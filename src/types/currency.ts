export interface XMLCurrencyData {
    Valute: {
      $: { ID: string };
      NumCode: string[];
      CharCode: string[];
      Nominal: string[];
      Name: string[];
      Value: string[];
    }[];
  }
  
  export interface ParsedCurrencyData {
    code: string;
    name: string;
    nominal: number;
    value: number;
    date: Date;
  }