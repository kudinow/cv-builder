import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { callOpenRouter } from "@/lib/openrouter";
import { ADAPT_SYSTEM_PROMPT } from "@/lib/prompts/adapt-system";
import type { ResumeData } from "@/lib/pdf-generator";
import { spendTokens, InsufficientTokensError } from '@/lib/tokens';
import { getAdaptCost } from '@/lib/token-costs';

/**
 * Extract and sanitize JSON from Claude's response.
 * Handles: markdown fences, trailing text, unescaped control chars in strings.
 */
function extractJson(raw: string): string {
  // Try to extract JSON from markdown code fences first
  const fenceMatch = raw.match(/```(?:json_resume|json)?\s*\n?([\s\S]*?)\n?\s*```/);
  let jsonStr: string;

  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  } else {
    // Try to find a top-level JSON object in the response
    const braceStart = raw.indexOf("{");
    const braceEnd = raw.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      jsonStr = raw.slice(braceStart, braceEnd + 1);
    } else {
      jsonStr = raw.trim();
    }
  }

  // Fix unescaped control characters inside JSON string values.
  // Claude sometimes puts real newlines/tabs inside JSON string literals.
  // We need to escape them, but ONLY inside string values (between quotes).
  jsonStr = jsonStr.replace(
    /"(?:[^"\\]|\\.)*"/g,
    (match) => match
      .replace(/(?<!\\)\n/g, "\\n")
      .replace(/(?<!\\)\r/g, "\\r")
      .replace(/(?<!\\)\t/g, "\\t")
  );

  return jsonStr;
}

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

    const { resumeText, vacancyText, vacancyUrl, photoBase64, positionInstructions, parentId } = await req.json();

    // Check and spend tokens
    const cost = getAdaptCost(parentId);
    try {
      await spendTokens(user.id, cost, 'Адаптация резюме');
    } catch (error) {
      if (error instanceof InsufficientTokensError) {
        return NextResponse.json(
          { error: 'Недостаточно токенов', needed: error.needed, balance: error.balance },
          { status: 402 }
        );
      }
      throw error;
    }

    if (!resumeText || !vacancyText) {
      return NextResponse.json(
        { error: "Резюме и вакансия обязательны" },
        { status: 400 }
      );
    }

    // Create resume record with status 'processing'
    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        type: "adaptation",
        status: "processing",
        original_text: resumeText,
        vacancy_url: vacancyUrl || null,
        vacancy_text: vacancyText,
        parent_id: parentId ?? null,
      })
      .select("id")
      .single();

    if (insertError || !resume) {
      console.error("Error creating resume record:", insertError);
      return NextResponse.json(
        { error: "Ошибка при создании записи" },
        { status: 500 }
      );
    }

    // Call OpenRouter API (Claude) with increased token limit for structured output
    const instructionsBlock = positionInstructions
      ? `\n\n## Инструкции пользователя по позициям:\n${positionInstructions}\n\nСТРОГО следуй этим инструкциям: позиции с пометкой ПОЛНОСТЬЮ — описывай максимально подробно (5-6 обязанностей, 6-8 достижений). Позиции с пометкой СОКРАТИТЬ — только 2-3 ключевых достижения, без обязанностей. Позиции с пометкой УБРАТЬ — НЕ включай в резюме.`
      : "";
    const userMessage = `## Моё резюме:\n${resumeText}\n\n## Вакансия:\n${vacancyText}${instructionsBlock}`;

    let result: string;
    try {
      result = await callOpenRouter({
        systemPrompt: ADAPT_SYSTEM_PROMPT,
        userMessage,
        maxTokens: 8192,
      });
    } catch (aiError) {
      await supabase
        .from("resumes")
        .update({ status: "error" })
        .eq("id", resume.id);
      console.error("OpenRouter API error:", aiError);
      return NextResponse.json(
        { error: "Ошибка при вызове AI. Попробуйте позже." },
        { status: 502 }
      );
    }

    // Extract JSON from Claude's response (handles fences, trailing text, etc.)
    const jsonStr = extractJson(result);

    let parsed: {
      resume: ResumeData;
      cover_letter: string;
      changes: string[];
    };

    try {
      parsed = JSON.parse(jsonStr);

      // Validate the parsed object has required structure
      if (!parsed.resume || !parsed.resume.full_name) {
        throw new Error("Missing required fields in parsed JSON");
      }

      // Ensure arrays exist even if Claude omitted them
      parsed.resume.experience = parsed.resume.experience || [];
      parsed.resume.education = parsed.resume.education || [];
      parsed.resume.certificates = parsed.resume.certificates || [];
      parsed.resume.languages = parsed.resume.languages || [];
      parsed.resume.skills = parsed.resume.skills || {};
      parsed.resume.contacts = parsed.resume.contacts || {};
      parsed.changes = parsed.changes || [];
      parsed.cover_letter = parsed.cover_letter || "";
    } catch (parseError) {
      // JSON parse failed — store raw text as fallback
      console.error(
        "Failed to parse Claude response as JSON:",
        parseError instanceof Error ? parseError.message : parseError
      );
      console.error("Raw response (first 500 chars):", result.slice(0, 500));

      await supabase
        .from("resumes")
        .update({
          status: "done",
          adapted_text: result,
          cover_letter: "",
          changes_log: [],
        })
        .eq("id", resume.id);

      return NextResponse.json({
        id: resume.id,
        resume: null,
        cover_letter: "",
        changes: [],
      });
    }

    // Store structured resume as JSON string in adapted_text
    // Store photo base64 in pdf_path column (repurposed for photo storage)
    await supabase
      .from("resumes")
      .update({
        status: "done",
        adapted_text: JSON.stringify(parsed.resume),
        cover_letter: parsed.cover_letter,
        changes_log: parsed.changes,
        pdf_path: photoBase64 || null,
      })
      .eq("id", resume.id);

    return NextResponse.json({
      id: resume.id,
      resume: parsed.resume,
      cover_letter: parsed.cover_letter,
      changes: parsed.changes,
    });
  } catch (error) {
    console.error("Error adapting resume:", error);
    return NextResponse.json(
      { error: "Ошибка при адаптации резюме" },
      { status: 500 }
    );
  }
}
