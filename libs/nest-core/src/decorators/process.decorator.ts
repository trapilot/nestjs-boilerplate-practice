import { HttpStatus } from '@nestjs/common'
import { ChildProcess, fork } from 'child_process'
import { AppException } from '../exceptions'

export function RunInNewProcess(timeout?: number) {
  return function (
    target: object,
    key: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: unknown[]) {
      const child: ChildProcess = fork(`${__dirname}/runtime/app.process.js`)

      child.send({ callbackFn: originalMethod.toString(), args })

      let timeoutId: NodeJS.Timeout

      if (timeout) {
        timeoutId = setTimeout(() => {
          const className = target.constructor.name
          const methodName = key
          const error = new AppException({
            message: 'worker execution timed out.',
            httpStatus: HttpStatus.REQUEST_TIMEOUT,
          })
          Object.assign(error, { context: `${className}/${methodName}` })
          console.error(error)
          child.kill()
        }, timeout)
      }

      child.on('message', (message: { error: Error; success: unknown }) => {
        try {
          if (timeoutId) clearTimeout(timeoutId)

          if (message.error) {
            child.kill(0)
            return Promise.reject(message.error)
          }

          if (message.success) {
            return Promise.resolve(message.success)
          }

          return Promise.resolve(message)
        } catch (error) {
          child.kill()
          throw error
        }
      })

      child.on('error', (error: Error) => {
        if (error.name === 'ReferenceError') {
          console.error(
            'it is not possible to use custom errors or objects as a response because they do not exist in the new process.',
            error,
          )
          return
        }
        console.error('error in child process: ', error)
      })

      child.on('exit', (code: number) => {
        if (code !== 0) {
          console.error(`child process exited ${code ?? `with code: code`}`)
        }
      })
    }

    return descriptor
  }
}
