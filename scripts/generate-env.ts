import { randomBytes } from 'crypto'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

class AppGenerator {
  private readonly appKey = 'APP_SECRET_KEY'

  private getEnvFile() {
    return resolve(process.cwd(), '.env')
  }

  private getStagingEnvFile(): string {
    return resolve(process.cwd(), '.env.staging')
  }

  createEnv(): void {
    const envFile = this.getEnvFile()
    const stagingFile = this.getStagingEnvFile()

    if (existsSync(envFile)) {
      console.log('✅ .env file already exists. No action taken.')
      return
    }

    if (!existsSync(stagingFile)) {
      console.error('❌ .env.staging file not found. Cannot create .env.')
      return
    }

    copyFileSync(stagingFile, envFile)
    console.log('✅ .env file created from .env.staging')
  }

  generateEnv(): void {
    const inputEnv = process.argv[3] || process.env.NODE_ENV || ''
    const envFile = inputEnv ? `.env.${inputEnv}` : '.env'
    const keyRand = randomBytes(32).toString('base64')

    let envContent = ''

    try {
      envContent = readFileSync(envFile, 'utf8')
    } catch {
      console.log(`${envFile} not found, creating a new one.`)
    }

    let newEnvContent = ''
    if (envContent.includes('APP_SECRET_KEY=')) {
      newEnvContent = envContent.replace(/APP_SECRET_KEY=.*/g, `APP_SECRET_KEY=${keyRand}`)
    } else {
      const needsNewline = envContent && !envContent.endsWith('\n')
      newEnvContent = `${envContent}${needsNewline ? '\n' : ''}APP_SECRET_KEY=${keyRand}\n`
    }

    writeFileSync(envFile, newEnvContent, 'utf8')

    console.log(`✅ APP_SECRET_KEY written to ${envFile}`)
    console.log(`🔑 APP_SECRET_KEY=${keyRand}`)
  }
}

function main() {
  const argv = process.argv.slice(2)
  const command = argv[0] || 'generate'

  const generator = new AppGenerator()

  if (command === 'create') {
    generator.createEnv()
  } else if (command === 'generate') {
    generator.generateEnv()
  } else {
    console.log(`
Usage: npm run app:env [command] [env]

Commands:
  generate    Generate APP_SECRET_KEY
  create      Create new .env file

Arguments:
  env         Generate APP_SECRET_KEY for specific env, empty if change .env
        `)
  }
}

main()
