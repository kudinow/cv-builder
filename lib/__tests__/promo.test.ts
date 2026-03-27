import { describe, it, expect } from 'vitest'
import { PromoCodeError } from '../promo'

describe('PromoCodeError', () => {
  it('creates error with correct name and message', () => {
    const error = new PromoCodeError('Промо-код не найден')
    expect(error.name).toBe('PromoCodeError')
    expect(error.message).toBe('Промо-код не найден')
    expect(error instanceof Error).toBe(true)
  })
})
