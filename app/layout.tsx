import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CV Builder — Создай продающее резюме с AI",
  description:
    "AI-интервьюер вытащит лучшее из вашего опыта и создаст продающее резюме за 15 минут. Проверенные формулы достижений из практики карьерных консультантов.",
  metadataBase: new URL("https://cv-builder.ru"),
  openGraph: {
    title: "CV Builder — Создай продающее резюме с AI",
    description:
      "AI проведёт интервью, извлечёт достижения и соберёт резюме по методике карьерных консультантов.",
    siteName: "CV Builder",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Builder — Создай продающее резюме с AI",
    description:
      "AI проведёт интервью, извлечёт достижения и соберёт резюме по методике карьерных консультантов.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108238897','ym');
            ym(108238897,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
          `}
        </Script>
        <noscript>
          <div><img src="https://mc.yandex.ru/watch/108238897" style={{position:'absolute',left:'-9999px'}} alt="" /></div>
        </noscript>
      </body>
    </html>
  );
}
