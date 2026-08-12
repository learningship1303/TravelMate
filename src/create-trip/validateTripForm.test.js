import { describe, expect, it } from 'vitest'
import { validateTripForm } from './index'

const validForm = { location: 'Goa', noOfDays: '4', budget: 'Cheap', traveler: 'Solo' }

describe('validateTripForm', () => {
  it('accepts a fully filled-in form', () => {
    expect(validateTripForm(validForm)).toEqual({ valid: true, message: null })
  })

  it.each(['location', 'noOfDays', 'budget', 'traveler'])('rejects a form missing %s', (field) => {
    const form = { ...validForm, [field]: '' }
    const result = validateTripForm(form)
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Please fill all the details')
  })

  it('accepts noOfDays at the MAX_DAYS boundary', () => {
    expect(validateTripForm({ ...validForm, noOfDays: '30' }, 30)).toEqual({ valid: true, message: null })
  })

  it('rejects noOfDays one over the MAX_DAYS boundary', () => {
    const result = validateTripForm({ ...validForm, noOfDays: '31' }, 30)
    expect(result.valid).toBe(false)
    expect(result.message).toBe('Trips are limited to 30 days')
  })

  it('rejects a non-integer number of days', () => {
    const result = validateTripForm({ ...validForm, noOfDays: '2.5' })
    expect(result.valid).toBe(false)
  })

  it('rejects zero or negative days', () => {
    expect(validateTripForm({ ...validForm, noOfDays: '0' }).valid).toBe(false)
    expect(validateTripForm({ ...validForm, noOfDays: '-1' }).valid).toBe(false)
  })
})
