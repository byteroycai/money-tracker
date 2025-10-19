export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionDto {
  id: number;
  amount: number;
  category: string;
  note: string;
  type: TransactionType;
  date: string;
}

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}
