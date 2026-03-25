import { X, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const consultantItems = [
  "5 000 — 15 000₽ за одно резюме",
  "Ждать 3–7 рабочих дней",
  "Нет доработок под каждую вакансию",
  "Нет сопроводительных писем в цену",
  "Один специалист — одна экспертиза",
];

const resumeAiItems = [
  "от 499₽ за пакет токенов",
  "Результат за 15–20 минут",
  "Адаптация под каждую вакансию за 40 токенов",
  "Сопроводительное письмо включено",
  "Методика на основе тысяч успешных резюме",
];

export function ComparisonSection() {
  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Ценность
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Карьерный консультант или ResumeAI?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Одинаковое качество. В 10–30 раз дешевле. В 10 раз быстрее.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Consultant */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-6">
              <div className="mb-1 text-sm text-slate-500">Карьерный консультант</div>
              <div className="text-4xl font-extrabold text-white">
                5 000–15 000₽
              </div>
              <div className="mt-1 text-sm text-slate-500">за одно резюме</div>
            </div>
            <ul className="space-y-3">
              {consultantItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* ResumeAI */}
          <div className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8">
            {/* Best value badge */}
            <div className="absolute -top-3 right-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
              Выгоднее в 10–30×
            </div>
            <div className="mb-6">
              <div className="mb-1 text-sm text-indigo-400">ResumeAI</div>
              <div className="text-4xl font-extrabold text-white">от 499₽</div>
              <div className="mt-1 text-sm text-slate-500">пакет токенов</div>
            </div>
            <ul className="space-y-3">
              {resumeAiItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(
                "mt-8 inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold text-white",
                "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25",
                "transition-all hover:from-indigo-600 hover:to-purple-600"
              )}
            >
              Попробовать бесплатно
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
