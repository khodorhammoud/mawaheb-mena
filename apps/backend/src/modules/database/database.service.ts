import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private dbInstance: any;

  constructor() {
    console.log('DatabaseService constructed');
  }

  async onModuleInit() {
    const { db } = await import('@mawaheb/db/server');
    this.dbInstance = db;
    console.log('Database module initialized, connection obtained');
  }

  onModuleDestroy() {
    console.log('Database connection closed (potential placeholder)');
  }

  get db() {
    if (!this.dbInstance) {
      throw new Error('Database connection not initialized yet.');
    }
    return this.dbInstance;
  }
}
