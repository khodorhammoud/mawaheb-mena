import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createConnection } from '@mawaheb/db';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private dbInstance;

  constructor() {
    // Create the database connection using the shared package
    this.dbInstance = createConnection();
    console.log('Database connection created');
  }

  onModuleInit() {
    console.log('Database module initialized');
  }

  onModuleDestroy() {
    // Close the database connection when the application shuts down
    console.log('Database connection closed');
  }

  // Method to get the database instance
  get db() {
    return this.dbInstance;
  }
}
