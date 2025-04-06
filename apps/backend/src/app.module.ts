import { Module, Type, DynamicModule, ForwardReference } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './modules/database/database.module';

// This helps TypeScript resolve the type conflict
type ModuleImport =
  | Type<any>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference<any>;

@Module({
  imports: [
    // Cast the module to help TypeScript resolve the types
    ConfigModule.forRoot({
      isGlobal: true,
    }) as ModuleImport,
    DatabaseModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
