import { MiddlewareConsumer, Type } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE } from '../enums'

type ControllerClass = Type<any>
type CommandClass = Type<any>
type TaskClass = Type<any>

type ApiControllerMap = Partial<Record<ENUM_APP_API_TYPE, ControllerClass[]>>

type CommandMap = Partial<Record<ENUM_APP_CMD_TYPE, CommandClass[]>>

export abstract class ModuleBase {
  static _tasks: TaskClass[] = []
  static _controllers: ApiControllerMap = {}
  static _commands: CommandMap = {}

  static controllers(type: ENUM_APP_API_TYPE): ControllerClass[] {
    return this._controllers[type] || []
  }

  static commands(type: ENUM_APP_CMD_TYPE): CommandClass[] {
    return this._commands[type] || []
  }

  static tasks(): TaskClass[] {
    return this._tasks
  }

  static middleware(_: MiddlewareConsumer) {}
}
