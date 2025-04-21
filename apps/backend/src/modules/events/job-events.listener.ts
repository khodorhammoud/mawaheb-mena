import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class JobEventsListener {
  @OnEvent('job.completed')
  handleJobCompleted(payload: {
    jobId: string;
    type: string;
    userId: number;
    result: any;
  }) {
    console.log(
      `🔔 JobEventsListener: job.completed event received for #${payload.jobId} (${payload.type}) for user ${payload.userId}`,
    );
    // → This listener just logs the event, it doesn't create notifications directly
  }
}
