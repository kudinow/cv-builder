import { Compass, Copy, HelpCircle } from "lucide-react";

const points = [
  {
    icon: Compass,
    title: "Не знаю с чего начать",
    description:
      "Открываете пустой документ — и блок. Не понятно какие блоки нужны, что писать первым, что вообще считается «достижением».",
  },
  {
    icon: Copy,
    title: "Шаблон выглядит как у всех",
    description:
      "Скачали типовой образец — заполнили — оно мёртвое. HR за 10 секунд скользит и закрывает: одно из десятка одинаковых.",
  },
  {
    icon: HelpCircle,
    title: "Не понимаю что писать в «о себе»",
    description:
      "Графа «о себе», профессиональные качества, краткое резюме — несколько одинаковых полей, и непонятно как заполнить, чтобы это работало.",
  },
];

export function PainPoints() {
  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Образец — это половина дела
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-400">
            Чтобы из примера получилось ваше работающее резюме, нужно решить три типичные проблемы.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-lg font-semibold text-white">{p.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
