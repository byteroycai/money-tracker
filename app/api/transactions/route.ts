import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { TransactionDto } from "@/types/transactions";
import { TransactionType } from "@prisma/client";

const serialize = (transaction: {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  type: TransactionType;
  date: Date;
}): TransactionDto => ({
  id: transaction.id,
  amount: transaction.amount,
  category: transaction.category,
  note: transaction.note ?? "",
  type: transaction.type,
  date: transaction.date.toISOString()
});

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: "desc" }
    });
    return NextResponse.json(transactions.map(serialize));
  } catch (error) {
    console.error("Failed to load transactions", error);
    return NextResponse.json({ message: "无法获取数据" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const amount = Number(payload.amount);
    const category = String(payload.category ?? "").trim();
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const date = payload.date ? new Date(payload.date) : new Date();
    const type = payload.type as TransactionType;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "金额不合法" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ message: "类别不能为空" }, { status: 400 });
    }

    if (!Object.values(TransactionType).includes(type)) {
      return NextResponse.json({ message: "类型不正确" }, { status: 400 });
    }

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ message: "日期不正确" }, { status: 400 });
    }

    const created = await prisma.transaction.create({
      data: {
        amount,
        category,
        note,
        type,
        date
      }
    });

    return NextResponse.json(serialize(created), { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction", error);
    return NextResponse.json({ message: "无法创建记录" }, { status: 500 });
  }
}
