import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { ENUM_MESSAGE_LANGUAGE, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'
import { ENUM_FACT_TYPE } from '../enums'

@Command({
  name: 'fact:seed',
  description: 'Seed facts',
})
export class FactSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async run(_passedParam: string[], _options?: any): Promise<void> {
    this.logger.warn(`${FactSeedCommand.name} is running...`)

    try {
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=0`
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE facts`)
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=1`

      await this.prisma.fact.createMany({
        data: [
          {
            type: ENUM_FACT_TYPE.ABOUT_US,
            title: {
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.lorem.sentence(),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.lorem.sentence(),
            },
            content: {
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.lorem.paragraphs(8),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.lorem.paragraphs(8),
            },
          },
          {
            type: ENUM_FACT_TYPE.PRIVACY,
            title: {
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.lorem.sentence(),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.lorem.sentence(),
            },
            content: {
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.lorem.paragraphs(8),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.lorem.paragraphs(8),
            },
          },
          {
            type: ENUM_FACT_TYPE.TERM_AND_CONDITION,
            title: {
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.lorem.sentence(),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.lorem.sentence(),
            },
            content: {
              [ENUM_MESSAGE_LANGUAGE.EN]: faker.lorem.paragraphs(8),
              [ENUM_MESSAGE_LANGUAGE.VI]: faker.lorem.paragraphs(8),
            },
          },
        ],
        skipDuplicates: true,
      })
    } catch (err: any) {
      throw new Error(err.message)
    }

    return
  }
}
