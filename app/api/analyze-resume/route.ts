import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

const ANALYZE_PROMPT = `Проанализируй текст резюме и извлеки список всех мест работы (позиций).

Для каждой позиции верни:
- company: название компании
- position: должность
- period: период работы (если есть)
- summary: краткое описание в 1 предложение (чем занимался)

Ответь СТРОГО в JSON без пояснений. Начни с { и закончи }.

{
  "positions": [
    {
      "company": "Яндекс",
      "position": "Руководитель отдела маркетинга",
      "period": "2022 — 2024",
      "summary": "Управлял performance-каналами и командой из 6 человек"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: "Текст резюме обязателен" },
        { status: 400 }
      );
    }

    const result = await callOpenRouter({
      systemPrompt: ANALYZE_PROMPT,
      userMessage: resumeText,
      maxTokens: 2048,
    });

    // Extract JSON
    const braceStart = result.indexOf("{");
    const braceEnd = result.lastIndexOf("}");
    if (braceStart === -1 || braceEnd <= braceStart) {
      return NextResponse.json({ positions: [] });
    }

    let jsonStr = result.slice(braceStart, braceEnd + 1);
    // Fix unescaped newlines in strings
    jsonStr = jsonStr.replace(
      /"(?:[^"\\]|\\.)*"/g,
      (match) =>
        match
          .replace(/(?<!\\)\n/g, "\\n")
          .replace(/(?<!\\)\r/g, "\\r")
          .replace(/(?<!\\)\t/g, "\\t")
    );

    const parsed = JSON.parse(jsonStr);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json({ positions: [] });
  }
}
