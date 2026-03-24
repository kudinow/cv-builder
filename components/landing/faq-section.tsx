"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Что такое токены?",
    a: "Токены — внутренняя валюта ResumeAI. При регистрации вы получаете 50 бесплатных токенов. Каждая операция списывает определённое количество: создание резюме с нуля — 100 токенов, адаптация под вакансию — 40 токенов. Токены не сгорают.",
  },
  {
    q: "Как проходит AI-интервью?",
    a: "После начала сессии AI задаёт вопросы в формате диалога — от базовой информации до глубоких вопросов про достижения. Интервью состоит из 5 фаз и занимает 15–20 минут. Сессию можно сохранить и продолжить позже — она хранится 72 часа.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да. Все данные хранятся в зашифрованной базе данных (Supabase). Мы не передаём персональные данные третьим лицам и не используем их для обучения моделей. Вы можете удалить свои резюме в любой момент.",
  },
  {
    q: "Могу ли я редактировать готовое резюме?",
    a: "Да. После генерации резюме вы можете вносить правки в тексты прямо в интерфейсе. PDF генерируется с учётом ваших правок.",
  },
  {
    q: "Что если меня не устроит результат?",
    a: "Вы можете продолжить интервью, добавить больше информации или попросить AI переработать конкретные блоки. Если резюме создано с нуля, адаптацию можно сделать за 40 токенов — это быстрее, чем начинать заново.",
  },
  {
    q: "Работает ли ResumeAI для любой профессии?",
    a: "Да. Алгоритм адаптируется под любую сферу: IT, маркетинг, финансы, продажи, HR, инженерия, менеджмент. Вопросы интервью формулируются под конкретную целевую позицию.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-16 bg-[#0f172a] py-24">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            FAQ
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Частые вопросы
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "overflow-hidden rounded-2xl border transition-all",
                openIndex === i
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-white/10 bg-white/5"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="pr-4 font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                    openIndex === i && "rotate-180 text-indigo-400"
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-400">
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
