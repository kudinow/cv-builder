import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL вакансии обязателен" },
        { status: 400 }
      );
    }

    // Detect hh.ru URLs and use their open API
    const hhMatch = url.match(/hh\.ru\/vacancy\/(\d+)/);

    if (hhMatch) {
      const vacancyId = hhMatch[1];
      const response = await fetch(
        `https://api.hh.ru/vacancies/${vacancyId}`,
        { headers: { "User-Agent": "CV Builder/1.0" } }
      );

      if (!response.ok) {
        return NextResponse.json(
          { error: "Не удалось загрузить вакансию с hh.ru" },
          { status: 400 }
        );
      }

      const data = await response.json();

      // Strip HTML tags from description
      const plainDescription = (data.description ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const keySkills =
        data.key_skills?.map((s: { name: string }) => s.name) ?? [];

      const salary = data.salary
        ? `${data.salary.from ?? ""}–${data.salary.to ?? ""} ${data.salary.currency}`
        : null;

      // Format as readable text for the AI prompt
      const parts = [
        `Должность: ${data.name}`,
        `Компания: ${data.employer?.name ?? ""}`,
        salary ? `Зарплата: ${salary}` : null,
        data.experience?.name ? `Опыт: ${data.experience.name}` : null,
        keySkills.length > 0
          ? `Ключевые навыки: ${keySkills.join(", ")}`
          : null,
        `\nОписание:\n${plainDescription}`,
      ];

      return NextResponse.json({
        text: parts.filter(Boolean).join("\n"),
        title: data.name,
        company: data.employer?.name,
        url,
      });
    }

    return NextResponse.json(
      {
        error:
          "Пока поддерживается только hh.ru. Вставьте текст вакансии вручную.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error parsing vacancy:", error);
    return NextResponse.json(
      { error: "Ошибка при парсинге вакансии" },
      { status: 500 }
    );
  }
}
