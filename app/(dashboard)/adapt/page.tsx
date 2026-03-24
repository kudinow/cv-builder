"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Step = "input" | "parsing" | "review" | "adapting" | "error";
type DetailLevel = "full" | "short" | "remove";

interface Position {
  company: string;
  position: string;
  period: string;
  summary: string;
  level: DetailLevel;
}

export default function AdaptPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [vacancyUrl, setVacancyUrl] = useState("");
  const [vacancyText, setVacancyText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);

  // Parsed data (stored between steps)
  const [resumeText, setResumeText] = useState("");
  const [finalVacancyText, setFinalVacancyText] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  // Step 1: Parse resume and vacancy, then analyze positions
  async function handleParse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!resumeFile) {
      setError("Загрузите PDF-файл с резюме");
      return;
    }
    if (!vacancyUrl && !vacancyText) {
      setError("Укажите ссылку на вакансию или вставьте текст");
      return;
    }

    try {
      setStep("parsing");

      // Parse PDF
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseResumeRes = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      const parseResumeData = await parseResumeRes.json();
      if (!parseResumeRes.ok)
        throw new Error(parseResumeData.error || "Ошибка парсинга резюме");

      setResumeText(parseResumeData.text);

      // Parse vacancy
      let vacText = vacancyText;
      if (vacancyUrl && !vacancyText) {
        const parseVacancyRes = await fetch("/api/parse-vacancy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: vacancyUrl }),
        });
        const parseVacancyData = await parseVacancyRes.json();
        if (!parseVacancyRes.ok)
          throw new Error(
            parseVacancyData.error || "Ошибка парсинга вакансии"
          );
        vacText = parseVacancyData.text;
      }
      setFinalVacancyText(vacText);

      // Analyze resume to extract positions
      const analyzeRes = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: parseResumeData.text }),
      });
      const analyzeData = await analyzeRes.json();

      const positionsWithLevel: Position[] = (
        analyzeData.positions || []
      ).map((p: Omit<Position, "level">) => ({
        ...p,
        level: "full" as DetailLevel,
      }));

      setPositions(positionsWithLevel);
      setStep("review");
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  }

  // Step 2: Adapt with user's choices
  async function handleAdapt() {
    setError(null);
    try {
      setStep("adapting");

      // Build user instructions from position choices
      const instructions = positions
        .map((p) => {
          const label =
            p.level === "full"
              ? "ПОЛНОСТЬЮ (все обязанности и достижения)"
              : p.level === "short"
                ? "СОКРАТИТЬ (только ключевые достижения, 2-3 пункта)"
                : "УБРАТЬ (не включать в резюме)";
          return `• ${p.company} — ${p.position} (${p.period}): ${label}`;
        })
        .join("\n");

      const adaptRes = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          vacancyText: finalVacancyText,
          vacancyUrl: vacancyUrl || null,
          photoBase64: photoPreview || null,
          positionInstructions: instructions,
        }),
      });
      const adaptData = await adaptRes.json();

      if (!adaptRes.ok)
        throw new Error(adaptData.error || "Ошибка адаптации");

      router.push(`/result/${adaptData.id}`);
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  }

  function setPositionLevel(index: number, level: DetailLevel) {
    setPositions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, level } : p))
    );
  }

  const isLoading = step === "parsing" || step === "adapting";

  // Review step — show positions with level selector
  if (step === "review") {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <h1 className="mb-2 text-3xl font-bold">Настройте адаптацию</h1>
        <p className="mb-6 text-muted-foreground">
          Укажите для каждой позиции, как подробно её описывать в
          адаптированном резюме
        </p>

        <div className="space-y-3">
          {positions.map((pos, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {pos.company} — {pos.position}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pos.period}
                    {pos.summary ? ` • ${pos.summary}` : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {(
                    [
                      ["full", "Полностью"],
                      ["short", "Сократить"],
                      ["remove", "Убрать"],
                    ] as [DetailLevel, string][]
                  ).map(([level, label]) => (
                    <button
                      key={level}
                      onClick={() => setPositionLevel(i, level)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        pos.level === level
                          ? level === "full"
                            ? "bg-primary text-primary-foreground border-primary"
                            : level === "short"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-red-100 text-red-800 border-red-300"
                          : "bg-background text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {positions.filter((p) => p.level === "remove").length ===
          positions.length && (
          <p className="mt-4 text-sm text-destructive">
            Нельзя убрать все позиции — оставьте хотя бы одну
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleAdapt}
            size="lg"
            className="flex-1"
            disabled={
              positions.filter((p) => p.level !== "remove").length === 0
            }
          >
            Адаптировать резюме
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep("input")}
          >
            Назад
          </Button>
        </div>
      </div>
    );
  }

  // Input step — upload form
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="mb-2 text-3xl font-bold">Адаптация резюме</h1>
      <p className="mb-8 text-muted-foreground">
        Загрузите резюме и укажите вакансию — AI адаптирует резюме и напишет
        сопроводительное письмо
      </p>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mb-6 rounded-md border bg-muted p-6 text-center">
          <div className="mb-2 text-lg font-medium">
            {step === "parsing"
              ? "Анализируем документы..."
              : "AI адаптирует резюме..."}
          </div>
          <p className="text-sm text-muted-foreground">
            {step === "parsing"
              ? "Извлекаем текст из PDF, парсим вакансию и анализируем опыт"
              : "Claude адаптирует ваше резюме. Это может занять 30-60 секунд"}
          </p>
        </div>
      )}

      <form onSubmit={handleParse} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Ваше резюме</CardTitle>
            <CardDescription>Загрузите PDF-файл с резюме</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
              required
            />
            {resumeFile && (
              <p className="mt-2 text-sm text-muted-foreground">
                Файл: {resumeFile.name} (
                {(resumeFile.size / 1024).toFixed(0)} КБ)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Фото (необязательно)</CardTitle>
            <CardDescription>
              Добавьте профессиональное фото для резюме
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Фото"
                  className="h-20 w-16 rounded-md object-cover border"
                />
              ) : (
                <div className="flex h-20 w-16 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                  Нет фото
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handlePhotoChange(e.target.files?.[0] ?? null)
                  }
                  disabled={isLoading}
                />
                {photoFile && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handlePhotoChange(null)}
                  >
                    Убрать фото
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Вакансия</CardTitle>
            <CardDescription>
              Вставьте ссылку на вакансию (hh.ru) или текст вакансии
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vacancyUrl">Ссылка на вакансию (hh.ru)</Label>
              <Input
                id="vacancyUrl"
                type="url"
                placeholder="https://hh.ru/vacancy/123456"
                value={vacancyUrl}
                onChange={(e) => setVacancyUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacancyText">Текст вакансии</Label>
              <Textarea
                id="vacancyText"
                placeholder="Вставьте описание вакансии..."
                rows={8}
                value={vacancyText}
                onChange={(e) => setVacancyText(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading || !resumeFile || (!vacancyUrl && !vacancyText)}
        >
          {isLoading ? "Обработка..." : "Далее — настроить адаптацию"}
        </Button>
      </form>
    </div>
  );
}
