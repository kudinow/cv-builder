import { MessageSquare, FileText, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "AI-интервью",
    description:
      "Отвечаете на вопросы AI — он проведёт вас по пяти фазам: от базовых данных до глубокого извлечения достижений. Никаких бланков.",
    detail: "15–20 минут",
  },
  {
    number: "02",
    icon: FileText,
    title: "Готовое резюме",
    description:
      "На основе интервью AI собирает резюме по методике достижений: конкретные результаты с цифрами, релевантные навыки, сильный профиль.",
    detail: "Формулы достижений",
  },
  {
    number: "03",
    icon: Zap,
    title: "Адаптация под вакансию",
    description:
      "Вставьте текст вакансии — AI переработает резюме под конкретные требования и напишет сопроводительное письмо.",
    detail: "40 токенов",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Как это работает
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Три шага до сильного резюме
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute top-8 left-[16.66%] right-[16.66%] hidden h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 md:block" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative text-center">
                {/* Number + icon */}
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
                  <Icon className="h-7 w-7 text-white" />
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-indigo-400 border border-indigo-500/30">
                    {step.number}
                  </div>
                </div>

                <h3 className="mb-3 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {step.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-500">
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
