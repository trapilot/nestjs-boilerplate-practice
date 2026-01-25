import { CliModule } from 'app/cli.module'
import { CommandFactory } from 'nest-commander'

async function bootstrap(): Promise<void> {
  const app = await CommandFactory.createWithoutRunning(CliModule, {
    logger: ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
    // abortOnError: true,
    // bufferLogs: false,
  })

  await CommandFactory.runApplication(app)

  await app.close()
  process.exit(0)
}

bootstrap()
