/**
 * Parser for hh.ru vacancy API
 */

export interface HHVacancy {
  title: string;
  company: string;
  description: string;
  keySkills: string[];
  salary: string | null;
  experience: string | null;
}

/**
 * Extract vacancy ID from hh.ru URL
 */
export function extractHHVacancyId(url: string): string | null {
  const match = url.match(/hh\.ru\/vacancy\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetch vacancy data from hh.ru API
 */
export async function fetchHHVacancy(vacancyId: string): Promise<HHVacancy> {
  const response = await fetch(`https://api.hh.ru/vacancies/${vacancyId}`, {
    headers: { "User-Agent": "ResumeAI/1.0" },
  });

  if (!response.ok) {
    throw new Error(`hh.ru API error: ${response.status}`);
  }

  const data = await response.json();

  // Strip HTML tags from description
  const plainDescription = data.description
    ?.replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: data.name,
    company: data.employer?.name ?? "",
    description: plainDescription ?? "",
    keySkills: data.key_skills?.map((s: { name: string }) => s.name) ?? [],
    salary: data.salary
      ? `${data.salary.from ?? ""}–${data.salary.to ?? ""} ${data.salary.currency}`
      : null,
    experience: data.experience?.name ?? null,
  };
}

/**
 * Format vacancy data as text for the AI prompt
 */
export function formatVacancyForPrompt(vacancy: HHVacancy): string {
  const parts = [
    `Должность: ${vacancy.title}`,
    `Компания: ${vacancy.company}`,
    vacancy.salary ? `Зарплата: ${vacancy.salary}` : null,
    vacancy.experience ? `Опыт: ${vacancy.experience}` : null,
    vacancy.keySkills.length > 0
      ? `Ключевые навыки: ${vacancy.keySkills.join(", ")}`
      : null,
    `\nОписание:\n${vacancy.description}`,
  ];

  return parts.filter(Boolean).join("\n");
}
