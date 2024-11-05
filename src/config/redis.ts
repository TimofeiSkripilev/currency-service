import Redis from 'ioredis';
import { RedisOptions } from 'ioredis';
import env from './env';

const redisConfig: RedisOptions = {
  host: env.REDIS_HOST || 'localhost',
  port: parseInt(env.REDIS_PORT || '6379'),
  password: env.REDIS_PASSWORD,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  }
};

export const redis = new Redis(redisConfig);

export async function waitForRedisConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    redis.on('ready', () => resolve());
    redis.on('error', (err) => reject(err));
  });
}