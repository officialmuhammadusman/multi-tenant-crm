import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import Redis from 'ioredis';

import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { NotesModule } from './notes/notes.module';
import { ActivityModule } from './activity/activity.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CorrelationIdInterceptor } from './common/interceptors/correlation-id.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // ✅ Removed validate: validateEnv from here
      // Validation now happens in main.ts at runtime
    }),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CustomersModule,
    NotesModule,
    ActivityModule,
  ],
  providers: [
    // Redis client as a global provider
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
        redis.on('error', (err) => console.error('Redis error:', err));
        redis.on('connect', () => console.log('✅ Redis connected'));
        return redis;
      },
    },
    // Global guards — applied to every route
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    // Global exception filter
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Global interceptors
    { provide: APP_INTERCEPTOR, useClass: CorrelationIdInterceptor },
  ],
})
export class AppModule {}