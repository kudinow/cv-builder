import { NextRequest, NextResponse } from "next/server";
import { generateResumePDF, type ResumeData } from "@/lib/pdf-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
