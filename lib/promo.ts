import { createServerSupabaseClient } from './supabase-server'
import { addTokens } from './tokens'

export class PromoCodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PromoCodeError'
  }
}

interface PromoCode {
  id: string
  code: string
  type: 'marketing' | 'referral' | 'partner'
  owner_id: string | null
  bonus_tokens: number
  owner_bonus_tokens: number
  owner_bonus_on: string | null
  max_uses: number | null
  uses_count: number
  per_user_limit: number
  expires_at: string | null
  active: boolean
}

export async function activatePromoCode(
  userId: string,
  rawCode: string
): Promise<{ tokensGranted: number }> {
  const code = rawCode.trim().toUpperCase()
  const supabase = await createServerSupabaseClient()

  // 1. Find promo code
  const { data: promo, error: findError } = await supabase
    .from('promo_codes')
    .select('*')
    .ilike('code', code)
    .eq('active', true)
    .single()

  if (findError || !promo) {
    throw new PromoCodeError('Промо-код не найден')
  }

  const pc = promo as PromoCode

  // 2. Referral codes can only be used at registration
  if (pc.type === 'referral') {
    throw new PromoCodeError('Реферальный код можно использовать только при регистрации')
  }

  // 3. Check own code
  if (pc.owner_id === userId) {
    throw new PromoCodeError('Нельзя использовать свой собственный код')
  }

  // 4. Check expiration
  if (pc.expires_at && new Date(pc.expires_at) < new Date()) {
    throw new PromoCodeError('Срок действия промо-кода истёк')
  }

  // 5. Check max uses
  if (pc.max_uses !== null && pc.uses_count >= pc.max_uses) {
    throw new PromoCodeError('Промо-код больше не действует')
  }

  // 6. Check per-user limit
  const { data: existingUse } = await supabase
    .from('promo_code_uses')
    .select('id')
    .eq('promo_code_id', pc.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingUse) {
    throw new PromoCodeError('Вы уже использовали этот промо-код')
  }

  // 7. Grant tokens
  await addTokens(userId, pc.bonus_tokens, 'bonus', `Промо-код: ${pc.code}`)

  // 8. Record usage
  await supabase.from('promo_code_uses').insert({
    promo_code_id: pc.id,
    user_id: userId,
    tokens_granted: pc.bonus_tokens,
  })

  // 9. Increment uses_count
  await supabase
    .from('promo_codes')
    .update({ uses_count: pc.uses_count + 1 })
    .eq('id', pc.id)

  return { tokensGranted: pc.bonus_tokens }
}
