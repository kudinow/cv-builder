"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function PricingSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      id="pricing"
      ref={ref}
      className={cn(
        "scroll-mt-16 bg-[#1e293b] py-20 transition-all duration-700",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      )}
    >
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Простые и понятные цены
        </h2>
        <p className="mt-3 text-slate-400">
          Первая адаптация — бесплатно. Оцените качество, потом решите.
        </p>

        <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
          {/* Starter */}
          <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-6 text-center">
            <div className="text-sm text-slate-400">Пакет</div>
            <div className="mt-2 text-4xl font-extrabold text-white">499₽</div>
            <div className="mt-1 text-sm text-slate-500">
              3 адаптации · 166₽ за штуку
            </div>
            <ul className="mt-6 space-y-3 text-left text-sm text-slate-400">
              <li>✓ Адаптация под вакансию</li>
              <li>✓ Сопроводительное письмо</li>
              <li>✓ Разбор всех изменений</li>
              <li>✓ Скачивание PDF</li>
            </ul>
            <Link
              href="/adapt"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-6 w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              )}
            >
              Купить пакет
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-xl border-2 border-blue-500 bg-[#0f172a] p-6 text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
              Выгоднее
            </div>
            <div className="text-sm text-blue-400">Подписка</div>
            <div className="mt-2 text-4xl font-extrabold text-white">1 499₽</div>
            <div className="mt-1 text-sm text-slate-500">
              15 адаптаций/мес · 100₽ за штуку
            </div>
            <ul className="mt-6 space-y-3 text-left text-sm text-slate-400">
              <li>✓ Всё из Пакета</li>
              <li>✓ Создание резюме с нуля</li>
              <li>✓ AI-интервью</li>
              <li>✓ Приоритет обработки</li>
            </ul>
            <Link
              href="/adapt"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              Оформить подписку
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Нужно больше?{" "}
          <a href="#" className="text-blue-400 underline hover:text-blue-300">
            Безлимитный план — 2 999₽/мес
          </a>
        </p>
      </div>
    </section>
  );
}
