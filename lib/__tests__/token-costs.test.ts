import { describe, it, expect } from 'vitest'
import { TOKEN_COSTS, INTERVIEW_LIMITS, getAdaptCost } from '../token-costs'

describe('TOKEN_COSTS', () => {
  it('defines costs for all operations', () => {
    expect(TOKEN_COSTS.CREATE_RESUME).toBe(100)
    expect(TOKEN_COSTS.IMPROVE_RESUME).toBe(60)
    expect(TOKEN_COSTS.ADAPT_RESUME).toBe(40)
    expect(TOKEN_COSTS.ADAPT_STANDALONE).toBe(80)
  })
})

describe('INTERVIEW_LIMITS', () => {
  it('defines all limits', () => {
    expect(INTERVIEW_LIMITS.MAX_MESSAGES_PER_SESSION).toBe(80)
    expect(INTERVIEW_LIMITS.MAX_AI_TOKENS_PER_SESSION).toBe(50_000)
    expect(INTERVIEW_LIMITS.SESSION_TTL_HOURS).toBe(72)
    expect(INTERVIEW_LIMITS.MAX_MESSAGE_LENGTH).toBe(2000)
    expect(INTERVIEW_LIMITS.SOFT_WARNING_AT_MESSAGE).toBe(60)
  })
})

describe('getAdaptCost', () => {
  it('returns 40 when parent_id is provided', () => {
    expect(getAdaptCost('some-uuid')).toBe(40)
  })

  it('returns 80 when parent_id is null', () => {
    expect(getAdaptCost(null)).toBe(80)
  })

  it('returns 80 when parent_id is undefined', () => {
    expect(getAdaptCost(undefined)).toBe(80)
  })
})
