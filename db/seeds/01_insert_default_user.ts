import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void|number[]> {
  // Hash the password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('admin123', saltRounds);

  // Insert the default admin user
  return knex('users').insert({
    username: 'admin',
    password: passwordHash,
  }).catch((err) => {
    if (err.code !== 'ER_DUP_ENTRY') {
      throw err;
    }
    console.warn('Default admin user already exists.');
  });
}