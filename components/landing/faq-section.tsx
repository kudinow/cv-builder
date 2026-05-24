"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { homepageFaq as faqs } from "@/lib/seo/faq";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-slate-400">
            FAQ
          </div>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Частые вопросы
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "overflow-hidden rounded-2xl border transition-all",
                openIndex === i
                  ? "border-indigo-500/30 bg-indigo-500/5"
                  : "border-white/10 bg-white/5"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-5 text-left"
              >
                <span className="pr-4 font-medium text-white">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200",
                    openIndex === i && "rotate-180 text-indigo-400"
                  )}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm leading-relaxed text-slate-400">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
