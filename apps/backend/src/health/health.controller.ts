import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  HealthIndicatorResult,
  HealthCheckStatus,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';
import { DatabaseService } from '../modules/database/database.service';
import { QueueService } from '../modules/queue/queue.service';

/**
 * Custom health indicator for PostgreSQL database
 */
@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test database connectivity by performing a simple query
      // Using drizzle-orm's sql template for a simple ping query
      const result = await this.databaseService.db.execute('SELECT 1 as ping');

      return this.getStatus(key, true, {
        message: 'PostgreSQL connection is healthy',
        response: result?.rows?.[0] || result,
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: `PostgreSQL connection failed: ${error.message}`,
      });
    }
  }
}

/**
 * Custom health indicator for Redis queue system
 */
@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  constructor(private readonly queueService: QueueService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Get queue statistics to verify Redis connectivity
      const queueStats = await this.queueService.getQueueJobs();

      return this.getStatus(key, true, {
        message: 'Queue system is healthy',
        activeJobs: queueStats.activeJobCount,
        totalJobs: queueStats.total,
        queues: {
          waiting: queueStats.waiting.count,
          active: queueStats.active.count,
          completed: queueStats.completed.count,
          failed: queueStats.failed.count,
        },
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: `Queue system failed: ${error.message}`,
      });
    }
  }
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealthIndicator: DatabaseHealthIndicator,
    private readonly queueHealthIndicator: QueueHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.databaseHealthIndicator.isHealthy('database'),
      () => this.queueHealthIndicator.isHealthy('queue'),
    ]);
  }

  /**
   * Detailed health check endpoint with more granular information
   */
  @Get('detailed')
  async detailedCheck(): Promise<{
    status: HealthCheckStatus;
    info: Record<string, any>;
    error: Record<string, any>;
    details: Record<string, any>;
  }> {
    const result = await this.health.check([
      () => this.databaseHealthIndicator.isHealthy('database'),
      () => this.queueHealthIndicator.isHealthy('queue'),
    ]);

    return {
      status: result.status,
      info: result.info || {},
      error: result.error || {},
      details: result.details,
    };
  }

  /**
   * Simple ping endpoint for basic liveness checks
   */
  @Get('ping')
  ping(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
