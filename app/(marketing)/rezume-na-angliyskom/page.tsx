import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronDown } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import { rezumeNaAngliyskomFaq } from "@/lib/seo/faq";

const PAGE_URL = "https://cv-builder.ru/rezume-na-angliyskom";

export const metadata: Metadata = {
  title: "Резюме на английском — CV vs Resume + AI-генератор для зарубежных вакансий",
  description:
    "Как составить резюме на английском: разница между CV и Resume, обязательные разделы, длина, типичные русские ошибки. + AI переведёт и адаптирует ваше резюме под международный формат.",
  alternates: { canonical: "/rezume-na-angliyskom" },
  openGraph: {
    title: "Резюме на английском — CV vs Resume + AI-адаптация",
    description: "Структура, разделы, типичные ошибки и AI, который соберёт ваше резюме под международные стандарты.",
    type: "website",
    url: PAGE_URL,
  },
};

const russianMistakes = [
  {
    bad: "Hard-working, responsible, communicable",
    good: "Product manager with 6 years in B2B SaaS — led team that grew MQL by 240% in 8 months",
    comment: "Конкретное позиционирование вместо набора шаблонных качеств",
  },
  {
    bad: "Photo на видном месте, дата рождения, семейное положение",
    good: "Без фото, без даты, без семейного положения — в US/UK это считается непрофессиональным",
    comment: "В России это норма, в международном формате — красный флаг для рекрутера",
  },
  {
    bad: "I have been working at... since 2019 till present",
    good: "Senior Product Manager, [Company] · 2019–Present",
    comment: "Заголовки позиций — структурированные, без «I» и без «I have been»",
  },
  {
    bad: "Was responsible for managing team and improving processes",
    good: "Led cross-functional team of 8 (3 PMs, 5 engineers) — reduced release cycle from 2 weeks to 3 days",
    comment: "Активные глаголы (led, drove, launched, scaled) — не passive «was responsible»",
  },
  {
    bad: "Excellent communication and presentation skills",
    good: "Presented quarterly product strategy to 200+ stakeholders across 3 BUs",
    comment: "Не self-evaluation, а конкретное доказательство через проект",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: rezumeNaAngliyskomFaq.map((f) => ({
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
    { "@type": "ListItem", position: 2, name: "Резюме на английском", item: PAGE_URL },
  ],
};

export default function RezumeAngPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-faq-eng" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Script id="ld-breadcrumb-eng" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <LandingNav />

      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full bg-sky-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Резюме на английском" }]} />
          </div>
          <div className="mb-5 inline-flex rounded-full bg-sky-500/10 border border-sky-500/20 px-4 py-1.5 text-sm text-sky-300">
            Для зарубежных вакансий и международных компаний
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Резюме на английском —{" "}
            <span className="bg-gradient-to-r from-sky-300 to-blue-300 bg-clip-text text-transparent">
              CV vs Resume + AI-адаптация
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Что отличает международный формат от русского, какие фразы используют топовые рекрутеры в US/UK и как AI переведёт ваше резюме под международные стандарты за 15 минут.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth?utm_source=seo_eng&utm_medium=hero_cta"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-sky-500/30 transition-all hover:from-sky-600 hover:to-blue-600 hover:-translate-y-0.5"
            >
              Создать резюме на английском с AI →
            </Link>
            <a href="#mistakes" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Типичные ошибки русских кандидатов
            </a>
          </div>
        </div>
      </section>

      {/* CV vs Resume */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">CV или Resume — что у вас просят?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-400">
              В США и Канаде — Resume. В UK, Австралии и Европе — CV (но обычно по формату ближе к Resume). Главное — понять, какой документ ожидают.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xl font-bold text-white">Resume</div>
              <div className="mt-1 text-sm text-slate-500">США, Канада · 1-2 страницы</div>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li>· Деловой документ под коммерческую роль</li>
                <li>· Сжатый формат: только то, что релевантно вакансии</li>
                <li>· Без фото, даты рождения, семейного положения</li>
                <li>· Active voice, конкретные цифры и результаты</li>
                <li>· ATS-friendly: текстовый PDF, стандартные заголовки</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-xl font-bold text-white">CV</div>
              <div className="mt-1 text-sm text-slate-500">UK, EU, академия · 1-5+ страниц</div>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li>· В UK и EU — обычно по формату как Resume (1-2 стр)</li>
                <li>· В академии — длинный документ с публикациями и грантами</li>
                <li>· Разделы Publications, Conferences, Awards могут быть отдельными</li>
                <li>· Так же без фото и personal details для коммерческих ролей</li>
                <li>· В job-описании часто пишут «CV», но имеют в виду Resume</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Структура международного резюме</h2>
            <p className="mt-3 text-base text-slate-400">Стандарт, который ожидают US/UK рекрутеры. Отклонения от структуры — сигнал «непрофессиональный кандидат».</p>
          </div>
          <ol className="space-y-3">
            {[
              { title: "Header", body: "Full name, professional email (не «cool_dude_2008@»), phone with country code, LinkedIn URL, location (city, country — без полного адреса). Опционально: portfolio link для дизайнеров и разработчиков." },
              { title: "Professional Summary", body: "3-5 строк, под целевую роль. Формула: роль + сфера + ключевая сильная сторона + якорное достижение. Не «hard-working professional» — конкретно." },
              { title: "Work Experience (обратная хронология)", body: "Последние 10 лет, не больше. Каждая роль: позиция, компания, период, 3-5 буллетов достижений с active verbs и цифрами." },
              { title: "Education", body: "Университет, степень, специальность, годы. Опционально GPA если высокий. Российский ВУЗ можно перевести: «Moscow State University» вместо «МГУ»." },
              { title: "Skills", body: "Technical skills (с группировкой: languages, frameworks, tools) + Languages (с уровнем: native, fluent, intermediate, basic). Без soft skills типа «communication» — они доказываются через опыт." },
              { title: "Optional sections", body: "Certifications, Publications, Awards, Volunteer work — только если реально релевантно. Hobbies и Photo — НЕ нужны." },
            ].map((s, i) => (
              <li key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="text-base font-semibold text-white">{i + 1}. {s.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Russian mistakes */}
      <section id="mistakes" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Типичные ошибки русских кандидатов</h2>
            <p className="mt-3 text-base text-slate-400">
              Что русские резюме на английском чаще всего делают не так. Слева — то, что у нас норма, справа — то, что ждут в US/UK.
            </p>
          </div>
          <div className="space-y-3">
            {russianMistakes.map((m, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="text-sm leading-relaxed text-rose-300/80 line-through decoration-rose-400/30">{m.bad}</div>
                  <div className="text-sm leading-relaxed text-emerald-200">{m.good}</div>
                </div>
                <div className="mt-3 text-xs text-slate-500">{m.comment}</div>
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
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про резюме на английском</h2>
          </div>
          <div className="space-y-3">
            {rezumeNaAngliyskomFaq.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-white/10 bg-white/[0.03] open:border-sky-500/30 open:bg-sky-500/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium text-white">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-sky-400" />
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-300">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <RelatedTiles currentSlug="/rezume-na-angliyskom" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
