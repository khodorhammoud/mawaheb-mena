import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Global()
@Module({
  imports: [EventEmitterModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
