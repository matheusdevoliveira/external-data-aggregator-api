import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) { }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttlInSeconds) {
      await this.redisClient.set(key, serializedValue, 'EX', ttlInSeconds);
    } else {
      await this.redisClient.set(key, serializedValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}