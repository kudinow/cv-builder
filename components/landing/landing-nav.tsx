import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingNav() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <span className="text-lg font-bold text-white">
          Resume<span className="text-blue-500">AI</span>
        </span>
        <div className="flex items-center gap-6">
          <a href="#how-it-works" className="hidden text-sm text-slate-400 hover:text-white sm:block">
            Как это работает
          </a>
          <a href="#pricing" className="hidden text-sm text-slate-400 hover:text-white sm:block">
            Цены
          </a>
          <Link
            href="/adapt"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            Попробовать бесплатно
          </Link>
        </div>
      </div>
    </nav>
  );
}
