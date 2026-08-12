import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, TriangleAlert, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CURRENCIES, convertAmount, detectCurrencyCode, useExchangeRates } from '@/service/currency'

const PREF_KEY = 'tm_preferred_currency'

function parseFirstNumber(text) {
  if (!text || typeof text !== 'string') return null
  const match = text.replace(/,/g, '').match(/(\d+(\.\d+)?)/)
  return match ? Number.parseFloat(match[1]) : null
}

export function computeBudgetVerdict(total, target) {
  if (target == null || total == null) return null
  const difference = target - total
  return { difference, isOverBudget: difference < 0 }
}

function estimateBudget(trip) {
  const days = Number(trip?.userSelection?.noOfDays) || 1
  const hotels = trip?.tripData?.hotel_options || []
  const hotelParsed = hotels
    .map((hotel) => ({ amount: parseFirstNumber(hotel?.price), currency: detectCurrencyCode(hotel?.price) }))
    .filter((hotel) => hotel.amount != null)
  const cheapest = hotelParsed.length
    ? hotelParsed.reduce((min, cur) => (cur.amount < min.amount ? cur : min))
    : null
  const lodging = cheapest ? { amount: cheapest.amount * days, currency: cheapest.currency } : null

  let activitiesAmount = 0
  let activitiesCurrency = null
  let included = 0
  let excluded = 0
  for (const day of trip?.tripData?.itinerary || []) {
    for (const place of day?.plan || []) {
      const amount = parseFirstNumber(place?.ticket_pricing)
      if (amount != null) {
        activitiesAmount += amount
        activitiesCurrency = activitiesCurrency || detectCurrencyCode(place?.ticket_pricing)
        included += 1
      } else if (place?.ticket_pricing) {
        excluded += 1
      }
    }
  }

  return {
    lodging,
    activities: included ? { amount: activitiesAmount, currency: activitiesCurrency } : null,
    excluded,
  }
}

function BudgetBreakdown({ trip }) {
  const estimate = useMemo(() => estimateBudget(trip), [trip])
  const { lodging, activities, excluded } = estimate

  const [targetCurrency, setTargetCurrency] = useState(() => localStorage.getItem(PREF_KEY) || 'USD')
  const { rates, loading: ratesLoading, error: ratesError } = useExchangeRates()

  useEffect(() => {
    localStorage.setItem(PREF_KEY, targetCurrency)
  }, [targetCurrency])

  const formatter = useMemo(
    () => new Intl.NumberFormat(undefined, { style: 'currency', currency: targetCurrency, maximumFractionDigits: 0 }),
    [targetCurrency]
  )

  const rows = [
    { label: 'Lodging', entry: lodging, color: 'bg-chart-1' },
    { label: 'Activities & tickets', entry: activities, color: 'bg-chart-2' },
  ]
    .filter((row) => row.entry)
    .map((row) => ({
      ...row,
      value: rates ? convertAmount(row.entry.amount, row.entry.currency, targetCurrency, rates) : null,
    }))

  const hasValues = rows.length > 0 && rows.every((row) => row.value != null)
  const total = hasValues ? rows.reduce((sum, row) => sum + row.value, 0) : 0

  const targetAmount = Number(trip?.userSelection?.targetBudgetAmount)
  const targetCurrencyCode = trip?.userSelection?.targetBudgetCurrency
  const hasTarget = targetAmount > 0 && Boolean(targetCurrencyCode)
  const convertedTarget =
    hasTarget && rates ? convertAmount(targetAmount, targetCurrencyCode, targetCurrency, rates) : null
  const verdict = convertedTarget != null && hasValues ? computeBudgetVerdict(total, convertedTarget) : null
  const difference = verdict?.difference ?? null

  return (
    <Card className="shadow-soft h-full">
      <CardContent className="flex h-full flex-col">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Budget estimate</h2>
          <select
            value={targetCurrency}
            onChange={(event) => setTargetCurrency(event.target.value)}
            aria-label="Currency"
            className="border-input bg-background rounded-full border px-2.5 py-1 text-xs font-medium outline-none"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code}
              </option>
            ))}
          </select>
        </div>
        <p className="text-muted-foreground mb-4 text-xs">
          Rough estimate from listed prices, converted to {targetCurrency} — not a guaranteed total.
        </p>

        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">Not enough priced items to estimate a budget.</p>
        ) : ratesError ? (
          <p className="text-muted-foreground text-sm">Couldn&apos;t load exchange rates right now.</p>
        ) : !hasValues ? (
          <div className="space-y-4">
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-2.5 w-full rounded-full" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-4">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-muted-foreground">{formatter.format(row.value)}</span>
                </div>
                <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${row.color}`}
                    style={{ width: total ? `${Math.max((row.value / total) * 100, 4)}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
            <div className="border-border flex items-center justify-between border-t pt-3 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <Wallet className="size-4" />
                Estimated total
              </span>
              <span>{formatter.format(total)}</span>
            </div>
            {excluded > 0 && (
              <p className="text-muted-foreground text-xs">
                {excluded} item{excluded === 1 ? '' : 's'} excluded (price listed as &quot;free&quot; or &quot;varies&quot;).
              </p>
            )}
            {difference != null && (
              <div
                className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                  difference >= 0
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {difference >= 0 ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                )}
                <span>
                  {difference >= 0
                    ? `Within your ${formatter.format(convertedTarget)} budget — about ${formatter.format(difference)} to spare.`
                    : `Over your ${formatter.format(convertedTarget)} budget by about ${formatter.format(Math.abs(difference))}.`}
                </span>
              </div>
            )}
          </div>
        )}
        {hasTarget && hasValues && !rates && (
          <p className="text-muted-foreground mt-2 text-xs">Checking against your target budget…</p>
        )}
        {ratesLoading && <p className="text-muted-foreground mt-2 text-xs">Loading live exchange rates…</p>}
      </CardContent>
    </Card>
  )
}

export default BudgetBreakdown
