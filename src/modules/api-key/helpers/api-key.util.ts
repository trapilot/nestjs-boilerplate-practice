import { Injectable } from '@nestjs/common'
import { HelperService } from 'lib/nest-core'

@Injectable()
export class ApiKeyUtil {
  constructor(private readonly helperService: HelperService) {}

  private createKey(appEnv: string): string {
    const random = this.helperService.randomString(25)
    return `${appEnv}_${random}`
  }

  private createSecret(): string {
    return this.helperService.randomString(35)
  }

  createHash(appEnv: string): { key: string; hash: string } {
    const key = this.createKey(appEnv)
    const secret = this.createSecret()

    const hash = this.helperService.hashCreate(`${key}:${secret}`, {
      algorithm: 'sha256',
    })
    return { key, hash }
  }

  resetHash(key: string): string {
    const secret = this.createSecret()
    const hash = this.helperService.hashCreate(`${key}:${secret}`, {
      algorithm: 'sha256',
    })

    return hash
  }
}
