import { useEffect, useState } from 'react'

const CACHE_KEY = 'tm_fx_rates_v1'
const CACHE_TTL_MS = 12 * 60 * 60 * 1000

export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'THB', label: 'Thai Baht' },
]

const SYMBOL_TO_CODE = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '₹': 'INR',
  '¥': 'JPY',
  '฿': 'THB',
}

export function detectCurrencyCode(text) {
  if (!text) return null
  const upper = text.toUpperCase()
  for (const currency of CURRENCIES) {
    if (upper.includes(currency.code)) return currency.code
  }
  for (const [symbol, code] of Object.entries(SYMBOL_TO_CODE)) {
    if (text.includes(symbol)) return code
  }
  return null
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null
    return parsed.rates
  } catch {
    return null
  }
}

function writeCache(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now() }))
  } catch {
    // storage full/unavailable, in-memory fetch still works this session
  }
}

async function fetchRates() {
  const cached = readCache()
  if (cached) return cached
  const res = await fetch('https://open.er-api.com/v6/latest/USD')
  if (!res.ok) throw new Error('Exchange rate request failed')
  const data = await res.json()
  if (data.result !== 'success' || !data.rates) throw new Error('Exchange rate response malformed')
  writeCache(data.rates)
  return data.rates
}

export function useExchangeRates() {
  const [state, setState] = useState({ rates: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    fetchRates()
      .then((rates) => {
        if (!cancelled) setState({ rates, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ rates: null, loading: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}

export function convertAmount(amount, fromCode, toCode, rates) {
  if (amount == null || !rates) return null
  const from = fromCode || 'USD'
  if (!rates[from] || !rates[toCode]) return null
  const amountInUsd = amount / rates[from]
  return amountInUsd * rates[toCode]
}
