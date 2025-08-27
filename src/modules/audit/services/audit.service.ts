import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { ILoggerEntry } from 'lib/nest-logger'
import { PrismaService } from 'lib/nest-prisma'

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  toHttpData(entry: ILoggerEntry): Prisma.AuditLogHttpUncheckedCreateInput {
    return {
      correlationId: entry.data.correlationId,
      type: entry.data.context,
      level: entry.data.level,
      ip: entry.data.req?.ip,
      protocol: entry.data.req?.protocol,
      hostname: entry.data.req?.hostname,
      pid: entry.data.pid,
      method: entry.data.req?.method,
      url: entry.data.req.url,
      referrer: entry.data.req?.headers?.referer,
      message: entry.data.message,
      headers: entry.data.req?.headers,
      params: entry.data.req?.params,
      query: entry.data.req?.query,
      body: entry.data.req?.body,
      language: entry.data.req?.headers?.['x-language'] as string,
      userAgent: entry.data.req?.headers?.['user-agent'],
      statusCode: entry.data.res?.statusCode,
      responseHeaders: entry.data.res?.headers,
      responseTime: entry.data.res?.responseTime,
      rawMetadata: entry.meta,
      rawRequest: entry.data.req as any,
      rawResponse: entry.data.res as any,
    }
  }

  async saveHttpData(data: Prisma.AuditLogHttpUncheckedCreateInput) {
    await this.prisma.auditLogHttp.create({ data })
  }

  async saveSqlData(data: Prisma.AuditLogMysqlUncheckedCreateInput) {
    await this.prisma.auditLogMysql.create({ data })
  }
}
