import { createServerSupabaseClient } from './supabase-server'

export async function hasActivePass(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('access_until')
    .eq('id', userId)
    .single()

  if (!data?.access_until) return false
  return new Date(data.access_until).getTime() > Date.now()
}

export async function isResumeUnlocked(resumeId: string, userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('resumes')
    .select('unlocked')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single()

  return data?.unlocked === true
}

// Доступ на скачивание: уже разблокировано ИЛИ активный pass.
// При активном pass помечаем резюме unlocked навсегда (решение: материалы,
// к которым притронулись во время доступа, остаются доступны после истечения).
export async function canDownloadResume(resumeId: string, userId: string): Promise<boolean> {
  if (await isResumeUnlocked(resumeId, userId)) return true
  if (await hasActivePass(userId)) {
    const supabase = await createServerSupabaseClient()
    await supabase.rpc('unlock_resume', { p_resume_id: resumeId, p_user_id: userId })
    return true
  }
  return false
}
