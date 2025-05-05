import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum JobType {
  SKILLFOLIO = 'skillfolio',
  // TODO: When adding a new process type, add it here as a new enum value
  // Example: RESUME = 'resume',
}

export interface JobData {
  type: JobType;
  userId: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class QueueService implements OnModuleInit {
  // Track active job count for logical sequencing
  private activeJobCount = 0;
  // Map to store our logical IDs to Bull's actual IDs
  private logicalToActualJobIdMap = new Map<number, string>();

  constructor(
    @InjectQueue('processQueue') private readonly processQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Initialize queue settings when module loads
  async onModuleInit() {
    // Reset the job counter
    await this.resetJobCounter();

    // Set up automatic job cleanup initially
    const completedJobs = await this.processQueue.getCompleted();
    if (completedJobs.length > 0) {
      await this.processQueue.clean(0, 'completed');
    }

    // Set up recurring cleanup task every 5 minutes
    setInterval(
      async () => {
        const completedJobs = await this.processQueue.getCompleted();
        if (completedJobs.length > 0) {
          await this.processQueue.clean(0, 'completed');
        }
      },
      5 * 60 * 1000,
    );

    // Handle stalled jobs
    this.processQueue.on('stalled', (job) => {});

    // Handle completed jobs
    this.processQueue.on('completed', async (job) => {
      const jobType = job.data.type;

      // Get the logical ID for this job
      const logicalId = this.getLogicalIdForJob(job.id.toString());
      if (logicalId) {
        // Remove the mapping
        this.logicalToActualJobIdMap.delete(logicalId);
      }

      // Decrease active job count
      this.activeJobCount = Math.max(0, this.activeJobCount - 1);

      // Remove completed job from the queue
      await job.remove();

      // If queue is empty, reset the counter
      if (this.activeJobCount === 0) {
        await this.resetJobCounter();
      }
    });

    // Handle failed jobs
    this.processQueue.on('failed', async (job) => {
      const jobType = job.data.type;

      // Get the logical ID for this job
      const logicalId = this.getLogicalIdForJob(job.id.toString());
      if (logicalId) {
        // Remove the mapping
        this.logicalToActualJobIdMap.delete(logicalId);
      }

      // Decrease active job count
      this.activeJobCount = Math.max(0, this.activeJobCount - 1);
    });
  }

  // Helper to reset job counter when queue is empty
  private async resetJobCounter() {
    // Check if queue is actually empty
    const waiting = await this.processQueue.getWaiting();
    const active = await this.processQueue.getActive();
    const delayed = await this.processQueue.getDelayed();

    if (waiting.length === 0 && active.length === 0 && delayed.length === 0) {
      this.activeJobCount = 0;
      this.logicalToActualJobIdMap.clear();
    } else {
      this.activeJobCount = waiting.length + active.length + delayed.length;
    }
  }

  // Helper to get the logical ID for a Bull job ID
  private getLogicalIdForJob(bullJobId: string): number | null {
    for (const [
      logicalId,
      actualId,
    ] of this.logicalToActualJobIdMap.entries()) {
      if (actualId === bullJobId) {
        return logicalId;
      }
    }
    return null;
  }

  // Enqueue any job
  async addJob(data: JobData) {
    // Increment the job count
    this.activeJobCount++;
    const logicalJobId = this.activeJobCount;

    // Add the logical job ID to the metadata so processors can access it
    const jobData = {
      ...data,
      metadata: {
        ...(data.metadata || {}),
        logicalJobId,
      },
    };

    // Add the job to the queue with removeOnComplete
    const job = await this.processQueue.add(data.type, jobData, {
      removeOnComplete: true, // Automatically remove job from queue when completed
      removeOnFail: false, // Keep failed jobs for debugging
    });

    // Store the mapping between our logical ID and Bull's actual ID
    this.logicalToActualJobIdMap.set(logicalJobId, job.id.toString());

    // Emit a general job.added event
    this.eventEmitter.emit('job.added', {
      jobId: job.id,
      logicalJobId: logicalJobId,
      type: data.type,
      userId: data.userId,
    });

    // Emit a type-specific job added event
    this.eventEmitter.emit(`job.${data.type}.added`, {
      jobId: job.id,
      logicalJobId: logicalJobId,
      userId: data.userId,
      metadata: data.metadata,
    });

    // Return both IDs for reference
    return {
      id: job.id,
      logicalId: logicalJobId,
    };
  }

  // Convenience method for skillfolio jobs
  async addSkillFolioJob(userId: number, metadata: Record<string, any> = {}) {
    return this.addJob({ type: JobType.SKILLFOLIO, userId, metadata });
  }

  // TODO: When adding a new process type, create a convenience method here
  // Example:
  // async addResumeJob(userId: number, metadata: Record<string, any> = {}) {
  //   return this.addJob({ type: JobType.RESUME, userId, metadata });
  // }

  // Get status/progress of a job
  async getJobStatus(jobId: string) {
    // Check if this is a logical ID (numeric)
    if (!isNaN(Number(jobId))) {
      // Convert logical ID to actual Bull ID
      let actualId = null;
      for (const [
        logicalId,
        bullJobId,
      ] of this.logicalToActualJobIdMap.entries()) {
        if (logicalId === Number(jobId)) {
          actualId = bullJobId;
          break;
        }
      }

      if (actualId) {
        jobId = actualId;
      } else {
        return {
          status: 'not_found',
          message: `No job found with logical ID ${jobId}`,
        };
      }
    }

    const job = await this.processQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }

    const state = await job.getState();
    const logicalId = this.getLogicalIdForJob(job.id.toString());

    return {
      id: job.id,
      logicalId: logicalId || 'unknown',
      status: state,
      progress: job.progress(),
      data: job.data,
    };
  }

  // Get all active jobs in the queue
  async getQueueJobs() {
    const waiting = await this.processQueue.getWaiting();
    const active = await this.processQueue.getActive();
    const delayed = await this.processQueue.getDelayed();
    const completed = await this.processQueue.getCompleted();
    const failed = await this.processQueue.getFailed();

    // Map jobs to include logical IDs
    const mapJobsWithLogicalIds = (jobs: Job[]) => {
      return jobs.map((job) => ({
        id: job.id,
        logicalId: this.getLogicalIdForJob(job.id.toString()) || 'unknown',
        type: job.data.type,
        userId: job.data.userId,
      }));
    };

    return {
      waiting: {
        count: waiting.length,
        jobs: mapJobsWithLogicalIds(waiting),
      },
      active: {
        count: active.length,
        jobs: mapJobsWithLogicalIds(active),
      },
      delayed: {
        count: delayed.length,
        jobs: mapJobsWithLogicalIds(delayed),
      },
      completed: {
        count: completed.length,
        jobs: mapJobsWithLogicalIds(completed),
      },
      failed: {
        count: failed.length,
        jobs: mapJobsWithLogicalIds(failed),
      },
      total:
        waiting.length +
        active.length +
        delayed.length +
        completed.length +
        failed.length,
      activeJobCount: this.activeJobCount,
    };
  }
}
