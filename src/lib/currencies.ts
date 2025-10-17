
export interface Currency {
  code: string;
  name: string;
}

export type Rates = Record<string, number>;

const CURRENCIES_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';

const getRatesUrl = (base: string) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`;

const allowedCurrencyCodes = new Set([
  'AFN', 'EUR', 'ALL', 'DZD', 'USD', 'AOA', 'XCD', 'ARS', 'AMD', 'AWG',
  'AUD', 'AZN', 'BSD', 'BHD', 'BDT', 'BBD', 'BYN', 'BZD', 'XOF', 'BMD',
  'INR', 'BTN', 'BOB', 'BOV', 'BAM', 'BWP', 'NOK', 'BRL', 'BND', 'BGN',
  'BIF', 'CVE', 'KHR', 'XAF', 'CAD', 'KYD', 'CLP', 'CLF', 'CNY', 'COP',
  'COU', 'KMF', 'CDF', 'NZD', 'CRC', 'CUP', 'XCG', 'CZK', 'DKK', 'DJF',
  'DOP', 'EGP', 'SVC', 'ERN', 'SZL', 'ETB', 'FKP', 'FJD', 'XPF', 'GMD',
  'GEL', 'GHS', 'GIP', 'GTQ', 'GBP', 'GNF', 'GYD', 'HTG', 'HNL', 'HKD',
  'HUF', 'ISK', 'IDR', 'XDR', 'IRR', 'IQD', 'ILS', 'JMD', 'JPY', 'JOD',
  'KZT', 'KES', 'KPW', 'KRW', 'KWD', 'KGS', 'LAK', 'LBP', 'LSL', 'ZAR',
  'LRD', 'LYD', 'CHF', 'MOP', 'MKD', 'MGA', 'MWK', 'MYR', 'MVR', 'MRU',
  'MUR', 'XUA', 'MXN', 'MXV', 'MDL', 'MNT', 'MAD', 'MZN', 'MMK', 'NAD',
  'NPR', 'NIO', 'NGN', 'OMR', 'PKR', 'PAB', 'PGK', 'PYG', 'PEN', 'PHP',
  'PLN', 'QAR', 'RON', 'RUB', 'RWF', 'SHP', 'WST', 'STN', 'SAR', 'RSD',
  'SCR', 'SLE', 'SGD', 'XSU', 'SBD', 'SOS', 'SSP', 'LKR', 'SDG', 'SRD',
  'SEK', 'CHE', 'CHW', 'SYP', 'TWD', 'TJS', 'TZS', 'THB', 'TOP', 'TTD',
  'TND', 'TRY', 'TMT', 'UGX', 'UAH', 'AED', 'USN', 'UYU', 'UYI', 'UYW',
  'UZS', 'VUV', 'VES', 'VED', 'VND', 'YER', 'ZMW', 'ZWG', 'XBA', 'XBB',
  'XBC', 'XBD', 'XTS', 'XXX', 'XAU', 'XPD', 'XPT', 'XAG'
]);

export async function fetchCurrencies(): Promise<Currency[]> {
  const response = await fetch(CURRENCIES_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch currencies');
  }
  const data: Record<string, string> = await response.json();
  
  return Object.entries(data)
    .map(([code, name]) => ({
      code: code.toUpperCase(),
      name,
    }))
    .filter(currency => allowedCurrencyCodes.has(currency.code));
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
    HKD: 'HK',
    SGD: 'SG',
    SEK: 'SE',
    KRW: 'KR',
    NOK: 'NO',
    MXN: 'MX',
    NZD: 'NZ',
    ZAR: 'ZA',
    BRL: 'BR',
    RUB: 'RU',
    TRY: 'TR',
    ANG: 'CW',
    XCD: 'AG',
    XPF: 'PF',
    XAF: 'CM',
    XOF: 'SN',
    XCG: 'CW',
    XDR: 'US', 
    XAU: 'US',
    XAG: 'US',
    XPT: 'US',
    XPD: 'US',
  };

  if (mappings[currencyCode.toUpperCase()]) {
    countryCode = mappings[currencyCode.toUpperCase()];
  }
  
  return `https://flagsapi.com/${countryCode.toUpperCase()}/flat/64.png`;
}
