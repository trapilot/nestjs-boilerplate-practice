import bytes from 'bytes'
import * as fs from 'fs'
import * as mime from 'mime'
import { basename, join, relative } from 'path'
import { APP_PATH, ROOT_PATH } from '../constants'
import { IFile, IFileFormatOptions } from '../interfaces'
import { ArrUtil } from './array.util'

export class FileUtil {
  static format(fileName: string, options?: IFileFormatOptions): string {
    const [name, ext] = fileName
      .replace(/ /g, '_')
      .replace(/^0-9a-zA-Z_.-/g, '')
      .split(/(\.[^.]+)$/)

    const parts = [name]
    if (options?.timestamp || name.length === 0) {
      parts.push(new Date().getTime().toString())
    }
    if (options?.suffix) {
      parts.push(options.suffix)
    }

    const _fileName = ArrUtil.join(parts, { delimiter: '_', allowEmpty: false })
    const _fileExtension = options?.extension ? `.${options.extension}` : ext

    return _fileName + _fileExtension
  }

  static kilobytes(val: number) {
    return bytes(`${val}kb`)
  }

  static megabytes(val: number) {
    return bytes(`${val}mb`)
  }

  static relative(from: string, to: string): string {
    return relative(from, to)
  }

  static normalize(path: string): string {
    return path.replaceAll('\\', '/')
  }

  static basename(path: string, suffix?: string): string {
    return basename(path, suffix)
  }

  static join(args: string[]): string {
    return join(...args)
  }

  static joinRoot(args: string[]): string {
    return join(ROOT_PATH, ...args)
  }

  static joinApp(args: string[]): string {
    return join(APP_PATH, ...args)
  }

  static isVideo(file: IFile): boolean {
    return file.mimetype.startsWith('video/')
  }

  static isImage(file: IFile): boolean {
    return file.mimetype.startsWith('image/')
  }

  static isHighEfficiency(fileName: string): [extension: string, heiFlg: boolean, hevFlg: boolean] {
    const fileExt = this.extractExtensionFromFilename(fileName)
    const fileMime = this.extractMimeFromFilename(fileName)
    if (['heic', 'heif'].includes(fileMime) || ['.heic', '.heif'].includes(fileExt)) {
      return [fileExt, true, false]
    }
    if (['h265', 'hevc'].includes(fileMime) || ['.h265', '.hevc'].includes(fileExt)) {
      return [fileExt, false, true]
    }

    // MP4(H.265) files won't work in Firefox
    /*
    if ('mp4' === fileMime || '.mp4' === fileExt) {
      return [fileExt, false, true]
    }
    */
    return [fileExt, false, false]
  }

  static async calculateTotalSize(files: string[]): Promise<number> {
    let totalSize = 0
    for (const filePath of files) {
      try {
        const stats = await fs.promises.stat(filePath)
        totalSize += stats.size
      } catch (_err: unknown) {
        console.warn(`File not found for size calculation: ${filePath}`)
      }
    }
    return totalSize
  }

  static extractExtensionFromFilename(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
  }

  static extractMimeFromFilename(filename: string): string {
    return mime.getType(this.extractExtensionFromFilename(filename))
  }

  static extractFilenameFromPath(filePath: string): string {
    const parts = filePath.split('/')
    return parts[parts.length - 1]
  }

  static getTemplate(fileName: string, language?: string): string {
    return language
      ? join(APP_PATH, 'resources', 'templates', language, fileName)
      : join(APP_PATH, 'resources', 'templates', fileName)
  }
}
