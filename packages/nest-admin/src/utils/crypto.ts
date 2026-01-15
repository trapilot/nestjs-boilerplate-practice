import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a secure random nonce string
 * @param length 16, 32 or 64
 */
export function generateNonce(length: number = 32): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  const randomValues = new Uint32Array(length)

  window.crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length]
  }
  return result
}

export const createCorrelationId = (prefix?: string) =>
  prefix ? `${prefix}-${uuidv4()}` : uuidv4()
