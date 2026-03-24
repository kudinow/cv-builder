import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "PDF файл обязателен" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // pdf-parse v1 tries to read a test file on import — create it to avoid crash
    const testDir = join(process.cwd(), "test", "data");
    try {
      const { mkdirSync, writeFileSync, existsSync } = await import("fs");
      if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true });
        writeFileSync(join(testDir, "05-versions-space.pdf"), "");
      }
    } catch {
      // ignore
    }

    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Не удалось извлечь текст из PDF. Возможно, файл содержит только изображения.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: data.text.trim(),
      pages: data.numpages,
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return NextResponse.json(
      { error: "Ошибка при обработке PDF" },
      { status: 500 }
    );
  }
}
