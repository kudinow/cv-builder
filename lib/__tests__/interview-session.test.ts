import { describe, it, expect, vi, beforeEach } from 'vitest'
import { INTERVIEW_LIMITS } from '../token-costs'

const mockSupabase = {
  from: vi.fn(),
}

vi.mock('../supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

const {
  createSession,
  getActiveSession,
  pauseSession,
  addMessage,
  shouldWarnAboutLimit,
  shouldForceFinalize,
  isSessionExpired,
} = await import('../interview-session')

describe('shouldWarnAboutLimit', () => {
  it('returns false below warning threshold', () => {
    expect(shouldWarnAboutLimit(50)).toBe(false)
  })

  it('returns true at warning threshold', () => {
    expect(shouldWarnAboutLimit(INTERVIEW_LIMITS.SOFT_WARNING_AT_MESSAGE)).toBe(true)
  })

  it('returns true above warning threshold', () => {
    expect(shouldWarnAboutLimit(65)).toBe(true)
  })

  it('returns false at max (force finalize takes over)', () => {
    expect(shouldWarnAboutLimit(INTERVIEW_LIMITS.MAX_MESSAGES_PER_SESSION)).toBe(false)
  })
})

describe('shouldForceFinalize', () => {
  it('returns false below max messages', () => {
    expect(shouldForceFinalize({ messageCount: 70, aiTokensUsed: 0 })).toBe(false)
  })

  it('returns true at max messages', () => {
    expect(shouldForceFinalize({
      messageCount: INTERVIEW_LIMITS.MAX_MESSAGES_PER_SESSION,
      aiTokensUsed: 0,
    })).toBe(true)
  })

  it('returns true when AI tokens exceeded', () => {
    expect(shouldForceFinalize({
      messageCount: 10,
      aiTokensUsed: INTERVIEW_LIMITS.MAX_AI_TOKENS_PER_SESSION + 1,
    })).toBe(true)
  })
})

describe('isSessionExpired', () => {
  it('returns false for future expiry', () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    expect(isSessionExpired(future)).toBe(false)
  })

  it('returns true for past expiry', () => {
    const past = new Date(Date.now() - 60_000).toISOString()
    expect(isSessionExpired(past)).toBe(true)
  })
})
