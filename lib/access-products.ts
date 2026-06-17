export const PASS_DURATION_DAYS = 30

export type ProductId = 'resume_390' | 'pass_890'

export const PRODUCTS: Record<
  ProductId,
  { priceKopeks: number; label: string; description: string; passDays?: number }
> = {
  resume_390: {
    priceKopeks: 39000,
    label: 'Скачать резюме — 390 ₽',
    description: 'Чистый PDF и DOCX этого резюме без ограничений, навсегда',
  },
  pass_890: {
    priceKopeks: 89000,
    label: 'Доступ на 30 дней — 890 ₽',
    description: 'Безлимит скачиваний + адаптации под вакансии + сопроводительные',
    passDays: PASS_DURATION_DAYS,
  },
}

export function isProductId(v: unknown): v is ProductId {
  return v === 'resume_390' || v === 'pass_890'
}
