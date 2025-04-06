import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { sql } from 'drizzle-orm';

@Controller('users')
export class UsersController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async findAll() {
    try {
      // Get the database instance
      const db = this.databaseService.db;

      // Now we can use the schema from the shared package
      const users = await db.query.UsersTable.findMany({
        limit: 10,
      });

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: 'Error fetching users',
        error: error.message,
      };
    }
  }

  @Get('count')
  async getUserCount() {
    try {
      const db = this.databaseService.db;
      const result = await db.execute(sql`SELECT COUNT(*) FROM users`);

      return {
        success: true,
        message: 'User count retrieved successfully',
        count: result && result[0] ? result[0].count : 0,
      };
    } catch (error) {
      console.error('Error getting user count:', error);
      return {
        success: false,
        message: 'Error getting user count',
        error: error.message,
      };
    }
  }

  @Get('test-connection')
  async testConnection() {
    try {
      const db = this.databaseService.db;
      // Simple query to test if the connection works
      await db.execute(sql`SELECT 1 as test`);

      return {
        success: true,
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Database connection failed:', error);
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }
}
