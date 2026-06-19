import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { Toc } from "@/components/marketing/toc";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import { kakSostavitRezumeFaq } from "@/lib/seo/faq";
import { ChevronDown } from "lucide-react";

const PAGE_URL = "https://cv-builder.ru/kak-sostavit-rezume";

export const metadata: Metadata = {
  title: "Как составить резюме в 2026 — пошаговый гайд из 7 шагов + AI",
  description:
    "Как написать сильное резюме с нуля: 7 шагов от цели до финального чек-листа. Что писать в графе «о себе», сколько страниц, как описать достижения. + AI-интервью за 15 минут.",
  alternates: { canonical: "/kak-sostavit-rezume" },
  openGraph: {
    title: "Как составить резюме — пошаговый гайд + AI за 15 минут",
    description:
      "7 шагов от чистого листа до резюме, на которое отвечают. Прочитайте гайд или пройдите те же шаги с AI.",
    type: "article",
    url: PAGE_URL,
  },
};

const steps = [
  {
    id: "step-1-tsel",
    title: "Шаг 1. Определите цель — 1 резюме = 1 роль",
    body: [
      "Универсальное резюме не работает. HR проводит первичный отбор по совпадению ключевых слов с вакансией — и универсальная формулировка проигрывает узкой специализации. Поэтому до того как открыть документ, ответьте на три вопроса:",
      "Какая роль (конкретно — не «маркетинг», а «продуктовый маркетолог B2B SaaS»). На какой уровень (Junior / Middle / Senior — это влияет на акценты в опыте). В какой сфере или типе компаний (стартап / корпорация / агентство).",
      "Если вы рассматриваете 2-3 разные роли — заведите 2-3 версии резюме. Это не дублирование, это нормальный рабочий процесс.",
    ],
  },
  {
    id: "step-2-fakty",
    title: "Шаг 2. Соберите факты — 30 минут сырого дампа",
    body: [
      "Откройте чистый документ и за 30 минут вывалите всё: места работы, проекты, обязанности, конкретные результаты, цифры, кейсы, отзывы клиентов или коллег. Без редактуры, без структуры, без «надо ли это упоминать».",
      "Цель этого шага — получить материал, из которого будете собирать резюме. На этом этапе любой факт может оказаться важным, поэтому не фильтруйте. Дочитали почту за смену? Запишите. Внедрили новый формат планёрки? Запишите.",
      "Этот шаг занимает у людей разочарование больше всего времени, потому что хочется сразу «правильно». Не торопитесь — на чистый дамп уйдёт 20-40 минут, а сэкономит часы на следующих шагах.",
    ],
  },
  {
    id: "step-3-struktura",
    title: "Шаг 3. Структура — блоки в правильном порядке",
    body: [
      "Стандартный порядок для 90% случаев: заголовок резюме → контакты → краткое резюме («о себе») → опыт работы → образование → навыки → дополнительно (языки, сертификаты, проекты).",
      "Опыт работы выше образования всегда, кроме случая «выпускник вуза без опыта». В этом случае выше образования — релевантные стажировки, проекты или волонтёрство.",
      "Заголовок резюме = название роли, на которую откликаетесь. «Менеджер по работе с ключевыми клиентами B2B SaaS», а не «менеджер». ATS-системы фильтруют по этой строке.",
    ],
  },
  {
    id: "step-4-dostizheniya",
    title: "Шаг 4. Достижения по формуле «действие → метрика → результат»",
    body: [
      "Главное отличие сильного резюме от среднего — конкретика в опыте. Сравните: «Улучшил процессы продаж» против «Сократил цикл сделки с 45 до 28 дней, выручка отдела +18% за полгода».",
      "Если цифр нет — переформулируйте через «до/после» с контекстом: «Внедрил CRM-процесс, который раньше был на бумаге — теперь отчётность собирается за час вместо двух дней».",
      "В каждой позиции опыта — 3-5 формулировок достижений, не больше 5. Каждая формулировка — на отдельной строке (буллет), не слитным текстом. Глаголы в прошедшем времени: запустил, сократил, поднял, внедрил, разработал.",
    ],
  },
  {
    id: "step-5-o-sebe",
    title: "Шаг 5. Раздел «о себе» — позиционирование, а не качества",
    body: [
      "«Ответственный, коммуникабельный, стрессоустойчивый» — слова, которые есть у всех и не доказывают ничего. Замените на профессиональное позиционирование: роль + сфера + сильная сторона + якорное достижение.",
      "Пример: «Маркетолог-аналитик с 5 годами в B2B SaaS. Запускаю growth-эксперименты от гипотезы до результата. В предыдущей компании поднял MQL на 240% за 8 месяцев». 2-3 предложения максимум — это не сочинение «расскажи о себе», это headline.",
      "Хорошее «о себе» — это компресс резюме на 3 строки. Если HR прочитает только этот блок, он должен понять кто вы профессионально и почему стоит читать дальше.",
    ],
  },
  {
    id: "step-6-stranits",
    title: "Шаг 6. Сколько страниц должно быть в резюме",
    body: [
      "Одна страница, если опыт до 5 лет. Две — если опыт больше 5 лет или сменяли несколько ролей в разных сферах. Третья страница оправдана только для топ-менеджмента или научных позиций с большим списком публикаций.",
      "Главный критерий — каждая строка несёт информацию, которая помогает принять решение о собеседовании. Если строку можно удалить и хуже не станет — удаляйте.",
      "HR в первом проходе тратит 7-10 секунд на резюме. На двух страницах он успевает дочитать до середины первой. Поэтому всё ключевое (заголовок, последняя позиция, ключевое достижение) — выше первой трети первой страницы.",
    ],
  },
  {
    id: "step-7-cheklist",
    title: "Шаг 7. Финальный чек-лист перед отправкой",
    body: [
      "Заголовок резюме совпадает с названием вакансии (или близок). «О себе» — не общие качества, а позиционирование. В каждой позиции опыта 3-5 достижений с цифрами или контекстом «до/после». Глаголы в прошедшем времени. Объём 1-2 страницы. Все даты заполнены. Нет орфографических ошибок (проверьте сервисом типа orfogrammka.ru). Файл назван как `Имя_Фамилия_Резюме_Роль.pdf`, а не `резюме_итог_3_финал.docx`.",
      "Если вы пройдёте все 7 шагов руками — на это уходит 3-4 часа. Если хотите тот же результат за 15-20 минут — пройдите интервью с AI, который задаёт вопросы по этим же шагам и собирает резюме автоматически.",
    ],
  },
];

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Как составить резюме в 2026 — пошаговый гайд из 7 шагов",
  description:
    "Пошаговая инструкция по составлению резюме: от определения цели до финального чек-листа.",
  totalTime: "PT3H",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.body.join(" "),
    url: `${PAGE_URL}#${s.id}`,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: kakSostavitRezumeFaq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Главная", item: "https://cv-builder.ru/" },
    { "@type": "ListItem", position: 2, name: "Как составить резюме", item: PAGE_URL },
  ],
};

