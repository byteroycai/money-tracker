"use client";

import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { TransactionDto } from "@/types/transactions";

ChartJS.register(ArcElement, Tooltip, Legend);

const palette = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#d946ef"
];

export function CategoryChart({ transactions }: { transactions: TransactionDto[] }) {
  const chartData = useMemo(() => {
    const expenseGroups = transactions
      .filter((transaction) => transaction.type === "EXPENSE")
      .reduce<Record<string, number>>((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] ?? 0) + transaction.amount;
        return acc;
      }, {});

    const labels = Object.keys(expenseGroups);
    const data = Object.values(expenseGroups);

    return {
      labels,
      datasets: [
        {
          label: "Expense by category",
          data,
          backgroundColor: labels.map((_, index) => palette[index % palette.length]),
          borderColor: "transparent"
        }
      ]
    };
  }, [transactions]);

  if (!chartData.labels.length) {
    return <p className="text-sm text-slate-500">Add some expenses to see the category breakdown.</p>;
  }

  return (
    <Doughnut
      data={chartData}
      options={{
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgb(148 163 184)"
            }
          }
        }
      }}
    />
  );
}
