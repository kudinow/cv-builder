import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { InterviewEntryClient } from '@/components/interview-entry-client'

interface Props {
  searchParams: Promise<{ mode?: string; error?: string }>
}

export default async function InterviewPage({ searchParams }: Props) {
  const { mode: rawMode, error } = await searchParams

  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/auth')
  }

  const mode: 'create' | 'improve' = rawMode === 'improve' ? 'improve' : 'create'

  return (
    <InterviewEntryClient
      mode={mode}
      expiredError={error === 'expired'}
    />
  )
}
