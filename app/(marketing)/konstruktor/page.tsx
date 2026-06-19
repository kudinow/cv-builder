import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronDown } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { ComparisonTriple } from "@/components/marketing/comparison-triple";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import { konstruktorFaq } from "@/lib/seo/faq";

const PAGE_URL = "https://cv-builder.ru/konstruktor";

export const metadata: Metadata = {
  title: "Конструктор резюме онлайн с AI — без шаблонной воды за 15 минут",
  description:
    "Конструктор резюме, в котором AI задаёт вопросы и собирает резюме автоматически. Не Word-шаблон, не hh-конструктор. Сравнение с другими сервисами, PDF и DOCX на выходе.",
  alternates: { canonical: "/konstruktor" },
  openGraph: {
    title: "Конструктор резюме онлайн с AI",
    description: "AI-конструктор резюме: интервью вместо формы, продающий контент вместо шаблона, PDF/DOCX на выходе.",
    type: "website",
    url: PAGE_URL,
  },
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CV Builder — AI Resume Constructor",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: PAGE_URL,
  description:
    "Онлайн-конструктор резюме с AI-интервью: вместо формы с полями вы отвечаете на вопросы AI, который собирает резюме за 15 минут.",
  inLanguage: "ru",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
    description: "Создание резюме и предпросмотр бесплатно. Скачивание от 390₽.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: konstruktorFaq.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Конструктор резюме", item: PAGE_URL },
  ],
};

export default function KonstruktorPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-software-konstruktor" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }} />
      <Script id="ld-faq-konstruktor" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="ld-breadcrumb-konstruktor" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <LandingNav />

      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Конструктор резюме" }]} />
          </div>
          <div className="mb-5 inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
            Не форма с полями, не Word-шаблон — AI-конструктор
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Конструктор резюме онлайн —{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              с AI вместо шаблона
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            В обычном конструкторе вы пишете контент сами в готовой форме. У нас AI задаёт вопросы и собирает резюме — вы получаете готовый PDF и DOCX за 15 минут.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth?utm_source=seo_konstruktor&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-600 hover:to-purple-600 hover:-translate-y-0.5"
            >
              Открыть конструктор — бесплатно →
            </Link>
            <a href="#compare" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Сравнение с другими конструкторами
            </a>
          </div>
        </div>
      </section>

      <div id="compare">
        <ComparisonTriple
          title="Конструктор резюме — какие бывают"
          subtitle="Чем AI-конструктор отличается от Word-шаблона и hh-формы"
          columns={[
            {
              label: "Word / Google Docs",
              sublabel: "Готовый шаблон, всё руками",
              tone: "neutral",
              pros: ["Бесплатно", "Полный контроль вёрстки"],
              cons: [
                "Контент пишете с нуля сами",
                "Шаблоны устарели на 5-10 лет",
                "PDF едет при разных версиях Office",
                "Нет автоадаптации под вакансию",
              ],
            },
            {
              label: "CV Builder (AI)",
              sublabel: "AI-интервью + структурированный конструктор",
              tone: "ours",
              pros: [
                "AI собирает контент за вас",
                "Стандартизированный ATS-friendly PDF",
                "Адаптация под вакансию за минуту",
                "Сопроводительные письма в комплекте",
                "DOCX, если нужен редактируемый файл",
                "Хранение всех версий в облаке",
              ],
              cons: [],
            },
            {
              label: "hh-конструктор / myresume",
              sublabel: "Форма с полями",
              tone: "consultant",
              pros: ["Простой интерфейс", "Бесплатно"],
              cons: [
                "Контент полностью на вас",
                "Конструктор привязан к одной площадке",
                "Нет помощи с формулировками",
                "Нет AI-адаптации",
              ],
            },
          ]}
        />
      </div>

      <HowItWorksSection />

      <PricingSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про конструктор резюме</h2>
          </div>
          <div className="space-y-3">
            {konstruktorFaq.map((faq, i) => (
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

      <RelatedTiles currentSlug="/konstruktor" preferGroup="tool" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
