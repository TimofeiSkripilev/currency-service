import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { Currency } from '../models/Currency';
import { CurrencyRate } from '../models/CurrencyRate';
import { ParsedCurrencyData } from '../types/currency';
import { redis } from '../config';

export class CurrencyService {
  private static CBR_URL = 'http://www.cbr.ru/scripts/XML_daily.asp';
  private static CACHE_TTL = 3600; // Кэш на 1 час

  static async fetchAndParseXML(): Promise<ParsedCurrencyData[]> {
    const cachedData = await redis.get('cbr_data');
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await axios.get(this.CBR_URL);
    const result = await parseStringPromise(response.data);
    const valCurs = result.ValCurs;
    const date = new Date(valCurs.$.Date.split('.').reverse().join('-'));

    const parsedData = valCurs.Valute.map((valute: any) => ({
      code: valute.CharCode[0],
      name: valute.Name[0],
      nominal: parseInt(valute.Nominal[0], 10),
      value: parseFloat(valute.Value[0].replace(',', '.')),
      date
    }));

    await redis.set('cbr_data', JSON.stringify(parsedData), 'EX', this.CACHE_TTL);
    return parsedData;
  }

  //обновить курсы
  static async updateRates(): Promise<void> {
    const trx = await Currency.startTransaction();
    
    try {
      const currencyData = await this.fetchAndParseXML();
      
      for (const data of currencyData) {
        let currency = await Currency.query(trx)
          .findOne({ code: data.code });
        
        if (!currency) {
          currency = await Currency.query(trx)
            .insert({
              code: data.code,
              name: data.name
            });
        }

        await CurrencyRate.query(trx)
          .insert({
            currency_id: currency.id,
            rate: data.value / data.nominal,
            date: data.date
          })
          .onConflict(['currency_id', 'date'])
          .merge();
      }

      await trx.commit();

      // Очистка кэша
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
  static async getCurrentRate(code: string) {
    const cachedRate = await redis.get(`rate:${code}`);
    if (cachedRate) {
      return JSON.parse(cachedRate);
    }

    const rate = await Currency.query()
      .where('code', code.toUpperCase())
      .withGraphFetched('rates(latest)')
      .modifiers({
        latest(builder) {
          builder.orderBy('date', 'desc').limit(1);
        }
      })
      .first();

    if (rate) {
      await redis.set(`rate:${code}`, JSON.stringify(rate), 'EX', this.CACHE_TTL);
    }

    return rate;
  }

  //история курса
  static async getRateHistory(code: string) {
    const cachedHistory = await redis.get(`history:${code}`);
    if (cachedHistory) {
      return JSON.parse(cachedHistory);
    }
  
    const history = await Currency.query()
      .where('code', code.toUpperCase())
      .withGraphFetched('rates')
      .modifyGraph('rates', builder => {
        builder.orderBy('date', 'desc');
      })
      .first();
  
    if (history) {
      // Кэш на 24 часа
      await redis.set(`history:${code}`, JSON.stringify(history), 'EX', 86400);
    }
  
    return history;
  }

  //список доступных валют
  static async getCurrencyList(): Promise<{ code: string; name: string }[]> {
    const currencies = await Currency.query().select('code', 'name');
    return currencies;
  }
}