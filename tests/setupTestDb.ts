// tests/setupTestDb.ts
import knex, { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const testDbName = 'currencyTestDB';

let testKnex: Knex | null = null;

export async function getTestKnex() {
  if (!testKnex) {
    testKnex = knex({
      client: 'mysql2',
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: testDbName,
        charset: 'utf8mb4',
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: path.join(__dirname, '../db/migrations'),
      },
    });
  }
  return testKnex;
}

export async function cleanupTestDb() {
  const knexInstance = await getTestKnex();
  
  try {
    await knexInstance.raw('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = await knexInstance.raw('SHOW TABLES');
    const tableNames = tables[0].map((table: any) => Object.values(table)[0]);
    
    for (const tableName of tableNames) {
      await knexInstance.raw(`TRUNCATE TABLE ??`, [tableName]);
    }
    
    await knexInstance.raw('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
}

export async function closeConnections() {
  if (testKnex) {
    await testKnex.destroy();
    testKnex = null;
  }
}