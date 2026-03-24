import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getBalance, getTransactionHistory } from '@/lib/tokens'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [balance, history] = await Promise.all([
    getBalance(session.user.id),
    getTransactionHistory(session.user.id),
  ])

  return NextResponse.json({ balance, history })
}
