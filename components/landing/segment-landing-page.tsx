import type { Metadata } from "next";
import Script from "next/script";
import { SegmentLanding } from "@/components/landing/segment-landing";
import type { SegmentData } from "@/lib/landing-segments";

const BASE = "https://cv-builder.ru";

/** Build per-segment metadata (title/description/og) from the segment config. */
export function buildSegmentMetadata(data: SegmentData): Metadata {
  const url = `${BASE}/${data.slug}`;
  return {
    title: data.meta.title,
    description: data.meta.description,
    alternates: { canonical: `/${data.slug}` },
    openGraph: {
      title: data.meta.ogTitle,
      description: data.meta.ogDescription,
      type: "website",
      url,
      siteName: "CV Builder",
      locale: "ru_RU",
    },
    twitter: {
      card: "summary_large_image",
      title: data.meta.ogTitle,
      description: data.meta.ogDescription,
    },
  };
}

/** Server wrapper: emits JSON-LD for SEO, then renders the (client) landing. */
export function SegmentLandingPage({ data }: { data: SegmentData }) {
  const url = `${BASE}/${data.slug}`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: data.meta.ogTitle, item: url },
    ],
  };

  return (
    <>
      <Script
        id={`ld-faq-${data.id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id={`ld-breadcrumb-${data.id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SegmentLanding data={data} />
    </>
  );
}
