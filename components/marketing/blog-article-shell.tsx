import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Breadcrumb } from "@/components/marketing/breadcrumb";
import { RelatedTiles } from "@/components/marketing/related-tiles";
import type { BlogPost } from "@/lib/seo/blog";

type Props = {
  post: BlogPost;
  children: React.ReactNode;
};

export function BlogArticleShell({ post, children }: Props) {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <LandingNav />

      {/* Article header */}
      <header className="relative overflow-hidden bg-[#0f172a] pt-16 pb-10 sm:pt-24 sm:pb-12 md:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Главная", href: "/" },
                { label: "Блог", href: "/blog" },
                { label: post.title },
              ]}
            />
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg text-slate-400 leading-relaxed">{post.hook}</p>
          <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.readingMinutes} мин чтения
            </span>
          </div>
        </div>
      </header>

      {/* Article body */}
      <article className="bg-[#0f172a] py-8 sm:py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="prose prose-invert prose-lg max-w-none [&>h2]:mt-12 [&>h2]:scroll-mt-24 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:sm:text-3xl [&>h3]:mt-8 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-white [&>p]:my-4 [&>p]:text-base [&>p]:leading-relaxed [&>p]:text-slate-300 [&>ul]:my-4 [&>ul]:space-y-2 [&>ul]:text-base [&>ul]:text-slate-300 [&>ul>li]:ml-5 [&>ul>li]:list-disc [&>ol]:my-4 [&>ol]:space-y-2 [&>ol]:text-base [&>ol]:text-slate-300 [&>ol>li]:ml-5 [&>ol>li]:list-decimal [&_strong]:text-white [&_a]:text-indigo-300 [&_a]:underline [&_a]:decoration-indigo-500/30 [&_a]:underline-offset-2 hover:[&_a]:text-indigo-200">
            {children}
          </div>

          {/* Post-offer card */}
          <div className="mt-12 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 sm:p-8">
            <div className="text-sm font-semibold text-indigo-300">Применить к своему резюме</div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Пройти AI-интервью — 15 минут и готовое резюме
            </h3>
            <p className="mt-3 text-base text-slate-300">
              AI спрашивает по всем правилам из этой статьи, вытаскивает цифры из вашего опыта и собирает сильное резюме. 50 токенов бесплатно при регистрации — хватит на первое резюме целиком.
            </p>
            <Link
              href={`/register?utm_source=seo_blog&utm_medium=post_offer&utm_content=${post.slug}`}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-600"
            >
              Создать своё резюме →
            </Link>
          </div>
        </div>
      </article>

      <RelatedTiles currentSlug={`/blog/${post.slug}`} preferGroup="blog" />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  );
}
