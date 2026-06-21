import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PromoCodeError } from '../promo'

// Mock supabase-server
vi.mock('../supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

import { createServerSupabaseClient } from '../supabase-server'
import { activatePromoCode } from '../promo'

describe('PromoCodeError', () => {
  it('creates error with correct name and message', () => {
    const error = new PromoCodeError('Промо-код не найден')
    expect(error.name).toBe('PromoCodeError')
    expect(error.message).toBe('Промо-код не найден')
    expect(error instanceof Error).toBe(true)
  })
})

describe('activatePromoCode', () => {
  const userId = 'user-123'
  const rawCode = 'PROMO10'

  const basePromoRow: {
    id: string
    code: string
    type: string
    owner_id: string | null
    bonus_tokens: number
    owner_bonus_tokens: number
    owner_bonus_on: string | null
    max_uses: number | null
    uses_count: number
    per_user_limit: number
    expires_at: string | null
    active: boolean
    pass_days: number | null
    owner_pass_days: number | null
  } = {
    id: 'pc-1',
    code: 'PROMO10',
    type: 'marketing',
    owner_id: null,
    bonus_tokens: 0,
    owner_bonus_tokens: 0,
    owner_bonus_on: null,
    max_uses: null,
    uses_count: 0,
    per_user_limit: 1,
    expires_at: null,
    active: true,
    pass_days: 3,
    owner_pass_days: null,
  }

  function makeSupabase({
    promoRow = basePromoRow,
    findError = null,
    existingUse = null,
    rpcError = null,
  }: {
    promoRow?: typeof basePromoRow | null
    findError?: { message: string } | null
    existingUse?: { id: string } | null
    rpcError?: { message: string } | null
  } = {}) {
    const rpcMock = vi.fn().mockResolvedValue({ data: null, error: rpcError })

    const supabase = {
      from: vi.fn((table: string) => {
        if (table === 'promo_codes') {
          return {
            select: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: findError ? null : promoRow,
              error: findError,
            }),
            update: vi.fn().mockReturnThis(),
          }
        }
        if (table === 'promo_code_uses') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: existingUse, error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      }),
      rpc: rpcMock,
    }

    // make update chain work for promo_codes
    const promoCodesChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: findError ? null : promoRow,
        error: findError,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }

    supabase.from = vi.fn((table: string) => {
      if (table === 'promo_codes') return promoCodesChain as any
      if (table === 'promo_code_uses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: existingUse, error: null }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    vi.mocked(createServerSupabaseClient).mockResolvedValue(supabase as any)
    return { supabase, rpcMock }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns passDaysGranted and calls grant_pass_days RPC on success', async () => {
    const { rpcMock } = makeSupabase()

    const result = await activatePromoCode(userId, rawCode)

    expect(result).toEqual({ passDaysGranted: 3 })
    expect(rpcMock).toHaveBeenCalledWith('grant_pass_days', {
      p_user_id: userId,
      p_days: 3,
    })
  })

  it('throws PromoCodeError when promo code not found', async () => {
    makeSupabase({ promoRow: null, findError: { message: 'not found' } })

    await expect(activatePromoCode(userId, rawCode)).rejects.toThrow(PromoCodeError)
    await expect(activatePromoCode(userId, rawCode)).rejects.toThrow('Промо-код не найден')
  })

  it('throws PromoCodeError for referral code', async () => {
    makeSupabase({ promoRow: { ...basePromoRow, type: 'referral' } })

    await expect(activatePromoCode(userId, rawCode)).rejects.toThrow(
      'Реферальный код можно использовать только при регистрации'
    )
  })

  it('throws PromoCodeError when user tries to use own code', async () => {
    makeSupabase({ promoRow: { ...basePromoRow, owner_id: userId } })

    await expect(activatePromoCode(userId, rawCode)).rejects.toThrow(
      'Нельзя использовать свой собственный код'
    )
  })

  it('throws PromoCodeError when code already used by user', async () => {
    makeSupabase({ existingUse: { id: 'use-1' } })

    await expect(activatePromoCode(userId, rawCode)).rejects.toThrow(
      'Вы уже использовали этот промо-код'
    )
  })

  it('throws PromoCodeError when RPC returns an error', async () => {
    makeSupabase({ rpcError: { message: 'db error' } })

    await expect(activatePromoCode(userId, rawCode)).rejects.toThrow('db error')
  })
})
