import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import archiver from 'archiver'
import * as fs from 'fs'
import { HelperDateService, IRequestApp, IResponseApp, ROOT_PATH } from 'lib/nest-core'
import { ENUM_FILE_MIME, FileHelper, FileService } from 'lib/nest-file'
import path from 'path'
import { Observable, throwError } from 'rxjs'
import { catchError, mergeMap } from 'rxjs/operators'
import { PassThrough } from 'stream'
import { v7 as uuidv7 } from 'uuid'
import { RESPONSE_FILE_DISPOSITION_METADATA, RESPONSE_FILE_TYPE_METADATA } from '../constants'
import { IDataFileBuffer, IDataFilePath, IResponseFile } from '../interfaces'

@Injectable()
export class ResponseFileInterceptor<T> implements NestInterceptor<T, IResponseFile> {
  constructor(
    private readonly reflector: Reflector,
    private readonly fileService: FileService,
    private readonly helperDateService: HelperDateService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        mergeMap(async (res: IResponseFile) => {
          if (Buffer.isBuffer(res.file)) {
            return await this.sendFromBuffer(context, res as IDataFileBuffer)
          }
          return await this.sendFromPath(context, res as IDataFilePath)
        }),
        catchError((err) => {
          return throwError(() => err)
        }),
      )
    }

    return next.handle()
  }

  private async sendFromPath(context: ExecutionContext, responseData: IDataFilePath) {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const disposition = this.reflector.get<'attachment' | 'inline'>(
      RESPONSE_FILE_DISPOSITION_METADATA,
      context.getHandler(),
    )

    if (Array.isArray(responseData.file)) {
      const zipFileName = responseData?.name || `files-${uuidv7()}.zip`
      const zipFilePath = path.join(ROOT_PATH, 'public', 'temporary', zipFileName)
      const zipFileRelative = responseData?.relative ?? ROOT_PATH
      const zipFileTemporary = responseData?.temporary as boolean

      // Set headers for ZIP response
      res
        .setHeader('Content-Type', FileHelper.toFileMimetype(zipFileName))
        .setHeader('Content-Disposition', `${disposition}; filename=${zipFileName}`)
        .setHeader('Transfer-Encoding', 'chunked')
        .setHeader('X-Accel-Buffering', 'no') // Disable buffering in proxies

      if (zipFileTemporary) {
        // Create the ZIP file
        await this.fileService.zipFiles(responseData.file, {
          zipFilePath,
          zipFileRelative,
        })

        const fileBuffer: Buffer = fs.readFileSync(zipFilePath)
        const streamableFile = new StreamableFile(fileBuffer)

        res.on('finish', () => {
          fs.unlink(zipFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temporary file:', unlinkErr)
            }
          })
        })
        return streamableFile
      } else {
        // Create the ZIP archive
        const archive = archiver.create('zip', {
          zlib: { level: 6 }, // Better compression level (1-9, higher = better compression but slower)
          store: false, // Set to true if you want to store without compression
        })

        // Create a PassThrough stream
        const passThroughStream = new PassThrough()

        // Pipe archive to PassThrough and then to response
        archive.pipe(passThroughStream)
        passThroughStream.pipe(res)

        // Set up archive event handlers
        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            console.warn('Archive warning:', err)
          } else {
            throw err
          }
        })

        archive.on('error', (err) => {
          console.error('Archive error:', err)
          if (!res.closed) {
            res.status(500).send('Error creating ZIP archive')
          }
        })

        // Log archive progress
        archive.on('progress', (progress) => {
          console.log('Archive progress:', progress)
        })

        // Log response events
        res.on('close', () => {
          console.log('Response closed by client')
        })

        res.on('finish', () => {
          console.log('Response finished')
        })

        res.on('error', (err) => {
          console.error('Response error:', err)
        })

        for (const filePath of responseData.file) {
          try {
            if (!fs.existsSync(filePath)) {
              console.warn(`File not found, skipping: ${filePath}`)
              continue
            }

            const stats = fs.statSync(filePath)
            if (!stats.isFile()) {
              console.warn(`Not a file, skipping: ${filePath}`)
              continue
            }

            const relativePath = path.relative(zipFileRelative, filePath)

            // Add file to archive
            archive.append(fs.createReadStream(filePath), {
              name: relativePath,
              date: stats.mtime, // Preserve modification time
              mode: stats.mode, // Preserve file permissions
            })
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error)
          }
        }

        // Finalize the archive
        try {
          await archive.finalize()
        } catch (error) {
          console.error('Error finalizing archive:', error)
          if (!res.closed) {
            res.status(500).send('Error finalizing ZIP archive')
          }
        }
        return passThroughStream
      }
    } else {
      const filePath = responseData.file as string
      const fileTemporary = responseData.temporary as boolean

      // set headers
      const fileBuffer: Buffer = fs.readFileSync(filePath)
      const fileName = filePath.replace(/^.*[\\/]/, '')

      const streamableFile = new StreamableFile(fileBuffer)

      res
        .setHeader('Content-Type', FileHelper.toFileMimetype(filePath))
        .setHeader('Content-Length', fileBuffer.length)
        .setHeader('Content-Disposition', `${disposition}; filename=${fileName}`)

      res.on('finish', () => {
        if (fileTemporary) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temporary file:', unlinkErr)
            }
          })
        }
      })
      return streamableFile
    }
  }

  private async sendFromBuffer(context: ExecutionContext, responseData: IDataFileBuffer) {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const disposition = this.reflector.get<'attachment' | 'inline'>(
      RESPONSE_FILE_DISPOSITION_METADATA,
      context.getHandler(),
    )

    const fileType = this.reflector.get<ENUM_FILE_MIME>(
      RESPONSE_FILE_TYPE_METADATA,
      context.getHandler(),
    )

    const dateNow = this.helperDateService.create()
    const fileBuffer = responseData.file
    const filePrefix = responseData.name
    const fileSuffix = responseData?.timestamp ? this.helperDateService.getTimestamp(dateNow) : ''

    // set headers
    const filename = [
      [filePrefix, fileSuffix].filter((i) => i).join('_'),
      FileHelper.mapFileMimetype(fileType),
    ].join('.')

    res
      .setHeader('Content-Type', fileType)
      .setHeader('Content-Length', fileBuffer.length)
      .setHeader('Content-Disposition', `${disposition}; filename=${filename}`)

    return new StreamableFile(fileBuffer)
  }
}
