import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PRODUCTS, isProductId } from '@/lib/access-products'

const YOOKASSA_API = 'https://api.yookassa.ru/v3/payments'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await req.json()
    const { product, resumeId } = body as { product: unknown; resumeId?: string }

    if (!isProductId(product)) {
      return NextResponse.json({ error: 'Неверный продукт' }, { status: 400 })
    }
    if (product === 'resume_390' && !resumeId) {
      return NextResponse.json({ error: 'Не передан resumeId' }, { status: 400 })
    }

    const prod = PRODUCTS[product]
    const shopId = process.env.YOKASSA_SHOP_ID
    const secretKey = process.env.YOKASSA_SECRET_KEY

    if (!shopId || !secretKey) {
      return NextResponse.json({ error: 'Платёжный сервис не настроен' }, { status: 500 })
    }

    const priceRubles = (prod.priceKopeks / 100).toFixed(2)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnUrl = `${baseUrl}/tokens/success`
    const idempotenceKey = `${session.user.id}-${product}-${resumeId ?? 'none'}-${Date.now()}`
    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

    const yooResponse = await fetch(YOOKASSA_API, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
      },
      body: JSON.stringify({
        amount: { value: priceRubles, currency: 'RUB' },
        confirmation: { type: 'redirect', return_url: returnUrl },
        description: prod.label,
        metadata: {
          user_id: session.user.id,
          product,
          ...(resumeId ? { resume_id: resumeId } : {}),
        },
        capture: true,
      }),
    })

    if (!yooResponse.ok) {
      const errText = await yooResponse.text()
      console.error('YooKassa error:', errText)
      return NextResponse.json({ error: 'Ошибка при создании платежа' }, { status: 502 })
    }

    const payment = await yooResponse.json() as {
      id: string
      confirmation: { confirmation_url: string }
    }

    await supabase.from('payments').insert({
      user_id: session.user.id,
      yookassa_payment_id: payment.id,
      amount: prod.priceKopeks,
      status: 'pending',
      product,
      resume_id: product === 'resume_390' ? resumeId : null,
      description: prod.label,
    })

    return NextResponse.json({ confirmationUrl: payment.confirmation.confirmation_url })
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
