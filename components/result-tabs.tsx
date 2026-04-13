"use client";

import { useState } from "react";
import type { ResumeData } from "@/lib/pdf-generator";
import { formatResumeToText } from "@/lib/format-resume";
import { reachGoal } from "@/lib/metrika";

interface ResultTabsProps {
  resumeData: ResumeData | null;
  adaptedText: string;
  coverLetter: string;
  changes: string[];
  photoBase64?: string;
}

type Tab = "resume" | "cover-letter" | "changes";

export function ResultTabs({
  resumeData,
  adaptedText,
  coverLetter,
  changes,
  photoBase64,
}: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("resume");
  const [editedText, setEditedText] = useState(
    resumeData ? formatResumeToText(resumeData) : adaptedText
  );
  const [editedLetter, setEditedLetter] = useState(coverLetter);
  const [photo, setPhoto] = useState<string | undefined>(photoBase64);
  const [resumeView, setResumeView] = useState<"structured" | "text">(
    resumeData ? "structured" : "text"
  );

  function handlePhotoUpload(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
  }

  async function handleDownloadPDF() {
    try {
      const body = resumeData
        ? { resumeData, photoBase64: photo }
        : { text: editedText, name: "resume", position: "" };
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Ошибка генерации PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeData?.full_name || "resume"}.pdf`;
      reachGoal('pdf_download');
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка при скачивании PDF");
    }
  }

  async function handleDownloadDOCX() {
    if (!resumeData) return;
    try {
      const res = await fetch("/api/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData }),
      });
      if (!res.ok) throw new Error("Ошибка генерации DOCX");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeData.full_name || "resume"}.docx`;
      reachGoal('docx_download');
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка при скачивании DOCX");
    }
  }

  async function handleDownloadLetterPDF() {
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editedLetter, name: "cover-letter", position: "" }),
      });
      if (!res.ok) throw new Error("Ошибка генерации PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cover-letter.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка при скачивании PDF");
    }
  }

  const tabs: { value: Tab; label: string }[] = [
    { value: "resume", label: "Резюме" },
    { value: "cover-letter", label: "Сопроводительное письмо" },
    { value: "changes", label: `Изменения (${changes.length})` },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl p-1" style={{ backgroundColor: "#1e293b" }}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              activeTab === tab.value
                ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }
                : { color: "#94a3b8" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Resume tab */}
      {activeTab === "resume" && (
        <div className="rounded-xl" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4" style={{ borderBottom: "1px solid #334155" }}>
            <h3 className="text-base font-semibold" style={{ color: "#f1f5f9" }}>
              Адаптированное резюме
            </h3>
            <div className="flex gap-2 items-center flex-wrap">
              {resumeData && (
                <div className="flex rounded-lg text-xs" style={{ border: "1px solid #334155" }}>
                  <button
                    className="px-3 py-1.5 rounded-l-lg transition-colors"
                    style={
                      resumeView === "structured"
                        ? { backgroundColor: "#334155", color: "#f1f5f9" }
                        : { color: "#64748b" }
                    }
                    onClick={() => setResumeView("structured")}
                  >
                    Секции
                  </button>
                  <button
                    className="px-3 py-1.5 rounded-r-lg transition-colors"
                    style={
                      resumeView === "text"
                        ? { backgroundColor: "#334155", color: "#f1f5f9" }
                        : { color: "#64748b" }
                    }
                    onClick={() => setResumeView("text")}
                  >
                    Текст
                  </button>
                </div>
              )}
              <button
                onClick={() => handleCopy(editedText)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ border: "1px solid #334155", color: "#94a3b8" }}
              >
                Копировать
              </button>
              <label
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                style={{ border: "1px solid #334155", color: "#94a3b8" }}
              >
                {photo ? "Заменить фото" : "Добавить фото"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handlePhotoUpload(f);
                  }}
                />
              </label>
              {photo && (
                <button
                  className="text-xs transition-colors"
                  style={{ color: "#ef4444" }}
                  onClick={() => setPhoto(undefined)}
                >
                  Убрать
                </button>
              )}
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Скачать PDF
              </button>
              {resumeData && (
                <button
                  onClick={handleDownloadDOCX}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  Скачать DOCX
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            {resumeData && resumeView === "structured" ? (
              <StructuredResumeView data={resumeData} />
            ) : (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={25}
                className="w-full rounded-lg p-3 font-mono text-sm resize-y"
                style={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  color: "#cbd5e1",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Cover letter tab */}
      {activeTab === "cover-letter" && (
        <div className="rounded-xl" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4" style={{ borderBottom: "1px solid #334155" }}>
            <h3 className="text-base font-semibold" style={{ color: "#f1f5f9" }}>
              Сопроводительное письмо
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleCopy(editedLetter)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ border: "1px solid #334155", color: "#94a3b8" }}
              >
                Копировать
              </button>
              <button
                onClick={handleDownloadLetterPDF}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Скачать PDF
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={editedLetter}
              onChange={(e) => setEditedLetter(e.target.value)}
              rows={15}
              className="w-full rounded-lg p-3 font-mono text-sm resize-y"
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                color: "#cbd5e1",
              }}
            />
          </div>
        </div>
      )}

      {/* Changes tab */}
      {activeTab === "changes" && (
        <div className="rounded-xl" style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}>
          <div className="p-4" style={{ borderBottom: "1px solid #334155" }}>
            <h3 className="text-base font-semibold" style={{ color: "#f1f5f9" }}>
              Список изменений
            </h3>
          </div>
          <div className="p-4">
            {changes.length > 0 ? (
              <ul className="space-y-3">
                {changes.map((change, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm rounded-lg p-3"
                    style={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                  >
                    <span style={{ color: "#6366f1" }}>•</span>
                    <span style={{ color: "#cbd5e1" }}>{change}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "#64748b" }}>
                Список изменений недоступен
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StructuredResumeView({ data }: { data: ResumeData }) {
  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="pb-4" style={{ borderBottom: "1px solid #334155" }}>
        <h2 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
          {data.full_name}
        </h2>
        <p className="font-medium" style={{ color: "#a78bfa" }}>
          {data.target_position}
        </p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs" style={{ color: "#64748b" }}>
          {data.contacts.email && <span>{data.contacts.email}</span>}
          {data.contacts.phone && <span>{data.contacts.phone}</span>}
          {data.contacts.telegram && <span>{data.contacts.telegram}</span>}
          {data.contacts.linkedin && <span>{data.contacts.linkedin}</span>}
        </div>
      </div>

      {data.about_me && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            О себе
          </h3>
          <p className="leading-relaxed" style={{ color: "#94a3b8" }}>{data.about_me}</p>
        </div>
      )}

      {Object.keys(data.skills).length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Навыки
          </h3>
          <div className="space-y-1">
            {Object.entries(data.skills).map(([category, skills]) => (
              <div key={category} className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="font-medium sm:min-w-[140px]" style={{ color: "#f1f5f9" }}>{category}:</span>
                <span style={{ color: "#94a3b8" }}>{skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.experience.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Опыт работы
          </h3>
          <div className="space-y-5">
            {data.experience.map((exp, i) =>
              exp.is_relevant !== false ? (
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold" style={{ color: "#f1f5f9" }}>{exp.company}</span>
                      {exp.industry && <span style={{ color: "#94a3b8" }}> — {exp.industry}</span>}
                    </div>
                    <span className="text-xs whitespace-nowrap ml-4" style={{ color: "#64748b" }}>
                      {exp.period}
                    </span>
                  </div>
                  <p style={{ color: "#94a3b8" }}>
                    {exp.position}
                    {exp.team_size ? ` | Команда: ${exp.team_size}` : ""}
                  </p>
                  {exp.responsibilities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#64748b" }}>
                        Обязанности
                      </p>
                      <ul className="space-y-0.5 pl-4">
                        {exp.responsibilities.map((r, j) => (
                          <li key={j} className="flex gap-2">
                            <span style={{ color: "#6366f1" }}>•</span>
                            <span style={{ color: "#cbd5e1" }}>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exp.achievements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#64748b" }}>
                        Достижения
                      </p>
                      <ul className="space-y-0.5 pl-4">
                        {exp.achievements.map((a, j) => (
                          <li key={j} className="flex gap-2">
                            <span style={{ color: "#a78bfa" }}>•</span>
                            <span style={{ color: "#cbd5e1" }}>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div key={i} className="pl-3 py-1" style={{ borderLeft: "2px solid #334155" }}>
                  <div className="flex items-start justify-between">
                    <span className="font-medium" style={{ color: "#94a3b8" }}>
                      {exp.company} — {exp.position}
                    </span>
                    <span className="text-xs whitespace-nowrap ml-4" style={{ color: "#64748b" }}>
                      {exp.period}
                    </span>
                  </div>
                  {exp.achievements.length > 0 && (
                    <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                      {exp.achievements.join(". ")}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Образование
          </h3>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-1">
              <span className="font-medium" style={{ color: "#f1f5f9" }}>{edu.institution}</span>
              <span style={{ color: "#94a3b8" }}> — {edu.degree}, {edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {data.certificates.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Сертификаты
          </h3>
          <div className="flex flex-wrap gap-1">
            {data.certificates.map((cert, i) => (
              <span
                key={i}
                className="rounded-md px-2 py-0.5 text-xs"
                style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "#a78bfa" }}
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.languages.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
            Языки
          </h3>
          <p style={{ color: "#94a3b8" }}>{data.languages.join(" | ")}</p>
        </div>
      )}
    </div>
  );
}
