import * as fs from 'fs'
import { FILE_MIME_TYPE } from '../constants'
import { ENUM_FILE_MIME, ENUM_FILE_MIME_AUDIO, ENUM_FILE_MIME_VIDEO } from '../enums'
import { DiskStorage } from '../storages'

export class FileHelper {
  public static toFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.')

    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return ''
    }

    return fileName.substring(lastDotIndex + 1)
  }

  static toFileMimetype(fileName: string): string {
    const fileExt = FileHelper.toFileExtension(fileName)
    for (const mimeType in FILE_MIME_TYPE) {
      const meta = FILE_MIME_TYPE[mimeType]
      if (meta.extensions && meta.extensions.includes(fileExt)) {
        return mimeType
      }
    }
    return ''
  }

  static normalizePath(path: string): string {
    return path.replaceAll('\\', '/')
  }

  static mapFileMimetype(mimetype: ENUM_FILE_MIME): string {
    for (const _mimeType in FILE_MIME_TYPE) {
      if (_mimeType === mimetype) {
        const meta = FILE_MIME_TYPE[_mimeType]
        if (meta.extensions && meta.extensions.length) {
          return meta.extensions[0]
        }
        return ''
      }
    }
    return ''
  }

  static isMimetype(fileName: string, mimetype: ENUM_FILE_MIME): boolean {
    const _mimetype = FileHelper.toFileMimetype(fileName)
    return _mimetype === mimetype
  }

  static inMimetype(fileName: string, mimetypes: string[]): boolean {
    const _mimetype = FileHelper.toFileMimetype(fileName)
    return mimetypes.includes(_mimetype)
  }

  static isVideo(fileName: string): boolean {
    return FileHelper.inMimetype(fileName, Object.values(ENUM_FILE_MIME_VIDEO))
  }

  static isAudio(fileName: string): boolean {
    return FileHelper.inMimetype(fileName, Object.values(ENUM_FILE_MIME_AUDIO))
  }

  static isHighEfficiencyImage(fileName: string): [extension: string, status: boolean] {
    const fileExt = FileHelper.toFileExtension(fileName)
    const fileMime = FileHelper.toFileMimetype(fileName)
    if (['heic', 'heif'].includes(fileMime) || ['.heic', '.heif'].includes(fileExt)) {
      return [fileExt, true]
    }
    return [fileExt, false]
  }

  static isHighEfficiencyVideo(fileName: string): [string, boolean] {
    const fileExt = FileHelper.toFileExtension(fileName)
    const fileMime = FileHelper.toFileMimetype(fileName)
    if (['h265', 'hevc'].includes(fileMime) || ['.h265', '.hevc'].includes(fileExt)) {
      return [fileExt, true]
    }
    return [fileExt, false]
  }

  static isHighEfficiency(fileName: string): [extension: string, heiFlg: boolean, hevFlg: boolean] {
    const fileExt = FileHelper.toFileExtension(fileName)
    const fileMime = FileHelper.toFileMimetype(fileName)
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

  static createFileName(fileName: string, milliseconds: number = 0): string {
    const filename = fileName.replace(/ /g, '_').replace(/^0-9a-zA-Z_.-/g, '')
    const [name, ext] = filename.split(/(\.[^.]+)$/)
    const timestamp = (new Date().getTime() + milliseconds).toString()
    return [name, timestamp].filter((i) => i.length).join('_') + ext
  }

  static createDiskStorage(directory?: string, userPath: boolean = false): DiskStorage {
    return new DiskStorage({ directory, userPath })
  }
}
