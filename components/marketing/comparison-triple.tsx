import { Check, X, Sparkles } from "lucide-react";

type Column = {
  label: string;
  sublabel?: string;
  tone: "neutral" | "consultant" | "ours";
  pros: string[];
  cons: string[];
};

export function ComparisonTriple({
  title,
  subtitle,
  columns,
}: {
  title: string;
  subtitle?: string;
  columns: [Column, Column, Column];
}) {
  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">{subtitle}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((col, i) => {
            const isOurs = col.tone === "ours";
            return (
              <div
                key={i}
                className={
                  isOurs
                    ? "relative rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 shadow-xl shadow-indigo-500/10"
                    : "rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                }
              >
                {isOurs && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                      <Sparkles className="h-3 w-3" />
                      CV Builder
                    </div>
                  </div>
                )}
                <div className="mb-1 text-base font-semibold text-white">{col.label}</div>
                {col.sublabel && (
                  <div className="mb-5 text-xs text-slate-500">{col.sublabel}</div>
                )}

                <ul className="space-y-2.5">
                  {col.pros.map((line, j) => (
                    <li key={`p-${j}`} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{line}</span>
                    </li>
                  ))}
                  {col.cons.map((line, j) => (
                    <li key={`c-${j}`} className="flex items-start gap-2 text-sm text-slate-500">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/70" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
