import type { ResumeData } from "./pdf-generator";

export function formatResumeToText(data: ResumeData): string {
  const lines: string[] = [];

  lines.push(data.full_name);
  lines.push(data.target_position);
  if (data.contacts.email) lines.push(`Email: ${data.contacts.email}`);
  if (data.contacts.phone) lines.push(`Тел: ${data.contacts.phone}`);
  if (data.contacts.telegram)
    lines.push(`Telegram: ${data.contacts.telegram}`);
  if (data.contacts.linkedin)
    lines.push(`LinkedIn: ${data.contacts.linkedin}`);

  if (data.about_me) {
    lines.push("\n--- О СЕБЕ ---");
    lines.push(data.about_me);
  }

  if (Object.keys(data.skills).length > 0) {
    lines.push("\n--- НАВЫКИ ---");
    for (const [category, skills] of Object.entries(data.skills)) {
      lines.push(`${category}: ${skills.join(", ")}`);
    }
  }

  if (data.experience.length > 0) {
    lines.push("\n--- ОПЫТ РАБОТЫ ---");
    for (const exp of data.experience) {
      lines.push(`\n${exp.company} | ${exp.industry}`);
      lines.push(`${exp.position} | ${exp.period}`);
      if (exp.team_size) lines.push(`Команда: ${exp.team_size}`);

      if (exp.responsibilities.length > 0) {
        lines.push("Обязанности:");
        for (const r of exp.responsibilities) lines.push(`  • ${r}`);
      }
      if (exp.achievements.length > 0) {
        lines.push("Достижения:");
        for (const a of exp.achievements) lines.push(`  • ${a}`);
      }
    }
  }

  if (data.education.length > 0) {
    lines.push("\n--- ОБРАЗОВАНИЕ ---");
    for (const edu of data.education) {
      lines.push(`${edu.institution} — ${edu.degree} (${edu.year})`);
    }
  }

  if (data.certificates.length > 0) {
    lines.push("\n--- СЕРТИФИКАТЫ ---");
    for (const cert of data.certificates) lines.push(`  • ${cert}`);
  }

  if (data.languages.length > 0) {
    lines.push("\n--- ЯЗЫКИ ---");
    for (const lang of data.languages) lines.push(`  • ${lang}`);
  }

  return lines.join("\n");
}
