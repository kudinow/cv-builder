import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TOKEN_PACKAGES } from '@/lib/token-costs'

const YOOKASSA_API = 'https://api.yookassa.ru/v3/payments'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await req.json()
    const { packageIndex } = body as { packageIndex: number }

    if (
      typeof packageIndex !== 'number' ||
      packageIndex < 0 ||
      packageIndex >= TOKEN_PACKAGES.length
    ) {
      return NextResponse.json({ error: 'Неверный индекс пакета' }, { status: 400 })
    }

    const pkg = TOKEN_PACKAGES[packageIndex]
    const shopId = process.env.YOKASSA_SHOP_ID
    const secretKey = process.env.YOKASSA_SECRET_KEY

    if (!shopId || !secretKey) {
      return NextResponse.json({ error: 'Платёжный сервис не настроен' }, { status: 500 })
    }

    // Format price: kopeks → rubles with 2 decimal places
    const priceRubles = (pkg.priceKopeks / 100).toFixed(2)

    // Build return URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnUrl = `${baseUrl}/tokens/success`

    // Idempotency key — unique per request
    const idempotenceKey = `${session.user.id}-${packageIndex}-${Date.now()}`

    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

    const yooResponse = await fetch(YOOKASSA_API, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify({
        amount: {
          value: priceRubles,
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: returnUrl,
        },
        description: `Пакет токенов «${pkg.name}» — ${pkg.tokens} токенов`,
        metadata: {
          user_id: session.user.id,
          package_index: packageIndex,
          tokens: pkg.tokens,
        },
        capture: true,
      }),
    })

    if (!yooResponse.ok) {
      const errText = await yooResponse.text()
      console.error('YooKassa error:', errText)
      return NextResponse.json(
        { error: 'Ошибка при создании платежа' },
        { status: 502 }
      )
    }

    const payment = await yooResponse.json() as {
      id: string
      status: string
      confirmation: { confirmation_url: string }
    }

    // Record payment in payments table (status = pending)
    await supabase.from('payments').insert({
      user_id: session.user.id,
      yookassa_payment_id: payment.id,
      amount: pkg.priceKopeks,
      credits_added: pkg.tokens,
      status: 'pending',
      description: `Пакет токенов «${pkg.name}»`,
    })

    return NextResponse.json({ confirmationUrl: payment.confirmation.confirmation_url })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
