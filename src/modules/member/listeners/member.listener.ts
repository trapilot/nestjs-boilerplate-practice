import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { EnumQueuePriority, HelperService, WorkerProducer } from 'lib/nest-core'
import { MEMBER_QUEUE_PROC_VERSION } from '../constants/member.constant'
import { EnumMemberEvent, EnumMemberQueue } from '../enums/member.enum'
import { MemberCreatedEvent } from '../events/member.created.event'
import {
  IMemberEmailWelcomePayload,
  IMemberGenerateCodePayload,
  IMemberGrantTierRewardPayload,
} from '../interfaces/member.interface'

@Injectable()
export class MemberListener {
  constructor(
    private readonly producer: WorkerProducer,
    private readonly helperService: HelperService,
  ) {}

  @OnEvent(EnumMemberEvent.CREATED, { async: true })
  async handleMemberCreatedEvent(event: MemberCreatedEvent): Promise<void> {
    const nowDate = this.helperService.dateNow()

    // enqueue to generate new membership code
    await this.producer.publish<IMemberGenerateCodePayload>(EnumMemberQueue.PROC_GENERATE_CODE, {
      version: MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_GENERATE_CODE],
      priority: EnumQueuePriority.HIGH,
      startDate: nowDate,
      message: {
        memberId: event.payload.id,
        issuedAt: event.payload.createdAt,
      },
    })

    // enqueue to receive tier wards from point schemas
    await this.producer.publish<IMemberGrantTierRewardPayload>(
      EnumMemberQueue.PROC_GRANT_TIER_REWARD,
      {
        version: MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_GRANT_TIER_REWARD],
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
      await this.producer.publish<IMemberEmailWelcomePayload>(EnumMemberQueue.PROC_EMAIL_WELCOME, {
        version: MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_EMAIL_WELCOME],
        priority: EnumQueuePriority.MEDIUM,
        startDate: nowDate,
        message: {
          memberId: event.payload.id,
          memberEmail: event.payload.email,
        },
      })
    }
  }

  @OnEvent(EnumMemberEvent.RENEWAL, { async: true })
  async handleMemberRenewalEvent(event: MemberCreatedEvent): Promise<void> {
    await this.producer.publish<IMemberGrantTierRewardPayload>(
      EnumMemberQueue.PROC_GRANT_TIER_REWARD,
      {
        version: MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_GRANT_TIER_REWARD],
        priority: EnumQueuePriority.HIGH,
        startDate: this.helperService.dateNow(),
        message: {
          memberId: event.payload.id,
          tierId: event.payload.tierId,
          issuedAt: event.payload.updatedAt,
        },
      },
    )
  }

  @OnEvent(EnumMemberEvent.DOWNGRADE, { async: true })
  async handleMemberDowngradeEvent(event: MemberCreatedEvent): Promise<void> {
    await this.producer.publish<IMemberGrantTierRewardPayload>(
      EnumMemberQueue.PROC_GRANT_TIER_REWARD,
      {
        version: MEMBER_QUEUE_PROC_VERSION[EnumMemberQueue.PROC_GRANT_TIER_REWARD],
        priority: EnumQueuePriority.HIGH,
        startDate: this.helperService.dateNow(),
        message: {
          memberId: event.payload.id,
          tierId: event.payload.tierId,
          issuedAt: event.payload.updatedAt,
        },
      },
    )
  }

  // bus.subscribe(EnumMemberEvent.DOWNGRADE, async (event: IDomainEvent<TMember>) => {
  //   await this.producer.publish<IMemberGrantTierRewardPayload>(
  //     EnumMemberQueue.GRANT_TIER_REWARD,
  //     {
  //       version: 1,
  //       priority: EnumQueuePriority.HIGH,
  //       startDate: this.helperService.dateNow(),
  //       message: {
  //         memberId: event.payload.id,
  //         tierId: event.payload.tierId,
  //         issuedAt: event.payload.updatedAt,
  //       },
  //     },
  //   )
  // })
}
