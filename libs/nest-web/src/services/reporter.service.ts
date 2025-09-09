import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { MetricsService } from './metrics.service'

@Injectable()
export class ReporterService implements OnApplicationBootstrap {
  private static readonly logger = new Logger(ReporterService.name)
  private static metricsService: MetricsService

  constructor(private readonly metrics: MetricsService) {}

  onApplicationBootstrap() {
    ReporterService.metricsService = this.metrics
  }

  static counter(key: string, labels?: Record<string, string | number>, value: number = 1): void {
    try {
      this.metricsService.incCounter(key, labels, value)
    } catch (error) {
      this.logError('increment counter', key, labels, error)
    }
  }

  static gauge(key: string, value: number, labels?: Record<string, string | number>): void {
    try {
      this.metricsService.setGauge(key, value, labels)
    } catch (error) {
      this.logError('set gauge', key, labels, error)
    }
  }

  static histogram(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
    buckets?: number[],
  ): void {
    try {
      this.metricsService.observeHistogram(key, value, labels, buckets)
    } catch (error) {
      this.logError('observe histogram', key, labels, error)
    }
  }

  static summary(
    key: string,
    value: number,
    labels?: Record<string, string | number>,
    percentiles?: number[],
  ): void {
    try {
      this.metricsService.observeSummary(key, value, labels, percentiles)
    } catch (error) {
      this.logError('observe summary', key, labels, error)
    }
  }

  static async pushMetrics(jobName: string): Promise<void> {
    try {
      await this.metricsService.pushMetrics(jobName)
    } catch (e) {
      this.logger.error(`Error pushing metrics: ${e}`)
    }
  }

  private static logError(
    action: string,
    key: string,
    labels: Record<string, string | number> | undefined,
    error: unknown,
  ): void {
    this.logger.error({
      message: `Failed to ${action}`,
      metric: key,
      labels,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
