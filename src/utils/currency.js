// src/utils/currency.js
// ✅ Corrected currency symbols — USD fixed, Latin American currencies added
export const CURRENCY_SYMBOLS = {
  // ─── MAJOR GLOBAL ─────────────────────────────────────────
  USD: '$',         // ✅ FIXED: was incorrectly 'R$'
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
  CNY: '¥',

  // ─── LATIN AMERICA ────────────────────────────────────────
  BRL: 'R$',
  ARS: '$',
  BOB: 'Bs',
  CLP: '$',
  COP: '$',
  CRC: '₡',
  CUP: '$',
  DOP: 'RD$',
  GTQ: 'Q',
  HNL: 'L',
  MXN: '$',
  NIO: 'C$',
  PAB: 'B/.',
  PYG: '₲',
  PEN: 'S/',
  UYU: '$U',
  VES: 'Bs',

  // ─── OTHER GLOBAL ─────────────────────────────────────────
  CAD: 'C$',
  AUD: 'A$',
  NZD: 'NZ$',
  INR: '₹',
  PKR: '₨',
  SGD: 'S$',
  MYR: 'RM',
  THB: '฿',
  VND: '₫',
  IDR: 'Rp',
  PHP: '₱',
  KRW: '₩',

  // ─── AFRICA ───────────────────────────────────────────────
  NGN: '₦',
  ZAR: 'R',
  KES: 'KSh',
  GHS: '₵',
  AOA: 'Kz',
  MZN: 'MT',
  CVE: '$',

  // ─── EUROPE / OTHER ───────────────────────────────────────
  PLN: 'zł',
  UAH: '₴',
  RUB: '₽',
  TRY: '₺',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
};

// ✅ Safe lookup — never returns undefined
export const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return '$';
  const code = String(currencyCode).trim().toUpperCase();
  return CURRENCY_SYMBOLS[code] || '$';
};

export const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_SYMBOLS);
};