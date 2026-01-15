import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { LoggerService } from 'lib/nest-core'
import { MetricsService } from './metrics.service'

@Injectable()
export class ReporterService implements OnApplicationBootstrap {
  private static logger: LoggerService
  private static metrics: MetricsService

  constructor(
    private readonly logger: LoggerService,
    private readonly metrics: MetricsService
  ) {}

  onApplicationBootstrap() {
    ReporterService.logger = this.logger
    ReporterService.metrics = this.metrics
  }

  static counter(key: string, labels?: Record<string, string | number>, value: number = 1): void {
    try {
      this.metrics.incCounter(key, labels, value)
    } catch (error) {
      this.logError('increment counter', key, labels, error)
    }
  }

  static gauge(key: string, value: number, labels?: Record<string, string | number>): void {
    try {
      this.metrics.setGauge(key, value, labels)
    } catch (error) {
      this.logError('set gauge', key, labels, error)
    }
  }

  static histogram(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
    buckets?: number[]
  ): void {
    try {
      this.metrics.observeHistogram(key, value, labels, buckets)
    } catch (error) {
      this.logError('observe histogram', key, labels, error)
    }
  }

  static summary(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
    percentiles?: number[]
  ): void {
    try {
      this.metrics.observeSummary(key, value, labels, percentiles)
    } catch (error) {
      this.logError('observe summary', key, labels, error)
    }
  }

  static async pushMetrics(jobName: string): Promise<void> {
    try {
      await this.metrics.pushMetrics(jobName)
    } catch (e) {
      this.logger.error(`Error pushing metrics: ${e}`)
    }
  }

  private static logError(
    action: string,
    key: string,
    labels: Record<string, string | number> | undefined,
    error: unknown
  ): void {
    this.logger.error({
      message: `Failed to ${action}`,
      metric: key,
      labels,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
