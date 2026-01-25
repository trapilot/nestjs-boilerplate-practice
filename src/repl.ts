import { repl } from '@nestjs/core'
import { AppModule } from 'app/app.module'

async function bootstrap(): Promise<void> {
  const replServer = await repl(AppModule)
  replServer.setupHistory('logs/.nestjs_repl_history', _err => {
    // if (err) {
    //   console.error(err)
    // }
  })
}
bootstrap()
