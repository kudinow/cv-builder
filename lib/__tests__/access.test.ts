import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
}

vi.mock('../supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

const { hasActivePass, isResumeUnlocked, canDownloadResume } = await import('../access')

function mockSelectSingle(data: unknown) {
  mockSupabase.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error: null }),
        }),
        single: vi.fn().mockResolvedValue({ data, error: null }),
      }),
    }),
  })
}

describe('hasActivePass', () => {
  beforeEach(() => vi.clearAllMocks())

  it('true когда access_until в будущем', async () => {
    mockSelectSingle({ access_until: new Date(Date.now() + 86_400_000).toISOString() })
    expect(await hasActivePass('u1')).toBe(true)
  })

  it('false когда access_until в прошлом', async () => {
    mockSelectSingle({ access_until: new Date(Date.now() - 86_400_000).toISOString() })
    expect(await hasActivePass('u1')).toBe(false)
  })

  it('false когда access_until == null', async () => {
    mockSelectSingle({ access_until: null })
    expect(await hasActivePass('u1')).toBe(false)
  })
})

describe('isResumeUnlocked', () => {
  beforeEach(() => vi.clearAllMocks())

  it('true когда unlocked', async () => {
    mockSelectSingle({ unlocked: true })
    expect(await isResumeUnlocked('r1', 'u1')).toBe(true)
  })

  it('false когда не unlocked', async () => {
    mockSelectSingle({ unlocked: false })
    expect(await isResumeUnlocked('r1', 'u1')).toBe(false)
  })
})

describe('canDownloadResume', () => {
  beforeEach(() => vi.clearAllMocks())

  it('true и НЕ дёргает RPC когда резюме уже unlocked', async () => {
    // первый запрос (isResumeUnlocked) → unlocked true
    mockSelectSingle({ unlocked: true })
    expect(await canDownloadResume('r1', 'u1')).toBe(true)
    expect(mockSupabase.rpc).not.toHaveBeenCalled()
  })

  it('при активном pass разблокирует резюме через RPC и возвращает true', async () => {
    // 1-й from(): isResumeUnlocked → false; 2-й from(): hasActivePass → future
    const future = new Date(Date.now() + 86_400_000).toISOString()
    mockSupabase.from
      .mockReturnValueOnce({
        select: () => ({ eq: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { unlocked: false }, error: null }) }) }) }),
      })
      .mockReturnValueOnce({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { access_until: future }, error: null }) }) }),
      })
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

    expect(await canDownloadResume('r1', 'u1')).toBe(true)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('unlock_resume', { p_resume_id: 'r1', p_user_id: 'u1' })
  })
})
