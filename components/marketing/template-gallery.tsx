import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

const templates = [
  { label: "Образец резюме разработчика", tone: "from-indigo-500/15 to-blue-500/15" },
  { label: "Образец резюме бухгалтера", tone: "from-emerald-500/15 to-teal-500/15" },
  { label: "Образец резюме дизайнера", tone: "from-pink-500/15 to-purple-500/15" },
  { label: "Образец резюме менеджера по продажам", tone: "from-amber-500/15 to-orange-500/15" },
  { label: "Образец резюме маркетолога", tone: "from-fuchsia-500/15 to-pink-500/15" },
  { label: "Образец резюме HR-специалиста", tone: "from-sky-500/15 to-cyan-500/15" },
  { label: "Образец резюме на английском", tone: "from-violet-500/15 to-indigo-500/15" },
  { label: "Образец резюме без опыта", tone: "from-slate-500/15 to-gray-500/15" },
];

function FakeResumePreview() {
  return (
    <div className="space-y-2 select-none [filter:blur(3px)]">
      <div className="h-3 w-2/3 rounded bg-white/30" />
      <div className="h-2 w-1/3 rounded bg-white/20" />
      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-full rounded bg-white/15" />
        <div className="h-2 w-11/12 rounded bg-white/15" />
        <div className="h-2 w-3/4 rounded bg-white/15" />
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-full rounded bg-white/15" />
        <div className="h-2 w-5/6 rounded bg-white/15" />
        <div className="h-2 w-4/6 rounded bg-white/15" />
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-1/2 rounded bg-white/20" />
        <div className="h-2 w-11/12 rounded bg-white/15" />
        <div className="h-2 w-3/4 rounded bg-white/15" />
      </div>
    </div>
  );
}

export function TemplateGallery() {
  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            Галерея образцов
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Готовые образцы под разные профессии
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            Каждый образец создан AI по методике карьерных консультантов. Откройте — посмотрите структуру — сгенерируйте своё за 15 минут.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t, i) => (
            <Link
              key={i}
              href="/auth?utm_source=seo_obrazec&utm_medium=gallery_card"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
            >
              <div className={`mb-4 rounded-xl bg-gradient-to-br ${t.tone} p-4 ring-1 ring-inset ring-white/5`}>
                <FakeResumePreview />
              </div>
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div className="text-sm font-medium text-white">{t.label}</div>
              </div>
              <div className="mt-3 text-xs text-indigo-300/80 opacity-0 transition-opacity group-hover:opacity-100">
                Сгенерировать своё →
              </div>
            </Link>
          ))}

          <Link
            href="/auth?utm_source=seo_obrazec&utm_medium=gallery_cta_tile"
            className="group flex flex-col items-center justify-center rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 text-center transition-all hover:from-indigo-500/15 hover:to-purple-500/15 hover:-translate-y-0.5"
          >
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="text-base font-semibold text-white">
              Не нашли свой?
            </div>
            <div className="mt-1 text-sm text-slate-300">
              Создайте уникальное резюме с AI — за 15 минут
            </div>
            <div className="mt-4 text-xs font-medium text-indigo-300">
              Создать бесплатно →
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
