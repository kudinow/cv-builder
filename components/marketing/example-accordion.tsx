"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type Example = {
  title: string;
  context: string;
  body: string;
};

export function ExampleAccordion({ examples }: { examples: Example[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {examples.map((ex, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={cn(
              "rounded-2xl border transition-colors",
              isOpen ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/10 bg-white/[0.03]"
            )}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-start gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
              <div className="flex-1">
                <div className="font-semibold text-white">{ex.title}</div>
                <div className="mt-0.5 text-sm text-slate-400">{ex.context}</div>
              </div>
              <ChevronDown
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform",
                  isOpen && "rotate-180 text-indigo-400"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="rounded-xl border border-white/5 bg-[#0a0f1f] p-4 text-sm leading-relaxed text-slate-300 sm:p-5 whitespace-pre-wrap font-[var(--font-inter)]">
                  {ex.body}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
