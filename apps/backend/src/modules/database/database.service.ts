// DatabaseService.ts - Provides access to the database through drizzle-orm
// This service is a singleton injected into other services that need to do database operations

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  /** The main database instance */
  public db: any;

  /** PostgreSQL client for LISTEN/NOTIFY */
  private pgListener: Client;

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    // Initialize the database connection using the existing db implementation
    const { db } = await import('@mawaheb/db/server');
    this.db = db;
    console.log('Database module initialized, connection obtained');

    // Set up PostgreSQL LISTEN/NOTIFY client
    this.pgListener = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await this.pgListener.connect();

    // Setup trigger for account status changes if it doesn't exist
    await this.setupAccountStatusTrigger();

    // Listen for account_status notifications
    await this.pgListener.query('LISTEN account_status');
    console.log(
      '🔔 Listening for PostgreSQL notifications on channel: account_status',
    );

    // Handle notifications from PostgreSQL
    this.pgListener.on('notification', ({ payload }) => {
      if (!payload) return;

      try {
        const data = JSON.parse(payload);
        console.log('📢 Received account status notification:', data);

        // Emit the event for the rest of the application
        this.eventEmitter.emit('account.status.changed', {
          accountId: data.accountId,
          userId: data.userId,
          previousStatus: data.previous,
          newStatus: data.current,
        });
      } catch (error) {
        console.error('Error processing database notification:', error);
      }
    });
  }

  async onModuleDestroy() {
    // Close the listener connection when the application shuts down
    if (this.pgListener) {
      await this.pgListener.end();
    }
  }

  /**
   * Sets up the database trigger for account status changes
   */
  private async setupAccountStatusTrigger() {
    try {
      // Create the notification function
      await this.pgListener.query(`
        CREATE OR REPLACE FUNCTION notify_account_status() RETURNS trigger AS $$
        BEGIN
          IF TG_OP = 'UPDATE' AND NEW.account_status <> OLD.account_status THEN
            PERFORM pg_notify(
              'account_status',
              json_build_object(
                'accountId', NEW.id,
                'userId',    NEW.user_id,
                'previous',  OLD.account_status,
                'current',   NEW.account_status
              )::text
            );
          END IF;
          RETURN NEW;
        END; $$ LANGUAGE plpgsql;
      `);

      // Check if trigger already exists
      const triggerCheck = await this.pgListener.query(`
        SELECT * FROM pg_trigger WHERE tgname = 'trg_account_status';
      `);

      // Create the trigger if it doesn't exist
      if (triggerCheck.rows.length === 0) {
        await this.pgListener.query(`
          CREATE TRIGGER trg_account_status
          AFTER UPDATE ON accounts
          FOR EACH ROW EXECUTE PROCEDURE notify_account_status();
        `);
        console.log('✅ Created database trigger for account status changes');
      } else {
        console.log(
          '✅ Database trigger for account status changes already exists',
        );
      }
    } catch (error) {
      console.error('Error setting up account status trigger:', error);
      // We'll continue even if the trigger setup fails - the polling mechanism should still work as fallback
    }
  }
}
