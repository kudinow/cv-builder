import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getBalance, getTransactionHistory } from '@/lib/tokens'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [balance, history] = await Promise.all([
    getBalance(user.id),
    getTransactionHistory(user.id),
  ])

  return NextResponse.json({ balance, history })
}
