import { CurrencyService } from "../src/services/CurrencyService";
import { redis } from "../src/config/index";
import { Currency } from "../src/models/Currency";
import { CurrencyRate } from "../src/models/CurrencyRate";
import { getTestKnex, cleanupTestDb, closeConnections } from "./setupTestDb";

describe("CurrencyService", () => {
  let testKnex: any;

  beforeAll(async () => {
    try {
      testKnex = await getTestKnex();
      
      // Set up models
      CurrencyService.setKnexInstance(testKnex);
      Currency.knex(testKnex);
      CurrencyRate.knex(testKnex);
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      await redis.flushall();
      await cleanupTestDb();
      
      // Insert currency
      const currency = await Currency.query().insert({
        code: "USD",
        name: "Доллар США",
      });

      // Insert rates one by one
      await CurrencyRate.query().insert({
        currency_id: currency.id,
        rate: 95.4567,
        date: "2024-01-01",
      });

      await CurrencyRate.query().insert({
        currency_id: currency.id,
        rate: 96.5432,
        date: "2024-01-02",
      });
    } catch (error) {
      console.error('Test preparation failed:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await redis.flushall();
      await redis.quit();
      await closeConnections();
    } catch (error) {
      console.error('Final cleanup failed:', error);
    }
  });

  it("should fetch and parse XML data", async () => {
    const data = await CurrencyService.fetchAndParseXML();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data[0]).toHaveProperty("code");
    expect(data[0]).toHaveProperty("value");
    expect(data[0]).toHaveProperty("date");
    expect(data[0].date).toBeInstanceOf(Date);
  });

  it("should update rates in database", async () => {
    await CurrencyService.updateRates();
    const rate = await CurrencyService.getCurrentRate("USD");
    expect(rate).toBeDefined();
    expect(rate).toMatchObject({
      code: "USD",
      name: expect.any(String),
      rate: expect.any(Number),
      date: expect.any(String),
    });
  });

  it("should get current rate for existing currency", async () => {
    const rate = await CurrencyService.getCurrentRate("USD");
    expect(rate).toBeDefined();
    expect(rate).toMatchObject({
      code: "USD",
      name: "Доллар США",
      rate: expect.any(Number),
      date: expect.any(String),
    });
  });

  it("should return null for non-existent currency", async () => {
    const rate = await CurrencyService.getCurrentRate("XXX");
    expect(rate).toBeNull();
  });

  it("should get rate history for existing currency", async () => {
    const history = await CurrencyService.getRateHistory("USD");
    expect(history).toBeDefined();
    expect(history).toMatchObject({
      code: "USD",
      name: "Доллар США",
      rates: {
        "2024-01-01": 95.4567,
        "2024-01-02": 96.5432,
      },
    });
  });

  it("should return null for non-existent currency history", async () => {
    const history = await CurrencyService.getRateHistory("XXX");
    expect(history).toBeNull();
  });

  it("should get list of available currencies", async () => {
    const currencies = await CurrencyService.getCurrencyList();
    expect(Array.isArray(currencies)).toBeTruthy();
    expect(currencies).toHaveLength(1);
    expect(currencies[0]).toMatchObject({
      code: "USD",
      name: "Доллар США",
    });
  });
});