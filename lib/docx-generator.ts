import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { ResumeData } from "@/lib/pdf-generator";

const ACCENT = "2563EB";
const MUTED = "6B7280";
const TEXT = "111827";

function filterLanguages(languages: string[]): string[] {
  return languages.filter(
    (l) => !/рус(ский)?\s*[—\-–]\s*родн/i.test(l)
  );
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    border: {
      bottom: { color: ACCENT, size: 6, style: BorderStyle.SINGLE, space: 2 },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 22,
        color: ACCENT,
      }),
    ],
  });
}

function bullet(text: string, color = TEXT): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 20, color })],
  });
}

export async function generateResumeDocx(data: ResumeData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header: name
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: data.full_name || "", bold: true, size: 40, color: TEXT }),
      ],
    })
  );

  if (data.target_position) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: data.target_position, size: 24, color: ACCENT }),
        ],
      })
    );
  }

  // Contacts
  const contactParts = Object.entries(data.contacts || {})
    .filter(([, v]) => v)
    .map(([, v]) => v);
  if (contactParts.length) {
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: contactParts.join("  •  "), size: 18, color: MUTED }),
        ],
      })
    );
  }

  // About
  if (data.about_me) {
    children.push(sectionHeading("О себе"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: data.about_me, size: 20, color: TEXT })],
      })
    );
  }

  // Skills
  const skillEntries = Object.entries(data.skills || {});
  if (skillEntries.length) {
    children.push(sectionHeading("Навыки"));
    for (const [category, skills] of skillEntries) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${category}: `, bold: true, size: 20, color: TEXT }),
            new TextRun({ text: skills.join(", "), size: 20, color: TEXT }),
          ],
        })
      );
    }
  }

  // Experience
  const relevantExp = (data.experience || []).filter((e) => e.is_relevant !== false);
  const otherExp = (data.experience || []).filter((e) => e.is_relevant === false);

  if (relevantExp.length || otherExp.length) {
    children.push(sectionHeading("Опыт работы"));

    for (const exp of relevantExp) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: exp.company, bold: true, size: 22, color: TEXT }),
            ...(exp.industry
              ? [new TextRun({ text: ` — ${exp.industry}`, size: 20, color: MUTED })]
              : []),
            new TextRun({ text: `  (${exp.period})`, size: 18, color: MUTED }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: exp.position + (exp.team_size ? ` | Команда: ${exp.team_size}` : ""),
              italics: true,
              size: 20,
              color: TEXT,
            }),
          ],
        })
      );
      if (exp.responsibilities?.length) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "Обязанности:", bold: true, size: 18, color: MUTED }),
            ],
          })
        );
        for (const r of exp.responsibilities) children.push(bullet(r));
      }
      if (exp.achievements?.length) {
        children.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: "Достижения:", bold: true, size: 18, color: MUTED }),
            ],
          })
        );
        for (const a of exp.achievements) children.push(bullet(a));
      }
    }

    if (otherExp.length) {
      children.push(
        new Paragraph({
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({ text: "Другой опыт", bold: true, size: 20, color: MUTED }),
          ],
        })
      );
      for (const exp of otherExp) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${exp.company} — ${exp.position} (${exp.period})`,
                size: 18,
                color: MUTED,
              }),
            ],
          })
        );
      }
    }
  }

  // Education
  if (data.education?.length) {
    children.push(sectionHeading("Образование"));
    for (const edu of data.education) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: edu.institution, bold: true, size: 20, color: TEXT }),
            new TextRun({
              text: ` — ${edu.degree}, ${edu.year}`,
              size: 20,
              color: TEXT,
            }),
          ],
        })
      );
    }
  }

  // Certificates
  if (data.certificates?.length) {
    children.push(sectionHeading("Сертификаты"));
    for (const cert of data.certificates) children.push(bullet(cert));
  }

  // Languages
  const langs = filterLanguages(data.languages || []);
  if (langs.length) {
    children.push(sectionHeading("Языки"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: langs.join(" | "), size: 20, color: TEXT })],
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 20 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1000, right: 1000 },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