export default function KakSostavitRezumePage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-howto-kak-sostavit" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <Script id="ld-faq-kak-sostavit" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="ld-breadcrumb-kak-sostavit" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Как составить резюме" }]} />
          </div>
          <div className="mb-5 inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
            Гайд · 7 шагов · ~3 часа без AI / 15 минут с AI
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Как составить резюме в 2026 —{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">пошаговый гайд</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            7 шагов от чистого листа до резюме, на которое отвечают. Прочитайте — или пройдите те же шаги с AI-интервью за 15 минут.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth?utm_source=seo_kak_sostavit&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-600 hover:to-purple-600 hover:-translate-y-0.5"
            >
              Пройти с AI за 15 минут →
            </Link>
            <a href="#step-1-tsel" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Читать гайд
            </a>
          </div>
        </div>
      </section>

      {/* TOC */}
      <section className="bg-[#0f172a] pb-8">
        <div className="mx-auto max-w-3xl px-4">
          <Toc items={steps.map((s) => ({ id: s.id, label: s.title }))} />
        </div>
      </section>

      {/* Steps */}
      <article className="bg-[#0f172a] py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 space-y-12">
          {steps.map((step, i) => (
            <section key={step.id} id={step.id} className="scroll-mt-24">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                Шаг {i + 1}
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">{step.title.replace(`Шаг ${i + 1}. `, "")}</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-300">
                {step.body.map((p, j) => <p key={j}>{p}</p>)}
              </div>
            </section>
          ))}
        </div>
      </article>

      {/* Compare с/без AI */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 sm:p-8">
            <div className="text-sm font-semibold text-indigo-300">Короткий путь</div>
            <p className="mt-2 text-base leading-relaxed text-slate-300">
              Если все 7 шагов выше — это 3-4 часа в Google Docs, то AI-интервью проходит по тем же шагам, но в формате диалога: задаёт уточняющие вопросы, вытаскивает достижения, переформулирует слабые места. 15-20 минут вместо часов.
            </p>
            <Link
              href="/auth?utm_source=seo_kak_sostavit&utm_medium=short_path"
              className="mt-4 inline-flex items-center text-sm font-semibold text-white underline decoration-indigo-400 underline-offset-4 hover:text-indigo-200"
            >
              Попробовать AI бесплатно — создание и просмотр без оплаты →
            </Link>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про составление резюме</h2>
          </div>
          <div className="space-y-3">
            {kakSostavitRezumeFaq.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-white/10 bg-white/[0.03] open:border-indigo-500/30 open:bg-indigo-500/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-indigo-400" />
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-300">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedTiles currentSlug="/kak-sostavit-rezume" preferGroup="guide" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
