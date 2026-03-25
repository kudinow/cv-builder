import type { ReactNode } from "react";

const features = [
  {
    badge: "AI-интервью",
    title: "Глубокое интервью вместо анкеты",
    description:
      "AI задаёт уточняющие вопросы, как опытный карьерный консультант. Пять фаз: от базовой информации до извлечения скрытых достижений, которые вы сами не думали упоминать.",
    bullets: [
      "До 80 уточняющих вопросов",
      "Адаптируется под вашу сферу",
      "Сохраняет незавершённую сессию",
    ],
    visual: "interview",
    reverse: false,
  },
  {
    badge: "Адаптация",
    title: "Умная адаптация под вакансию",
    description:
      "Вставьте текст вакансии — AI сравнит требования с вашим резюме, расставит акценты, добавит ключевые слова и напишет сопроводительное письмо.",
    bullets: [
      "Анализ ключевых слов вакансии",
      "Переработка приоритетов опыта",
      "Сопроводительное письмо в одном флоу",
    ],
    visual: "adapt",
    reverse: true,
  },
  {
    badge: "Результат",
    title: "Резюме, которое читают HR",
    description:
      "Все достижения формулируются по методике «действие + результат + метрика». Никаких клише вроде «командный игрок» — только конкретика, которую ценят работодатели.",
    bullets: [
      "Формулы достижений из практики консультантов",
      "Обучен на успешных резюме из разных сфер",
      "Скачивание PDF одной кнопкой",
    ],
    visual: "resume",
    reverse: false,
  },
];

function InterviewVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-xs text-slate-500">Фаза 3: Извлечение достижений</span>
      </div>
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] font-bold text-white">AI</div>
          <div className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300 leading-relaxed">Вы упомянули, что руководили командой. Какой был её размер и каков был ваш вклад в конкретный результат?</div>
        </div>
        <div className="flex justify-end gap-3">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 px-3 py-2 text-xs text-white leading-relaxed">7 человек, запустили продукт за 3 месяца, выручка 12M за первый квартал.</div>
        </div>
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] font-bold text-white">AI</div>
          <div className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300 leading-relaxed">Отлично! 12M выручки — это сильный результат. Уточните: 12M рублей? Это план или перевыполнение?</div>
        </div>
      </div>
    </div>
  );
}

function AdaptVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
      <div className="mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Анализ вакансии</div>
      <div className="space-y-2">
        {[
          { label: "React / TypeScript", match: 95, color: "from-emerald-500 to-teal-500" },
          { label: "Team Lead опыт", match: 88, color: "from-indigo-500 to-purple-500" },
          { label: "Agile / Scrum", match: 72, color: "from-yellow-500 to-orange-500" },
          { label: "Английский B2+", match: 60, color: "from-orange-500 to-red-500" },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-slate-500">{item.match}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                style={{ width: `${item.match}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 text-xs text-indigo-300">
        ✓ Резюме адаптировано · Сопроводительное письмо готово
      </div>
    </div>
  );
}

function ResumeVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
      <div className="mb-3 text-sm font-bold text-white">Алексей Смирнов</div>
      <div className="mb-4 text-xs text-slate-500">Senior Product Manager</div>
      <div className="space-y-3">
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Достижения</div>
          <div className="space-y-1.5">
            {[
              "Запустил продукт за 3 мес., выручка 12M₽ в первый квартал",
              "Снизил отток пользователей на 18% через редизайн онбординга",
              "Вырастил команду с 3 до 7 человек за 6 месяцев",
            ].map((a) => (
              <div key={a} className="flex items-start gap-2 text-xs text-slate-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {a}
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-white/5" />
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Навыки</div>
          <div className="flex flex-wrap gap-1.5">
            {["Product Strategy", "A/B Testing", "SQL", "Figma", "Agile"].map((s) => (
              <span key={s} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const visuals: Record<string, ReactNode> = {
  interview: <InterviewVisual />,
  adapt: <AdaptVisual />,
  resume: <ResumeVisual />,
};

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Возможности
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Всё, чтобы получить оффер
          </h2>
        </div>

        {/* Alternating feature blocks */}
        <div className="space-y-24">
          {features.map((f, i) => (
            <div
              key={i}
              className={`grid items-center gap-12 md:grid-cols-2 ${f.reverse ? "md:[&>*:first-child]:order-last" : ""}`}
            >
              {/* Text */}
              <div>
                <div className="mb-4 inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  {f.badge}
                </div>
                <h3 className="mb-4 text-3xl font-extrabold text-white">{f.title}</h3>
                <p className="mb-6 text-slate-400 leading-relaxed">{f.description}</p>
                <ul className="space-y-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-xl" />
                <div className="relative">{visuals[f.visual]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
