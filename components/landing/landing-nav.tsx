"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function LandingNav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <span className="text-xl font-bold text-white tracking-tight">
          Resume<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
        </span>

        {/* Nav links */}
        <div className="hidden items-center gap-8 sm:flex">
          <a href="#features" className="text-sm text-slate-400 transition-colors hover:text-white">
            Возможности
          </a>
          <a href="#pricing" className="text-sm text-slate-400 transition-colors hover:text-white">
            Тарифы
          </a>
          <a href="#faq" className="text-sm text-slate-400 transition-colors hover:text-white">
            FAQ
          </a>
        </div>

        {/* CTA group */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-slate-400 transition-colors hover:text-white sm:block"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white",
              "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25",
              "transition-all hover:from-indigo-600 hover:to-purple-600 hover:shadow-indigo-500/40"
            )}
          >
            Создать резюме
          </Link>
        </div>
      </div>
    </nav>
  );
}
