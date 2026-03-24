import Link from "next/link";
import { cn } from "@/lib/utils";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] to-[#172554] py-32">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        {/* Free tokens badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-5 py-2 text-sm font-medium text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          50 бесплатных токенов при регистрации
        </div>

        {/* Headline */}
        <h2 className="text-5xl font-extrabold text-white sm:text-6xl">
          Начните бесплатно
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
          Создайте первое резюме прямо сейчас. 50 токенов хватит на адаптацию
          под первую вакансию — без привязки карты.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-10 py-4 text-base font-semibold text-white",
              "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30",
              "transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-2xl hover:shadow-indigo-500/40",
              "hover:-translate-y-0.5"
            )}
          >
            Зарегистрироваться бесплатно →
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-base text-slate-300 transition-all hover:bg-white/5 hover:text-white"
          >
            Уже есть аккаунт? Войти
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-slate-600">
          12 000+ резюме создано · 87% соискателей получили оффер
        </p>
      </div>
    </section>
  );
}
