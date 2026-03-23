"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const rows = [
  {
    label: "Знает формулы достижений",
    chatgpt: { text: "Генерирует шаблонные фразы", status: "bad" as const },
    consultant: { text: "Да", status: "good" as const },
    resumeai: { text: "Встроены в алгоритм", status: "good" as const },
  },
  {
    label: "Анализирует вакансию",
    chatgpt: { text: "Только если попросить", status: "bad" as const },
    consultant: { text: "Да", status: "good" as const },
    resumeai: { text: "Автоматически", status: "good" as const },
  },
  {
    label: "Адаптация под каждый отклик",
    chatgpt: { text: "Каждый раз заново промпт", status: "warn" as const },
    consultant: { text: "1 резюме = 1 консультация", status: "bad" as const },
    resumeai: { text: "30 секунд на вакансию", status: "good" as const },
  },
  {
    label: "Сопроводительное письмо",
    chatgpt: { text: "Отдельный запрос", status: "warn" as const },
    consultant: { text: "Да, за доп. плату", status: "good" as const },
    resumeai: { text: "Генерируется автоматически", status: "good" as const },
  },
  {
    label: "Стоимость",
    chatgpt: { text: "Бесплатно", status: "good" as const },
    consultant: { text: "5 000–30 000₽", status: "bad" as const },
    resumeai: { text: "от 499₽ за 3 адаптации", status: "good" as const },
  },
  {
    label: "Антигаллюцинации",
    chatgpt: { text: "Может выдумать опыт", status: "bad" as const },
    consultant: { text: "Живой человек", status: "good" as const },
    resumeai: { text: "Встроенная защита", status: "good" as const },
  },
];

const statusIcon = { good: "✅", warn: "⚠️", bad: "❌" };

export function ComparisonSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        "bg-[#1e293b] py-20 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
          Почему ChatGPT не заменит карьерного консультанта
        </h2>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-4 pr-4 text-slate-400"></th>
                <th className="pb-4 pr-4 text-slate-400">ChatGPT</th>
                <th className="pb-4 pr-4 text-slate-400">Консультант</th>
                <th className="pb-4 pr-4 font-semibold text-blue-400">ResumeAI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-700/50">
                  <td className="py-4 pr-4 font-medium text-white">{row.label}</td>
                  <td className="py-4 pr-4 text-slate-400">
                    {statusIcon[row.chatgpt.status]} {row.chatgpt.text}
                  </td>
                  <td className="py-4 pr-4 text-slate-400">
                    {statusIcon[row.consultant.status]} {row.consultant.text}
                  </td>
                  <td className="py-4 pr-4 text-slate-300">
                    {statusIcon[row.resumeai.status]} {row.resumeai.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-10 text-center text-lg font-medium text-slate-300">
          Экспертиза карьерного консультанта. Скорость AI. Цена —{" "}
          <span className="text-blue-400">166₽ за адаптацию.</span>
        </p>
      </div>
    </section>
  );
}
