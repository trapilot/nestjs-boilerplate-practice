import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseInterceptors,
} from '@nestjs/common'
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
  NoFilesInterceptor,
} from '@nestjs/platform-express'
import { FILE_SIZE_IN_BYTES } from '../constants'
import { FileHelper } from '../helpers'
import {
  IFileUploadMultiple,
  IFileUploadMultipleField,
  IFileUploadMultipleFieldOptions,
  IFileUploadSingle,
} from '../interfaces'

export function FileUploadSingle(options: IFileUploadSingle): MethodDecorator {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(options?.field ?? 'file', {
        storage: FileHelper.createDiskStorage(options?.filePath, options?.fileUser),
        limits: {
          fileSize: options?.fileSize ?? FILE_SIZE_IN_BYTES,
          files: 1,
        },
      }),
    ),
  )
}

export function FileUploadMultiple(options: IFileUploadMultiple): MethodDecorator {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(options?.field ?? 'files', options?.maxFiles ?? 2, {
        storage: FileHelper.createDiskStorage(options?.filePath, options?.fileUser),
        limits: {
          fileSize: options?.fileSize ?? FILE_SIZE_IN_BYTES,
        },
      }),
    ),
  )
}

export function FileUploadMultipleFields(
  fields: IFileUploadMultipleField[],
  options?: IFileUploadMultipleFieldOptions,
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        fields.map((e) => ({
          name: e.field,
          maxCount: e.maxFiles,
        })),
        {
          storage: FileHelper.createDiskStorage(options?.filePath, options?.fileUser),
          limits: {
            fileSize: options?.fileSize ?? FILE_SIZE_IN_BYTES,
          },
        },
      ),
    ),
  )
}

export function NoFilesUpload(): MethodDecorator {
  return applyDecorators(UseInterceptors(NoFilesInterceptor()))
}

export const FilePartNumber: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest()
    const { headers } = request
    return headers['x-part-number'] ? Number(headers['x-part-number']) : 0
  },
)
