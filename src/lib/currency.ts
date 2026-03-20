/**
 * Currency utilities for PitchIQ.
 *
 * Static exchange rates (1 USD = X units of foreign currency).
 * Rates as of March 2026.
 */

// ---------------------------------------------------------------------------
// Exchange rates: 1 USD → target currency (as of March 2026)
// ---------------------------------------------------------------------------
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.91,
  GBP: 0.78,
  NGN: 1580.0,
  INR: 85.5,
  BRL: 5.78,
  KES: 153.0,
  ZAR: 18.2,
  SGD: 1.34,
  AED: 3.673,
  JPY: 149.5,
  CNY: 7.24,
  CAD: 1.36,
  AUD: 1.55,
  CHF: 0.88,
  SEK: 10.45,
  KRW: 1345.0,
  MXN: 17.8,
  COP: 4050.0,
  EGP: 50.5,
  GHS: 15.8,
  TZS: 2680.0,
  RWF: 1380.0,
  PKR: 280.0,
  BDT: 121.0,
  IDR: 15850.0,
  VND: 25200.0,
  THB: 35.2,
  PHP: 56.5,
  MYR: 4.48,
  HKD: 7.81,
  TWD: 32.2,
  NZD: 1.68,
  PLN: 3.98,
  CZK: 23.1,
  HUF: 370.0,
  ILS: 3.62,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.307,
};

// ---------------------------------------------------------------------------
// Currency symbols
// ---------------------------------------------------------------------------
const SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  NGN: "\u20A6",
  INR: "\u20B9",
  BRL: "R$",
  KES: "KSh",
  ZAR: "R",
  SGD: "S$",
  AED: "AED",
  JPY: "\u00A5",
  CNY: "\u00A5",
  CAD: "C$",
  AUD: "A$",
  CHF: "CHF",
  SEK: "kr",
  KRW: "\u20A9",
  MXN: "MX$",
  COP: "COL$",
  EGP: "E\u00A3",
  GHS: "GH\u20B5",
  TZS: "TSh",
  RWF: "FRw",
  PKR: "\u20A8",
  BDT: "\u09F3",
  IDR: "Rp",
  VND: "\u20AB",
  THB: "\u0E3F",
  PHP: "\u20B1",
  MYR: "RM",
  HKD: "HK$",
  TWD: "NT$",
  NZD: "NZ$",
  PLN: "z\u0142",
  CZK: "K\u010D",
  HUF: "Ft",
  ILS: "\u20AA",
  SAR: "SAR",
  QAR: "QAR",
  KWD: "KD",
};

// ---------------------------------------------------------------------------
// Country → default currency (ISO 3166-1 alpha-2 → ISO 4217)
// ---------------------------------------------------------------------------
const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  MT: "EUR",
  CY: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  HR: "EUR",
  NG: "NGN",
  IN: "INR",
  BR: "BRL",
  KE: "KES",
  ZA: "ZAR",
  SG: "SGD",
  AE: "AED",
  JP: "JPY",
  CN: "CNY",
  CA: "CAD",
  AU: "AUD",
  CH: "CHF",
  SE: "SEK",
  KR: "KRW",
  MX: "MXN",
  CO: "COP",
  EG: "EGP",
  GH: "GHS",
  TZ: "TZS",
  RW: "RWF",
  PK: "PKR",
  BD: "BDT",
  ID: "IDR",
  VN: "VND",
  TH: "THB",
  PH: "PHP",
  MY: "MYR",
  HK: "HKD",
  TW: "TWD",
  NZ: "NZD",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  IL: "ILS",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  DK: "EUR", // Denmark uses DKK but we map to EUR as closest supported
  NO: "EUR", // Norway uses NOK
  UG: "KES", // closest supported
  ET: "KES",
  AR: "USD", // Argentina — USD widely used
  CL: "USD",
  PE: "USD",
  TR: "EUR",
  RO: "EUR",
  BG: "EUR",
  RS: "EUR",
  UA: "EUR",
  RU: "EUR",
};

// ---------------------------------------------------------------------------
// Locale map for Intl.NumberFormat
// ---------------------------------------------------------------------------
const CURRENCY_LOCALE: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  NGN: "en-NG",
  INR: "en-IN",
  BRL: "pt-BR",
  KES: "en-KE",
  ZAR: "en-ZA",
  SGD: "en-SG",
  AED: "ar-AE",
  JPY: "ja-JP",
  CNY: "zh-CN",
  CAD: "en-CA",
  AUD: "en-AU",
  CHF: "de-CH",
  SEK: "sv-SE",
  KRW: "ko-KR",
  MXN: "es-MX",
  COP: "es-CO",
  EGP: "ar-EG",
  GHS: "en-GH",
  TZS: "en-TZ",
  RWF: "en-RW",
  PKR: "en-PK",
  BDT: "bn-BD",
  IDR: "id-ID",
  VND: "vi-VN",
  THB: "th-TH",
  PHP: "en-PH",
  MYR: "ms-MY",
  HKD: "en-HK",
  TWD: "zh-TW",
  NZD: "en-NZ",
  PLN: "pl-PL",
  CZK: "cs-CZ",
  HUF: "hu-HU",
  ILS: "he-IL",
  SAR: "ar-SA",
  QAR: "ar-QA",
  KWD: "ar-KW",
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Convert an amount in the given currency to USD. */
export function convertToUSD(amount: number, currency: string): number {
  const code = currency.toUpperCase();
  const rate = EXCHANGE_RATES[code];
  if (!rate) throw new Error(`Unsupported currency: ${currency}`);
  return amount / rate;
}

/** Convert a USD amount to the target currency. */
export function convertFromUSD(
  amount: number,
  targetCurrency: string,
): number {
  const code = targetCurrency.toUpperCase();
  const rate = EXCHANGE_RATES[code];
  if (!rate) throw new Error(`Unsupported currency: ${targetCurrency}`);
  return amount * rate;
}

/** Locale-aware currency formatting using Intl.NumberFormat. */
export function formatCurrency(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const locale = CURRENCY_LOCALE[code] ?? "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if Intl doesn't recognise the currency code
    const sym = SYMBOLS[code] ?? code;
    return `${sym}${amount.toLocaleString()}`;
  }
}

/** Return the symbol for a currency code (e.g. "$" for USD). */
export function currencySymbol(code: string): string {
  return SYMBOLS[code.toUpperCase()] ?? code.toUpperCase();
}

/** Return the default currency for an ISO country code. */
export function currencyForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? "USD";
}
