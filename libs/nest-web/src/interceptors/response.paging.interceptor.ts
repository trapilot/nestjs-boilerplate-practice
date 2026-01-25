import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer'
import { stream, Workbook, Worksheet } from 'exceljs'
import {
  DecoratorPropertyStorage,
  EnumFileExtensionDocument,
  FileUtil,
  HelperService,
  IExportableMetadata,
  IRequestApp,
  IResponseApp,
  IReturnGenerator,
  IReturnPaging,
  MessageService,
  ResponsePagingMetadataDto,
  ResponseSuccessDto,
  ScopeContext,
  StrUtil,
} from 'lib/nest-core'
import { Observable, throwError } from 'rxjs'
import { catchError, mergeMap } from 'rxjs/operators'
import {
  REQUEST_DEFAULT_EXPORT_PER_SHEET,
  RESPONSE_DTO_CONSTRUCTOR_METADATA,
  RESPONSE_DTO_TRANSFORM_METADATA,
  RESPONSE_FILE_EXPORT_METADATA,
} from '../constants'
import { ResponseUserBelongDto } from '../dtos'
import { IResponsePaging } from '../interfaces'
import { ResponseUtil } from '../utils'

@Injectable()
export class ResponsePagingInterceptor<T, R> implements NestInterceptor<T, IResponsePaging<R>> {
  constructor(
    private readonly message: MessageService,
    private readonly reflector: Reflector,
    private readonly helperService: HelperService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (context.getType() !== 'http') {
      return next.handle()
    }

    const { query } = context.switchToHttp().getRequest()
    const bookType = query?.bookType
    const exportFlag = this.reflector.get<boolean>(
      RESPONSE_FILE_EXPORT_METADATA,
      context.getHandler(),
    )

    return next.handle().pipe(
      mergeMap(async (res: IResponsePaging<R>) => {
        if (exportFlag && Boolean(bookType) && ['xlsx', 'csv'].includes(bookType)) {
          return await this.export(context, res as IReturnGenerator<R>, bookType)
        }
        return await this.send(context, res as IReturnPaging<R>)
      }),
      catchError(err => throwError(() => err)),
    )
  }

  private async send(
    context: ExecutionContext,
    response: IReturnPaging<R>,
  ): Promise<ResponseSuccessDto> {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_CONSTRUCTOR_METADATA,
      context.getHandler(),
    )

    const dtoTransform = this.reflector.get<ClassTransformOptions>(
      RESPONSE_DTO_TRANSFORM_METADATA,
      context.getHandler(),
    )

    const dtoGroups = [req?.user?.loginFrom, req?.user?.scopeType]

    // metadata
    const nowDate = this.helperService.dateNow()
    const ctxData = ScopeContext.getReqData()
    let metadata: ResponsePagingMetadataDto = {
      path: req.path,
      language: ctxData.language,
      timezone: ctxData.timezone,
      version: ctxData.version,
      timestamp: this.helperService.dateGetTimestamp(nowDate),
      availableSearch: req.__filters?.availableSearch ?? [],
      availableOrderBy: req.__filters?.availableOrderBy ?? [],
      pagination: {
        ...{ page: 1, perPage: 1, totalPage: 1, totalRecord: 1 },
        ...req.__pagination,
        ...response.pagination,
      },
    }

    const statusHttp = res.statusCode
    let result = response.data

    if (dtoClass) {
      result = ResponseUtil.mapToInstances(result, {
        type: dtoClass,
        transform: { groups: dtoGroups, ...dtoTransform },
        mappingProperties: response?.metadata?.mappingProperties,
      })
    }

    metadata = {
      ...response.metadata,
      ...metadata,
    }

    res
      .setHeader('x-language', metadata.language)
      .setHeader('x-timezone', metadata.timestamp)
      .setHeader('x-version', metadata.version)
      .status(statusHttp)

    return {
      success: true,
      metadata,
      result,
    }
  }

  private async export(context: ExecutionContext, response: IReturnGenerator<R>, bookType: string) {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_CONSTRUCTOR_METADATA,
      context.getHandler(),
    )

    const dtoTransform = this.reflector.get<ClassTransformOptions>(
      RESPONSE_DTO_TRANSFORM_METADATA,
      context.getHandler(),
    )

    const dtoGroups = [req?.user?.loginFrom, req?.user?.scopeType]

    const fileXlsx = bookType === EnumFileExtensionDocument.XLSX
    const fileOutput = response?.filePrefix ?? 'export'

    const filename = FileUtil.format(fileOutput, {
      timestamp: response?.fileTimestamp,
      extension: bookType,
    })

    // set headers
    res
      .setHeader('Content-Type', FileUtil.extractMimeFromFilename(filename))
      .setHeader('Content-Disposition', `attachment; filename=${filename}`)

    const workbook = fileXlsx
      ? new stream.xlsx.WorkbookWriter({ stream: res, useStyles: false, useSharedStrings: true })
      : new Workbook()

    const serializeOptions = {
      excludeExtraneousValues: true,
      groups: dtoGroups,
      ...dtoTransform,
    }

    const userProperties = Object.keys(plainToInstance(ResponseUserBelongDto, {}, serializeOptions))
    const exportProperties = DecoratorPropertyStorage.get<IExportableMetadata>(dtoClass)
    const mappingProperties = response?.metadata?.mappingProperties

    let rowIndex = 0
    let sheetIndex = 1
    let sheetFields = []
    let sheetHeaders = []
    let worksheet: Worksheet = null

    const sheetSize = REQUEST_DEFAULT_EXPORT_PER_SHEET
    const generator: AsyncGenerator<R[]> = response.data

    // Process each data item in the generator stream
    for await (const records of generator) {
      for (let data of records) {
        if (rowIndex > 0 && sheetHeaders.length === 0) break

        if (dtoClass) {
          data = ResponseUtil.mapToInstance(data, {
            type: dtoClass,
            transform: serializeOptions,
            mappingProperties: mappingProperties,
          })
        }

        if (sheetHeaders.length === 0) {
          sheetFields = ResponseUtil.mapToProperties(data, {
            type: dtoClass,
            transform: serializeOptions,
            allowProperties: exportProperties,
            ignoreProperties: userProperties,
          })

          if (sheetHeaders.length === 0) {
            sheetHeaders = sheetFields.map(field => {
              const { header } = exportProperties.get(field) || {}
              if (header) {
                return this.message.setMessage(header)
              }
              return StrUtil.capitalize(field, { splitWords: true })
            })
          }

          if (sheetHeaders.length === 0) {
            console.warn(
              `${dtoClass.name} does not exists exportable properties. Please add Exportable decorator`,
            )
          }
        }

        // add new work sheet
        if (sheetHeaders.length && rowIndex % sheetSize === 0) {
          worksheet?.commit()
          worksheet = workbook.addWorksheet(`Sheet ${sheetIndex++}`)
          worksheet!.addRow(sheetHeaders).commit()
        }

        // add new sheet row
        if (sheetFields.length) {
          const sheetRow = []
          for (const field of sheetFields) {
            if (userProperties.includes(field)) {
              const userData = data[field]?.name ?? data[field]
              sheetRow.push(userData || undefined)
            } else {
              sheetRow.push(data[field])
            }
          }
          worksheet!.addRow(sheetRow).commit()
        }

        rowIndex++
      }
    }

    // save workbook
    if (fileXlsx) {
      await (workbook as stream.xlsx.WorkbookWriter).commit()
    } else {
      await workbook.csv.write(res)
    }

    // send
    res.end()
  }
}
