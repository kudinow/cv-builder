import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
}

vi.mock('../supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

// Must import after mock setup
const { getBalance, spendTokens, addTokens, getTransactionHistory } = await import('../tokens')

describe('getBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns token balance for user', async () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { tokens: 250 },
          error: null,
        }),
      }),
    })
    mockSupabase.from.mockReturnValue({ select: selectMock })

    const balance = await getBalance('user-123')
    expect(balance).toBe(250)
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
  })

  it('throws on error', async () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'not found' },
        }),
      }),
    })
    mockSupabase.from.mockReturnValue({ select: selectMock })

    await expect(getBalance('user-123')).rejects.toThrow('not found')
  })
})

describe('spendTokens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws InsufficientTokensError when balance too low', async () => {
    const selectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { tokens: 30 },
          error: null,
        }),
      }),
    })
    mockSupabase.from.mockReturnValue({ select: selectMock })

    await expect(
      spendTokens('user-123', 100, 'Создание резюме', 'ref-id')
    ).rejects.toThrow('Insufficient tokens')
  })
})

describe('addTokens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds tokens and records transaction', async () => {
    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const insertMock = vi.fn().mockResolvedValue({ error: null })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') return { update: updateMock }
      if (table === 'token_transactions') return { insert: insertMock }
      return {}
    })
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

    await addTokens('user-123', 500, 'purchase', 'Пакет Малый', 'payment-id')

    expect(mockSupabase.rpc).toHaveBeenCalled()
  })
})
