import TransactionsDashboard from "@/components/transactions-dashboard";
import { prisma } from "@/lib/prisma";
import type { Totals, TransactionDto } from "@/types/transactions";

async function getInitialData(): Promise<{
  transactions: TransactionDto[];
  totals: Totals;
}> {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" }
  });

  const formattedTransactions: TransactionDto[] = transactions.map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount,
    category: transaction.category,
    note: transaction.note ?? "",
    type: transaction.type,
    date: transaction.date.toISOString()
  }));

  const totals = formattedTransactions.reduce<Totals>(
    (acc, transaction) => {
      if (transaction.type === "INCOME") {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  return { transactions: formattedTransactions, totals };
}

export default async function Home() {
  const { transactions, totals } = await getInitialData();

  return <TransactionsDashboard initialTransactions={transactions} initialTotals={totals} />;
}
