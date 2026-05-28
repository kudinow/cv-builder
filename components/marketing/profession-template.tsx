import Link from "next/link";
import { ChevronDown, Check, X, AlertTriangle } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import type { Profession } from "@/lib/seo/professions";
import { professions } from "@/lib/seo/professions";

type Props = { profession: Profession };

export function ProfessionPageTemplate({ profession: p }: Props) {
  const relatedProfessions = professions.filter((pp) => p.related.includes(pp.slug));

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f172a] pt-16 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Главная", href: "/" },
                { label: "По профессиям", href: "/rezume" },
                { label: `Резюме ${p.genitive}` },
              ]}
            />
          </div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Образец и AI-генератор · обновлено 2026
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            Резюме {p.genitive} —{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              образец и AI-генератор за 15 минут
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">{p.heroHook}</p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href={`/auth?utm_source=seo_profession&utm_medium=hero_cta&utm_content=${p.slug}`}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-600 hover:to-purple-600 hover:-translate-y-0.5"
            >
              Создать своё резюме {p.genitive} →
            </Link>
            <a href="#content" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
              <ChevronDown className="h-4 w-4" /> Сначала прочитать гайд
            </a>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section id="content" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Типичные проблемы в резюме {p.genitive}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {p.painPoints.map((pp, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="text-lg font-semibold text-white">{pp.title}</div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{pp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Какие навыки и в каком порядке писать</h2>
            <p className="mt-3 text-base text-slate-400">Hard skills — в порядке приоритета для рекрутера. Soft — только с подтверждением через опыт.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 text-sm font-semibold uppercase tracking-wide text-indigo-300">Hard skills</div>
              <ol className="space-y-2.5 text-sm text-slate-300">
                {p.hardSkills.map((skill, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="shrink-0 font-mono text-xs text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                    <span>{skill}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 text-sm font-semibold uppercase tracking-wide text-purple-300">Soft skills</div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {p.softSkills.map((skill, i) => (
                  <li key={i} className="flex items-baseline gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements: weak vs strong */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Как формулировать достижения</h2>
            <p className="mt-3 text-base text-slate-400">Слева — типовая формулировка из резюме большинства. Справа — то же самое, но с конкретикой и цифрами.</p>
          </div>
          <div className="space-y-3">
            {p.achievements.map((a, i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-rose-400/70" />
                  <div className="text-sm leading-relaxed text-slate-500 line-through decoration-rose-400/30">
                    {a.weak}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <div className="text-sm leading-relaxed text-slate-200">{a.strong}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mistakes */}
      <section className="bg-[#0f172a] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Типичные ошибки</h2>
            <p className="mt-3 text-base text-slate-400">Чего избегать в резюме {p.genitive} — список того, что HR замечает в первые 10 секунд.</p>
          </div>
          <ul className="space-y-3">
            {p.mistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/80" />
                <span className="text-sm leading-relaxed text-slate-300">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Unique content (SEO body) */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Что HR смотрит в резюме {p.genitive}</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-slate-300">
            {p.uniqueContent.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
            <div className="text-sm font-semibold text-indigo-300">Короткий путь</div>
            <p className="mt-2 text-base text-slate-300">
              AI задаёт целевые вопросы под профессию {p.genitive} — те, что вы знаете, но забываете включить в резюме. Результат — конкретное и продающее резюме за 15 минут.
            </p>
            <Link
              href={`/auth?utm_source=seo_profession&utm_medium=short_path&utm_content=${p.slug}`}
              className="mt-4 inline-flex items-center text-sm font-semibold text-white underline decoration-indigo-400 underline-offset-4 hover:text-indigo-200"
            >
              Попробовать AI бесплатно — 50 токенов при регистрации →
            </Link>
          </div>
        </div>
      </section>

      <HowItWorksSection />

      {/* FAQ */}
      <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Частые вопросы про резюме {p.genitive}</h2>
          </div>
          <div className="space-y-3">
            {p.faq.map((faq, i) => (
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

      {/* Related professions */}
      {relatedProfessions.length > 0 && (
        <section className="bg-[#0f172a] py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">Резюме для других профессий</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProfessions.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/rezume/${rp.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
                >
                  <div className="text-base font-semibold text-white">Резюме {rp.genitive}</div>
                  <div className="mt-1.5 text-xs text-slate-500">Образец + AI-генератор</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
