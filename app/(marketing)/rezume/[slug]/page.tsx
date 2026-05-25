import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ProfessionPageTemplate } from "@/components/marketing/profession-template";
import { professions, getProfession } from "@/lib/seo/professions";

type RouteParams = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return professions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const profession = getProfession(slug);
  if (!profession) return {};

  const url = `https://cv-builder.ru/rezume/${slug}`;
  return {
    title: profession.metaTitle,
    description: profession.metaDescription,
    alternates: { canonical: `/rezume/${slug}` },
    openGraph: {
      title: profession.metaTitle,
      description: profession.metaDescription,
      type: "website",
      url,
    },
  };
}

export default async function ProfessionPage({ params }: RouteParams) {
  const { slug } = await params;
  const profession = getProfession(slug);
  if (!profession) notFound();

  const url = `https://cv-builder.ru/rezume/${slug}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profession.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://cv-builder.ru/" },
      { "@type": "ListItem", position: 2, name: "По профессиям", item: "https://cv-builder.ru/rezume" },
      { "@type": "ListItem", position: 3, name: `Резюме ${profession.genitive}`, item: url },
    ],
  };

  return (
    <>
      <Script
        id={`ld-faq-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`ld-breadcrumb-${slug}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProfessionPageTemplate profession={profession} />
    </>
  );
}
