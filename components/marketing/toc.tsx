type TocItem = { id: string; label: string };

export function Toc({ items, title = "Содержание" }: { items: TocItem[]; title?: string }) {
  return (
    <nav
      aria-label={title}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <ol className="space-y-2 text-sm text-slate-300">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-baseline gap-3">
            <span className="shrink-0 font-mono text-xs text-slate-600">
              {String(i + 1).padStart(2, "0")}
            </span>
            <a
              href={`#${item.id}`}
              className="text-slate-300 underline decoration-slate-700 underline-offset-4 transition-colors hover:text-white hover:decoration-indigo-400"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
