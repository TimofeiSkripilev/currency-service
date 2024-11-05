import axios from "axios";
import { parseStringPromise } from "xml2js";
import { Currency } from "../models/Currency";
import { CurrencyRate } from "../models/CurrencyRate";
import { ParsedCurrencyData } from "../types/currency";
import { redis, env } from "../config";
import { knex } from "../config/database";
import { CurrentRate, RateHistory } from "../types/currency";
import { decode } from "iconv-lite";

interface LatestRateQueryResult {
  code: string;
  name: string;
  rate: number | null;
  date: string | null;
}

export class CurrencyService {
  private static CBR_URL = env.CBR_API_URL;
  private static CACHE_TTL = 3600; // Кэш на 1 час

  private static knexInstance: any;

  static setKnexInstance(knex: any) {
    this.knexInstance = knex;
  }

  static async fetchAndParseXML(): Promise<ParsedCurrencyData[]> {
    const cachedData = await redis.get("cbr_data");
    if (cachedData) {
      const parsed = JSON.parse(cachedData);

      return parsed.map((item: any) => ({
        ...item,
        date: new Date(item.date),
      }));
    }

    const response = await axios.get(this.CBR_URL, {
      responseType: "arraybuffer",
      headers: {
        "Accept-Charset": "windows-1251",
      },
    });
    const data = decode(Buffer.from(response.data), 'win1251');
    const result = await parseStringPromise(data);
    const valCurs = result.ValCurs;

    // DD.MM.YYYY
    const [day, month, year] = valCurs.$.Date.split(".");
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    const parsedData = valCurs.Valute.map((valute: any) => ({
      code: valute.CharCode[0],
      name: valute.Name[0],
      nominal: parseInt(valute.Nominal[0], 10),
      value: parseFloat(valute.Value[0].replace(",", ".")),
      date: date,
    }));

    await redis.set(
      "cbr_data",
      JSON.stringify(parsedData),
      "EX",
      this.CACHE_TTL
    );
    return parsedData;
  }

  //обновить курсы
  static async updateRates(): Promise<void> {
    const trx = await knex.transaction();

    try {
      const currencyData = await this.fetchAndParseXML();

      for (const data of currencyData) {
        let currency = await Currency.query(trx).findOne({ code: data.code });

        if (!currency) {
          currency = await Currency.query(trx).insert({
            code: data.code,
            name: data.name,
          });
        }

        // YYYY-MM-DD
        const formattedDate =
          data.date instanceof Date
            ? data.date.toISOString().split("T")[0]
            : new Date(data.date).toISOString().split("T")[0];

        await CurrencyRate.query(trx)
          .insert({
            currency_id: currency.id,
            rate: data.value / data.nominal,
            date: formattedDate,
          })
          .onConflict(["currency_id", "date"])
          .merge();
      }

      await trx.commit();

      console.log(`${currencyData.length} rates updated`);

      // очистить кэш
      const currencies = await Currency.query();
      for (const currency of currencies) {
        await redis.del(`history:${currency.code}`);
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  //текущий курс
  static async getCurrentRate(code: string): Promise<CurrentRate | null> {
    const cachedRate = await redis.get(`rate:${code}`);
    if (cachedRate) {
      return JSON.parse(cachedRate);
    }

    const latestRate = (await Currency.query()
      .where("currencies.code", code.toUpperCase())
      .select(
        "currencies.code",
        "currencies.name",
        "currency_rates.rate",
        knex.raw("DATE_FORMAT(currency_rates.date, '%Y-%m-%d') as date") // YYYY-MM-DD
      )
      .leftJoin("currency_rates", "currencies.id", "currency_rates.currency_id")
      .orderBy("currency_rates.date", "desc")
      .first()) as unknown as CurrentRate;

    if (!latestRate || !latestRate.rate || !latestRate.date) {
      return null;
    }

    const result = {
      code: latestRate.code,
      name: latestRate.name,
      rate: Number(latestRate.rate),
      date: latestRate.date,
    };

    await redis.set(
      `rate:${code}`,
      JSON.stringify(result),
      "EX",
      this.CACHE_TTL
    );
    return result;
  }

  static async getRateHistory(code: string): Promise<RateHistory | null> {
    const cachedHistory = await redis.get(`history:${code}`);
    if (cachedHistory) {
      return JSON.parse(cachedHistory);
    }

    const currency = await Currency.query()
      .where("code", code.toUpperCase())
      .select("currencies.code", "currencies.name")
      .first();


    if (!currency) {
      return null;
    }

    const rates = await CurrencyRate.query()
      .join("currencies", "currency_rates.currency_id", "currencies.id")
      .where("currencies.code", code.toUpperCase())
      .select(
        knex.raw("DATE_FORMAT(currency_rates.date, '%Y-%m-%d') as date"), // YYYY-MM-DD
        "currency_rates.rate"
      )
      .orderBy("currency_rates.date", "desc");

    if (!rates || rates.length === 0) {
      return {
        code: currency.code,
        name: currency.name,
        rates: {},
      };
    }

    const result = {
      code: currency.code,
      name: currency.name,
      rates: rates.reduce((acc: Record<string, number>, rate) => {
        if (rate.date) {
          acc[rate.date] = Number(rate.rate);
        }
        return acc;
      }, {} as Record<string, number>),
    };

    await redis.set(
      `history:${code}`,
      JSON.stringify(result),
      "EX",
      this.CACHE_TTL
    ); // Кэш на 1 час
    return result;
  }

  //список доступных валют
  static async getCurrencyList(): Promise<{ code: string; name: string }[]> {
    const currencies = await Currency.query().select("code", "name");
    return currencies;
  }
}
