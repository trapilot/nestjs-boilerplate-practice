import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  CacheService,
  EnumRouteType,
  HelperService,
  IRequestApp,
  ScopeContext,
} from 'lib/nest-core'

@Injectable()
export class RequestSecurityGuard implements CanActivate {
  private readonly securityEnable: boolean
  private readonly securityKey: string
  private readonly securityTTL: number

  constructor(
    private readonly cache: CacheService,
    private readonly config: ConfigService,
    private readonly helperService: HelperService,
  ) {
    this.securityEnable = this.config.get<boolean>('request.security.enable')
    this.securityKey = this.config.get<string>('request.security.key')
    this.securityTTL = this.config.get<number>('request.security.ttl')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.securityEnable) {
      return true
    }

    const req = context.switchToHttp().getRequest<IRequestApp>()

    const method = req.method.toUpperCase()
    const nonce = req.headers['x-nonce'] as string
    const timestamp = req.headers['x-timestamp'] as string

    if (!nonce || !timestamp) {
      throw new PreconditionFailedException({
        statusCode: HttpStatus.PRECONDITION_FAILED,
        message: 'http.clientError.missingSecurityHeaders',
      })
    }

    const reqTs = Number(timestamp)
    const isNonceValid = await this.checkAndSaveNonce(nonce, reqTs, req.ip)

    if (!isNonceValid) {
      throw new PreconditionFailedException({
        statusCode: HttpStatus.PRECONDITION_FAILED,
        message: 'http.clientError.nonceTimeout',
      })
    }

    // --- Only validate signature/body for "safe" methods ---
    const skipSignatureCheck = ['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)
    if (!skipSignatureCheck && ScopeContext.isReqRoute(EnumRouteType.APP)) {
      const signature = req.headers['x-signature'] as string
      const bodyHash = req.headers['x-body-hash'] as string

      if (!signature || !bodyHash) {
        throw new PreconditionFailedException({
          statusCode: HttpStatus.PRECONDITION_FAILED,
          message: 'http.clientError.missingSignatureHeaders',
        })
      }

      const bodyPayload = req.body ? JSON.stringify(req.body) : ''
      const validated = this.checkSignature(bodyPayload, bodyHash, {
        nonce,
        timestamp: reqTs,
        signature,
      })

      if (!validated) {
        throw new PreconditionFailedException({
          statusCode: HttpStatus.PRECONDITION_FAILED,
          message: 'http.clientError.invalidSignature',
        })
      }
    }
    return true
  }

  private async checkAndSaveNonce(nonce: string, reqTs: number, reqIp: string): Promise<boolean> {
    const nowTs = Date.now()
    const cacheKey = `security:nonce:${reqIp}:${nonce}`

    // Check if timestamp is too old
    if (Math.abs(nowTs - reqTs) > this.securityTTL) {
      return false // Nonce timeout
    }

    const isUsed = await this.cache.get(cacheKey)
    if (isUsed) {
      return false // Nonce already exists in the cache -> Replay attack
    }

    // Store Nonce in cache with TTL
    await this.cache.set(cacheKey, 1, this.securityTTL)

    return true
  }

  private checkSignature(
    bodyPayload: string,
    bodyHash: string,
    checkOpts: {
      nonce: string
      timestamp: number
      signature: string
    },
  ): boolean {
    // Hash body of request on server
    const serverBodyHash = this.helperService.hashCreate(bodyPayload, {
      algorithm: 'sha256',
    })

    // Compare the body hash with the hash from the client
    if (serverBodyHash !== bodyHash) {
      throw new PreconditionFailedException({
        statusCode: HttpStatus.PRECONDITION_FAILED,
        message: 'http.clientError.invalidBodyHash',
      })
    }

    // Create dataToValidate with only metadata and hash of body
    const dataToValidate = `${checkOpts.nonce}${checkOpts.timestamp}${bodyHash}`
    const validated = this.helperService.hmacCompare(dataToValidate, checkOpts.signature, {
      algorithm: 'sha256',
      key: this.securityKey,
    })

    return validated
  }
}
