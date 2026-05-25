import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronDown } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { PainPoints } from "@/components/marketing/pain-points";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { obrazecRezumeFaq } from "@/lib/seo/faq";

const PAGE_URL = "https://cv-builder.ru/obrazec-rezume";

export const metadata: Metadata = {
  title: "Образец резюме 2026 — 8 примеров под разные профессии + AI-генератор",
  description:
    "Готовые образцы резюме под профессии: разработчик, бухгалтер, дизайнер, маркетолог. Структура и формулы достижений + AI-генератор за 15 минут. 50 токенов бесплатно.",
  alternates: { canonical: "/obrazec-rezume" },
  openGraph: {
    title: "Образец резюме 2026 — 8 примеров + AI-генератор",
    description:
      "Готовые образцы резюме под разные профессии и AI, который соберёт ваше за 15 минут по методике карьерных консультантов.",
    type: "website",
    url: PAGE_URL,
  },
};

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: obrazecRezumeFaq.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Образец резюме", item: PAGE_URL },
  ],
};

export default function ObrazecRezumePage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script
        id="ld-faq-obrazec"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <Script
        id="ld-breadcrumb-obrazec"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-[360px] w-[360px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Главная", href: "/" },
                { label: "Образец резюме" },
              ]}
            />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Обновлено в 2026
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Образец резюме —{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              8 готовых примеров
            </span>{" "}
            и AI, который соберёт ваше за&nbsp;15&nbsp;минут
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Готовые образцы под разные профессии — структура, разделы, формулы достижений. Посмотрите как должно выглядеть — или сразу сгенерируйте уникальное резюме с AI по методике карьерных консультантов.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/register?utm_source=seo_obrazec&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-600 hover:to-purple-600 hover:-translate-y-0.5"
            >
              Создать своё резюме — 50 токенов бесплатно →
            </Link>
            <a
              href="#gallery"
              className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              <ChevronDown className="h-4 w-4" />
              Сначала посмотреть образцы
            </a>
          </div>

          <div className="mt-6 text-xs text-slate-600">
            Без карты. Никакого автосписания. 50 токенов хватит на адаптацию под первую вакансию.
          </div>
        </div>
      </section>

      <PainPoints />

      <div id="gallery">
        <TemplateGallery />
      </div>

      {/* Unique content: правила продающего резюме */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
              Чек-лист продающего резюме
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Что отличает хороший образец от плохого
            </h2>
          </div>

          <div className="space-y-8 text-base leading-relaxed text-slate-300">
            <p>
              Главная ошибка — относиться к образцу как к шаблону, который достаточно заполнить. Шаблон даёт визуальную рамку: где имя, где опыт, где навыки. Контент в эту рамку нужно сгенерировать самому, и именно от него зависит, придёт ли отклик. Ниже пять правил, по которым работают резюме карьерных консультантов.
            </p>

            <div>
              <h3 className="text-xl font-bold text-white">1. Заголовок — это название вакансии, на которую вы откликаетесь</h3>
              <p className="mt-3">
                Не «менеджер», а «менеджер по работе с ключевыми клиентами в B2B SaaS». HR ATS-системы фильтруют резюме по точному совпадению с вакансией — поэтому формулировка должна совпадать с тем, как роль называет работодатель, а не как её называете вы.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">2. Достижения — с цифрами, без воды</h3>
              <p className="mt-3">
                Сравните: «Улучшил процессы продаж» против «Сократил цикл сделки с 45 до 28 дней, выручка отдела +18% за полгода». Первое — самопохвала, второе — факт. Если цифр нет, переформулируйте через «до/после»: «Внедрил CRM-процесс, который раньше был на бумаге — теперь отчётность по сделкам собирается за час вместо двух дней».
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">3. Раздел «о себе» — позиционирование, а не качества</h3>
              <p className="mt-3">
                «Ответственный, коммуникабельный, стрессоустойчивый» — слова, которые есть у всех и не доказывают ничего. Замените на короткое профессиональное позиционирование: роль + сфера + сильная сторона + якорное достижение. Это та же формула, которую LinkedIn-консультанты ставят в headline и summary — она перекочевала и в русские резюме.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">4. Одна страница до 5 лет опыта, две — если больше</h3>
              <p className="mt-3">
                Длинное резюме не значит сильное. HR в первом проходе тратит около 10 секунд на резюме — на двух страницах он успевает дочитать только до середины первой. Поэтому всё ключевое (заголовок, последняя позиция, ключевое достижение) должно быть выше первого сгиба — первой трети первой страницы.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">5. Адаптация под каждую вакансию — не «один документ на всех»</h3>
              <p className="mt-3">
                Не нужно переписывать резюме с нуля для каждой вакансии. Достаточно переставлять порядок навыков и переформулировать пару достижений под акцент конкретной роли. Те, кто откликается одним резюме на 50 вакансий, получают отклик в 3-5% случаев. Те, кто адаптируют — в 15-25%.
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
              <div className="text-sm font-semibold text-indigo-300">Короткий путь</div>
              <p className="mt-2 text-base text-slate-300">
                Перечитайте пять правил выше — потом откройте AI-интервью. AI задаст вопросы под каждое правило: вытащит цифры, переформулирует достижения и соберёт резюме за 15 минут вместо часов в Google Docs.
              </p>
              <Link
                href="/register?utm_source=seo_obrazec&utm_medium=rules_block"
                className="mt-4 inline-flex items-center text-sm font-semibold text-white underline decoration-indigo-400 underline-offset-4 transition-colors hover:text-indigo-200"
              >
                Начать интервью бесплатно →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
              FAQ
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Частые вопросы об образцах резюме
            </h2>
          </div>

          <div className="space-y-3">
            {obrazecRezumeFaq.map((faq, i) => (
              <details
                key={i}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors open:border-indigo-500/30 open:bg-indigo-500/5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-base font-medium text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-indigo-400" />
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
