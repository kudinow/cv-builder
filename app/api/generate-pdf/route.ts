import { NextRequest, NextResponse } from "next/server";
import { generateResumePDF, type ResumeData } from "@/lib/pdf-generator";
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

    // Paywall: скачивание разрешено для разблокированного резюме или активного доступа.
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

    // Accept either structured ResumeData or plain text
    if (body.resumeData) {
      const data = body.resumeData as ResumeData;
      const pdfBuffer = await generateResumePDF(data, body.photoBase64 || undefined);

      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(data.full_name || "resume")}.pdf"`,
        },
      });
    }

    // Plain text mode — create a simple resume structure
    if (body.text && body.name) {
      const simpleData: ResumeData = {
        full_name: body.name,
        target_position: body.position || "",
        contacts: {},
        about_me: "",
        skills: {},
        experience: [],
        education: [],
        certificates: [],
        languages: [],
      };

      // Try to parse adapted text into a basic structure
      simpleData.about_me = body.text;

      const pdfBuffer = await generateResumePDF(simpleData);

      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(body.name || "resume")}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: "Необходимо передать resumeData или text + name" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации PDF" },
      { status: 500 }
    );
  }
}
