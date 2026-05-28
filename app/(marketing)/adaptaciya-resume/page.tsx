import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronDown, ArrowRight } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import { adaptaciyaResumeFaq } from "@/lib/seo/faq";

const PAGE_URL = "https://cv-builder.ru/adaptaciya-resume";

export const metadata: Metadata = {
  title: "Адаптация резюме под вакансию с AI — за 1 минуту, 50 токенов",
  description:
    "Зачем адаптировать резюме под каждый отклик, что меняется при адаптации, и как AI делает это автоматически за минуту. Конверсия в ответ вырастает с 3% до 15-25%.",
  alternates: { canonical: "/adaptaciya-resume" },
  openGraph: {
    title: "Адаптация резюме под вакансию — AI за минуту",
    description: "AI читает вакансию и переставляет акценты в вашем резюме под конкретные требования.",
    type: "website",
    url: PAGE_URL,
  },
};

const steps = [
  { from: "Стандартное резюме без адаптации", to: "Адаптированное под вакансию", what: "Что меняется" },
  { from: "Заголовок: «Маркетолог»", to: "«Performance-маркетолог B2B SaaS»", what: "Точное совпадение с названием вакансии" },
  { from: "Summary: общая для всех ролей", to: "Summary с акцентом на 2-3 ключевых требования вакансии", what: "Релевантность под конкретный отклик" },
  { from: "Опыт: достижения в исходном порядке", to: "Релевантные достижения вынесены наверх", what: "HR видит важное в первые 7 секунд" },
  { from: "Навыки: общий список из 15", to: "Топ-7 навыков, совпадающих с требованиями вакансии", what: "ATS-системы фильтруют по точному совпадению" },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: adaptaciyaResumeFaq.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Адаптация резюме под вакансию", item: PAGE_URL },
  ],
};

export default function AdaptaciyaPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-faq-adapt" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="ld-breadcrumb-adapt" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <LandingNav />

      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-emerald-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Адаптация резюме" }]} />
          </div>
          <div className="mb-5 inline-flex rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm text-emerald-300">
            50 токенов · 1 минута · конверсия в ответ ×5
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Адаптация резюме под вакансию —{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              AI за минуту
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Один универсальный отклик на 50 вакансий приносит ответ в 3-5% случаев. Адаптированные — в 15-25%. AI делает адаптацию за минуту по тексту вакансии.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth?utm_source=seo_adapt&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-500/30 transition-all hover:from-emerald-600 hover:to-teal-600 hover:-translate-y-0.5"
            >
              Адаптировать резюме →
            </Link>
            <a href="#changes" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Что именно меняется
            </a>
          </div>
        </div>
      </section>

      {/* Stat block */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <div className="text-3xl font-bold text-emerald-300 sm:text-4xl">3-5%</div>
                <div className="mt-2 text-sm text-slate-400">конверсия в ответ при универсальном отклике</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-300 sm:text-4xl">15-25%</div>
                <div className="mt-2 text-sm text-slate-400">при адаптированном под вакансию</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white sm:text-4xl">×5</div>
                <div className="mt-2 text-sm text-slate-400">рост конверсии в ответ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What changes */}
      <section id="changes" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Что AI меняет в резюме при адаптации</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-400">
              Без переписывания с нуля. AI читает вакансию и точечно правит 4-5 мест в резюме.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <div className="col-span-4">Было</div>
              <div className="col-span-4">Стало</div>
              <div className="col-span-4">Зачем</div>
            </div>
            {steps.map((step, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-white/5 px-6 py-5 last:border-0">
                <div className="col-span-4 text-sm text-slate-400 line-through decoration-rose-400/30">{step.from}</div>
                <div className="col-span-4 flex items-start gap-2 text-sm text-white">
                  <ArrowRight className="hidden md:block mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{step.to}</span>
                </div>
                <div className="col-span-4 text-sm text-slate-500">{step.what}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про адаптацию</h2>
          </div>
          <div className="space-y-3">
            {adaptaciyaResumeFaq.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-white/10 bg-white/[0.03] open:border-emerald-500/30 open:bg-emerald-500/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-emerald-400" />
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-300">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedTiles currentSlug="/adaptaciya-resume" preferGroup="tool" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
