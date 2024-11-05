import Redis from 'ioredis';
import { RedisOptions } from 'ioredis';
import { env } from './index';

const redisConfig: RedisOptions = {
  host: env.REDIS_HOST || 'localhost',
  port: parseInt(env.REDIS_PORT || '6379'),
  password: env.REDIS_PASSWORD,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  }
};

export const redis = new Redis(redisConfig);