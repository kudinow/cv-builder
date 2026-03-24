import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  isSessionExpired,
  resumeSession,
  type InterviewMessage,
} from '@/lib/interview-session'
import { InterviewChatV2 } from '@/components/interview-chat-v2'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function InterviewSessionPage({ params }: Props) {
  const { sessionId } = await params

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user!.id

  // Load session from DB
  const { data: session } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (!session) {
    notFound()
  }

  // Handle expired session
  if (isSessionExpired(session.expires_at)) {
    redirect('/interview?error=expired')
  }

  // If session was paused, resume it
  if (session.status === 'paused') {
    await resumeSession(sessionId)
  }

  // Reconstruct messages for the chat component (exclude system messages)
  const chatMessages = (session.messages as InterviewMessage[])
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  return (
    <div className="theme-premium h-[calc(100vh-64px)] flex flex-col">
      <InterviewChatV2
        sessionId={sessionId}
        initialMessages={chatMessages}
        mode={session.mode}
        initialPhase={session.phase}
        messageCount={session.message_count}
      />
    </div>
  )
}
