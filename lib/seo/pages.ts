export type RelatedPage = {
  slug: string;       // e.g. "/obrazec-rezume"
  title: string;      // short title shown on card
  hook: string;       // 1-line teaser
  group: "guide" | "profession" | "tool" | "blog";
};

export const allPages: RelatedPage[] = [
  // Wave 1
  {
    slug: "/obrazec-rezume",
    title: "Образец резюме",
    hook: "8 готовых примеров под разные профессии + правила сильного резюме",
    group: "guide",
  },
  // Wave 2
  {
    slug: "/kak-sostavit-rezume",
    title: "Как составить резюме",
    hook: "Пошаговый гайд за 7 шагов: от чистого листа до резюме, на которое отвечают",
    group: "guide",
  },
  {
    slug: "/soprovoditelnoe-pismo",
    title: "Сопроводительное письмо",
    hook: "Примеры под разные ситуации + AI-генератор за минуту",
    group: "tool",
  },
  {
    slug: "/ai-resume",
    title: "Резюме с помощью ИИ",
    hook: "Что AI делает лучше шаблонного конструктора и где он на уровне карьерного консультанта",
    group: "guide",
  },
  // Wave 3 (profession pages — added via professions data)
  // Wave 4
  {
    slug: "/rezume-na-angliyskom",
    title: "Резюме на английском",
    hook: "CV vs резюме — формат, объём, стоп-фразы для зарубежного рекрутера",
    group: "guide",
  },
  {
    slug: "/konstruktor",
    title: "Конструктор резюме",
    hook: "Сравнение конструкторов: какие минусы у hh, myresume, Word-шаблонов и при чём тут AI",
    group: "tool",
  },
  {
    slug: "/adaptaciya-resume",
    title: "Адаптация резюме под вакансию",
    hook: "Почему один отклик на 50 вакансий = 3% ответов, а адаптированные = 15-25%",
    group: "tool",
  },
  {
    slug: "/blog/oshibki-v-rezume",
    title: "10 ошибок в резюме",
    hook: "Из-за каких ошибок HR закрывает вкладку за 10 секунд",
    group: "blog",
  },
  {
    slug: "/blog/dostizheniya-v-rezume",
    title: "Как описать достижения",
    hook: "Формула «действие → метрика → результат» с примерами по 6 профессиям",
    group: "blog",
  },
];

export function getRelatedPages(currentSlug: string, count = 3, preferGroup?: RelatedPage["group"]): RelatedPage[] {
  const candidates = allPages.filter((p) => p.slug !== currentSlug);
  if (preferGroup) {
    const sameGroup = candidates.filter((p) => p.group === preferGroup);
    const others = candidates.filter((p) => p.group !== preferGroup);
    return [...sameGroup, ...others].slice(0, count);
  }
  return candidates.slice(0, count);
}
