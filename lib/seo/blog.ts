export type BlogPost = {
  slug: string;                // "oshibki-v-rezume"
  title: string;
  description: string;
  hook: string;                // hero subtitle
  publishedAt: string;         // ISO date
  updatedAt: string;
  readingMinutes: number;
  ws: number;                  // wordstat /mo for primary keyword
};

export const blogPosts: BlogPost[] = [
  {
    slug: "oshibki-v-rezume",
    title: "10 ошибок в резюме, из-за которых HR закрывает вкладку",
    description: "Топ ошибок, которые делают резюме «непрочитываемыми»: от устаревшего фото до отсутствия конкретики в опыте. С примерами «было / стало».",
    hook: "10 ошибок, которые видны рекрутеру в первые 7 секунд просмотра. Если в вашем резюме есть хотя бы 3 из них — отклики не приходят не из-за рынка.",
    publishedAt: "2026-05-26",
    updatedAt: "2026-05-26",
    readingMinutes: 8,
    ws: 793,
  },
  {
    slug: "dostizheniya-v-rezume",
    title: "Как описать достижения в резюме — формула и примеры по 6 профессиям",
    description: "Главная разница между сильным и слабым резюме — конкретика в достижениях. Формула «действие → метрика → результат» + 18 готовых примеров по 6 ролям.",
    hook: "Формула достижений, которой пользуются карьерные консультанты. С 18 готовыми примерами «было / стало» по 6 профессиям: разработчик, маркетолог, бухгалтер, менеджер продаж, дизайнер, HR.",
    publishedAt: "2026-05-26",
    updatedAt: "2026-05-26",
    readingMinutes: 10,
    ws: 40,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
