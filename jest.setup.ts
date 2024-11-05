// jest.setup.ts
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env.local') });

const testDbName = 'currencyTestDB';

async function globalSetup() {
  const rootKnex = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  });

  try {
    // Drop database if exists
    await rootKnex.raw(`DROP DATABASE IF EXISTS ??`, [testDbName]);
    await rootKnex.raw(`CREATE DATABASE ??`, [testDbName]);

    // Create a connection to the new database
    const testKnex = knex({
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: testDbName,
      },
      migrations: {
        directory: path.join(__dirname, './db/migrations'),
      },
    });

    // Run migrations
    await testKnex.migrate.latest();
    await testKnex.destroy();
  } finally {
    await rootKnex.destroy();
  }
}

async function globalTeardown() {
  const rootKnex = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    }
  });

  try {
    await rootKnex.raw(`DROP DATABASE IF EXISTS ??`, [testDbName]);
  } finally {
    await rootKnex.destroy();
  }
}

export default globalSetup;
export { globalTeardown };