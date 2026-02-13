import { Injectable } from '@nestjs/common'
import {
  EnumQueuePriority,
  HelperService,
  IDomainEvent,
  IEventBus,
  IEventListener,
  QueueProducer,
} from 'lib/nest-core'
import { EnumMemberEvent, EnumMemberQueue } from '../enums/member.enum'
import {
  IMemberGenerateCodePayload,
  IMemberGrantTierRewardPayload,
  IMemberTriggerWelcomeEmailPayload,
  TMember,
} from '../interfaces/member.interface'

@Injectable()
export class MemberListener implements IEventListener {
  constructor(
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  register(bus: IEventBus): void {
    const nowDate = this.helperService.dateNow()

    bus.subscribe(EnumMemberEvent.CREATED, async (event: IDomainEvent<TMember>) => {
      // enqueue to generate new membership code
      await this.producer.publish<IMemberGenerateCodePayload>(EnumMemberQueue.GENERATE_CODE, {
        version: 1,
        priority: EnumQueuePriority.HIGH,
        startDate: nowDate,
        message: {
          memberId: event.payload.id,
          issuedAt: event.payload.createdAt,
        },
      })

      // enqueue to receive tier wards from point schemas
      await this.producer.publish<IMemberGrantTierRewardPayload>(
        EnumMemberQueue.GRANT_TIER_REWARD,
        {
          version: 1,
          priority: EnumQueuePriority.HIGH,
          startDate: nowDate,
          message: {
            memberId: event.payload.id,
            tierId: event.payload.tierId,
            issuedAt: event.payload.createdAt,
          },
        },
      )

      // enqueue to send a welcome email if it's verified
      if (event.payload.isEmailVerified) {
        await this.producer.publish<IMemberTriggerWelcomeEmailPayload>(
          EnumMemberQueue.TRIGGER_WELCOME_EMAIL,
          {
            version: 1,
            priority: EnumQueuePriority.MEDIUM,
            startDate: nowDate,
            message: {
              memberId: event.payload.id,
              memberEmail: event.payload.email,
            },
          },
        )
      }
    })

    bus.subscribe(EnumMemberEvent.RENEWAL, async (event: IDomainEvent<TMember>) => {
      await this.producer.publish<IMemberGrantTierRewardPayload>(
        EnumMemberQueue.GRANT_TIER_REWARD,
        {
          version: 1,
          priority: EnumQueuePriority.HIGH,
          startDate: this.helperService.dateNow(),
          message: {
            memberId: event.payload.id,
            tierId: event.payload.tierId,
            issuedAt: event.payload.updatedAt,
          },
        },
      )
    })

    bus.subscribe(EnumMemberEvent.DOWNGRADE, async (event: IDomainEvent<TMember>) => {
      const member = event.payload

      await this.producer.publish<IMemberGrantTierRewardPayload>(
        EnumMemberQueue.GRANT_TIER_REWARD,
        {
          version: 1,
          priority: EnumQueuePriority.HIGH,
          startDate: this.helperService.dateNow(),
          message: {
            memberId: member.id,
            tierId: member.tierId,
            issuedAt: member.updatedAt,
          },
        },
      )
    })
  }
}
