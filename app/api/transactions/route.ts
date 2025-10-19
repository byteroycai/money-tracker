import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  TRANSACTION_TYPES,
  type TransactionDto,
  type TransactionType
} from "@/types/transactions";

const TRANSACTION_TYPE_VALUES = new Set<string>(TRANSACTION_TYPES);

const serialize = (transaction: {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  type: string;
  date: Date;
}): TransactionDto => ({
  id: transaction.id,
  amount: transaction.amount,
  category: transaction.category,
  note: transaction.note ?? "",
  type: TRANSACTION_TYPE_VALUES.has(transaction.type)
    ? (transaction.type as TransactionType)
    : "EXPENSE",
  date: transaction.date.toISOString()
});

const isTransactionType = (value: unknown): value is TransactionType =>
  typeof value === "string" && TRANSACTION_TYPE_VALUES.has(value);

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
    const type = payload.type;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "金额不合法" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ message: "类别不能为空" }, { status: 400 });
    }

    if (!isTransactionType(type)) {
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
