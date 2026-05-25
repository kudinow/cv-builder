import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getRelatedPages, type RelatedPage } from "@/lib/seo/pages";

type Props = {
  currentSlug: string;
  preferGroup?: RelatedPage["group"];
  count?: number;
  title?: string;
};

export function RelatedTiles({ currentSlug, preferGroup, count = 3, title = "Смежные гайды" }: Props) {
  const pages = getRelatedPages(currentSlug, count, preferGroup);

  if (pages.length === 0) return null;

  return (
    <section className="bg-[#0f172a] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pages.map((p) => (
            <Link
              key={p.slug}
              href={p.slug}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-lg font-semibold text-white">{p.title}</div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-600 transition-colors group-hover:text-indigo-400" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.hook}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
