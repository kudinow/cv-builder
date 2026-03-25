import Link from "next/link";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const metrics = [
    { value: "12 000+", label: "резюме создано" },
    { value: "87%", label: "получили оффер" },
    { value: "15 мин", label: "среднее время" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#172554] pt-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          AI-интервью + экспертная методика
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Создай продающее резюме{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            в 10 раз быстрее
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          AI проведёт с вами интервью, извлечёт достижения и соберёт резюме по
          методике карьерных консультантов. Без шаблонов, без ChatGPT-клише.
        </p>

        {/* CTA group */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className={cn(
              "inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-white",
              "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30",
              "transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-xl hover:shadow-indigo-500/40",
              "hover:-translate-y-0.5"
            )}
          >
            Начать бесплатно →
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 text-base text-slate-300 transition-all hover:bg-white/5 hover:text-white"
          >
            Как это работает
          </a>
        </div>

        {/* Free tokens note */}
        <p className="mt-4 text-sm text-slate-500">
          50 бесплатных токенов при регистрации · Без привязки карты
        </p>

        {/* Trust metrics */}
        <div className="mx-auto mt-16 grid max-w-xl grid-cols-3 gap-6">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-3xl font-extrabold text-white">{m.value}</div>
              <div className="mt-1 text-sm text-slate-400">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
