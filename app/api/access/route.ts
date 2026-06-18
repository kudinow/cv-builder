import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  const { data } = await supabase
    .from('profiles')
    .select('access_until')
    .eq('id', session.user.id)
    .single()

  return NextResponse.json({ accessUntil: data?.access_until ?? null })
}
