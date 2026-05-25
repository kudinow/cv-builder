import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-slate-300">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-400" : ""}>{item.label}</span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-700" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
