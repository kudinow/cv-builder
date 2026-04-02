import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("cover_letters")
      .select("id, title, vacancy_url, vacancy_text, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cover letters:", error);
      return NextResponse.json(
        { error: "Ошибка при загрузке писем" },
        { status: 500 }
      );
    }

    return NextResponse.json({ coverLetters: data ?? [] });
  } catch (error) {
    console.error("Error in cover letters list:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
