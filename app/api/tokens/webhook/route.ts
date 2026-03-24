import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TOKEN_PACKAGES } from '@/lib/token-costs'

interface YooKassaEvent {
  type: string
  event: string
  object: {
    id: string
    status: string
    metadata?: {
      user_id?: string
      package_index?: number | string
      tokens?: number | string
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json() as YooKassaEvent

    // Only handle succeeded payments
    if (event.event !== 'payment.succeeded' || event.object?.status !== 'succeeded') {
      return NextResponse.json({ ok: true })
    }

    const payment = event.object
    const meta = payment.metadata

    if (!meta?.user_id) {
      console.error('Webhook: no user_id in metadata', payment.id)
      return NextResponse.json({ ok: true })
    }

    const userId = meta.user_id
    const packageIndex = typeof meta.package_index === 'string'
      ? parseInt(meta.package_index, 10)
      : (meta.package_index ?? 0)

    const pkg = TOKEN_PACKAGES[packageIndex]
    if (!pkg) {
      console.error('Webhook: invalid package_index', packageIndex)
      return NextResponse.json({ ok: true })
    }

    const tokensToAdd = pkg.tokens
    const supabase = await createServerSupabaseClient()

    // Check if we already processed this payment (idempotency)
    const { data: existing } = await supabase
      .from('payments')
      .select('id, status')
      .eq('yookassa_payment_id', payment.id)
      .single()

    if (existing?.status === 'succeeded') {
      // Already processed — return 200 to stop retries
      return NextResponse.json({ ok: true })
    }

    // Add tokens: try the increment_tokens RPC first (atomic), then fall back to
    // a direct expression-based update using the Supabase JS client's sql template.
    // The credits column is still named 'credits' (migration 002 not yet applied).
    const { error: rpcError } = await supabase.rpc('increment_tokens', {
      p_user_id: userId,
      p_amount: tokensToAdd,
    })

    if (rpcError) {
      // RPC unavailable — fall back to a read-then-write (best effort)
      console.warn('increment_tokens RPC failed, falling back:', rpcError.message)

      const { data: profile, error: readErr } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (readErr || !profile) {
        console.error('Webhook: failed to read profile', readErr)
        return NextResponse.json({ error: 'Ошибка начисления токенов' }, { status: 500 })
      }

      const newBalance = (profile.credits ?? 0) + tokensToAdd

      const { error: writeErr } = await supabase
        .from('profiles')
        .update({ credits: newBalance })
        .eq('id', userId)

      if (writeErr) {
        console.error('Webhook: failed to update credits', writeErr)
        return NextResponse.json({ error: 'Ошибка начисления токенов' }, { status: 500 })
      }
    }

    // Update or insert payment record
    if (existing) {
      await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('yookassa_payment_id', payment.id)
    } else {
      // Edge case: purchase route didn't create the record
      await supabase.from('payments').insert({
        user_id: userId,
        yookassa_payment_id: payment.id,
        amount: pkg.priceKopeks,
        credits_added: tokensToAdd,
        status: 'succeeded',
        description: `Пакет токенов «${pkg.name}»`,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
