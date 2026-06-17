import { NextRequest, NextResponse } from "next/server";
import { generateResumeDocx } from "@/lib/docx-generator";
import type { ResumeData } from "@/lib/pdf-generator";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { canDownloadResume, hasActivePass } from "@/lib/access";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();

    const resumeId: string | undefined = body.resumeId;
    const allowed = resumeId
      ? await canDownloadResume(resumeId, user.id)
      : await hasActivePass(user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: "payment_required", code: "PAYWALL", resumeId: resumeId ?? null },
        { status: 402 }
      );
    }

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
