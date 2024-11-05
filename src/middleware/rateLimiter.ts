import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis, waitForRedisConnection } from "../config/redis";
import { Command } from "ioredis";

async function createRateLimiter() {
  await waitForRedisConnection();

  const redisStoreOptions = {
    sendCommand: async (command: string, ...args: any[]): Promise<any> => {
      try {
        const result = await redis.call(command, ...args);
        return result;
      } catch (error) {
        console.error("Redis command execution failed:", error);
        throw error;
      }
    },
  };

  return rateLimit({
    store: new RedisStore(redisStoreOptions),
    windowMs: 1000,
    max: 2000,
    message: "Too many requests from this IP",
    legacyHeaders: true,
    standardHeaders: false,
    requestPropertyName: "rateLimit",
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    handler: (req, res, next) => {
      res.status(429).json({ message: "Too many requests from this IP" });
    },
  });
}

export const rateLimiter = createRateLimiter();