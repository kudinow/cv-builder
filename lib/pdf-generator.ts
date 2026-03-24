import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

// Register fonts that support Cyrillic
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  // Header
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headerPhoto: {
    width: 70,
    height: 85,
    marginRight: 14,
    borderRadius: 4,
    objectFit: "cover" as const,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 6,
  },
  targetPosition: {
    fontSize: 11,
    color: "#2563eb",
    marginBottom: 8,
  },
  contacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9,
    color: "#6b7280",
  },
  contactItem: {
    marginRight: 16,
  },
  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  // About me
  aboutMe: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },
  // Skills
  skillGroup: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategory: {
    fontWeight: 700,
    fontSize: 10,
    width: 130,
    color: "#374151",
  },
  skillList: {
    fontSize: 10,
    color: "#4b5563",
    flex: 1,
  },
  // Experience
  expBlock: {
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 700,
    color: "#111827",
    flex: 1,
  },
  expPeriod: {
    fontSize: 9,
    color: "#6b7280",
    marginLeft: 8,
  },
  positionLine: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 1,
  },
  industryLine: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 9,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    marginTop: 4,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: "#9ca3af",
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.4,
  },
  achievementDot: {
    width: 12,
    fontSize: 10,
    color: "#374151",
  },
  // Education
  eduItem: {
    marginBottom: 4,
  },
  eduName: {
    fontSize: 10,
    fontWeight: 700,
    color: "#374151",
  },
  eduDetail: {
    fontSize: 9,
    color: "#6b7280",
  },
  // Compact experience for non-relevant
  compactExp: {
    marginBottom: 6,
    paddingLeft: 4,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
});

