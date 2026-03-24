import { NextRequest, NextResponse } from "next/server";

// POST /api/payment — create payment via YooKassa
export async function POST(req: NextRequest) {
  try {
    const { amount, description } = await req.json();

    // TODO: integrate YooKassa API
    return NextResponse.json(
      { error: "Платежи пока не подключены" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Ошибка при создании платежа" },
      { status: 500 }
    );
  }
}
