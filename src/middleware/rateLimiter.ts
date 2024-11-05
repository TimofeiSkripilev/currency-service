import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/index';
import { Command } from 'ioredis';

const redisStoreOptions = {
  sendCommand: async (command: string, ...args: any[]): Promise<any> => {
    const result = await redis.sendCommand(command as unknown as Command, ...args);
    return result;
  },
};

export const rateLimiter = rateLimit({
  store: new RedisStore(redisStoreOptions),
  windowMs: 1000,
  max: 2000,
  message: 'Too many requests from this IP',
  legacyHeaders: true,
  standardHeaders: false,
  requestPropertyName: 'rateLimit',
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  handler: (req, res, next) => {
    res.status(429).json({ message: 'Too many requests from this IP' });
  },
});