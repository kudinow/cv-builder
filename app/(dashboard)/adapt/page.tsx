"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reachGoal } from "@/lib/metrika";

type Step = "input" | "parsing" | "review" | "adapting" | "error";
type DetailLevel = "full" | "short" | "remove";

interface Position {
  company: string;
  position: string;
  period: string;
  summary: string;
  level: DetailLevel;
}

const cardStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "12px",
};

const inputStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  color: "#f1f5f9",
  borderRadius: "8px",
};

export default function AdaptPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDragOver, setResumeDragOver] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [vacancyUrl, setVacancyUrl] = useState("");
  const [vacancyText, setVacancyText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [error, setError] = useState<string | null>(null);

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

  async function handleParse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!resumeFile) { setError("Загрузите PDF-файл с резюме"); return; }
    if (!vacancyUrl && !vacancyText) { setError("Укажите ссылку на вакансию или вставьте текст"); return; }

    try {
      setStep("parsing");
      const formData = new FormData();
      formData.append("file", resumeFile);
      const parseResumeRes = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const parseResumeData = await parseResumeRes.json();
      if (!parseResumeRes.ok) throw new Error(parseResumeData.error || "Ошибка парсинга резюме");
      setResumeText(parseResumeData.text);

      let vacText = vacancyText;
      if (vacancyUrl && !vacancyText) {
        const parseVacancyRes = await fetch("/api/parse-vacancy", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: vacancyUrl }),
        });
        const parseVacancyData = await parseVacancyRes.json();
        if (!parseVacancyRes.ok) throw new Error(parseVacancyData.error || "Ошибка парсинга вакансии");
        vacText = parseVacancyData.text;
      }
      setFinalVacancyText(vacText);

      const analyzeRes = await fetch("/api/analyze-resume", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: parseResumeData.text }),
      });
      const analyzeData = await analyzeRes.json();
      const positionsWithLevel: Position[] = (analyzeData.positions || []).map(
        (p: Omit<Position, "level">) => ({ ...p, level: "full" as DetailLevel })
      );
      setPositions(positionsWithLevel);
      reachGoal('adapt_start');
      setStep("review");
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  }

  async function handleAdapt() {
    setError(null);
    try {
      setStep("adapting");
      const instructions = positions
        .map((p) => {
          const label = p.level === "full" ? "ПОЛНОСТЬЮ" : p.level === "short" ? "СОКРАТИТЬ" : "УБРАТЬ";
          return `• ${p.company} — ${p.position} (${p.period}): ${label}`;
        })
        .join("\n");

      const adaptRes = await fetch("/api/adapt", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText, vacancyText: finalVacancyText, vacancyUrl: vacancyUrl || null,
          photoBase64: photoPreview || null, positionInstructions: instructions,
        }),
      });
      const adaptData = await adaptRes.json();
      if (!adaptRes.ok) throw new Error(adaptData.error || "Ошибка адаптации");
      reachGoal('adapt_finish');
      router.push(`/result/${adaptData.id}`);
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  }

  function setPositionLevel(index: number, level: DetailLevel) {
    setPositions((prev) => prev.map((p, i) => (i === index ? { ...p, level } : p)));
  }

  const isLoading = step === "parsing" || step === "adapting";

  // Review step
  if (step === "review") {
    return (
      <div className="mx-auto max-w-3xl py-8 px-4">
        <h1 className="mb-2 text-3xl font-bold" style={{ color: "#f1f5f9" }}>
          Настройте адаптацию
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#94a3b8" }}>
          Укажите для каждой позиции, как подробно её описывать в адаптированном резюме
        </p>

        <div className="space-y-3">
          {positions.map((pos, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={cardStyle}>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" style={{ color: "#f1f5f9" }}>
                  {pos.company} — {pos.position}
                </p>
                <p className="text-xs" style={{ color: "#64748b" }}>
                  {pos.period}{pos.summary ? ` • ${pos.summary}` : ""}
                </p>
              </div>
              <div className="flex gap-1 shrink-0 flex-wrap">
                {([["full", "Полностью"], ["short", "Сократить"], ["remove", "Убрать"]] as [DetailLevel, string][]).map(
                  ([level, label]) => (
                    <button
                      key={level}
                      onClick={() => setPositionLevel(i, level)}
                      className="px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors"
                      style={
                        pos.level === level
                          ? level === "full"
                            ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff" }
                            : level === "short"
                              ? { backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }
                              : { backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }
                          : { border: "1px solid #334155", color: "#64748b" }
                      }
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {positions.filter((p) => p.level === "remove").length === positions.length && (
          <p className="mt-4 text-sm" style={{ color: "#ef4444" }}>
            Нельзя убрать все позиции — оставьте хотя бы одну
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAdapt}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            disabled={positions.filter((p) => p.level !== "remove").length === 0}
          >
            Адаптировать резюме
          </button>
          <button
            onClick={() => setStep("input")}
            className="py-3 px-6 rounded-xl text-sm font-medium"
            style={{ border: "1px solid #334155", color: "#94a3b8" }}
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Input step
  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="mb-2 text-3xl font-bold" style={{ color: "#f1f5f9" }}>
        Адаптация резюме
      </h1>
      <p className="mb-8 text-sm" style={{ color: "#94a3b8" }}>
        Загрузите резюме и укажите вакансию — AI адаптирует резюме и напишет сопроводительное письмо
      </p>

      {error && (
        <div
          className="mb-6 rounded-xl p-4 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mb-6 rounded-xl p-6 text-center" style={cardStyle}>
          <div className="mb-2">
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: "#6366f1", borderTopColor: "transparent" }}
            />
          </div>
          <p className="text-base font-medium" style={{ color: "#f1f5f9" }}>
            {step === "parsing" ? "Анализируем документы..." : "AI адаптирует резюме..."}
          </p>
          <p className="text-sm" style={{ color: "#64748b" }}>
            {step === "parsing"
              ? "Извлекаем текст из PDF, парсим вакансию и анализируем опыт"
              : "Claude адаптирует ваше резюме. Это может занять 30-60 секунд"}
          </p>
        </div>
      )}

      <form onSubmit={handleParse} className="space-y-6">
        {/* Resume upload */}
        <div className="p-3 sm:p-5 rounded-xl" style={cardStyle}>
          <h3 className="text-base font-semibold mb-1" style={{ color: "#f1f5f9" }}>1. Ваше резюме</h3>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>Загрузите PDF-файл с резюме</p>
          <label
            className="flex items-center justify-center w-full py-8 rounded-lg cursor-pointer transition-colors hover:border-[#6366f1]"
            style={{
              border: "2px dashed",
              borderColor: resumeDragOver ? "#8b5cf6" : "#334155",
              backgroundColor: resumeDragOver ? "rgba(99,102,241,0.08)" : "#0f172a",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setResumeDragOver(true);
            }}
            onDragLeave={() => setResumeDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setResumeDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file && file.type === "application/pdf") {
                setResumeFile(file);
              } else {
                setError("Пожалуйста, загрузите файл в формате PDF");
              }
            }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📄</div>
              <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                {resumeFile ? resumeFile.name : "Перетащите PDF или нажмите для выбора"}
              </p>
              {resumeFile && (
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  {(resumeFile.size / 1024).toFixed(0)} КБ
                </p>
              )}
            </div>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
            />
          </label>
        </div>

        {/* Photo upload */}
        <div className="p-3 sm:p-5 rounded-xl" style={cardStyle}>
          <h3 className="text-base font-semibold mb-1" style={{ color: "#f1f5f9" }}>2. Фото (необязательно)</h3>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>Добавьте профессиональное фото для резюме</p>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Фото" className="h-20 w-16 rounded-lg object-cover" style={{ border: "1px solid #334155" }} />
            ) : (
              <div className="flex h-20 w-16 items-center justify-center rounded-lg text-xs" style={{ border: "2px dashed #334155", color: "#64748b" }}>
                Нет фото
              </div>
            )}
            <div className="flex-1 space-y-2">
              <label
                className="flex items-center justify-center w-full py-4 rounded-lg cursor-pointer"
                style={{ border: "2px dashed #334155", backgroundColor: "#0f172a" }}
              >
                <span className="text-sm" style={{ color: "#94a3b8" }}>
                  {photoFile ? photoFile.name : "Выбрать фото"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                  disabled={isLoading}
                />
              </label>
              {photoFile && (
                <button type="button" className="text-xs" style={{ color: "#ef4444" }} onClick={() => handlePhotoChange(null)}>
                  Убрать фото
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vacancy */}
        <div className="p-3 sm:p-5 rounded-xl" style={cardStyle}>
          <h3 className="text-base font-semibold mb-1" style={{ color: "#f1f5f9" }}>3. Вакансия</h3>
          <p className="text-sm mb-4" style={{ color: "#64748b" }}>Вставьте ссылку на вакансию (hh.ru) или текст вакансии</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Ссылка на вакансию (hh.ru)</label>
              <input
                type="url"
                placeholder="https://hh.ru/vacancy/123456"
                value={vacancyUrl}
                onChange={(e) => setVacancyUrl(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none focus:ring-1 focus:ring-[#6366f1] placeholder:text-[#475569]"
                style={inputStyle}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
              <span className="text-xs uppercase" style={{ color: "#64748b" }}>или</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#334155" }} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Текст вакансии</label>
              <textarea
                placeholder="Вставьте описание вакансии..."
                rows={8}
                value={vacancyText}
                onChange={(e) => setVacancyText(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2.5 text-sm rounded-lg resize-y outline-none focus:ring-1 focus:ring-[#6366f1] placeholder:text-[#475569]"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          disabled={isLoading || !resumeFile || (!vacancyUrl && !vacancyText)}
        >
          {isLoading ? "Обработка..." : "Далее — настроить адаптацию"}
        </button>
      </form>
    </div>
  );
}
