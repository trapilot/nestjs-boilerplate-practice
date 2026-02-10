import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  EnumQueuePriority,
  HelperService,
  IQueuePublishOptions,
  QueueProducer,
} from 'lib/nest-core'
import { EnumMemberEvent, EnumMemberQueue } from '../enums/member.enum'
import { TMember } from '../interfaces/member.interface'

@Injectable()
export class MemberListener {
  constructor(
    private readonly producer: QueueProducer,
    private readonly helperService: HelperService,
  ) {}

  @OnEvent(`${EnumMemberEvent.CREATED}:v1`, { async: true })
  async handleMemberCreateV1(payload: TMember) {
    const options: IQueuePublishOptions = {
      version: 1,
      exclusive: false,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateNow(),
      message: payload,
    }

    await this.producer.publish(EnumMemberQueue.GENERATE_CODE, options)
    await this.producer.publish(EnumMemberQueue.GRANT_WELCOME_REWARD, options)
    await this.producer.publish(EnumMemberQueue.TRIGGER_WELCOME_EMAIL, options)
  }

  @OnEvent(`${EnumMemberEvent.RENEWAL}:v1`, { async: true })
  async handleMemberRenewalV1(payload: TMember) {
    const options: IQueuePublishOptions = {
      version: 1,
      exclusive: false,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateNow(),
      message: payload,
    }

    await this.producer.publish(EnumMemberQueue.GRANT_WELCOME_REWARD, options)
  }

  @OnEvent(`${EnumMemberEvent.DOWNGRADE}:v1`, { async: true })
  async handleMemberDowngradeV1(payload: TMember) {
    const options: IQueuePublishOptions = {
      version: 1,
      exclusive: false,
      autoDelete: true,
      priority: EnumQueuePriority.HIGH,
      startDate: this.helperService.dateNow(),
      message: payload,
    }

    await this.producer.publish(EnumMemberQueue.GRANT_WELCOME_REWARD, options)
  }
}
