import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { spendTokens, InsufficientTokensError } from '@/lib/tokens'
import { completeSession } from '@/lib/interview-session'
import { TOKEN_COSTS } from '@/lib/token-costs'

// NOTE: Token ordering — tokens are spent BEFORE the resume record is created.
// If resume creation fails after a successful token spend, the tokens are lost (no rollback).
// This is an eventual consistency risk. A proper fix would use a Supabase RPC transaction
// that performs both operations atomically.
// TODO: Replace steps 4-6 with a `finalize_interview_session` RPC function that wraps
// token deduction + resume insert + session completion in a single DB transaction.

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { sessionId, resumeJson } = (await req.json()) as {
    sessionId: string
    resumeJson: string
  }

  // 1. Load and validate session
  const { data: session, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) {
    return Response.json({ error: 'Сессия не найдена' }, { status: 404 })
  }

  if (session.status === 'completed') {
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

  // 3. Determine token cost by mode
  const tokenCost =
    session.mode === 'improve' ? TOKEN_COSTS.IMPROVE_RESUME : TOKEN_COSTS.CREATE_RESUME

  // 4. Spend tokens (throws InsufficientTokensError if balance too low)
  try {
    const description =
      session.mode === 'improve'
        ? 'Улучшение резюме (интервью)'
        : 'Создание резюме с нуля (интервью)'
    await spendTokens(user.id, tokenCost, description)
  } catch (err) {
    if (err instanceof InsufficientTokensError) {
      return Response.json(
        { error: 'Недостаточно токенов', needed: err.needed, balance: err.balance },
        { status: 402 }
      )
    }
    throw err
  }

  // 5. Create master resume record
  // Note: if this fails, tokens have already been spent — manual recovery needed.
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
    console.error(
      '[finalize] Resume insert failed after token spend — manual recovery needed for userId:',
      user.id,
      resumeError
    )
    return Response.json({ error: 'Не удалось сохранить резюме' }, { status: 500 })
  }

  // 6. Complete session
  await completeSession(sessionId, resume.id)

  return Response.json({ resumeId: resume.id })
}
