import type { Knex } from 'knex';
import dotenv from 'dotenv';
import { env } from './config';

dotenv.config();

const config = {
  client: 'mysql2',
  connection: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './db/migrations',
    extension: 'ts'
  },
  seeds: {
    directory: './db/seeds',
    extension: 'ts'
  }
};

export default config;
