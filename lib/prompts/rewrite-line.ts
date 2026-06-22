// System prompt for the public "вставь одну строчку" demo on the segment
// landing pages. Single-line rewrite into a strong achievement. This is a
// throwaway demo prompt (example metrics, shown with a disclaimer) — distinct
// from the full-resume methodology in lib/prompts/writing-rules.ts.

import type { SegmentId } from "@/lib/landing-segments";

const SEGMENT_LABEL: Record<SegmentId, string> = {
  marketing: "маркетинг / digital",
  it: "IT / разработка",
  manager: "руководитель / менеджмент",
};

export function buildRewritePrompt(segment: SegmentId, line: string): string {
  return `Ты — карьерный консультант. Перепиши ОДНУ строчку из резюме в сильное достижение по формуле «действие + результат + метрика (+ контекст)».
Правила:
- Ответь ОДНИМ предложением на русском, без кавычек, без пояснений и без вступления.
- Не более 240 символов.
- Если в исходной строке нет конкретных цифр — добавь правдоподобную ПРИМЕРНУЮ метрику, уместную для сферы (её правдоподобность важнее точности; пользователю отдельно показывается дисклеймер, что цифры — пример).
- Подстрой тип метрик под сегмент:
  - marketing: ROI, ДРР, CAC, рост лидов/охватов/выручки, конверсия.
  - it: latency, нагрузка/RPS, аптайм, ускорение деплоя, экономия на инфраструктуре, влияние на продукт.
  - manager: выручка/P&L, рост и удержание команды, сроки запусков, окупаемость.
- Никаких клише вроде «коммуникабельный», «нацелен на результат».
- Если на входе бессмыслица или не относится к опыту работы — верни короткую нейтральную просьбу ввести строчку из резюме.
Сегмент: ${SEGMENT_LABEL[segment]}
Строчка пользователя: ${line}`;
}
