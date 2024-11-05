import Knex from 'knex';
import { loadEnv } from './env';

loadEnv(['..','..'])

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: '../../db/migrations',
    extension: 'ts'
  },
  seeds: {
    directory: '../../db/seeds',
    extension: 'ts'
  }
};

// console.log('Knex Config:', JSON.stringify(knexConfig, null, 2));

export const knex = Knex(knexConfig);