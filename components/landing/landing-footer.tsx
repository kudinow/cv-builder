import Link from "next/link";

const columns: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Продукт",
    links: [
      { label: "Главная", href: "/" },
      { label: "Резюме с помощью ИИ", href: "/ai-resume" },
      { label: "Конструктор резюме", href: "/konstruktor" },
      { label: "Адаптация под вакансию", href: "/adaptaciya-resume" },
      { label: "Сопроводительное письмо", href: "/soprovoditelnoe-pismo" },
      { label: "Тарифы", href: "/#pricing" },
    ],
  },
  {
    title: "Гайды",
    links: [
      { label: "Образец резюме", href: "/obrazec-rezume" },
      { label: "Как составить резюме", href: "/kak-sostavit-rezume" },
      { label: "Резюме на английском", href: "/rezume-na-angliyskom" },
      { label: "По профессиям", href: "/rezume" },
      { label: "Блог", href: "/blog" },
    ],
  },
  {
    title: "Документы",
    links: [
      { label: "Условия использования", href: "/terms" },
      { label: "Политика конфиденциальности", href: "/terms" },
    ],
  },
  {
    title: "Контакты",
    links: [
      { label: "Поддержка в Telegram", href: "https://t.me/cvbuilder_support_bot", external: true },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0f1f]">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-4 text-sm font-semibold text-white">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            © 2026 CV Builder — AI-помощник для создания продающих резюме
          </p>
          <p className="text-xs text-slate-600">
            cv-builder.ru
          </p>
        </div>
      </div>
    </footer>
  );
}
