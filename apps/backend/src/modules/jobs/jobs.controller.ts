// JobsController — Defines API endpoints to interact with background jobs.
// - POST /api/jobs/skillfolio → Adds a new SkillFolio job to the queue
// - GET /api/jobs/:jobId/status → Returns the current status of a job
// This controller is used by the frontend to trigger background tasks and check their progress.

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { QueueService, JobType } from '../queue/queue.service';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly queueService: QueueService) {}

  @Post('skillfolio')
  async createSkillFolioJob(
    @Body() body: { userId: number; metadata?: Record<string, any> },
  ) {
    const { userId, metadata } = body;

    if (!userId) {
      return { success: false, message: 'User ID is required' };
    }

    try {
      const jobResult = await this.queueService.addSkillFolioJob(
        userId,
        metadata,
      ); // adds a job to the Redis queue
      return {
        success: true,
        jobId: jobResult.id,
        logicalJobId: jobResult.logicalId,
        message: `Added job with logical ID #${jobResult.logicalId}`,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create skillfolio job',
      };
    }
  }
  // This endpoint lets the frontend send:
  // POST /api/jobs/skillfolio
  // {
  // "userId": 123,
  // "metadata": { "additionalData": "value" }
  // }
  //
  // And your server responds with:
  // {
  // "success": true,
  // "jobId": "abc123",
  // "logicalJobId": 1,
  // "message": "Added job with logical ID #1"
  // }

  @Get(':jobId/status')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const status = await this.queueService.getJobStatus(jobId); // looks inside Redis and returns the job info from the queue.
      return status;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to get job status',
      };
    }
  }
  // This endpoint lets the frontend send:
  // GET /api/jobs/abc123/status
  // And your server responds with:
  // {
  //   "id": "abc123",
  //   "logicalId": 1,
  //   "status": "completed",
  //   "progress": 100,
  //   "data": {
  //     "userId": 123,
  //     "portfolioData": { ... }
  //   }
  // }

  @Get('queue/status')
  async getQueueStatus() {
    try {
      const queueStatus = await this.queueService.getQueueJobs();
      return {
        success: true,
        queueStatus,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to get queue status',
      };
    }
  }
}
