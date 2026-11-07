export interface CurrencyRatesResult {
  baseCurrency: string;
  date: string;
  rates: Record<string, number>;
  source: string;
}

export interface ConvertCurrencyParams {
  amount: number; // in cents or standard units
  fromCurrency: string;
  toCurrency: string;
}

export interface ConvertCurrencyResult {
  originalAmount: number;
  fromCurrency: string;
  convertedAmount: number;
  toCurrency: string;
  rate: number;
  date: string;
  source: string;
}

export interface ICurrencyProvider {
  readonly providerName: string;
  getRates(base?: string): Promise<CurrencyRatesResult>;
  convert(params: ConvertCurrencyParams): Promise<ConvertCurrencyResult>;
}
