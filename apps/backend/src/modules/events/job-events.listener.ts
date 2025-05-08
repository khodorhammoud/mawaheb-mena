import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QueueService } from '../queue/queue.service';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class JobEventsListener {
  constructor(
    private readonly queueService: QueueService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Fire when an account switches to "published".
   * Only triggers skillfolio generation when account status changes to published.
   */
  @OnEvent('account.status.changed')
  async handleAccountStatusChanged(payload: {
    accountId: number;
    userId: number;
    previousStatus: string;
    newStatus: string;
  }) {
    // Ignore anything except the transition → published
    if (payload.newStatus !== 'published') return;

    // Trigger skillfolio generation
    await this.triggerSkillfolioGeneration(payload.userId, payload.accountId);
  }

  /**
   * Manually trigger skillfolio generation for a user
   * This can be called directly from an API endpoint
   */
  async triggerSkillfolioGeneration(userId: number, accountId: number) {
    // Add skillfolio job to the queue
    const job = await this.queueService.addSkillFolioJob(userId, {
      reason: 'account_published',
      accountId: accountId,
    });

    // Create "initiated" notification
    await this.notificationService.create({
      userId: userId,
      type: 'skillfolio_added',
      message: `Your SkillFolio has been added`,
      payload: {
        jobId: job.id,
        logicalId: job.logicalId,
        accountId: accountId,
        initiatedAt: new Date().toISOString(),
      },
    });

    return job;
  }

  /**
   * Handle when a skillfolio job starts
   */
  @OnEvent('job.skillfolio.started')
  async handleSkillfolioStarted(payload: {
    jobId: string;
    userId: number;
    metadata?: Record<string, any>;
  }) {
    await this.notificationService.create({
      userId: payload.userId,
      type: 'skillfolio_started',
      message: `Your SkillFolio has started its processing`,
      payload: {
        jobId: payload.jobId,
        startedAt: new Date().toISOString(),
        metadata: payload.metadata,
      },
    });
  }

  /**
   * Handle when a skillfolio job completes
   */
  @OnEvent('job.skillfolio.completed')
  async handleSkillfolioCompleted(payload: {
    jobId: string;
    userId: number;
    result?: any;
  }) {
    try {
      let skillfolioData = {};

      // Try to extract skillfolio data, handling different result formats
      if (payload.result?.data?.skillfolio?.skillfolio) {
        // Format from processor: nested under data.skillfolio.skillfolio
        skillfolioData = payload.result.data.skillfolio.skillfolio;
      } else if (payload.result?.data?.skillfolio) {
        // Direct format: under data.skillfolio
        skillfolioData = payload.result.data.skillfolio;
      }

      await this.notificationService.create({
        userId: payload.userId,
        type: 'skillfolio_completed',
        message: `Your SkillFolio has been successfully generated`,
        payload: {
          jobId: payload.jobId,
          completedAt: new Date().toISOString(),
          skillfolio: skillfolioData,
        },
      });
    } catch (error) {
      console.error(
        `Error handling skillfolio completion notification:`,
        error,
      );
      // Still create a notification without the skillfolio data
      await this.notificationService.create({
        userId: payload.userId,
        type: 'skillfolio_completed',
        message: `Your SkillFolio has been generated`,
        payload: {
          jobId: payload.jobId,
          completedAt: new Date().toISOString(),
          error: 'Error including skillfolio details in notification',
        },
      });
    }
  }

  /**
   * Handle when a skillfolio job fails
   */
  @OnEvent('job.skillfolio.failed')
  async handleSkillfolioFailed(payload: {
    jobId: string;
    userId: number;
    error: string;
  }) {
    await this.notificationService.create({
      userId: payload.userId,
      type: 'skillfolio_failed',
      message: `There was an error generating your SkillFolio`,
      payload: {
        jobId: payload.jobId,
        failedAt: new Date().toISOString(),
        error: payload.error,
      },
    });
  }

  // TODO: When adding a new process type, add event handlers for its lifecycle events here
  // Example for a resume process:
  //
  // @OnEvent('job.resume.started')
  // async handleResumeStarted(payload: {
  //   jobId: string;
  //   userId: number;
  //   metadata?: Record<string, any>;
  // }) {
  //   console.log(`📣 JobEventsListener: resume job #${payload.jobId} started for user ${payload.userId}`);
  //
  //   await this.notificationService.create({
  //     userId: payload.userId,
  //     type: 'resume_started',
  //     message: 'Your Resume generation has started processing.',
  //     payload: {
  //       jobId: payload.jobId,
  //       startedAt: new Date().toISOString(),
  //       metadata: payload.metadata
  //     },
  //   });
  // }
  //
  // @OnEvent('job.resume.completed')
  // async handleResumeCompleted(payload: { ... }) { ... }
  //
  // @OnEvent('job.resume.failed')
  // async handleResumeFailed(payload: { ... }) { ... }
}
