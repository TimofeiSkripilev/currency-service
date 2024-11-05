import { BaseModel } from './BaseModel';
import { CurrencyRate } from './CurrencyRate';

export class Currency extends BaseModel {
  static tableName = 'currencies';

  code!: string;
  name!: string;
  rates?: CurrencyRate[];

  static relationMappings = {
    rates: {
      relation: BaseModel.HasManyRelation,
      modelClass: CurrencyRate,
      join: {
        from: 'currencies.id',
        to: 'currency_rates.currency_id'
      }
    }
  };
}