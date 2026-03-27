import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

function generateRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'REF-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from('promo_codes')
      .select('id, code')
      .eq('owner_id', userId)
      .eq('type', 'referral')
      .maybeSingle()

    let code: string
    let promoId: string

    if (existing) {
      code = existing.code
      promoId = existing.id
    } else {
      // Generate unique referral code
      let attempts = 0
      while (true) {
        code = generateRefCode()
        const { data, error } = await supabase.from('promo_codes').insert({
          code,
          type: 'referral',
          owner_id: userId,
          bonus_tokens: 80,
          owner_bonus_tokens: 30,
          owner_bonus_on: 'first_action',
          per_user_limit: 1,
        }).select('id').single()
        if (!error && data) {
          promoId = data.id
          break
        }
        attempts++
        if (attempts > 5) {
          return NextResponse.json({ error: 'Не удалось создать код' }, { status: 500 })
        }
      }
    }

    // Get stats
    const { data: uses } = await supabase
      .from('promo_code_uses')
      .select('tokens_granted, owner_tokens_granted')
      .eq('promo_code_id', promoId)

    const invited = uses?.length ?? 0
    const tokensEarned = uses?.reduce((sum, u) => sum + (u.owner_tokens_granted ?? 0), 0) ?? 0

    return NextResponse.json({
      code,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${code}`,
      stats: { invited, tokensEarned },
    })
  } catch (error) {
    console.error('Referral error:', error)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
