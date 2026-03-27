import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { activatePromoCode, PromoCodeError } from '@/lib/promo'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { code } = await req.json()

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return NextResponse.json({ error: 'Введите промо-код' }, { status: 400 })
    }

    const result = await activatePromoCode(session.user.id, code)

    return NextResponse.json({
      success: true,
      tokensGranted: result.tokensGranted,
    })
  } catch (error) {
    if (error instanceof PromoCodeError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Promo activation error:', error)
    return NextResponse.json(
      { error: 'Ошибка активации промо-кода' },
      { status: 500 }
    )
  }
}
