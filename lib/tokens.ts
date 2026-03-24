import { createServerSupabaseClient } from './supabase-server'

export class InsufficientTokensError extends Error {
  public needed: number
  public balance: number

  constructor(needed: number, balance: number) {
    super('Insufficient tokens')
    this.name = 'InsufficientTokensError'
    this.needed = needed
    this.balance = balance
  }
}

export async function getBalance(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('tokens')
    .eq('id', userId)
    .single()

  if (error) return 0
  return data.tokens ?? 0
}

export async function spendTokens(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<void> {
  // Pre-check balance for user-friendly error with exact numbers
  const balance = await getBalance(userId)

  if (balance < amount) {
    throw new InsufficientTokensError(amount, balance)
  }

  const supabase = await createServerSupabaseClient()

  // Decrement tokens atomically (handles race conditions)
  const { error: updateError } = await supabase.rpc('decrement_tokens', {
    p_user_id: userId,
    p_amount: amount,
  })

  if (updateError) {
    // RPC raises 'Insufficient tokens' on race condition
    if (updateError.message.includes('Insufficient tokens')) {
      const currentBalance = await getBalance(userId)
      throw new InsufficientTokensError(amount, currentBalance)
    }
    throw new Error(updateError.message)
  }

  // Record transaction
  const { error: txError } = await supabase
    .from('token_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'spend',
      description,
      reference_id: referenceId ?? null,
    })

  if (txError) throw new Error(txError.message)
}

export async function addTokens(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus',
  description: string,
  referenceId?: string
): Promise<void> {
  const supabase = await createServerSupabaseClient()

  // Increment tokens atomically
  const { error: updateError } = await supabase.rpc('increment_tokens', {
    p_user_id: userId,
    p_amount: amount,
  })

  if (updateError) throw new Error(updateError.message)

  // Record transaction
  const { error: txError } = await supabase
    .from('token_transactions')
    .insert({
      user_id: userId,
      amount,
      type,
      description,
      reference_id: referenceId ?? null,
    })

  if (txError) throw new Error(txError.message)
}

export async function getTransactionHistory(
  userId: string,
  limit = 20
): Promise<Array<{
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}>> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('token_transactions')
    .select('id, amount, type, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}
