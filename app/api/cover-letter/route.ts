import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callOpenRouter } from "@/lib/openrouter";
import { COVER_LETTER_SYSTEM_PROMPT } from "@/lib/prompts/cover-letter-system";
import { spendTokens, InsufficientTokensError } from "@/lib/tokens";
import { TOKEN_COSTS } from "@/lib/token-costs";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { resumeId, resumeText, vacancyUrl, vacancyText } = await req.json();

    // Validate input: need one of resumeId or resumeText
    if (!resumeId && !resumeText) {
      return NextResponse.json(
        { error: "Укажите резюме: выберите из списка или загрузите PDF" },
        { status: 400 }
      );
    }
    if (!vacancyUrl && !vacancyText) {
      return NextResponse.json(
        { error: "Укажите вакансию: вставьте ссылку или текст" },
        { status: 400 }
      );
    }

    // Resolve resume text
    let finalResumeText = resumeText;
    if (resumeId && !resumeText) {
      const { data: resume, error: fetchError } = await supabase
        .from("resumes")
        .select("adapted_text, original_text")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !resume) {
        return NextResponse.json(
          { error: "Резюме не найдено" },
          { status: 404 }
        );
      }

      // Prefer adapted_text (structured JSON) — extract readable text
      if (resume.adapted_text) {
        try {
          const parsed = JSON.parse(resume.adapted_text);
          const parts: string[] = [];
          if (parsed.full_name) parts.push(parsed.full_name);
          if (parsed.target_position) parts.push(parsed.target_position);
          if (parsed.about_me) parts.push(parsed.about_me);
          if (parsed.experience) {
            for (const exp of parsed.experience) {
              parts.push(`${exp.company} — ${exp.position} (${exp.period})`);
              if (exp.responsibilities) {
                for (const r of exp.responsibilities) parts.push(`- ${r}`);
              }
              if (exp.achievements) {
                for (const a of exp.achievements) parts.push(`- ${a}`);
              }
            }
          }
          if (parsed.education) {
            for (const edu of parsed.education) {
              parts.push(`${edu.institution}, ${edu.degree} (${edu.year})`);
            }
          }
          if (parsed.skills) {
            for (const [cat, items] of Object.entries(parsed.skills)) {
              parts.push(`${cat}: ${(items as string[]).join(", ")}`);
            }
          }
          finalResumeText = parts.join("\n");
        } catch {
          finalResumeText = resume.adapted_text;
        }
      } else {
        finalResumeText = resume.original_text || "";
      }
    }

    if (!finalResumeText) {
      return NextResponse.json(
        { error: "Не удалось получить текст резюме" },
        { status: 400 }
      );
    }

    // Resolve vacancy text
    let finalVacancyText = vacancyText;
    if (vacancyUrl && !vacancyText) {
      const parseRes = await fetch(
        new URL("/api/parse-vacancy", req.url).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: vacancyUrl }),
        }
      );
      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        return NextResponse.json(
          { error: parseData.error || "Ошибка парсинга вакансии" },
          { status: 400 }
        );
      }
      finalVacancyText = parseData.text;
    }

    if (!finalVacancyText) {
      return NextResponse.json(
        { error: "Не удалось получить текст вакансии" },
        { status: 400 }
      );
    }

    // Spend tokens
    const cost = TOKEN_COSTS.COVER_LETTER;
    try {
      await spendTokens(user.id, cost, "Сопроводительное письмо");
    } catch (error) {
      if (error instanceof InsufficientTokensError) {
        return NextResponse.json(
          {
            error: "Недостаточно токенов",
            needed: error.needed,
            balance: error.balance,
          },
          { status: 402 }
        );
      }
      throw error;
    }

    // Auto-generate title from first non-empty line of vacancy text
    const autoTitle = finalVacancyText
      .split("\n")
      .map((l: string) => l.trim())
      .find((l: string) => l.length > 0)
      ?.slice(0, 100) || "Сопроводительное письмо";

    // Create cover letter record
    const { data: record, error: insertError } = await supabase
      .from("cover_letters")
      .insert({
        user_id: user.id,
        resume_id: resumeId || null,
        resume_text: finalResumeText,
        vacancy_url: vacancyUrl || null,
        vacancy_text: finalVacancyText,
        title: autoTitle,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError || !record) {
      console.error("Error creating cover letter record:", insertError);
      return NextResponse.json(
        { error: "Ошибка при создании записи" },
        { status: 500 }
      );
    }

    // Call AI
    const userMessage = `## Моё резюме:\n${finalResumeText}\n\n## Вакансия:\n${finalVacancyText}`;

    let coverLetter: string;
    try {
      coverLetter = await callOpenRouter({
        systemPrompt: COVER_LETTER_SYSTEM_PROMPT,
        userMessage,
        maxTokens: 2048,
      });
    } catch (aiError) {
      await supabase
        .from("cover_letters")
        .update({ status: "error" })
        .eq("id", record.id);
      console.error("OpenRouter API error:", aiError);
      return NextResponse.json(
        { error: "Ошибка при вызове AI. Попробуйте позже." },
        { status: 502 }
      );
    }

    // Save result
    await supabase
      .from("cover_letters")
      .update({
        cover_letter: coverLetter.trim(),
        status: "done",
      })
      .eq("id", record.id);

    return NextResponse.json({
      id: record.id,
      cover_letter: coverLetter.trim(),
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации сопроводительного письма" },
      { status: 500 }
    );
  }
}