export interface ResumeData {
  full_name: string;
  target_position: string;
  contacts: Record<string, string>;
  about_me: string;
  skills: Record<string, string[]>;
  experience: Array<{
    company: string;
    industry: string;
    position: string;
    period: string;
    team_size?: string;
    responsibilities: string[];
    achievements: string[];
    is_relevant: boolean;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  certificates: string[];
  languages: string[];
}

/**
 * Sanitize text for PDF rendering:
 * - Replace ₽ with "руб." (₽ is not in standard Roboto webfont)
 * - Replace other problematic Unicode chars
 */
function sanitize(text: string): string {
  return text
    .replace(/₽/g, "руб.")
    .replace(/[\u2028\u2029]/g, " ");
}

/**
 * Filter out "Русский — родной" from languages list
 */
function filterLanguages(languages: string[]): string[] {
  return languages.filter(
    (lang) => !/русский\s*[—–-]\s*родн/i.test(lang)
  );
}

/**
 * Add semicolons to achievement bullets if they don't end with punctuation
 */
function formatAchievement(text: string, isLast: boolean): string {
  const s = sanitize(text.trim());
  if (isLast) {
    // Last item ends with period
    return s.endsWith(".") ? s : s.replace(/[;,]$/, "") + ".";
  }
  // Non-last items end with semicolon
  return s.endsWith(";") ? s : s.replace(/[.,]$/, "") + ";";
}

function ResumePDF({ data, photoBase64 }: { data: ResumeData; photoBase64?: string }) {
  const contactItems = Object.entries(data.contacts).filter(
    ([, v]) => v && v.trim()
  );
  const displayLanguages = filterLanguages(data.languages);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // Header (with optional photo)
      React.createElement(
        View,
        { style: styles.header },
        // Photo on the left
        photoBase64 &&
          React.createElement(Image, {
            style: styles.headerPhoto,
            src: photoBase64,
          }),
        // Info on the right
        React.createElement(
          View,
          { style: styles.headerInfo },
          React.createElement(Text, { style: styles.name }, sanitize(data.full_name)),
          React.createElement(
            Text,
            { style: styles.targetPosition },
            sanitize(data.target_position)
          ),
          contactItems.length > 0 &&
            React.createElement(
              View,
              { style: styles.contacts },
              ...contactItems.map(([key, val]) =>
                React.createElement(
                  Text,
                  { key, style: styles.contactItem },
                  sanitize(val)
                )
              )
            )
        )
      ),

      // About Me
      data.about_me &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "О себе"
          ),
          React.createElement(Text, { style: styles.aboutMe }, sanitize(data.about_me))
        ),

      // Skills
      Object.keys(data.skills).length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Навыки"
          ),
          ...Object.entries(data.skills).map(([category, skills]) =>
            React.createElement(
              View,
              { key: category, style: styles.skillGroup },
              React.createElement(
                Text,
                { style: styles.skillCategory },
                `${sanitize(category)}:`
              ),
              React.createElement(
                Text,
                { style: styles.skillList },
                sanitize(skills.join(", "))
              )
            )
          )
        ),

      // Experience
      data.experience.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Опыт работы"
          ),
          ...data.experience.map((exp, i) =>
            exp.is_relevant !== false
              ? // Full experience block
                React.createElement(
                  View,
                  { key: i, style: styles.expBlock },
                  React.createElement(
                    View,
                    { style: styles.expHeader },
                    React.createElement(
                      Text,
                      { style: styles.companyName },
                      sanitize(exp.company)
                    ),
                    React.createElement(
                      Text,
                      { style: styles.expPeriod },
                      sanitize(exp.period)
                    )
                  ),
                  React.createElement(
                    Text,
                    { style: styles.positionLine },
                    sanitize(`${exp.position}${exp.team_size ? ` | Команда: ${exp.team_size}` : ""}`)
                  ),
                  exp.industry &&
                    React.createElement(
                      Text,
                      { style: styles.industryLine },
                      sanitize(exp.industry)
                    ),
                  // Responsibilities
                  exp.responsibilities.length > 0 &&
                    React.createElement(
                      View,
                      null,
                      React.createElement(
                        Text,
                        { style: styles.subheading },
                        "Обязанности"
                      ),
                      ...exp.responsibilities.map((r, j) =>
                        React.createElement(
                          View,
                          { key: j, style: styles.bullet },
                          React.createElement(
                            Text,
                            { style: styles.bulletDot },
                            "•"
                          ),
                          React.createElement(
                            Text,
                            { style: styles.bulletText },
                            sanitize(r)
                          )
                        )
                      )
                    ),
                  // Achievements
                  exp.achievements.length > 0 &&
                    React.createElement(
                      View,
                      null,
                      React.createElement(
                        Text,
                        { style: styles.subheading },
                        "Достижения"
                      ),
                      ...exp.achievements.map((a, j) =>
                        React.createElement(
                          View,
                          { key: j, style: styles.bullet },
                          React.createElement(
                            Text,
                            { style: styles.achievementDot },
                            "•"
                          ),
                          React.createElement(
                            Text,
                            { style: styles.bulletText },
                            formatAchievement(a, j === exp.achievements.length - 1)
                          )
                        )
                      )
                    )
                )
              : // Compact experience block (non-relevant)
                React.createElement(
                  View,
                  { key: i, style: styles.compactExp },
                  React.createElement(
                    View,
                    { style: styles.expHeader },
                    React.createElement(
                      Text,
                      { style: styles.companyName },
                      sanitize(`${exp.company} — ${exp.position}`)
                    ),
                    React.createElement(
                      Text,
                      { style: styles.expPeriod },
                      sanitize(exp.period)
                    )
                  ),
                  exp.achievements.length > 0 &&
                    React.createElement(
                      Text,
                      { style: { fontSize: 9, color: "#4b5563" } },
                      sanitize(exp.achievements.join(". "))
                    )
                )
          )
        ),

      // Education
      data.education.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Образование"
          ),
          ...data.education.map((edu, i) =>
            React.createElement(
              View,
              { key: i, style: styles.eduItem },
              React.createElement(
                Text,
                { style: styles.eduName },
                sanitize(edu.institution)
              ),
              React.createElement(
                Text,
                { style: styles.eduDetail },
                sanitize(`${edu.degree}, ${edu.year}`)
              )
            )
          )
        ),

      // Certificates
      data.certificates.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Сертификаты"
          ),
          ...data.certificates.map((cert, i) =>
            React.createElement(
              View,
              { key: i, style: styles.bullet },
              React.createElement(
                Text,
                { style: styles.bulletDot },
                "•"
              ),
              React.createElement(Text, { style: styles.bulletText }, sanitize(cert))
            )
          )
        ),

      // Languages (без "Русский — родной")
      displayLanguages.length > 0 &&
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Языки"
          ),
          React.createElement(
            Text,
            { style: { fontSize: 10, color: "#374151" } },
            sanitize(displayLanguages.join(" | "))
          )
        )
    )
  );
}

export async function generateResumePDF(data: ResumeData, photoBase64?: string): Promise<Buffer> {
  const doc = createResumeDocument(data, photoBase64);
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}

function createResumeDocument(data: ResumeData, photoBase64?: string) {
  return React.createElement(ResumePDF, { data, photoBase64 }) as unknown as React.ReactElement<
    import("@react-pdf/renderer").DocumentProps
  >;
}
