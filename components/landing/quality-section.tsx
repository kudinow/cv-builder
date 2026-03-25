export function QualitySection() {
  const formulas = [
    {
      label: "Действие",
      example: "Разработал",
      color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
    },
    {
      label: "Результат",
      example: "систему онбординга",
      color: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    },
    {
      label: "Метрика",
      example: "снизив отток на 18%",
      color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    },
    {
      label: "Контекст",
      example: "за 1 квартал",
      color: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    },
  ];

  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Качество результата
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            До и после
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Формула достижения: действие + результат + метрика + контекст
          </p>
        </div>

        {/* Formula */}
        <div className="mb-16 flex flex-wrap items-center justify-center gap-2">
          {formulas.map((f, i) => (
            <div key={f.label} className="flex items-center gap-2">
              <div className={`rounded-xl border px-4 py-2 text-sm font-medium ${f.color}`}>
                <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-0.5">{f.label}</div>
                <div>{f.example}</div>
              </div>
              {i < formulas.length - 1 && (
                <span className="text-slate-600">+</span>
              )}
            </div>
          ))}
        </div>

        {/* Before / After */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Before */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xs">✕</div>
              <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Было</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-xs text-slate-500">Опыт работы</div>
                <p className="text-slate-400 leading-relaxed">
                  Занимался продажами и работой с клиентами. Выполнял план. Опыт
                  работы с людьми. Ответственный и целеустремлённый.
                </p>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Навыки</div>
                <p className="text-slate-400">Коммуникабельный. Умею работать в команде.</p>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs">✓</div>
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Стало</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-xs text-slate-500">Опыт работы</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    Увеличил выручку отдела на 40% за 6 мес., перестроив воронку продаж
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    Привлёк 12 корпоративных клиентов с совокупным LTV &gt;2M₽
                  </li>
                  <li className="flex items-start gap-2 text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                    Вошёл в топ-3 по показателям в команде из 28 менеджеров
                  </li>
                </ul>
              </div>
              <div>
                <div className="mb-1 text-xs text-slate-500">Ключевые навыки</div>
                <div className="flex flex-wrap gap-2">
                  {["B2B-продажи", "CRM (Bitrix24)", "Переговоры", "KPI-планирование"].map((s) => (
                    <span key={s} className="rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-xs text-slate-300">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
