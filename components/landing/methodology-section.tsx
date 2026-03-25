import { BookOpen, Brain, Users } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    title: "Авторская методика",
    description:
      "Структура и вопросы разработаны на основе реальной практики карьерных консультантов. Не Generic AI — специализированный инструмент для рынка труда.",
  },
  {
    icon: Brain,
    title: "Обучен на успешных резюме",
    description:
      "Модели обучены на тысячах резюме, которые реально принесли офферы в IT, маркетинге, финансах, менеджменте и других сферах.",
  },
  {
    icon: Users,
    title: "Глубокое интервью",
    description:
      "Вместо анкеты с полями — живой диалог. AI выявляет достижения, которые вы сами считаете незначительными, и превращает их в убедительные факты.",
  },
];

export function MethodologySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1e1b4b]/30 to-[#0f172a] py-12 sm:py-16 md:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Методология
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Не просто AI —{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              экспертная методика
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400 leading-relaxed">
            ChatGPT напишет что-нибудь. ResumeAI напишет то, что работает на
            рынке труда — потому что за алгоритмом стоит методика, а не
            универсальный промпт.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                  <Icon className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{p.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Divider quote */}
        <div className="mt-16 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 text-center">
          <blockquote className="text-xl font-medium text-white leading-relaxed">
            «Большинство соискателей недооценивают свой опыт. Наша задача — помочь
            вам рассказать о себе так, как это делают люди, которые получают офферы.»
          </blockquote>
          <p className="mt-4 text-sm text-slate-500">— Методика ResumeAI</p>
        </div>
      </div>
    </section>
  );
}
