import { BaseModel } from './BaseModel';
import { Currency } from './Currency';

export class CurrencyRate extends BaseModel {
  static tableName = 'currency_rates';

  currency_id!: number;
  rate!: number;
  date!: Date;
  currency?: Currency;

  static relationMappings = {
    currency: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Currency,
      join: {
        from: 'currency_rates.currency_id',
        to: 'currencies.id'
      }
    }
  };
}