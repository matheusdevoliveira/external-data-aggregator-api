import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import Redis from 'ioredis';

import { validate } from './config/env.schema';
import { User } from './modules/users/entities/user.entity';
import { SearchHistory } from './modules/history/entities/search-history.entity';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { MarketModule } from './modules/market/market.module';
import { RedisCacheModule } from './modules/cache/cache.module';
import { HistoryModule } from './modules/history/history.module';
import { HealthModule } from './modules/health/health.module';
import { CustomThrottlerGuard } from './modules/rate-limit/custom-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, SearchHistory],
        synchronize: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    // RedisCacheModule é @Global(), mas importamos explicitamente aqui
    // para deixar claro que o ThrottlerModule depende do REDIS_CLIENT
    // exportado por ele (necessário para o `inject` abaixo funcionar).
    RedisCacheModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisCacheModule],
      inject: [ConfigService, 'REDIS_CLIENT'],
      useFactory: (configService: ConfigService, redisClient: Redis) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 10,
          },
        ],
        // Reaproveita o mesmo client Redis do RedisCacheModule, cujo
        // ciclo de vida (incluindo disconnect() no onModuleDestroy)
        // já é gerenciado pelo CacheService. Isso evita abrir uma
        // segunda conexão Redis paralela que o Nest não sabe fechar
        // ao encerrar a aplicação (causa do warning de worker
        // "failed to exit gracefully" nos testes E2E).
        storage: new ThrottlerStorageRedisService(redisClient),
      }),
    }),
    UsersModule,
    AuthModule,
    IntegrationsModule,
    MarketModule,
    HistoryModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule { }