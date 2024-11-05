import mysql, { QueryResult } from 'mysql2/promise';
import { loadEnv } from '../config/env';

loadEnv(['..','..'])

type DatabaseResult = Array<{ SCHEMA_NAME: string }> & QueryResult;

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Checking if database exists...');
    
    const escapedDbName = escapeRegExp(process.env.DB_NAME!);
    const [rows] = await connection.execute<DatabaseResult>(`SHOW DATABASES LIKE '${escapedDbName}'`);

    if (rows.length === 0) {
      console.log(`Database ${process.env.DB_NAME} does not exist. Creating...`);
      await connection.execute(`CREATE DATABASE ${escapedDbName}`);
      console.log(`Database ${process.env.DB_NAME} created successfully.`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    }

    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  }
}

createDatabaseIfNotExists().catch(console.error);