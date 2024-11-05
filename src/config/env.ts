import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

export function loadEnv(dir: string[]) {
  const envDir = path.join(__dirname, ...dir);
  
  if (process.env.NODE_ENV === 'production') {
    // console.log('Loading production environment variables from .env');
    return dotenv.config({ path: path.join(envDir, '.env') });
  } else {
    // console.log('Loading local environment variables from .env.local');
    return dotenv.config({ path: path.join(envDir, '.env.local') });
  }
}


loadEnv(['..','..'])

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.string().transform(Number).default('3000'),
  API_HOST: z.string(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  CBR_API_URL: z.string().default('http://www.cbr.ru/scripts/XML_daily.asp')
});

const env = envSchema.parse(process.env);
// console.log('Env in use', env)

export default env;