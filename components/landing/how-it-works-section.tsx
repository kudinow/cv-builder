"use client";

import Link from "next/link";
import { FileText, Zap, CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const steps = [
  {
    num: "01",
    icon: FileText,
    title: "Загрузите резюме и вакансию",
    desc: "Прикрепите PDF резюме и ссылку на вакансию с hh.ru или текст описания",
  },
  {
    num: "02",
    icon: Zap,
    title: "AI адаптирует за 30 секунд",
    desc: "Алгоритм анализирует требования вакансии, переформулирует опыт по формулам достижений и выделяет релевантные навыки",
  },
  {
    num: "03",
    icon: CheckCircle,
    title: "Скачайте и откликайтесь",
    desc: "Получите адаптированное резюме, сопроводительное письмо и список внесённых изменений",
  },
];

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={cn(
        "scroll-mt-16 bg-[#0f172a] py-20 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Продающее резюме за 3 шага
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-xl border border-slate-800 bg-[#1e293b] p-6 text-left"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm font-bold text-blue-500">{step.num}</span>
                <step.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/adapt"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-12 bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700"
          )}
        >
          Попробовать бесплатно →
        </Link>
      </div>
    </section>
  );
}
