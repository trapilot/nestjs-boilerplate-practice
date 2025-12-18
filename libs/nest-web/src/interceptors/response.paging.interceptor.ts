import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer'
import { stream, Workbook, Worksheet } from 'exceljs'
import {
  AppContext,
  DateService,
  ENUM_FILE_TYPE_EXCEL,
  FileHelper,
  IRequestApp,
  IResponseApp,
  MessageService,
  MetadataHelper,
  ResponsePagingMetadataDto,
  ResponseSuccessDto,
} from 'lib/nest-core'
import { Observable, throwError } from 'rxjs'
import { catchError, mergeMap } from 'rxjs/operators'
import {
  REQUEST_DEFAULT_EXPORT_PER_SHEET,
  RESPONSE_DTO_CONSTRUCTOR_METADATA,
  RESPONSE_DTO_OPTIONS_METADATA,
  RESPONSE_FILE_EXPORT_METADATA,
} from '../constants'
import { ResponseUserBelongDto } from '../dtos'
import { IDataIterator, IDataPaging, IResponsePaging } from '../interfaces'

@Injectable()
export class ResponsePagingInterceptor<T> implements NestInterceptor<T, IResponsePaging> {
  constructor(
    private readonly reflector: Reflector,
    private readonly dateService: DateService,
    private readonly messageService: MessageService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (context.getType() === 'http') {
      const { query } = context.switchToHttp().getRequest()
      const exportType = query?.exportType
      const exportFlag = this.reflector.get<boolean>(
        RESPONSE_FILE_EXPORT_METADATA,
        context.getHandler(),
      )

      return next.handle().pipe(
        mergeMap(async (res: IResponsePaging) => {
          if (exportFlag && Boolean(exportType) && ['xlsx', 'csv'].includes(exportType)) {
            return await this.export(context, res as IDataIterator, exportType)
          } else {
            return await this.send(context, res as IDataPaging)
          }
        }),
        catchError((err) => {
          return throwError(() => err)
        }),
      )
    }

    return next.handle()
  }

  private async send(
    context: ExecutionContext,
    responsePaging: IDataPaging,
  ): Promise<ResponseSuccessDto> {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_CONSTRUCTOR_METADATA,
      context.getHandler(),
    )

    const dtoOptions = this.reflector.get<ClassTransformOptions>(
      RESPONSE_DTO_OPTIONS_METADATA,
      context.getHandler(),
    )

    // metadata
    const dateNow = this.dateService.create()
    const ctxData = AppContext.current()
    let metadata: ResponsePagingMetadataDto = {
      path: req.path,
      language: ctxData?.language ?? AppContext.language(),
      timezone: ctxData?.timezone ?? AppContext.timezone(),
      version: ctxData?.apiVersion ?? AppContext.apiVersion(),
      timestamp: this.dateService.getTimestamp(dateNow),
      availableSearch: req.__filters?.availableSearch ?? [],
      availableOrderBy: req.__filters?.availableOrderBy ?? [],
      pagination: {
        ...{ page: 1, perPage: 1, totalPage: 1, totalRecord: 1 },
        ...req.__pagination,
        ...responsePaging.pagination,
      },
    }

    const statusHttp = res.statusCode
    let result = responsePaging.data

    const { _metadata } = responsePaging
    const customProperty = _metadata?.customProperty

    if (dtoClass) {
      if (customProperty?.serializeProperties) {
        result.forEach((i) => ({ __metadata: customProperty.serializeProperties, ...i }))
      }

      result = plainToInstance(dtoClass, result, {
        excludeExtraneousValues: true,
        groups: [req?.user?.loginFrom, req?.user?.scopeType],
        ...dtoOptions,
      })
    }

    delete _metadata?.customProperty

    metadata = {
      ...metadata,
      ..._metadata,
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

  private async export(
    context: ExecutionContext,
    responseIterator: IDataIterator,
    exportType: string,
  ) {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_CONSTRUCTOR_METADATA,
      context.getHandler(),
    )

    const dtoOptions = this.reflector.get<ClassTransformOptions>(
      RESPONSE_DTO_OPTIONS_METADATA,
      context.getHandler(),
    )

    const dateNow = this.dateService.create()
    const fileExcel = exportType === ENUM_FILE_TYPE_EXCEL.XLSX
    const filePrefix = responseIterator?.filePrefix ?? 'export'
    const fileSuffix = responseIterator?.fileTimestamp ? this.dateService.getTimestamp(dateNow) : ''

    const filename = `${[filePrefix, fileSuffix].filter((i) => i).join('_')}.${exportType}`

    // set headers
    res
      .setHeader('Content-Type', FileHelper.toFileMimetype(filename))
      .setHeader('Content-Disposition', `attachment; filename=${filename}`)

    const workbook = fileExcel
      ? new stream.xlsx.WorkbookWriter({ stream: res, useStyles: false, useSharedStrings: true })
      : new Workbook()

    const dtoSerializeOptions = {
      excludeExtraneousValues: true,
      groups: [req?.user?.loginFrom, req?.user?.scopeType],
      ...dtoOptions,
    }

    const userKeys = Object.keys(plainToInstance(ResponseUserBelongDto, {}, dtoSerializeOptions))
    const exportProperties = MetadataHelper.getExportableProperties(dtoClass)
    const serializeMetadata = responseIterator?._metadata?.customProperty?.serializeProperties ?? {}

    let rowIndex = 0
    let sheetIndex = 1
    let sheetFields = []
    let sheetHeaders = []
    let worksheet: Worksheet = null

    const sheetSize = REQUEST_DEFAULT_EXPORT_PER_SHEET
    const iterator: AsyncGenerator<any[]> = responseIterator.data

    // Process each data item in the iterator stream
    for await (const records of iterator) {
      for (let data of records) {
        if (dtoClass) {
          const dtoSerializeData = { __metadata: serializeMetadata, ...data }
          data = plainToInstance(dtoClass, dtoSerializeData, dtoSerializeOptions)
        }

        if (sheetFields.length === 0) {
          sheetFields = Object.keys(plainToInstance(dtoClass, {}, dtoSerializeOptions))
            .filter((field) => data[field] !== undefined)
            .filter((field) => exportProperties.has(field) || userKeys.includes(field))

          sheetHeaders = sheetFields.map((field) => {
            const { message, domain } = exportProperties.get(field) || {}
            if (message) {
              return this.messageService.setMessage(`${message}`)
            }
            if (domain) {
              return this.messageService.setMessage(['export', domain, field].join('.'))
            }
            return field
              .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
              .replace(/^./, (c: string) => c.toUpperCase())
          })
        }

        if (rowIndex % sheetSize === 0) {
          worksheet?.commit()
          worksheet = workbook.addWorksheet(`Sheet ${sheetIndex++}`)
          worksheet!.addRow(sheetHeaders).commit()
        }

        const sheetRow = []
        for (const field of sheetFields) {
          if (userKeys.includes(field)) {
            const userData = data[field]?.name ?? data[field]
            sheetRow.push(userData || undefined)
          } else {
            sheetRow.push(data[field])
          }
        }

        worksheet!.addRow(sheetRow).commit()
        rowIndex++
      }
    }

    // save workbook
    if (fileExcel) {
      await (workbook as stream.xlsx.WorkbookWriter).commit()
    } else {
      await workbook.csv.write(res)
    }

    // send
    res.end()
  }
}
