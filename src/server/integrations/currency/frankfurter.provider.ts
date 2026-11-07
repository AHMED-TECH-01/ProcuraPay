import {
  ICurrencyProvider,
  CurrencyRatesResult,
  ConvertCurrencyParams,
  ConvertCurrencyResult,
} from './currency.interface';

export class FrankfurterCurrencyProvider implements ICurrencyProvider {
  public readonly providerName = 'Frankfurter ECB Real-Time FX API';
  private baseUrl = 'https://api.frankfurter.app';

  // Cache rates for 1 hour to optimize performance and prevent rate limiting
  private cache: { [base: string]: { result: CurrencyRatesResult; expiresAt: number } } = {};

  // Deterministic fallback rates
  private static FALLBACK_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    AUD: 1.52,
    JPY: 154.5,
    CHF: 0.89,
    SGD: 1.34,
  };

  public async getRates(base: string = 'USD'): Promise<CurrencyRatesResult> {
    const normBase = base.toUpperCase();
    const now = Date.now();

    if (this.cache[normBase] && this.cache[normBase].expiresAt > now) {
      return this.cache[normBase].result;
    }

    try {
      const res = await fetch(`${this.baseUrl}/latest?from=${normBase}`, {
        signal: AbortSignal.timeout(3500),
      });

      if (!res.ok) {
        throw new Error(`Frankfurter API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const result: CurrencyRatesResult = {
        baseCurrency: data.base || normBase,
        date: data.date || new Date().toISOString().split('T')[0],
        rates: { ...data.rates, [normBase]: 1.0 },
        source: 'FRANKFURTER_ECB_LIVE_API',
      };

      this.cache[normBase] = {
        result,
        expiresAt: now + 3600000, // 1 hour
      };

      return result;
    } catch (err) {
      console.warn(`[Frankfurter] FX rate fetch failed, using fallback ECB rates:`, err);
      return {
        baseCurrency: normBase,
        date: new Date().toISOString().split('T')[0],
        rates: FrankfurterCurrencyProvider.FALLBACK_RATES,
        source: 'STATIC_ECB_FALLBACK',
      };
    }
  }

  public async convert(params: ConvertCurrencyParams): Promise<ConvertCurrencyResult> {
    const from = params.fromCurrency.toUpperCase();
    const to = params.toCurrency.toUpperCase();

    if (from === to) {
      return {
        originalAmount: params.amount,
        fromCurrency: from,
        convertedAmount: params.amount,
        toCurrency: to,
        rate: 1.0,
        date: new Date().toISOString().split('T')[0],
        source: 'IDENTITY',
      };
    }

    const ratesData = await this.getRates(from);
    const rate = ratesData.rates[to];

    if (!rate) {
      throw new Error(`Unsupported destination currency: ${to}`);
    }

    const convertedAmount = Math.round(params.amount * rate);

    return {
      originalAmount: params.amount,
      fromCurrency: from,
      convertedAmount,
      toCurrency: to,
      rate,
      date: ratesData.date,
      source: ratesData.source,
    };
  }
}
