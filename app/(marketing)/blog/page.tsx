import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Clock, Calendar } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { blogPosts } from "@/lib/seo/blog";

const PAGE_URL = "https://cv-builder.ru/blog";

export const metadata: Metadata = {
  title: "Блог CV Builder — гайды и разборы по составлению резюме",
  description: "Статьи о составлении резюме, сопроводительных писем и поиске работы. Без воды — только практические гайды от карьерных консультантов.",
  alternates: { canonical: "/blog" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Главная", item: "https://cv-builder.ru/" },
    { "@type": "ListItem", position: 2, name: "Блог", item: PAGE_URL },
  ],
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Script id="ld-breadcrumb-blog-index" type="application/ld+json" strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <LandingNav />

      <section className="bg-[#0f172a] pt-16 pb-10 sm:pt-24 sm:pb-12 md:pt-28">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6">
            <Breadcrumb items={[{ label: "Главная", href: "/" }, { label: "Блог" }]} />
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">Блог</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-400">
            Практические гайды о составлении резюме, сопроводительных писем и поиске работы.
          </p>
        </div>
      </section>

      <section className="bg-[#0f172a] py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-0.5"
              >
                <h2 className="text-xl font-bold text-white group-hover:text-indigo-200 sm:text-2xl">{post.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">{post.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingMinutes} мин чтения
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
