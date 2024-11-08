import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET NAMES utf8mb4');
  await knex.raw('SET character_set_client = utf8mb4');
  
  await knex.schema.createTable('currencies', (table) => {
    table.increments('id').primary();
    table.string('code', 3).notNullable().unique();
    table.string('name').notNullable().collate('utf8mb4_unicode_ci');
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('currency_rates', (table) => {
    table.increments('id').primary();
    table.integer('currency_id').unsigned().references('id').inTable('currencies');
    table.decimal('rate', 10, 4).notNullable();
    table.date('date').notNullable();
    table.datetime('created_at').defaultTo(knex.fn.now());
    table.datetime('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['currency_id', 'date']);
    table.index(['date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('currency_rates');
  await knex.schema.dropTable('currencies');
}