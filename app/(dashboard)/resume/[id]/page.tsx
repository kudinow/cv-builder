import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ResumeViewClient } from '@/components/resume-view-client'

export const dynamic = 'force-dynamic'

interface ResumeData {
  full_name: string
  target_position?: string
  about_me?: string
  experience?: Array<{
    company: string
    position: string
    period: string
    achievements: string[]
  }>
  skills?: Array<{ category: string; items: string[] }> | string[]
  education?: Array<{ institution: string; degree: string; year: string }>
  languages?: Array<{ language: string; level: string }>
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResumePage({ params }: Props) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  // Load master resume
  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!resume) {
    notFound()
  }

  // Load adaptations
  const { data: adaptations } = await supabase
    .from('resumes')
    .select('id, title, target_position, created_at, status')
    .eq('parent_id', id)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Parse resume JSON
  let resumeData: ResumeData | null = null
  try {
    if (resume.adapted_text) {
      const parsed = JSON.parse(resume.adapted_text)
      if (parsed.full_name && parsed.experience) resumeData = parsed
    }
  } catch {
    /* not JSON */
  }

  return (
    <div className="theme-premium min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <ResumeViewClient
          resume={{
            id: resume.id,
            title: resume.title,
            target_position: resume.target_position ?? null,
            adapted_text: resume.adapted_text ?? '',
            created_at: resume.created_at,
          }}
          resumeData={resumeData}
          adaptations={adaptations ?? []}
        />
      </div>
    </div>
  )
}
