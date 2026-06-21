import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { completeSession } from '@/lib/interview-session'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    return Response.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { sessionId, resumeJson } = (await req.json()) as {
    sessionId: string
    resumeJson: string
  }

  // 1. Load and validate session
  const { data: interviewSession, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !interviewSession) {
    return Response.json({ error: 'Сессия не найдена' }, { status: 404 })
  }

  if (interviewSession.status === 'completed') {
    return Response.json({ error: 'Сессия уже завершена' }, { status: 409 })
  }

  // 2. Parse and validate resume JSON
  let resumeData: Record<string, unknown>
  try {
    resumeData = JSON.parse(resumeJson)
    if (!resumeData.full_name || !resumeData.experience) {
      throw new Error('Invalid structure')
    }
  } catch {
    return Response.json({ error: 'Некорректный JSON резюме' }, { status: 422 })
  }

  // Создание резюме бесплатно (freemium). Оплата — на выгрузке (см. /api/generate-pdf).

  // 3. Create master resume record
  const title = (resumeData.target_position as string) || 'Моё резюме'
  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      type: 'master',
      title,
      target_position: (resumeData.target_position as string) ?? null,
      parent_id: null,
      adapted_text: resumeJson, // store raw JSON in adapted_text field
      status: 'done',
    })
    .select('id')
    .single()

  if (resumeError || !resume) {
    console.error('[finalize] Resume insert failed for userId:', user.id, resumeError)
    return Response.json({ error: 'Не удалось сохранить резюме' }, { status: 500 })
  }

  // 4. Complete session
  await completeSession(sessionId, resume.id)

  // Реферальный owner-бонус: финализация резюме = «первое действие» в freemium.
  try {
    await supabase.rpc('process_referral_bonus', { p_user_id: user.id })
  } catch {
    // не критично для основного флоу
  }

  return Response.json({ resumeId: resume.id })
}
