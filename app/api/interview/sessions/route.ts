import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createSession, getActiveSession } from '@/lib/interview-session'

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check for existing active session
  const active = await getActiveSession(user.id)
  if (active) {
    return NextResponse.json(
      { error: 'Active session exists', sessionId: active.id },
      { status: 409 }
    )
  }

  const { mode, uploadedResumeText } = await req.json()

  if (!mode || !['create', 'improve'].includes(mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  }

  const session = await createSession(user.id, mode, uploadedResumeText)
  return NextResponse.json({ session }, { status: 201 })
}
