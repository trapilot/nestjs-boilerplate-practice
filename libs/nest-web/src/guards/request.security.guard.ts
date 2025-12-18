import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  PreconditionFailedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CryptoService, IRequestApp } from 'lib/nest-core'

const usedNonces = new Map<string, number>()

@Injectable()
export class RequestSecurityGuard implements CanActivate {
  private readonly securityEnabled: boolean
  private readonly securityKey: string
  private readonly securityTTL: number

  constructor(
    private readonly config: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {
    this.securityEnabled = this.config.get<boolean>('middleware.security.enable')
    this.securityKey = this.config.get<string>('middleware.security.key')
    this.securityTTL = this.config.get<number>('middleware.security.ttl')
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestApp>()

    if (!this.securityEnabled) return true

    const method = req.method.toUpperCase()
    const nonce = req.headers['x-nonce'] as string
    const timestamp = req.headers['x-timestamp'] as string

    if (!nonce || !timestamp) {
      throw new PreconditionFailedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'http.clientError.missingSecurityHeaders',
      })
    }

    const reqTs = parseInt(timestamp, 10)
    if (!this.checkAndSaveNonce(nonce, reqTs)) {
      throw new PreconditionFailedException({
        statusCode: HttpStatus.PRECONDITION_FAILED,
        message: 'http.clientError.nonceTimeout',
      })
    }

    // --- Only validate signature/body for "safe" methods ---
    const skipSignatureCheck = ['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)
    if (!skipSignatureCheck) {
      const signature = req.headers['x-signature'] as string
      const bodyHash = req.headers['x-body-hash'] as string

      if (!signature || !bodyHash) {
        throw new PreconditionFailedException({
          statusCode: HttpStatus.BAD_REQUEST,
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
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'http.clientError.invalidSignature',
        })
      }
    }
    return true
  }

  private checkAndSaveNonce(nonce: string, reqTs: number): boolean {
    const nowTs = Math.floor(Date.now() / 1000)

    // Clean up expired nonces
    for (const [nonce, storedTimestamp] of usedNonces.entries()) {
      if (Math.abs(nowTs - storedTimestamp) > this.securityTTL) {
        usedNonces.delete(nonce)
      }
    }

    // Check if nonce has been used
    if (usedNonces.has(nonce)) {
      return false // Replay attack detected
    }

    // Check if timestamp is too old
    if (Math.abs(nowTs - reqTs) > this.securityTTL) {
      return false // Nonce timeout
    }

    // Save new nonce with expiration time
    usedNonces.set(nonce, nowTs)
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
    const serverBodyHash = this.cryptoService.createHash(bodyPayload, {
      algorithm: 'sha256',
    })

    // Compare the body hash with the hash from the client
    if (serverBodyHash !== bodyHash) {
      throw new PreconditionFailedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'http.clientError.invalidBodyHash',
      })
    }

    // Create dataToValidate with only metadata and hash of body
    const dataToValidate = `${checkOpts.nonce}${checkOpts.timestamp}${bodyHash}`
    const validated = this.cryptoService.compareHmac(dataToValidate, checkOpts.signature, {
      algorithm: 'sha256',
      key: this.securityKey,
    })

    return validated
  }
}
