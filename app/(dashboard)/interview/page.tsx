import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getBalance } from '@/lib/tokens'
import { TOKEN_COSTS } from '@/lib/token-costs'
import { InterviewEntryClient } from '@/components/interview-entry-client'

interface Props {
  searchParams: Promise<{ mode?: string; error?: string }>
}

export default async function InterviewPage({ searchParams }: Props) {
  const { mode: rawMode, error } = await searchParams

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const mode: 'create' | 'improve' = rawMode === 'improve' ? 'improve' : 'create'
  const tokenBalance = await getBalance(user!.id)
  const requiredTokens =
    mode === 'improve' ? TOKEN_COSTS.IMPROVE_RESUME : TOKEN_COSTS.CREATE_RESUME

  return (
    <InterviewEntryClient
      mode={mode}
      tokenBalance={tokenBalance}
      requiredTokens={requiredTokens}
      expiredError={error === 'expired'}
    />
  )
}
