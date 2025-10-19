export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

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
