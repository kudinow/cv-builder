import { FileText, AlertTriangle, Target } from "lucide-react";

const segments = [
  {
    icon: FileText,
    title: "Нет резюме",
    description:
      "Только начинаете или давно не искали работу? AI-интервью поможет структурировать опыт и создать резюме с нуля — без бланков и шаблонов.",
    cta: "100 токенов",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Слабое резюме",
    description:
      "Есть резюме, но оно не даёт отклик? Загрузите его, AI проведёт углублённое интервью и перепишет по методике достижений.",
    cta: "80 токенов",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  {
    icon: Target,
    title: "Нужна адаптация",
    description:
      "Хотите откликнуться на конкретную вакансию? Адаптируем резюме под требования работодателя за несколько минут.",
    cta: "50 токенов",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
];

export function AudienceSection() {
  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Для кого
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Узнайте себя
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            CV Builder решает три ключевые задачи соискателя
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {segments.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`rounded-2xl border ${s.borderColor} ${s.bgColor} p-8 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl`}
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {s.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  {s.cta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
