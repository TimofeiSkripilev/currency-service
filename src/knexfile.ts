import type { Knex } from "knex";
import { loadEnv } from "./config/env";

const result = loadEnv(['..','..'])

if (result.error) {
  throw result.error;
}

// console.log("Loaded env vars:", result.parsed);

const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: "../db/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "../db/seeds",
    extension: "ts",
  },
};

// console.log("Knex Config:", JSON.stringify(config, null, 2));

export default config;
