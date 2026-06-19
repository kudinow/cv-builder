import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Бесплатно",
    price: "0₽",
    subtitle: null,
    popular: false,
    features: [
      "AI-интервью полностью",
      "Готовое резюме на экране",
      "Просмотр результата",
    ],
    cta: "Начать бесплатно",
    href: "/auth",
  },
  {
    name: "Резюме",
    price: "390₽",
    subtitle: "разово",
    popular: false,
    features: [
      "Чистый PDF и DOCX",
      "Одного резюме — навсегда",
      "Без подписки",
    ],
    cta: "Создать резюме",
    href: "/auth",
  },
  {
    name: "Доступ на 30 дней",
    price: "890₽",
    subtitle: "разовый платёж",
    popular: true,
    features: [
      "Безлимит скачиваний",
      "Адаптации под вакансии",
      "Сопроводительные письма",
      "Все ваши резюме",
    ],
    cta: "Получить доступ",
    href: "/auth",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Тарифы
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Простые цены
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Без подписок. Платите за результат.
          </p>
        </div>

        {/* Free preview badge */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-5 py-2 text-sm font-medium text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            Создание и просмотр резюме — бесплатно. Оплата только за скачивание.
          </div>
        </div>

        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-8 transition-all",
                plan.popular
                  ? "border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 shadow-xl shadow-indigo-500/10"
                  : "border border-white/10 bg-white/5"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                  Популярный
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm text-slate-400">{plan.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                </div>
                {plan.subtitle && (
                  <div className="mt-1 text-sm text-slate-500">{plan.subtitle}</div>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all",
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-600"
                    : "border border-white/20 text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
