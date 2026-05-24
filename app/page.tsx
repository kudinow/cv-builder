import type { Metadata } from "next";
import Script from "next/script";
import { homepageFaq } from "@/lib/seo/faq";
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
import { AiRecommenderSection } from "@/components/landing/ai-recommender-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "CV Builder — Создай продающее резюме за 15 минут",
  description:
    "AI проведёт интервью, извлечёт достижения и соберёт резюме по методике карьерных консультантов. Без шаблонов. 50 токенов бесплатно при регистрации.",
  alternates: { canonical: "/" },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CV Builder",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://cv-builder.ru",
  description:
    "AI-сервис для создания продающего резюме: интервью с AI вытаскивает достижения, шаблоны карьерных консультантов превращают их в резюме за 15 минут. Адаптация под вакансию и генерация сопроводительных писем.",
  inLanguage: "ru",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "RUB",
    description: "50 токенов бесплатно при регистрации",
  },
};

const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homepageFaq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script
        id="ld-software-application"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
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
      <AiRecommenderSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
