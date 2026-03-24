import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { HeroSection } from "@/components/landing/hero-section";
import { AudienceSection } from "@/components/landing/audience-section";
import { DemoSection } from "@/components/landing/demo-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { MethodologySection } from "@/components/landing/methodology-section";
import { QualitySection } from "@/components/landing/quality-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export const metadata: Metadata = {
  title: "ResumeAI — Создай продающее резюме за 15 минут",
  description:
    "AI проведёт интервью, извлечёт достижения и соберёт резюме по методике карьерных консультантов. Без шаблонов. 50 токенов бесплатно при регистрации.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <LandingNav />
      <HeroSection />
      <AudienceSection />
      <DemoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <MethodologySection />
      <QualitySection />
      <ComparisonSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <footer className="border-t border-white/10 bg-[#0f172a] py-8 text-center text-sm text-slate-600">
        © 2026 ResumeAI — AI-помощник для создания продающих резюме
      </footer>
    </div>
  );
}
