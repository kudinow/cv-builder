import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === 'true'

  let query = supabase
    .from('resumes')
    .select(`
      id, title, target_position, type, status, created_at, pdf_path,
      adaptations:resumes!parent_id(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!all) {
    query = query.is('parent_id', null)
  }

  const { data: resumes, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ resumes })
}
