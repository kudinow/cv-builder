"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Чем это лучше, чем самому написать в ChatGPT?",
    a: "ChatGPT — универсальный инструмент, который не знает правил рынка труда. ResumeAI использует формулы достижений из практики карьерных консультантов, автоматически анализирует требования вакансии и защищён от галлюцинаций — AI не придумает опыт, которого у вас нет.",
  },
  {
    q: "AI не выдумает то, чего я не делал?",
    a: "Нет. В алгоритм встроена защита от галлюцинаций — AI переформулирует и усиливает ваш реальный опыт, но никогда не добавляет вымышленные факты, навыки или достижения.",
  },
  {
    q: "Одной бесплатной адаптации хватит, чтобы оценить?",
    a: "Да. Загрузите резюме, укажите вакансию — получите полный результат: адаптированное резюме, сопроводительное письмо и детальный разбор изменений. Без привязки карты.",
  },
  {
    q: "Что значит «формулы достижений»?",
    a: "Это проверенные структуры из практики карьерных консультантов: «действие + результат + метрика». Вместо «занимался продажами» → «увеличил выручку на 40% за 6 месяцев». Именно так HR-специалисты ожидают видеть ваш опыт.",
  },
  {
    q: "Подходит ли для моей профессии?",
    a: "ResumeAI работает для любых специалистов: менеджеры, маркетологи, IT, финансы, HR, инженеры. Алгоритм анализирует конкретную вакансию и адаптирует резюме под её требования.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        "bg-[#0f172a] py-20 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-extrabold text-white sm:text-4xl">
          Частые вопросы
        </h2>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-800 bg-[#1e293b]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="pr-4 font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
