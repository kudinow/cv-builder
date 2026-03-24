import { createServerSupabaseClient } from './supabase-server'
import { INTERVIEW_LIMITS } from './token-costs'

export interface InterviewMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface InterviewSession {
  id: string
  user_id: string
  resume_id: string | null
  status: 'active' | 'paused' | 'completed' | 'expired'
  mode: 'create' | 'improve'
  phase: number
  messages: InterviewMessage[]
  collected_data: Record<string, unknown>
  uploaded_resume_text: string | null
  message_count: number
  ai_tokens_used: number
  expires_at: string
  created_at: string
  updated_at: string
}

export async function createSession(
  userId: string,
  mode: 'create' | 'improve',
  uploadedResumeText?: string
): Promise<InterviewSession> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: userId,
      mode,
      uploaded_resume_text: uploadedResumeText ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getActiveSession(
  userId: string
): Promise<InterviewSession | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('interview_sessions')
    .select()
    .eq('user_id', userId)
    .in('status', ['active', 'paused'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)

  if (data && isSessionExpired(data.expires_at)) {
    await expireSession(data.id)
    return null
  }

  return data
}

export async function pauseSession(sessionId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('interview_sessions')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function resumeSession(sessionId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('interview_sessions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function addMessage(
  sessionId: string,
  message: InterviewMessage,
  aiTokensUsed?: number
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  // Fetch current session to append message
  const { data: session, error: fetchError } = await supabase
    .from('interview_sessions')
    .select('messages, message_count, ai_tokens_used')
    .eq('id', sessionId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const updatedMessages = [...(session.messages as InterviewMessage[]), message]
  const updatedCount = session.message_count + 1
  const updatedAiTokens = session.ai_tokens_used + (aiTokensUsed ?? 0)

  const { error: updateError } = await supabase
    .from('interview_sessions')
    .update({
      messages: updatedMessages,
      message_count: updatedCount,
      ai_tokens_used: updatedAiTokens,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (updateError) throw new Error(updateError.message)
}

export async function completeSession(
  sessionId: string,
  resumeId: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from('interview_sessions')
    .update({
      status: 'completed',
      resume_id: resumeId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

async function expireSession(sessionId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  await supabase
    .from('interview_sessions')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('id', sessionId)
}

export function shouldWarnAboutLimit(messageCount: number): boolean {
  return (
    messageCount >= INTERVIEW_LIMITS.SOFT_WARNING_AT_MESSAGE &&
    messageCount < INTERVIEW_LIMITS.MAX_MESSAGES_PER_SESSION
  )
}

export function shouldForceFinalize(session: {
  messageCount: number
  aiTokensUsed: number
}): boolean {
  return (
    session.messageCount >= INTERVIEW_LIMITS.MAX_MESSAGES_PER_SESSION ||
    session.aiTokensUsed > INTERVIEW_LIMITS.MAX_AI_TOKENS_PER_SESSION
  )
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now()
}
