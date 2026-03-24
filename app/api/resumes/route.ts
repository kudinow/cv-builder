import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: resumes, error } = await supabase
    .from('resumes')
    .select(`
      id, title, target_position, type, status, created_at, pdf_path,
      adaptations:resumes!parent_id(count)
    `)
    .eq('user_id', user.id)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resumes })
}
