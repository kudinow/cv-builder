import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] pt-14">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        {/* Badge */}
        <div className="mb-6 inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
          Методики карьерных консультантов + AI
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Резюме, которое продаёт вас дороже
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          AI адаптирует ваше резюме под каждую вакансию за 30 секунд.
          Используя проверенные формулы достижений, а не шаблонные фразы из ChatGPT.
        </p>

        {/* CTA group */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/adapt"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700"
            )}
          >
            Попробовать бесплатно →
          </Link>
          <a
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-slate-700 text-base text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            Как это работает
          </a>
        </div>

        {/* Risk removal */}
        <p className="mt-4 text-sm text-slate-600">
          Первая адаптация бесплатно · Без привязки карты
        </p>

        {/* Before / After */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {/* Before */}
          <div className="rounded-lg border border-slate-700 bg-[#1e293b] p-5 text-left">
            <div className="mb-3 text-xs font-semibold uppercase text-red-500">
              ❌ Было
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Занимался продажами и работой с клиентами. Выполнял план.{" "}
              <span className="rounded bg-red-900/30 px-1 text-red-300">
                Опыт работы с людьми.
              </span>
            </p>
          </div>
          {/* After */}
          <div className="rounded-lg border border-green-500/20 bg-[#1e293b] p-5 text-left">
            <div className="mb-3 text-xs font-semibold uppercase text-green-500">
              ✅ Стало
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Увеличил выручку отдела на 40% за 6 мес., перестроив воронку продаж.{" "}
              <span className="rounded bg-green-900/30 px-1 text-green-300">
                Привлёк 12 корп. клиентов с LTV {">"}2M₽
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
