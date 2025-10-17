
export interface Currency {
  code: string;
  name: string;
}

export type Rates = Record<string, number>;

const CURRENCIES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';

const getRatesUrl = (base: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`;

export async function fetchCurrencies(): Promise<Currency[]> {
  const response = await fetch(CURRENCIES_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch currencies');
  }
  const data: Record<string, string> = await response.json();
  return Object.entries(data).map(([code, name]) => ({
    code: code.toUpperCase(),
    name,
  }));
}

export async function fetchRates(base: string): Promise<Rates> {
  const response = await fetch(getRatesUrl(base));
  if (!response.ok) {
    throw new Error(`Failed to fetch rates for ${base}`);
  }
  const data = await response.json();
  // The API returns rates nested under the base currency code
  return data[base.toLowerCase()];
}

export function getFlagUrl(currencyCode: string): string {
  let countryCode = currencyCode.substring(0, 2);
  
  // Manual mapping for special cases
  const mappings: Record<string, string> = {
    EUR: 'DE',
    USD: 'US',
    GBP: 'GB',
    JPY: 'JP',
    AUD: 'AU',
    CAD: 'CA',
    CHF: 'CH',
    CNY: 'CN',
    INR: 'IN',
    BTC: 'BTC', // Fictional, but some APIs include it
    ETH: 'ETH', // Fictional
  };

  if (mappings[currencyCode.toUpperCase()]) {
    countryCode = mappings[currencyCode.toUpperCase()];
  }
  
  if (countryCode === 'BT' && currencyCode.toUpperCase() === 'BTC') {
     return `https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg`;
  }
  
  return `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;
}
