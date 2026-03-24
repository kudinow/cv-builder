import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { pauseSession, resumeSession, type InterviewMessage } from '@/lib/interview-session'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify session belongs to the user
  const { data: interviewSession } = await supabase
    .from('interview_sessions')
    .select('id, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!interviewSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  const body = await req.json()

  // Support new format: { status?: string; messages?: InterviewMessage[] }
  if (body.status !== undefined || body.messages !== undefined) {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.status === 'paused') {
      updates.status = 'paused'
    } else if (body.status === 'active') {
      updates.status = 'active'
    }

    if (Array.isArray(body.messages)) {
      // Save messages snapshot (client may have more recent messages than DB)
      updates.messages = body.messages as InterviewMessage[]
      updates.message_count = (body.messages as InterviewMessage[]).filter(
        (m) => m.role !== 'system'
      ).length
    }

    const { error } = await supabase
      .from('interview_sessions')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, status: body.status ?? 'updated' })
  }

  // Legacy format: { action: 'pause' | 'resume' }
  const { action } = body

  if (action === 'pause') {
    await pauseSession(id)
    return NextResponse.json({ ok: true, status: 'paused' })
  }

  if (action === 'resume') {
    await resumeSession(id)
    return NextResponse.json({ ok: true, status: 'active' })
  }

  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
}
