"use client";

import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

const metrics = [
  { value: "30 сек", label: "Среднее время адаптации" },
  { value: "3 формулы", label: "Из практики карьерных консультантов" },
  { value: "3 в 1", label: "Резюме + письмо + разбор в каждой адаптации" },
];

export function MetricsSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        "bg-[#0f172a] py-20 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Цифры, которые говорят за нас
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.value}>
              <div className="text-4xl font-extrabold text-blue-400 sm:text-5xl">
                {m.value}
              </div>
              <p className="mt-3 text-sm text-slate-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
