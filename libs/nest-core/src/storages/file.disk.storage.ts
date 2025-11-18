import concat from 'concat-stream'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import { createWriteStream, mkdirSync, readFileSync, statSync } from 'fs'
import { access, mkdir, unlink } from 'fs/promises'
import convert from 'heic-convert'
import imageSize from 'image-size'
import { Jimp } from 'jimp'
import { DiskStorageOptions, StorageEngine } from 'multer'
import { basename, join } from 'path'
import { ENUM_FILE_MIME } from '../enums'
import { FileHelper } from '../helpers'
import { IFile } from '../interfaces'

// Set the path to the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath)

export class DiskStorage implements StorageEngine {
  private directory: string
  private userPath: boolean
  private getFilename: (req: any, file: IFile, cb: (error: any, filename: string) => void) => void
  private getDestination: (
    req: any,
    file: IFile,
    cb: (error: any, destination: string) => void,
  ) => void

  private readonly transcoding: { heic: boolean; hevc: boolean }

  constructor(
    opts: {
      directory?: string
      userPath?: boolean
      transcoding?: { heic: boolean; hevc: boolean }
    } & DiskStorageOptions,
  ) {
    // Set default path
    this.directory = opts?.directory || 'uploads'
    this.userPath = opts?.userPath ?? false
    this.transcoding = opts?.transcoding || { heic: true, hevc: true }

    // Set the getFilename method
    this.getFilename = opts.filename || this.defaultGetFilename

    // If destination is a string, create the directory
    if (typeof opts.destination === 'string') {
      mkdirSync(opts.destination, { recursive: true })
      this.getDestination =
        () => (req: any, file: IFile, cb: (error: any, destination: string) => void) => {
          cb(null, opts.destination as string)
        }
    } else {
      this.getDestination = opts.destination || this.defaultGetDestination
    }
  }

  /**
   * Creates a directory recursively.
   * @param destination The path to the directory.
   */
  private async createUploadDirectory(destination: string) {
    try {
      await access(destination)
    } catch {
      await mkdir(destination, { recursive: true })
    }
  }

  /**
   * Creates a unique filename.
   * @param fileName The original filename.
   * @param milliseconds A unique timestamp.
   * @returns The new filename.
   */
  private createFileName(fileName: string, milliseconds: number = 0): string {
    return FileHelper.createFileName(fileName, milliseconds)
  }

  /**
   * Default method for getting the filename.
   */
  private defaultGetFilename(req: any, file: IFile, cb: (error: any, filename: string) => void) {
    cb(null, this.createFileName(file.originalname))
  }

  /**
   * Default method for getting the destination path.
   */
  private defaultGetDestination(
    req: any,
    file: IFile,
    cb: (error: any, destination: string) => void,
  ) {
    let directory = this.directory
    if (this.userPath && !this.directory.includes('{userId}')) {
      directory += '/{userId}/'
      req.fileInfo = { userId: req?.user?.user?.id ?? 0, ...(req?.fileInfo ?? {}) }
    }
    const destination = directory
      .replace('//', '/')
      .replace(/{(.*?)}/g, (match, key) => req?.fileInfo[key] || match)

    // Call the async directory creation method
    this.createUploadDirectory(destination).then(() => {
      cb(null, destination)
    })
  }

