import * as fs from 'fs'
import { join } from 'path'
import { APP_PATH, FILE_MIME_TYPE, ROOT_PATH } from '../constants'
import { ENUM_FILE_MIME } from '../enums'
import { IFile } from '../interfaces'

export class FileUtil {
  static format(fileName: string, milliseconds: number = 0): string {
    const filename = fileName.replace(/ /g, '_').replace(/^0-9a-zA-Z_.-/g, '')
    const [name, ext] = filename.split(/(\.[^.]+)$/)
    const timestamp = (new Date().getTime() + milliseconds).toString()
    return [name, timestamp].filter((i) => i.length).join('_') + ext
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

  static parseExtension(fileName: string, def: string = ''): string {
    const lastDotIndex = fileName.lastIndexOf('.')
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return def
    }
    return fileName.substring(lastDotIndex + 1)
  }

  static parseMimetype(fileName: string, def: string = ''): string {
    const fileExtension = this.parseExtension(fileName)
    if (fileExtension.length) return def

    for (const mimeType in FILE_MIME_TYPE) {
      const meta = FILE_MIME_TYPE[mimeType]
      if (meta.extensions && meta.extensions.includes(fileExtension)) {
        return mimeType
      }
    }
    return def
  }

  static mapMimetype(mimetype: ENUM_FILE_MIME, def: string = ''): string {
    for (const _mimeType in FILE_MIME_TYPE) {
      if (_mimeType === mimetype) {
        const meta = FILE_MIME_TYPE[_mimeType]
        if (meta.extensions && meta.extensions.length) {
          return meta.extensions[0]
        }
        return def
      }
    }
    return def
  }

  static isVideo(file: IFile): boolean {
    return file.mimetype.startsWith('video/')
  }

  static isImage(file: IFile): boolean {
    return file.mimetype.startsWith('image/')
  }

  static isHighEfficiency(fileName: string): [extension: string, heiFlg: boolean, hevFlg: boolean] {
    const fileExt = this.parseExtension(fileName)
    const fileMime = this.parseMimetype(fileName)
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

  static getTemplate(fileName: string, language?: string): string {
    return language
      ? join(APP_PATH, 'resources', 'templates', language, fileName)
      : join(APP_PATH, 'resources', 'templates', fileName)
  }
}
