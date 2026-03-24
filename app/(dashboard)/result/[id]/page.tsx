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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    notFound();
  }

  // Try to parse adapted_text as structured ResumeData JSON
  let resumeData: ResumeData | null = null;
  try {
    if (resume.adapted_text) {
      const parsed = JSON.parse(resume.adapted_text);
      // Verify it has the expected structure
      if (parsed.full_name && parsed.experience) {
        resumeData = parsed as ResumeData;
      }
    }
  } catch {
    // Not JSON — old format plain text, will use fallback
    resumeData = null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="mb-6 text-3xl font-bold">Результат адаптации</h1>

      {resume.status === "processing" && (
        <div className="rounded-md border bg-muted p-6 text-center">
          <p className="text-lg font-medium">Резюме обрабатывается...</p>
          <p className="text-sm text-muted-foreground">
            Обновите страницу через несколько секунд
          </p>
        </div>
      )}

      {resume.status === "error" && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-lg font-medium text-destructive">
            Произошла ошибка при обработке
          </p>
          <p className="text-sm text-muted-foreground">Попробуйте ещё раз</p>
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
