import { Injectable } from '@nestjs/common'
import { compareSync, genSaltSync, hashSync } from 'bcrypt'
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  createSign,
  createVerify,
} from 'crypto'
import { IResult } from 'ua-parser-js'
import { v7 as uuidv7 } from 'uuid'
import {
  IEncryptionHashOptions,
  IEncryptionHmacOptions,
  IEncryptionSignOptions,
  IEncryptionTypeOptions,
  IEncryptionVerifyOptions,
} from '../interfaces'

@Injectable()
export class CryptoService {
  base62Encrypt(data: number, options: IEncryptionTypeOptions): string {
    let chars = '0123456789'
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let len = chars.length
    let result = ''
    while (data > 0) {
      result = chars[data % len] + result
      data = Math.floor(data / len)
    }
    return result
  }

  base62Decrypt(data: string, options: IEncryptionTypeOptions): number {
    let chars = '0123456789'
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let len = chars.length
    let result = 0
    for (let i = 0; i < data.length; i++) {
      const index = chars.indexOf(data[i])
      if (index === -1) throw new Error('Invalid character in Base62 string')
      result = result * len + index
    }
    return result
  }

  base64Encrypt(data: string): string {
    const buff: Buffer = Buffer.from(data, 'utf8')
    return buff.toString('base64')
  }

  base64Decrypt(data: string): string {
    const buff: Buffer = Buffer.from(data, 'base64')
    return buff.toString('utf8')
  }

  base64Compare(basicToken1: string, basicToken2: string): boolean {
    return basicToken1 === basicToken2
  }

  aes256Encrypt(
    data: string | Record<string, any> | Record<string, any>[],
    key: string,
    iv: string,
  ): string {
    const keyBuffer = Buffer.from(key, 'utf-8')
    const ivBuffer = Buffer.from(iv, 'utf-8')

    const cipher = createCipheriv('aes-256-cbc', keyBuffer, ivBuffer)

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64')
    encrypted += cipher.final('base64')

    return encrypted
  }

  aes256Decrypt(
    encrypted: string,
    key: string,
    iv: string,
  ): string | Record<string, any> | Record<string, any>[] {
    const keyBuffer = Buffer.from(key, 'utf-8')
    const ivBuffer = Buffer.from(iv, 'utf-8')

    const decipher = createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer)

    let decrypted = decipher.update(encrypted, 'base64', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  randomSalt(length: number): string {
    return genSaltSync(length)
  }

  bcrypt(passwordString: string, salt: string): string {
    return hashSync(passwordString, salt)
  }

  bcryptCompare(passwordString: string, passwordHashed: string): boolean {
    return compareSync(passwordString, passwordHashed || '')
  }

  getShortenedNumber(number: string | number) {
    const hash = this.createHash(`${number}`, { algorithm: 'md5' })
    const shortened = parseInt(hash.substring(0, 8), 16)
    return shortened
  }

  createHash(data: string, options: IEncryptionHashOptions): string {
    const { algorithm, ...hashOpts } = options

    const hash = createHash(algorithm, hashOpts)

    hash.update(data, 'utf8')

    const hexDigest = hash.digest('hex')

    return hexDigest
  }

  compareHash(data: string, hash: string, options: IEncryptionHashOptions): boolean {
    return hash === this.createHash(data, options)
  }

  createHmac(data: string, options: IEncryptionHmacOptions): string {
    const { algorithm, key, length = 12, ...hmacOpts } = options
    const matches = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    const hmac = createHmac(algorithm, key, hmacOpts)

    hmac.update(data, 'utf8')

    const hexDigest = hmac.digest('hex')

    let hmacValue = ''
    let hmacDigit = parseInt(hexDigest, 16)

    for (let i = 0; i < length; i++) {
      hmacValue += [hmacDigit % matches.length]
      hmacDigit = Math.floor(hmacDigit / matches.length) // Move to the next "digit"
    }

    return hmacValue
  }

  compareHmac(data: string, hmac: string, options: IEncryptionHmacOptions): boolean {
    return hmac === this.createHmac(data, options)
  }

  createUserToken(userIp: string, userAgent: IResult, userRotate: boolean = false): string {
    const { ua, browser, device, engine, os, cpu } = userAgent
    const randToken = userRotate ? uuidv7() : ''

    return this.createHash(
      [
        JSON.stringify(browser),
        JSON.stringify(device),
        JSON.stringify(engine),
        JSON.stringify(os),
        JSON.stringify(cpu),
        ua,
        userIp,
        randToken,
      ].join('|'),
      { algorithm: 'sha256' },
    )
  }

  sign(data: string, options: IEncryptionSignOptions): string {
    try {
      // Create a signer object
      const signer = createSign(options.algorithm)

      // Update the signer with the data to be signed
      signer.update(data)

      // Sign the data with the private key
      const signature = signer.sign(options.privateKey, options.outputFormat)

      return signature
    } catch (err) {
      throw new Error('Error signing data: ' + err.message)
    }
  }

  verify(data: string, options: IEncryptionVerifyOptions): boolean {
    try {
      // Create a verifier object
      const verify = createVerify(options.algorithm)

      // Update the verifier with the data to be signed
      verify.update(data)

      // Sign the data with the public key
      return verify.verify(options.publicKey, options.signature, options.outputFormat)
    } catch (err) {
      throw new Error('Error verifying data: ' + err.message)
    }
  }
}
