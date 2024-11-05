import { CurrencyService } from '../src/services/CurrencyService';
import { db as knex } from '../src/config/index';

describe('CurrencyService', () => {
  beforeEach(async () => {
    await knex.migrate.rollback();
    await knex.migrate.latest();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  it('should fetch and parse XML data', async () => {
    const data = await CurrencyService.fetchAndParseXML();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data[0]).toHaveProperty('code');
    expect(data[0]).toHaveProperty('rate');
  });

  it('should update rates in database', async () => {
    await CurrencyService.updateRates();
    const rate = await CurrencyService.getCurrentRate('USD');
    expect(rate).toBeDefined();
    expect(rate.code).toBe('USD');
  });
});