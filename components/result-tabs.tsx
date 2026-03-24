"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ResumeData } from "@/lib/pdf-generator";
import { formatResumeToText } from "@/lib/format-resume";

interface ResultTabsProps {
  resumeData: ResumeData | null;
  adaptedText: string;
  coverLetter: string;
  changes: string[];
  photoBase64?: string;
}

export function ResultTabs({
  resumeData,
  adaptedText,
  coverLetter,
  changes,
  photoBase64,
}: ResultTabsProps) {
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
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Ошибка при скачивании PDF");
    }
  }

  async function handleDownloadLetterPDF() {
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editedLetter,
          name: "cover-letter",
          position: "",
        }),
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

  return (
    <Tabs defaultValue="resume">
      <TabsList className="mb-4">
        <TabsTrigger value="resume">Резюме</TabsTrigger>
        <TabsTrigger value="cover-letter">Сопроводительное письмо</TabsTrigger>
        <TabsTrigger value="changes">Изменения ({changes.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="resume">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Адаптированное резюме</CardTitle>
              <div className="flex gap-2">
                {resumeData && (
                  <div className="flex rounded-lg border text-xs">
                    <button
                      className={`px-3 py-1 rounded-l-lg ${resumeView === "structured" ? "bg-muted font-medium" : ""}`}
                      onClick={() => setResumeView("structured")}
                    >
                      Секции
                    </button>
                    <button
                      className={`px-3 py-1 rounded-r-lg ${resumeView === "text" ? "bg-muted font-medium" : ""}`}
                      onClick={() => setResumeView("text")}
                    >
                      Текст
                    </button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(editedText)}
                >
                  Копировать
                </Button>
                <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs font-medium hover:bg-muted">
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
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setPhoto(undefined)}
                  >
                    Убрать
                  </button>
                )}
                <Button size="sm" onClick={handleDownloadPDF}>
                  Скачать PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {resumeData && resumeView === "structured" ? (
              <StructuredResumeView data={resumeData} />
            ) : (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={25}
                className="font-mono text-sm"
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cover-letter">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Сопроводительное письмо</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(editedLetter)}
                >
                  Копировать
                </Button>
                <Button size="sm" onClick={handleDownloadLetterPDF}>
                  Скачать PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editedLetter}
              onChange={(e) => setEditedLetter(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="changes">
        <Card>
          <CardHeader>
            <CardTitle>Список изменений</CardTitle>
          </CardHeader>
          <CardContent>
            {changes.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5">
                {changes.map((change, i) => (
                  <li key={i} className="text-sm">
                    {change}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Список изменений недоступен
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Structured resume view component
function StructuredResumeView({ data }: { data: ResumeData }) {
  return (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold">{data.full_name}</h2>
        <p className="text-primary font-medium">{data.target_position}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {data.contacts.email && <span>{data.contacts.email}</span>}
          {data.contacts.phone && <span>{data.contacts.phone}</span>}
          {data.contacts.telegram && <span>{data.contacts.telegram}</span>}
          {data.contacts.linkedin && <span>{data.contacts.linkedin}</span>}
        </div>
      </div>

      {/* About Me */}
      {data.about_me && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
            О себе
          </h3>
          <p className="text-muted-foreground leading-relaxed">{data.about_me}</p>
        </div>
      )}

      {/* Skills */}
      {Object.keys(data.skills).length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
            Навыки
          </h3>
          <div className="space-y-1">
            {Object.entries(data.skills).map(([category, skills]) => (
              <div key={category} className="flex gap-2">
                <span className="font-medium min-w-[140px]">{category}:</span>
                <span className="text-muted-foreground">{skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">
            Опыт работы
          </h3>
          <div className="space-y-5">
            {data.experience.map((exp, i) =>
              exp.is_relevant !== false ? (
                // Relevant role — full detail
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold">{exp.company}</span>
                      {exp.industry && (
                        <span className="text-muted-foreground"> — {exp.industry}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    {exp.position}
                    {exp.team_size ? ` | Команда: ${exp.team_size}` : ""}
                  </p>

                  {exp.responsibilities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Обязанности
                      </p>
                      <ul className="space-y-0.5 pl-4">
                        {exp.responsibilities.map((r, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.achievements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Достижения
                      </p>
                      <ul className="space-y-0.5 pl-4">
                        {exp.achievements.map((a, j) => (
                          <li key={j} className="flex gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                // Non-relevant role — compact
                <div
                  key={i}
                  className="border-l-2 border-muted pl-3 py-1"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-medium">
                      {exp.company} — {exp.position}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {exp.period}
                    </span>
                  </div>
                  {exp.achievements.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.achievements.join(". ")}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
            Образование
          </h3>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-1">
              <span className="font-medium">{edu.institution}</span>
              <span className="text-muted-foreground">
                {" "} — {edu.degree}, {edu.year}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Certificates */}
      {data.certificates.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
            Сертификаты
          </h3>
          <div className="flex flex-wrap gap-1">
            {data.certificates.map((cert, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
            Языки
          </h3>
          <p className="text-muted-foreground">{data.languages.join(" | ")}</p>
        </div>
      )}
    </div>
  );
}
