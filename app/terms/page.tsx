import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Условия использования и политика конфиденциальности — CV Builder",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-violet-400 hover:underline"
        >
          &larr; На главную
        </Link>

        <h1 className="mb-8 text-3xl font-bold text-white">
          Условия использования и политика конфиденциальности
        </h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              1. Общие положения
            </h2>
            <p>
              Сервис CV Builder (далее — «Сервис») предоставляет инструменты для
              создания и адаптации резюме с использованием искусственного
              интеллекта. Используя Сервис, вы соглашаетесь с настоящими
              условиями.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              2. Какие данные мы собираем
            </h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Имя и адрес электронной почты — при регистрации</li>
              <li>
                Текст резюме и данные вакансий — для адаптации и создания резюме
              </li>
              <li>
                Данные интервью — ответы, которые вы даёте AI-интервьюеру
              </li>
              <li>История платежей — при покупке токенов</li>
              <li>
                Данные об использовании сайта — через сервис аналитики
                Яндекс.Метрика
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              3. Зачем мы обрабатываем данные
            </h2>
            <p>
              Ваши данные используются исключительно для предоставления услуг
              Сервиса: создания, адаптации резюме, проведения AI-интервью и
              обработки платежей.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              4. Третьи стороны
            </h2>
            <p>Для работы Сервиса мы используем следующие сторонние сервисы:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <strong>OpenRouter</strong> — AI-обработка текста резюме и
                интервью. Текст резюме передаётся на серверы OpenRouter для
                обработки языковой моделью.
              </li>
              <li>
                <strong>YooKassa</strong> — обработка платежей. Платёжные данные
                обрабатываются непосредственно YooKassa и не хранятся на наших
                серверах.
              </li>
              <li>
                <strong>Яндекс.Метрика</strong> — аналитика использования сайта.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              5. Хранение данных
            </h2>
            <p>
              Данные хранятся в базе данных Supabase (PostgreSQL). Серверы могут
              располагаться за пределами Российской Федерации.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              6. Ваши права
            </h2>
            <p>Вы имеете право:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Запросить доступ к своим персональным данным</li>
              <li>Запросить удаление своего аккаунта и всех связанных данных</li>
              <li>Отозвать согласие на маркетинговые рассылки в любое время</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              7. Маркетинговые рассылки
            </h2>
            <p>
              Мы отправляем маркетинговые рассылки только тем пользователям,
              которые дали на это отдельное согласие при регистрации. Вы можете
              отказаться от рассылок в любое время.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">
              8. Контакты
            </h2>
            <p>
              По вопросам, связанным с персональными данными, обращайтесь по
              адресу:{" "}
              <a
                href="mailto:support@cv-builder.ru"
                className="text-violet-400 hover:underline"
              >
                support@cv-builder.ru
              </a>
            </p>
          </section>

          <p className="pt-4 text-xs text-slate-500">
            Последнее обновление: 30 марта 2026 г.
          </p>
        </div>
      </div>
    </div>
  );
}
