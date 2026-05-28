import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronDown } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { ExampleAccordion } from "@/components/marketing/example-accordion";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import { soprovoditelnoePismoFaq } from "@/lib/seo/faq";

const PAGE_URL = "https://cv-builder.ru/soprovoditelnoe-pismo";

export const metadata: Metadata = {
  title: "Сопроводительное письмо к резюме — примеры + AI-генератор за минуту",
  description:
    "Как написать сопроводительное письмо: формула, 4 примера под разные ситуации, типичные ошибки. + AI соберёт письмо под вакансию за 1 минуту. 50 токенов бесплатно.",
  alternates: { canonical: "/soprovoditelnoe-pismo" },
  openGraph: {
    title: "Сопроводительное письмо — примеры и AI-генератор",
    description: "Формула сильного сопроводительного письма + готовые примеры под разные ситуации + AI за минуту.",
    type: "website",
    url: PAGE_URL,
  },
};

const examples = [
  {
    title: "Пример 1. Отклик после понравившейся вакансии",
    context: "Базовый случай: опыт есть, релевантность очевидна",
    body: `Здравствуйте, [Имя HR]!

Прочитал вашу вакансию продуктового маркетолога — особенно зацепило, что вы строите воронку с нуля для нового B2B-направления. Я как раз так же стартовал в [компания]: за 8 месяцев поднял MQL на 240% и собрал growth-команду из 3 человек.

В вашем стеке я плотно работал с HubSpot и Amplitude, делал когортный анализ retention и запускал A/B-тесты на 10k+ MQL/мес. Готов закрыть в первые 90 дней: аудит текущей воронки, 2 эксперимента на onboarding, MQL→SQL квалификацию.

Если интересно — готов обсудить детали в Zoom на этой неделе.

С уважением,
[Имя]`,
  },
  {
    title: "Пример 2. Смена сферы",
    context: "Прямого опыта нет, делаем акцент на переносимые навыки",
    body: `Здравствуйте!

В вакансии аналитика данных вы пишете о работе с SQL, дашбордами и продуктовой аналитикой. У меня нет 3 лет именно в продуктовой аналитике, но 5 лет в B2B-консалтинге, где я строил отчётность на SQL и Power BI для финансовых директоров.

Конкретно: запустил систему ежедневной отчётности по 12 KPI для команды из 30 аналитиков, сократил время сборки отчётов с 4 часов до 20 минут. Понимаю что такое чистые данные, как искать аномалии и как разговаривать с бизнесом на языке метрик.

Хочу перейти в продукт, потому что [искренняя причина]. Готов к тестовому заданию и доказать на практике.

[Имя]`,
  },
  {
    title: "Пример 3. Новичок без опыта",
    context: "Первая работа, junior-позиция — фокус на проекты и обучаемость",
    body: `Здравствуйте!

Откликаюсь на вакансию junior frontend-разработчика. Я учусь в [вуз], 3 курс, последние 8 месяцев делаю учебные и pet-проекты на React + TypeScript: переписал заброшенный open-source плагин для VSCode (50+ звёзд за 2 месяца), собрал лендинг для университетского клуба, прошёл курс по системному дизайну.

Понимаю, что без коммерческого опыта вы выберете кандидата с опытом. Но я готов к тестовому, к работе бесплатно первые 2 недели в режиме «оценка fit» и закрытию любых задач, которые показывает junior.

Резюме приложил, GitHub: [ссылка]. Спасибо за внимание!

[Имя]`,
  },
  {
    title: "Пример 4. Повышение / переход в крупную компанию",
    context: "Senior-уровень, переход в FAANG-аналог",
    body: `Здравствуйте, [Имя]!

Видел вашу вакансию Senior Product Manager для платформы B2B-аналитики. Сейчас я владелец продукта в [компания] — отвечаю за core-функционал, которым пользуются 12,000+ B2B-клиентов в 8 странах. За 2 года под моим P&L выручка продукта выросла на 47%, NPS с 32 до 58.

Что готов принести: опыт миграции legacy-платформы на новый стек без downtime, выстраивание product discovery-процессов через customer development (200+ интервью за 18 месяцев), управление командой из 4 PM и 12 инженеров.

Хочу в [компания], потому что мне интересен масштаб и сложность платформы — на текущем месте я плотно работаю со средним enterprise, а у вас задача порядков больше. Готов к рабочему интервью с командой.

С уважением,
[Имя]`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: soprovoditelnoePismoFaq.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Сопроводительное письмо", item: PAGE_URL },
  ],
};

export default function SoprovoditelnoePismoPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-faq-sopr" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="ld-breadcrumb-sopr" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <LandingNav />

      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-purple-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Сопроводительное письмо" }]} />
          </div>
          <div className="mb-5 inline-flex rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-sm text-purple-300">
            100-200 слов · 4 готовых примера · AI-генератор за минуту
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Сопроводительное письмо к резюме —{" "}
            <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              примеры и AI-генератор
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Формула сильного сопроводительного письма, 4 готовых примера под разные ситуации и AI, который соберёт ваше письмо под конкретную вакансию за минуту.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth?utm_source=seo_sopr&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-purple-500/30 transition-all hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5"
            >
              Сгенерировать с AI →
            </Link>
            <a href="#examples" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Посмотреть примеры
            </a>
          </div>
        </div>
      </section>

      {/* Formula */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Формула: 4 абзаца, 100-200 слов</h2>
            <p className="mt-3 text-base text-slate-400">
              Большинство сильных сопроводительных писем построены по одной структуре. Длиннее 200 слов HR не дочитывают; короче 80 — выглядит как отписка.
            </p>
          </div>
          <ol className="space-y-5 text-base text-slate-300">
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-purple-300">1. Крючок (1-2 предложения)</div>
              <p className="mt-1.5">Конкретная деталь из вакансии или компании, которая вас зацепила. Не «вы — лидер рынка», а «прочитал, что вы запускаете направление X, как раз так же стартовал в Y».</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-purple-300">2. Почему вы (2-3 предложения)</div>
              <p className="mt-1.5">1-2 факта из опыта, релевантных вакансии, с цифрами. Не пересказывайте резюме — выберите самое важное.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-purple-300">3. Что готовы сделать (1-2 предложения)</div>
              <p className="mt-1.5">Конкретный план на первые 90 дней или ближайшее действие. Это сразу отличает вас от 90% откликов с общими формулировками.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-purple-300">4. Закрытие с CTA (1 предложение)</div>
              <p className="mt-1.5">Не «жду ответа», а «готов обсудить детали в Zoom на этой неделе» или «приложил резюме и портфолио, готов к тестовому».</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
              4 примера под разные ситуации
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Готовые сопроводительные письма</h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
              Образцы под распространённые сценарии. Не копировать целиком — адаптируйте под свой контекст. Или сгенерируйте с AI на основе своего резюме и конкретной вакансии.
            </p>
          </div>

          <ExampleAccordion examples={examples} />

          <div className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 text-center">
            <p className="text-base text-slate-300">
              Не уверены, какой формат подходит вашей ситуации?
            </p>
            <Link
              href="/auth?utm_source=seo_sopr&utm_medium=examples_cta"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:from-purple-600 hover:to-pink-600"
            >
              Сгенерировать на основе моей вакансии →
            </Link>
          </div>
        </div>
      </section>

      {/* Mistakes */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Что убивает шанс на ответ</h2>
            <p className="mt-3 text-base text-slate-400">Типичные ошибки в сопроводительных, из-за которых HR закрывает письмо после первой строки.</p>
          </div>
          <ul className="space-y-3 text-base text-slate-300">
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-semibold text-white">«Здравствуйте, меня зовут Иван, мне 27 лет...»</div>
              <p className="mt-1.5 text-sm text-slate-400">Имя есть в подписи и в резюме — повторять не нужно. Начинайте с того, что зацепило в вакансии.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-semibold text-white">«Вы — лидер на рынке, и я хотел бы работать у вас»</div>
              <p className="mt-1.5 text-sm text-slate-400">Сразу видно: вставлено в 20 разных писем. Замените на конкретику про конкретно эту компанию.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-semibold text-white">Пересказ резюме</div>
              <p className="mt-1.5 text-sm text-slate-400">Если письмо повторяет «о себе» и «опыт» — оно бесполезно. Письмо — это добавочная ценность, чего нет в резюме.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-semibold text-white">Длина 400+ слов</div>
              <p className="mt-1.5 text-sm text-slate-400">Письма длиннее 200 слов HR не дочитывают, особенно при потоке откликов. Сокращайте до сути.</p>
            </li>
          </ul>
        </div>
      </section>

      <HowItWorksSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про сопроводительные письма</h2>
          </div>
          <div className="space-y-3">
            {soprovoditelnoePismoFaq.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-white/10 bg-white/[0.03] open:border-purple-500/30 open:bg-purple-500/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-purple-400" />
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-300">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedTiles currentSlug="/soprovoditelnoe-pismo" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
