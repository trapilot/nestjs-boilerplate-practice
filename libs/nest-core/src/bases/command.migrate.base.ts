import { Logger } from '@nestjs/common'
import { CommandRunner, Option } from 'nest-commander'
import { APP_ENV } from '../constants'
import { EnumCommandType } from '../enums'
import { ICommandOptions } from '../interfaces'
import { AppUtil } from '../utils'

export abstract class CommandMigrateBase extends CommandRunner {
  protected readonly logger: Logger = new Logger(CommandMigrateBase.name)

  async run(_passedParam: string[], options?: ICommandOptions): Promise<void> {
    this.logger.log(`${this.constructor.name} starting...`)

    if (!AppUtil.isLocal()) {
      this.logger.warn(`${this.constructor.name} running migration data on ${APP_ENV}`)
    }

    if (options?.type === EnumCommandType.down) {
      await this._down()
    } else if (options?.type === EnumCommandType.up) {
      await this._up()
    } else {
      throw new Error(
        `${this.constructor.name} please specify --type ${EnumCommandType.up} or ${EnumCommandType.down}`,
      )
    }

    this.logger.log(`${this.constructor.name} ${options.type} successfully`)
  }

  @Option({
    flags: '-t, --type <type>',
    choices: [EnumCommandType.up, EnumCommandType.down],
    defaultValue: EnumCommandType.up,
    required: true,
    name: 'type',
    description: `Command type: ${EnumCommandType.up} or ${EnumCommandType.down}`,
  })
  parseType(val: EnumCommandType): EnumCommandType | null {
    return val
  }

  private async _up(): Promise<void> {
    try {
      await this.up()
    } catch (err: unknown) {
      this.logger.error(err)
      throw err
    }
  }

  private async _down(): Promise<void> {
    try {
      await this.down()
    } catch (err: unknown) {
      this.logger.error(err)
      throw err
    }
  }

  abstract up(): Promise<void>
  abstract down(): Promise<void>
}
