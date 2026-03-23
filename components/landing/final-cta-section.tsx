"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function FinalCtaSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        "bg-gradient-to-br from-blue-600/20 to-[#0f172a] py-20 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Ваше следующее собеседование начинается с резюме
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          Загрузите резюме и получите первую адаптацию бесплатно.
          Через 30 секунд вы увидите разницу.
        </p>
        <Link
          href="/adapt"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-8 bg-blue-600 px-10 text-lg font-semibold text-white hover:bg-blue-700"
          )}
        >
          Попробовать бесплатно →
        </Link>
        <p className="mt-4 text-sm text-slate-600">
          Без привязки карты · Результат за 30 секунд
        </p>
      </div>
    </section>
  );
}