  /**
   * Writes a stream to a file and returns a Promise.
   * @param stream The readable stream.
   * @param path The destination path.
   * @returns A Promise that resolves when the write is finished.
   */
  private async writeStreamToFile(stream: NodeJS.ReadableStream, path: string): Promise<void> {
    const writeStream = createWriteStream(path)
    stream.pipe(writeStream)
    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })
  }

  /**
   * Handles image file uploads, including HEIC transcoding.
   * @returns An object with file information.
   */
  private async handleFileImage(
    file: IFile,
    destination: string,
    filename: string,
    extension: string,
  ): Promise<any> {
    const [_, isHEI] = FileHelper.isHighEfficiency(file.originalname)

    // If HEIC transcoding is enabled and the file is HEIC
    if (isHEI && this.transcoding.heic) {
      console.log(`\x1b[33mConverting HEIC to JPEG file. Please wait....\x1b[0m`)

      const buffer = await new Promise<Buffer>((resolve, reject) => {
        file.stream.pipe(concat({ encoding: 'buffer' }, resolve))
      })
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length)

      const outputType: { format: 'JPEG' | 'PNG'; extension: string; mimetype: ENUM_FILE_MIME } = {
        format: 'JPEG',
        extension: '.jpeg',
        mimetype: ENUM_FILE_MIME.JPEG,
      }
      const outputBuffer = await convert({
        buffer: arrayBuffer,
        format: outputType.format,
        quality: 0.95,
      })

      const outputName = this.createFileName(file.originalname).replace(
        new RegExp(`${extension}$`),
        outputType.extension,
      )
      const outputPath = join(destination, outputName)

      const image = await Jimp.read(outputBuffer)
      await image.write(outputPath as `${string}.${string}`)

      const newBuffer = readFileSync(outputPath)
      const dimension = imageSize(newBuffer)
      const fileStat = statSync(outputPath)

      return {
        originalname: outputName,
        filename: basename(outputPath),
        destination: FileHelper.normalizePath(destination),
        path: FileHelper.normalizePath(outputPath),
        mimetype: outputType.mimetype,
        width: dimension?.width ?? undefined,
        height: dimension?.height ?? undefined,
        size: fileStat.size,
      }
    } else {
      // Use the generic handler for normal files
      return this.handleFileNormal(file, destination, filename)
    }
  }

  /**
   * Handles video file uploads, including HEVC transcoding.
   * @returns An object with file information.
   */
  private async handleFileVideo(
    file: IFile,
    destination: string,
    filename: string,
    extension: string,
  ): Promise<any> {
    const [_, __, isHEV] = FileHelper.isHighEfficiency(file.originalname)

    // If HEVC transcoding is enabled and the file is HEVC
    if (isHEV && this.transcoding.hevc) {
      console.log(`\x1b[33mConverting H.265 video to H.264. Please wait...\x1b[0m`)
      const finalPath = join(destination, filename)

      const outputType: { extension: string; mimetype: ENUM_FILE_MIME } = {
        extension: '.mp4',
        mimetype: ENUM_FILE_MIME.MP4,
      }

      const outputName = this.createFileName(file.originalname).replace(
        new RegExp(`${extension}$`),
        outputType.extension,
      )
      const outputPath = join(destination, outputName)

      await this.writeStreamToFile(file.stream, finalPath)

      // cspell:disable
      await new Promise<void>((resolve, reject) => {
        ffmpeg(finalPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions(['-preset veryfast', '-crf 23', '-movflags +faststart'])
          .on('end', async () => {
            await unlink(finalPath)
            resolve()
          })
          .on('error', (err: any) => reject(err))
          .save(outputPath)
      })
      // cspell:enable

      const fileStat = statSync(outputPath)
      return {
        originalname: outputName,
        filename: basename(outputPath),
        destination: FileHelper.normalizePath(destination),
        path: FileHelper.normalizePath(outputPath),
        mimetype: outputType.mimetype,
        size: fileStat.size,
        width: undefined,
        height: undefined,
      }
    } else {
      // Use the generic handler for normal files
      return this.handleFileNormal(file, destination, filename)
    }
  }

  /**
   * Handles non-image and non-video file uploads.
   * @returns An object with file information.
   */
  private async handleFileNormal(file: IFile, destination: string, filename: string): Promise<any> {
    const finalPath = join(destination, filename)
    await this.writeStreamToFile(file.stream, finalPath)

    const fileStat = statSync(finalPath)

    let imgWidth = undefined
    let imgHeight = undefined
    try {
      const buffer = readFileSync(finalPath)
      const dimension = imageSize(buffer)
      imgWidth = dimension?.width
      imgHeight = dimension?.height
    } catch (e) {
      // Ignore errors, this file might not be an image
    }

    return {
      originalname: file.originalname,
      filename: filename,
      destination: FileHelper.normalizePath(destination),
      path: FileHelper.normalizePath(finalPath),
      mimetype: FileHelper.toFileMimetype(file.originalname) || file.mimetype,
      width: imgWidth,
      height: imgHeight,
      size: fileStat.size,
    }
  }

  /**
   * The main handler for file uploads.
   */
  public async _handleFile(req: any, file: IFile, cb: (error: any, info?: any) => void) {
    try {
      // Use async/await to get destination and filename
      const destination = await new Promise<string>((resolve, reject) =>
        this.getDestination(req, file, (err, dest) => (err ? reject(err) : resolve(dest))),
      )
      const filename = await new Promise<string>((resolve, reject) =>
        this.getFilename(req, file, (err, name) => (err ? reject(err) : resolve(name))),
      )

      let info
      const isImage = file.mimetype.startsWith('image/')
      const isVideo = file.mimetype.startsWith('video/')

      if (isImage) {
        info = await this.handleFileImage(
          file,
          destination,
          filename,
          FileHelper.toFileExtension(file.originalname),
        )
      } else if (isVideo) {
        info = await this.handleFileVideo(
          file,
          destination,
          filename,
          FileHelper.toFileExtension(file.originalname),
        )
      } else {
        info = await this.handleFileNormal(file, destination, filename)
      }
      cb(null, info)
    } catch (err) {
      cb(err)
    }
  }

  /**
   * Removes a file from the disk.
   */
  public async _removeFile(req: any, file: IFile, cb: (error: any) => void) {
    const filePath = file.path

    // Clean up file properties
    delete file.destination
    delete file.path

    try {
      await unlink(filePath)
      cb(null)
    } catch (err) {
      cb(err)
    }
  }
}
