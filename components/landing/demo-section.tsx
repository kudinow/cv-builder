export function DemoSection() {
  const messages = [
    {
      role: "ai",
      text: "Привет! Я помогу вам создать сильное резюме. Для начала — как вас зовут и на какую позицию вы нацелены?",
    },
    {
      role: "user",
      text: "Меня зовут Алексей, ищу позицию Senior Product Manager.",
    },
    {
      role: "ai",
      text: "Отлично, Алексей! Расскажите о вашем самом значимом продуктовом достижении за последние 2 года — желательно с цифрами.",
    },
    {
      role: "user",
      text: "Запустил фичу онбординга, которая снизила отток на 18% за квартал.",
    },
    {
      role: "ai",
      text: "Прекрасно! Снижение оттока на 18% — это сильная метрика. Давайте углубимся: сколько пользователей было затронуто, и какова была ваша роль в команде?",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]/50 py-12 sm:py-16 md:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Демо продукта
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Интервью, которое{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              знает вашу сферу
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            AI задаёт точные вопросы и извлекает достижения, которые вы сами не
            догадались бы вписать
          </p>
        </div>

        {/* Chat mockup */}
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-indigo-900/20 backdrop-blur-sm">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <div className="ml-4 flex-1 rounded-md bg-slate-700/50 px-3 py-1 text-xs text-slate-500">
                CV Builder — Интервью · Фаза 2 из 5
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-800">
              <div className="h-full w-2/5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            </div>

            {/* Messages */}
            <div className="space-y-4 p-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ai" && (
                    <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "ai"
                        ? "bg-slate-800 text-slate-200"
                        : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              <div className="flex justify-start">
                <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                  AI
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-slate-800 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-800/50 px-4 py-3 text-sm text-slate-500">
                <span className="flex-1">Напишите ответ...</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Среднее интервью — 15–20 минут · 5 фаз · до 80 вопросов
          </p>
        </div>
      </div>
    </section>
  );
}
