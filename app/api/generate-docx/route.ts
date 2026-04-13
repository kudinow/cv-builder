import { NextRequest, NextResponse } from "next/server";
import { generateResumeDocx } from "@/lib/docx-generator";
import type { ResumeData } from "@/lib/pdf-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.resumeData) {
      return NextResponse.json(
        { error: "Необходимо передать resumeData" },
        { status: 400 }
      );
    }

    const data = body.resumeData as ResumeData;
    const buffer = await generateResumeDocx(data);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          data.full_name || "resume"
        )}.docx"`,
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации DOCX" },
      { status: 500 }
    );
  }
}
