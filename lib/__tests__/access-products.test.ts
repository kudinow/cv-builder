import { describe, it, expect } from 'vitest'
import { PRODUCTS, PASS_DURATION_DAYS, isProductId } from '../access-products'

describe('access-products', () => {
  it('resume_390 стоит 39000 копеек', () => {
    expect(PRODUCTS.resume_390.priceKopeks).toBe(39000)
  })

  it('pass_890 стоит 89000 копеек и даёт 30 дней', () => {
    expect(PRODUCTS.pass_890.priceKopeks).toBe(89000)
    expect(PRODUCTS.pass_890.passDays).toBe(PASS_DURATION_DAYS)
  })

  it('isProductId валидирует id продукта', () => {
    expect(isProductId('resume_390')).toBe(true)
    expect(isProductId('pass_890')).toBe(true)
    expect(isProductId('packageIndex')).toBe(false)
    expect(isProductId(0)).toBe(false)
  })
})
