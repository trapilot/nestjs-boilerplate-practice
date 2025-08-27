import { BinaryLike, BinaryToTextEncoding, HashOptions, KeyObject } from 'node:crypto'
import { TransformOptions } from 'node:stream'

export interface IEncryptionHashOptions extends HashOptions {
  algorithm: 'md5' | 'sha256'
}

export interface IEncryptionHmacOptions extends TransformOptions {
  algorithm: 'md5' | 'sha256'
  key: BinaryLike | KeyObject
  length?: number
}

export interface IEncryptionSignOptions {
  privateKey: string
  algorithm: 'RSA-SHA256' | 'SHA256'
  outputFormat: BinaryToTextEncoding
}

export interface IEncryptionVerifyOptions
  extends Pick<IEncryptionSignOptions, 'algorithm' | 'outputFormat'> {
  publicKey: string | KeyObject
  signature: string
}

export interface IEncryptionTypeOptions {
  uppercase?: boolean
  lowercase?: boolean
}
