import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { pauseSession, resumeSession } from '@/lib/interview-session'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action } = await req.json()

  if (action === 'pause') {
    await pauseSession(id)
    return NextResponse.json({ ok: true, status: 'paused' })
  }

  if (action === 'resume') {
    await resumeSession(id)
    return NextResponse.json({ ok: true, status: 'active' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
