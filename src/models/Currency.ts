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

  static jsonSchema = {
    type: 'object',
    required: ['code', 'name'],
    properties: {
      id: { type: 'integer' },
      code: { type: 'string', minLength: 3, maxLength: 3 },
      name: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' }
    }
  };
}