export const TOKEN_COSTS = {
  CREATE_RESUME: 100,
  IMPROVE_RESUME: 60,
  ADAPT_RESUME: 40,
  ADAPT_STANDALONE: 80,
} as const

export const INTERVIEW_LIMITS = {
  MAX_MESSAGES_PER_SESSION: 80,
  MAX_AI_TOKENS_PER_SESSION: 50_000,
  SESSION_TTL_HOURS: 72,
  MAX_MESSAGE_LENGTH: 2000,
  SOFT_WARNING_AT_MESSAGE: 60,
} as const

export const TOKEN_PACKAGES = [
  { name: 'Малый', tokens: 500, priceKopeks: 49_900 },
  { name: 'Средний', tokens: 1_500, priceKopeks: 119_900 },
  { name: 'Большой', tokens: 4_000, priceKopeks: 249_900 },
] as const

export function getAdaptCost(parentId: string | null | undefined): number {
  return parentId ? TOKEN_COSTS.ADAPT_RESUME : TOKEN_COSTS.ADAPT_STANDALONE
}
