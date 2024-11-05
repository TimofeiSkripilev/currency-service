import { BaseModel } from "./BaseModel";
import { Currency } from "./Currency";

export class CurrencyRate extends BaseModel {
  static tableName = "currency_rates";

  currency_id!: number;
  rate!: number;
  date!: string;
  currency?: Currency;

  static jsonSchema = {
    type: "object",
    required: ["currency_id", "rate", "date"],
    properties: {
      id: { type: "integer" },
      currency_id: { type: "integer" },
      rate: { type: "number" },
      date: { type: "string", format: "date" },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  };

  // Simplified date handling
  $formatDatabaseJson(json: any) {
    json = super.$formatDatabaseJson(json);
    if (json.date && typeof json.date === 'string') {
      json.date = json.date.split('T')[0];
    }
    return json;
  }

  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    if (json.date && typeof json.date === 'string') {
      json.date = json.date.split('T')[0];
    }
    return json;
  }
}