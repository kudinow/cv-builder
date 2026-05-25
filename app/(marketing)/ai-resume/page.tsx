import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronDown, MessageSquare, Brain, FileText, Target, Sparkles } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { MethodologySection } from "@/components/landing/methodology-section";
import { QualitySection } from "@/components/landing/quality-section";
import { AiRecommenderSection } from "@/components/landing/ai-recommender-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { ComparisonTriple } from "@/components/marketing/comparison-triple";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import { aiResumeFaq } from "@/lib/seo/faq";

const PAGE_URL = "https://cv-builder.ru/ai-resume";

export const metadata: Metadata = {
  title: "Резюме с помощью ИИ — собирается за 15 минут под вашу вакансию",
  description:
    "AI задаёт вопросы как карьерный консультант, вытаскивает достижения и собирает резюме по проверенным формулам. Не шаблон с подстановкой — обученная модель. 50 токенов бесплатно.",
  alternates: { canonical: "/ai-resume" },
  openGraph: {
    title: "Резюме с помощью ИИ — 15 минут вместо часов в Google Docs",
    description:
      "AI берёт у вас интервью и собирает резюме по методике карьерных консультантов. Не ChatGPT с промптом — специализированная модель.",
    type: "website",
    url: PAGE_URL,
  },
};

const phases = [
  {
    icon: MessageSquare,
    title: "Фаза 1. Базовые данные",
    description: "AI спрашивает имя, контакты, целевую роль и тип позиции. 1-2 минуты.",
    sample: "«На какую роль откликаетесь? Junior / Middle / Senior?»",
  },
  {
    icon: Brain,
    title: "Фаза 2. Опыт по ролям",
    description: "По каждой позиции — компания, период, ключевая ответственность. Без сочинений.",
    sample: "«Какие 1-3 задачи занимали 80% вашего времени в этой роли?»",
  },
  {
    icon: Target,
    title: "Фаза 3. Достижения по формуле",
    description: "Главная фаза. AI задаёт уточняющие вопросы, чтобы вытащить цифры и контекст.",
    sample: "«Вы сказали «улучшил процессы». На сколько процентов или часов изменился результат?»",
  },
  {
    icon: FileText,
    title: "Фаза 4. Адаптация под вакансию",
    description: "Если есть текст вакансии — AI переставит акценты в опыте и навыках под требования.",
    sample: "«В вакансии важен опыт с B2B SaaS. У вас он есть в роли X — вынесу его выше.»",
  },
  {
    icon: Sparkles,
    title: "Фаза 5. Финальная сборка",
    description: "Резюме генерируется в PDF и DOCX. Вы можете править руками — изменения сохраняются.",
    sample: "«Готово. Открыть редактор / Скачать PDF.»",
  },
];

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CV Builder — AI Resume Builder",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: PAGE_URL,
  description:
    "AI-сервис создания резюме на русском языке: AI-интервью извлекает достижения, специализированная модель собирает резюме по методике карьерных консультантов.",
  inLanguage: "ru",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
    description: "50 токенов бесплатно при регистрации",
  },
  featureList: [
    "AI-интервью из 5 фаз",
    "Извлечение достижений по формуле",
    "Адаптация резюме под вакансию",
    "Генерация сопроводительных писем",
    "Экспорт в PDF и DOCX",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: aiResumeFaq.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Резюме с помощью ИИ", item: PAGE_URL },
  ],
};

export default function AiResumePage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-software-ai-resume" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <Script id="ld-faq-ai-resume" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="ld-breadcrumb-ai-resume" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <LandingNav />

      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/3 h-[460px] w-[460px] rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-[360px] w-[360px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Резюме с помощью ИИ" }]} />
          </div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-интервью · 5 фаз · ~15 минут
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Резюме с помощью ИИ —{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              15 минут вместо часов в Google Docs
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            AI задаёт вопросы как карьерный консультант, вытаскивает достижения и собирает резюме по методике, которая реально приносит офферы. Без шаблонной воды.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register?utm_source=seo_ai_resume&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-600 hover:to-purple-600 hover:-translate-y-0.5"
            >
              Попробовать AI бесплатно →
            </Link>
            <a href="#phases" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Как AI работает
            </a>
          </div>
          <div className="mt-6 text-xs text-slate-600">50 токенов хватит на первое резюме. Без привязки карты.</div>
        </div>
      </section>

      <ComparisonTriple
        title="AI vs шаблонный конструктор vs карьерный консультант"
        subtitle="Где AI выигрывает у одного и одинаков с другим"
        columns={[
          {
            label: "Шаблонный конструктор",
            sublabel: "hh, myresume, Word",
            tone: "neutral",
            pros: ["Бесплатно", "Готовые шаблоны"],
            cons: [
              "Контент вы пишете сами с нуля",
              "Шаблон выглядит как у тысяч других",
              "Нет адаптации под вакансию",
              "Нет помощи с достижениями",
            ],
          },
          {
            label: "CV Builder (AI)",
            sublabel: "AI-интервью + методика консультанта",
            tone: "ours",
            pros: [
              "AI задаёт правильные вопросы",
              "Достижения вытаскиваются по формуле",
              "Адаптация под вакансию за 1 минуту",
              "15-20 минут вместо часов",
              "Сопроводительные письма в комплекте",
              "Бесплатно при регистрации",
            ],
            cons: [],
          },
          {
            label: "Карьерный консультант",
            sublabel: "Личная консультация",
            tone: "consultant",
            pros: [
              "Глубокая методика",
              "Индивидуальный подход",
            ],
            cons: [
              "5,000–15,000₽ за резюме",
              "Ждать 3-7 рабочих дней",
              "Нет автоадаптации",
              "Сопроводительные оплачиваются отдельно",
            ],
          },
        ]}
      />

      {/* Phases */}
      <section id="phases" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
              5 фаз AI-интервью
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Как AI собирает ваше резюме</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              Не «введите данные в форму» — диалог, в котором AI задаёт вопросы и углубляется, когда вы говорите общими словами.
            </p>
          </div>

          <div className="space-y-4">
            {phases.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-white">{phase.title}</div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{phase.description}</p>
                      <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-[#0a0f1f] px-3 py-2 text-xs italic text-slate-400 ring-1 ring-inset ring-white/5">
                        <span className="text-indigo-400">AI:</span>
                        <span>{phase.sample}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <MethodologySection />
      <QualitySection />
      <AiRecommenderSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про AI-резюме</h2>
          </div>
          <div className="space-y-3">
            {aiResumeFaq.map((faq, i) => (
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

      <RelatedTiles currentSlug="/ai-resume" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
