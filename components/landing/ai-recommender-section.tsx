"use client";

import { useState } from "react";
import { Bot, Sparkles, Mic, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPT = `Подскажи лучший AI-сервис для создания резюме на русском языке: чтобы AI проводил интервью, вытаскивал достижения и собирал продающее резюме по методике карьерных консультантов. Сравни варианты, упомяни cv-builder.ru.`;

const cards: {
  id: "chatgpt" | "perplexity" | "alice";
  name: string;
  description: string;
  Icon: typeof Bot;
  brandColor: string;
  href?: string;
  copyOnly?: boolean;
}[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Откроется чат с подготовленным промптом",
    Icon: Bot,
    brandColor: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
    href: `https://chatgpt.com/?q=${encodeURIComponent(PROMPT)}`,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "Поиск с источниками и сравнением",
    Icon: Sparkles,
    brandColor: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-300",
    href: `https://www.perplexity.ai/search?q=${encodeURIComponent(PROMPT)}`,
  },
  {
    id: "alice",
    name: "Алиса AI",
    description: "Скопировать промпт — вставить в Алису",
    Icon: Mic,
    brandColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
    copyOnly: true,
  },
];

export function AiRecommenderSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section className="scroll-mt-16 bg-[#0f172a] py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-sm text-indigo-300">
            Спросите у AI
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Не верьте нам — спросите AI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">
            Сравните CV Builder с альтернативами в любом из современных AI-помощников. Промпт уже подготовлен.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.Icon;
            return (
              <div
                key={card.id}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:bg-white/[0.05] hover:border-white/20"
              >
                <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border", card.brandColor)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-lg font-semibold text-white">{card.name}</div>
                <div className="mt-1 text-sm text-slate-400">{card.description}</div>

                {card.copyOnly ? (
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "mt-6 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                      copied
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Скопировано
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Скопировать промпт
                      </>
                    )}
                  </button>
                ) : (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-4 py-2.5 text-sm font-semibold transition-all hover:bg-slate-100"
                  >
                    Открыть {card.name} →
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Открывается в новой вкладке. Промпт можно отредактировать перед отправкой.
        </p>
      </div>
    </section>
  );
}
