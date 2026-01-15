import { CacheInterceptor as CacheBaseInterceptor } from '@nestjs/cache-manager'
import { ExecutionContext, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { CacheService } from 'lib/nest-core'

/**
 * Response cache interceptor that extends the base CacheInterceptor functionality.
 * Adds configurable cache key prefixes to distinguish response caching from other cache operations.
 */
@Injectable()
export class ResponseCacheInterceptor extends CacheBaseInterceptor {
  private readonly cachePrefix: string

  constructor(
    protected readonly cache: CacheService,
    protected readonly config: ConfigService,
    protected readonly reflector: Reflector,
  ) {
    super(cache, reflector)

    this.cachePrefix = this.config.get<string>('request.cachePrefix')
  }

  /**
   * Generates cache key with configured prefix for response caching.
   * Overrides the base trackBy method to add response-specific cache prefixes.
   *
   * @param {ExecutionContext} context - The execution context containing request information
   * @returns {string | undefined} Prefixed cache key or undefined if no key generated
   */
  protected trackBy(context: ExecutionContext): string | undefined {
    const key = super.trackBy(context)

    if (!key) {
      return undefined
    }

    return `${this.cachePrefix}:${key}`
  }
}
