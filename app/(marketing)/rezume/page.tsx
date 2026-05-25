import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { LandingNav } from "@/components/landing/landing-nav";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { professions } from "@/lib/seo/professions";

const PAGE_URL = "https://cv-builder.ru/rezume";

export const metadata: Metadata = {
  title: "Резюме по профессиям — образцы и AI-генератор для каждой роли",
  description:
    "Образцы резюме под разные профессии: бухгалтер, менеджер по продажам, дизайнер, разработчик, HR. Что писать в опыте, какие навыки выносить, типичные ошибки.",
  alternates: { canonical: "/rezume" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Главная", item: "https://cv-builder.ru/" },
    { "@type": "ListItem", position: 2, name: "По профессиям", item: PAGE_URL },
  ],
};

export default function RezumeIndexPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script
        id="ld-breadcrumb-rezume-index"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <LandingNav />

      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "По профессиям" }]} />
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Резюме по профессиям —{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              образцы и AI-генератор
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Образцы резюме под конкретные роли с разбором того, что HR смотрит в первую очередь, какие навыки выносить и как формулировать достижения.
          </p>
        </div>
      </section>

      <section className="bg-[#0f172a] py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professions.map((p) => (
              <Link
                key={p.slug}
                href={`/rezume/${p.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
              >
                <div className="text-xl font-semibold text-white">Резюме {p.genitive}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.heroHook.slice(0, 120)}…</p>
                <div className="mt-4 text-xs font-medium text-indigo-300">
                  Образец + AI-генератор →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
