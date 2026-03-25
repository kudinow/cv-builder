import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ResultTabs } from "@/components/result-tabs";
import type { ResumeData } from "@/lib/pdf-generator";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    notFound();
  }

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!resume) {
    notFound();
  }

  let resumeData: ResumeData | null = null;
  try {
    if (resume.adapted_text) {
      const parsed = JSON.parse(resume.adapted_text);
      if (parsed.full_name && parsed.experience) {
        resumeData = parsed as ResumeData;
      }
    }
  } catch {
    resumeData = null;
  }

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <h1
        className="mb-6 text-3xl font-bold"
        style={{ color: "#f1f5f9" }}
      >
        Результат адаптации
      </h1>

      {resume.status === "processing" && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
        >
          <p className="text-lg font-medium" style={{ color: "#f1f5f9" }}>
            Резюме обрабатывается...
          </p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Обновите страницу через несколько секунд
          </p>
        </div>
      )}

      {resume.status === "error" && (
        <div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <p className="text-lg font-medium" style={{ color: "#ef4444" }}>
            Произошла ошибка при обработке
          </p>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Попробуйте ещё раз
          </p>
        </div>
      )}

      {resume.status === "done" && (
        <ResultTabs
          resumeData={resumeData}
          adaptedText={resume.adapted_text ?? ""}
          coverLetter={resume.cover_letter ?? ""}
          changes={(resume.changes_log as string[]) ?? []}
          photoBase64={resume.pdf_path ?? undefined}
        />
      )}
    </div>
  );
}
