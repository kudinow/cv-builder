import { describe, it, expect } from 'vitest'
import { TOKEN_COSTS, INTERVIEW_LIMITS } from '../token-costs'

describe('TOKEN_COSTS', () => {
  it('defines costs for all operations', () => {
    expect(TOKEN_COSTS.CREATE_RESUME).toBe(100)
    expect(TOKEN_COSTS.IMPROVE_RESUME).toBe(80)
    expect(TOKEN_COSTS.ADAPT_RESUME).toBe(50)
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
