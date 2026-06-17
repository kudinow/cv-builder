import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PRODUCTS, isProductId, type ProductId } from '@/lib/access-products'
import { notifyAdmin } from '@/lib/telegram-bot'

interface YooKassaEvent {
  type: string
  event: string
  object: {
    id: string
    status: string
    metadata?: {
      user_id?: string
      product?: string
      resume_id?: string
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json() as YooKassaEvent

    if (event.event !== 'payment.succeeded' || event.object?.status !== 'succeeded') {
      return NextResponse.json({ ok: true })
    }

    const payment = event.object
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
