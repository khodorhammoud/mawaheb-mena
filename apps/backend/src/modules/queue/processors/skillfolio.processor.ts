import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobType, JobData } from '../queue.service';

@Injectable()
@Processor('processQueue')
export class SkillFolioProcessor {
  constructor(
    @InjectQueue('processQueue') private readonly processQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Helper to get the logical ID for a Bull job ID
  private getLogicalIdForJob(bullJobId: string): number | null {
    // Since we don't have direct access to the QueueService's map,
    // we'll try to find it in the job metadata if available
    // This is a fallback; the actual logicalJobId should come from the QueueService

    // Default to null if we can't determine it
    return null;
  }

  @Process(JobType.SKILLFOLIO)
  async handleSkillFolioCreation(job: Job<JobData>) {
    try {
      const { userId, metadata } = job.data;

      // Get the logical job ID if available in metadata
      // This is a placeholder - in the actual implementation, you should get this from
      // the QueueService's mapping or job metadata
      const logicalJobId = metadata?.logicalJobId || 1;

      // Emit job started event
      this.eventEmitter.emit('job.started', {
        jobId: job.id,
        logicalJobId,
        type: JobType.SKILLFOLIO,
        userId,
      });

      console.log(
        `▶️  Processing skillfolio job #${job.id} (logical ID: ${logicalJobId}) for user ${userId}`,
      );

      // simulate progress
      await job.progress(0);
      await new Promise((res) => setTimeout(res, 1000));
      await job.progress(50);
      await new Promise((res) => setTimeout(res, 1000));
      await job.progress(100);

      const result = {
        success: true,
        message: 'SkillFolio processed successfully',
        userId,
        data: {
          skillfolio: {
            id: Math.floor(Math.random() * 1000),
            title: 'Generated SkillFolio',
            skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
            score: Math.floor(Math.random() * 100),
            generatedAt: new Date().toISOString(),
          },
        },
      };

      console.log(
        `✅  Completed skillfolio job #${job.id} (logical ID: ${logicalJobId}) for user ${userId}`,
      );

      // Emit job completed event
      this.eventEmitter.emit('job.completed', {
        jobId: job.id,
        logicalJobId,
        type: JobType.SKILLFOLIO,
        userId,
        result,
      });

      return result;
    } catch (error) {
      // Get the logical job ID if available in metadata (fallback)
      const logicalJobId = job.data.metadata?.logicalJobId || null;

      // Log and emit job failed event
      console.error(
        `❌ Failed to process skillfolio job #${job.id} (logical ID: ${logicalJobId || 'unknown'}): ${error.message}`,
      );

      this.eventEmitter.emit('job.failed', {
        jobId: job.id,
        logicalJobId,
        type: JobType.SKILLFOLIO,
        userId: job.data.userId,
        error: error.message || 'Unknown error',
      });

      // Rethrow to let Bull handle the failure
      throw error;
    }
  }
}
