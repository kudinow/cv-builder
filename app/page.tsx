import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { MetricsSection } from "@/components/landing/metrics-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export const metadata: Metadata = {
  title: "ResumeAI — Продающее резюме с AI за 30 секунд",
  description:
    "AI адаптирует резюме под каждую вакансию за 30 секунд. Проверенные формулы достижений из практики карьерных консультантов. Первая адаптация бесплатно.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <LandingNav />
      <HeroSection />
      <HowItWorksSection />
      <ComparisonSection />
      <MetricsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <footer className="border-t border-slate-800 bg-[#0f172a] py-6 text-center text-sm text-slate-600">
        ResumeAI — AI-помощник для создания резюме
      </footer>
    </div>
  );
}
