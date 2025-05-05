// JobsController — Defines API endpoints to interact with background jobs.
// - POST /api/jobs/skillfolio → Adds a new SkillFolio job to the queue
// - GET /api/jobs/:jobId/status → Returns the current status of a job
// This controller is used by the frontend to trigger background tasks and check their progress.

import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QueueService, JobType } from '../queue/queue.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly queueService: QueueService) {}

  @Post('/skillfolio')
  @UseGuards(AuthGuard)
  async createSkillFolioJob(@Body() body: { userId: number }) {
    const { userId } = body;

    if (!userId) {
      return {
        success: false,
        error: 'Missing required userId parameter',
      };
    }

    try {
      // Add a job to the queue for this user
      const result = await this.queueService.addSkillFolioJob(userId, {
        manual: true,
      });

      return {
        success: true,
        jobId: result.id,
        logicalId: result.logicalId,
        message: `Job added to queue for user ${userId}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  @Get('/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    if (!jobId) {
      return {
        success: false,
        error: 'Missing required jobId parameter',
      };
    }

    try {
      const result = await this.queueService.getJobStatus(jobId);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  @Get('/')
  async getJobs() {
    try {
      const result = await this.queueService.getQueueJobs();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  // TODO: When adding a new process type, create a new endpoint here
  // Example:
  // @Post('/resume')
  // @UseGuards(AuthGuard)
  // async createResumeJob(@Body() body: { userId: number }) {
  //   const { userId } = body;
  //   // Implementation similar to createSkillFolioJob but using addResumeJob
  // }
}
