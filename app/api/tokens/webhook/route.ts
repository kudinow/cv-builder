import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PRODUCTS, isProductId, type ProductId } from '@/lib/access-products'
import { notifyAdmin } from '@/lib/telegram-bot'

interface YooKassaEvent {
  type: string
  event: string
  object: { id: string }
}

interface YooKassaPayment {
  id: string
  status: string
  metadata?: {
    user_id?: string
    product?: string
    resume_id?: string
  }
}

const YOOKASSA_API = 'https://api.yookassa.ru/v3/payments'

export async function POST(req: NextRequest) {
  try {
    const event = await req.json() as YooKassaEvent

    // Cheap filter on the claimed event type before doing any work.
    if (event.event !== 'payment.succeeded') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = event.object?.id
    if (!paymentId) {
      console.error('Webhook: no payment id in event')
      return NextResponse.json({ ok: true })
    }

    // SECURITY: never trust the webhook body. Re-fetch the payment from YooKassa
    // and use only the authoritative status + metadata it returns. A forged
    // notification with a bogus id cannot be made to return status=succeeded.
    const shopId = process.env.YOKASSA_SHOP_ID
    const secretKey = process.env.YOKASSA_SECRET_KEY
    if (!shopId || !secretKey) {
      console.error('Webhook: YooKassa credentials not configured')
      return NextResponse.json({ error: 'Платёжный сервис не настроен' }, { status: 500 })
    }

    const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
    const verifyRes = await fetch(`${YOOKASSA_API}/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Basic ${credentials}` },
    })

    if (!verifyRes.ok) {
      // Unknown/forged id (404) or transient YooKassa error (5xx) — reject with 500.
      // Genuine notifications are retried by YooKassa; forged ones never get fulfilled.
      console.error('Webhook: payment verification failed', paymentId, verifyRes.status)
      return NextResponse.json({ error: 'Не удалось проверить платёж' }, { status: 500 })
    }

    const payment = await verifyRes.json() as YooKassaPayment

    // Trust only the verified status.
    if (payment.status !== 'succeeded') {
      return NextResponse.json({ ok: true })
    }

    const meta = payment.metadata
    if (!meta?.user_id || !isProductId(meta.product)) {
      console.error('Webhook: missing user_id or invalid product', payment.id, meta?.product)
      return NextResponse.json({ ok: true })
    }

    const userId = meta.user_id
    const product: ProductId = meta.product
    const resumeId = meta.resume_id
    const supabase = await createServerSupabaseClient()

    // Идемпотентность
    const { data: existing } = await supabase
      .from('payments')
      .select('id, status')
      .eq('yookassa_payment_id', payment.id)
      .single()

    if (existing?.status === 'succeeded') {
      return NextResponse.json({ ok: true })
    }

    // Фулфилмент по продукту (SECURITY DEFINER RPC — webhook без RLS-контекста)
    if (product === 'resume_390') {
      if (!resumeId) {
        console.error('Webhook: resume_390 without resume_id', payment.id)
        return NextResponse.json({ ok: true })
      }
      const { error } = await supabase.rpc('unlock_resume', {
        p_resume_id: resumeId,
        p_user_id: userId,
      })
      if (error) {
        console.error('Webhook: unlock_resume failed', error)
        return NextResponse.json({ error: 'Ошибка разблокировки' }, { status: 500 })
      }
    } else {
      const days = PRODUCTS.pass_890.passDays ?? 30
      const { error } = await supabase.rpc('grant_pass_days', {
        p_user_id: userId,
        p_days: days,
      })
      if (error) {
        console.error('Webhook: grant_pass_days failed', error)
        return NextResponse.json({ error: 'Ошибка начисления доступа' }, { status: 500 })
      }
    }

    // Обновить/создать запись платежа
    if (existing) {
      await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('yookassa_payment_id', payment.id)
    } else {
      await supabase.from('payments').insert({
        user_id: userId,
        yookassa_payment_id: payment.id,
        amount: PRODUCTS[product].priceKopeks,
        status: 'succeeded',
        product,
        resume_id: product === 'resume_390' ? resumeId : null,
        description: PRODUCTS[product].label,
      })
    }

    // Уведомление админа (fire-and-forget)
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('telegram_id, full_name, access_until')
        .eq('id', userId)
        .single()

      const tgIdLine = profile?.telegram_id ? ` (tg_id ${profile.telegram_id})` : ''
      const name = profile?.full_name ? ` — ${profile.full_name}` : ''
      const priceRub = (PRODUCTS[product].priceKopeks / 100).toFixed(2)
      const extra = product === 'pass_890' && profile?.access_until
        ? `\nДоступ до: ${new Date(profile.access_until).toLocaleDateString('ru-RU')}`
        : ''

      await notifyAdmin(
        `💰 Оплата${name}${tgIdLine}\nПродукт: ${PRODUCTS[product].label}, ${priceRub} ₽${extra}`
      )
    } catch (e) {
      console.error('notifyAdmin (payment) failed', e)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
