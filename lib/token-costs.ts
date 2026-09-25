export const TOKEN_COSTS = {
  CREATE_RESUME: 100,
  IMPROVE_RESUME: 80,
  ADAPT_RESUME: 50,
  COVER_LETTER: 20,
} as const

export const INTERVIEW_LIMITS = {
  MAX_MESSAGES_PER_SESSION: 80,
  // Cumulative prompt+completion tokens (each turn re-sends the whole history,
  // so this grows quadratically; 50k ran out after ~13 turns).
  MAX_AI_TOKENS_PER_SESSION: 500_000,
  SESSION_TTL_HOURS: 72,
  MAX_MESSAGE_LENGTH: 2000,
  SOFT_WARNING_AT_MESSAGE: 60,
} as const

// Sent by the client to ask AI for the final resume. The server lets a request
// through the session limits only if the user message ends with this text.
export const INTERVIEW_FINALIZE_INSTRUCTION =
  'Завершай интервью — у меня больше данных нет. Сгенерируй лучшее возможное резюме из того, что есть.'

export const TOKEN_PACKAGES = [
  { name: 'Малый', tokens: 500, priceKopeks: 49_900 },
  { name: 'Средний', tokens: 1_500, priceKopeks: 119_900 },
  { name: 'Большой', tokens: 4_000, priceKopeks: 249_900 },
] as const
