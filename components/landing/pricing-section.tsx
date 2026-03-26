import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const packages = [
  {
    name: "Малый",
    tokens: 500,
    price: 499,
    pricePerToken: "~1₽",
    popular: false,
    features: [
      "5 адаптаций резюме",
      "или 1 создание с нуля + 1 адаптация",
      "Сопроводительные письма включены",
      "Скачивание PDF",
    ],
  },
  {
    name: "Средний",
    tokens: 1500,
    price: 1199,
    pricePerToken: "~0.8₽",
    popular: true,
    features: [
      "15 адаптаций резюме",
      "или 3 создания с нуля + 6 адаптаций",
      "Сопроводительные письма включены",
      "Скачивание PDF",
      "Улучшение существующих резюме",
    ],
  },
  {
    name: "Большой",
    tokens: 4000,
    price: 2499,
    pricePerToken: "~0.6₽",
    popular: false,
    features: [
      "40 адаптаций резюме",
      "или 10+ созданий с нуля",
      "Сопроводительные письма включены",
      "Скачивание PDF",
      "Улучшение существующих резюме",
      "Самый выгодный токен",
    ],
  },
];

const costTable = [
  { operation: "Создание резюме с нуля (интервью)", tokens: 100 },
  { operation: "Улучшение существующего резюме", tokens: 80 },
  { operation: "Адаптация под вакансию", tokens: 50 },
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
            Пакеты токенов
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Без подписок. Платите за результат.
          </p>
        </div>

        {/* Free tokens badge */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-5 py-2 text-sm font-medium text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            50 бесплатных токенов при регистрации — хватит на первую адаптацию
          </div>
        </div>

        {/* Packages */}
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={cn(
                "relative rounded-2xl p-8 transition-all",
                pkg.popular
                  ? "border-2 border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 shadow-xl shadow-indigo-500/10"
                  : "border border-white/10 bg-white/5"
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                  Популярный
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm text-slate-400">{pkg.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">{pkg.price}₽</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm">
                  <span className="font-semibold text-white">{pkg.tokens.toLocaleString()} токенов</span>
                  <span className="text-slate-500">{pkg.pricePerToken} за токен</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-400">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all",
                  pkg.popular
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-600"
                    : "border border-white/20 text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                Купить пакет
              </Link>
            </div>
          ))}
        </div>

        {/* Cost table */}
        <div className="mt-16">
          <h3 className="mb-6 text-center text-lg font-bold text-white">
            Стоимость операций
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-left font-semibold text-slate-300">
                    Операция
                  </th>
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-right font-semibold text-slate-300">
                    Токены
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {costTable.map((row, i) => (
                  <tr key={i} className="transition-colors hover:bg-white/5">
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-slate-400">{row.operation}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 text-right font-semibold text-white">
                      {row.tokens}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
