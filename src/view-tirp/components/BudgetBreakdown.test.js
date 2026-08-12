import { describe, expect, it } from 'vitest'
import { computeBudgetVerdict } from './BudgetBreakdown'

describe('computeBudgetVerdict', () => {
  it('reports within-budget when the target is above the estimated total', () => {
    const verdict = computeBudgetVerdict(800, 1000)
    expect(verdict.isOverBudget).toBe(false)
    expect(verdict.difference).toBe(200)
  })

  it('reports over-budget when the target is below the estimated total', () => {
    const verdict = computeBudgetVerdict(1200, 1000)
    expect(verdict.isOverBudget).toBe(true)
    expect(verdict.difference).toBe(-200)
  })

  it('treats an exact match as within budget', () => {
    const verdict = computeBudgetVerdict(1000, 1000)
    expect(verdict.isOverBudget).toBe(false)
    expect(verdict.difference).toBe(0)
  })

  it('returns null when total or target is missing', () => {
    expect(computeBudgetVerdict(null, 1000)).toBeNull()
    expect(computeBudgetVerdict(1000, null)).toBeNull()
  })
})
