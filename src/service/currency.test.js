import { describe, expect, it } from 'vitest'
import { convertAmount, detectCurrencyCode } from './currency'

describe('detectCurrencyCode', () => {
  it('detects a currency code mentioned in the text', () => {
    expect(detectCurrencyCode('from $35/night, USD only')).toBe('USD')
  })

  it('detects a currency symbol when no code is present', () => {
    expect(detectCurrencyCode('₹1500 per night')).toBe('INR')
    expect(detectCurrencyCode('€50 entry fee')).toBe('EUR')
  })

  it('prefers a matched currency code over a symbol found later in the text', () => {
    expect(detectCurrencyCode('EUR 50 (about $55)')).toBe('EUR')
  })

  it('returns null when nothing matches', () => {
    expect(detectCurrencyCode('Free entry')).toBeNull()
  })

  it('returns null for empty or missing input', () => {
    expect(detectCurrencyCode('')).toBeNull()
    expect(detectCurrencyCode(null)).toBeNull()
    expect(detectCurrencyCode(undefined)).toBeNull()
  })
})

describe('convertAmount', () => {
  const rates = { USD: 1, EUR: 0.9, INR: 83 }

  it('converts between two non-USD currencies via the USD-based rate table', () => {
    // 83 INR == 1 USD == ~0.9 EUR
    expect(convertAmount(83, 'INR', 'EUR', rates)).toBeCloseTo(0.9, 5)
  })

  it('defaults the source currency to USD when fromCode is falsy', () => {
    expect(convertAmount(10, null, 'EUR', rates)).toBeCloseTo(9, 5)
  })

  it('returns null when amount is null/undefined', () => {
    expect(convertAmount(null, 'USD', 'EUR', rates)).toBeNull()
    expect(convertAmount(undefined, 'USD', 'EUR', rates)).toBeNull()
  })

  it('returns null when rates are missing', () => {
    expect(convertAmount(10, 'USD', 'EUR', null)).toBeNull()
  })

  it('returns null when the source or target currency is not in the rate table', () => {
    expect(convertAmount(10, 'ZZZ', 'EUR', rates)).toBeNull()
    expect(convertAmount(10, 'USD', 'ZZZ', rates)).toBeNull()
  })
})
