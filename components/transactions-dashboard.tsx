"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "@/components/theme-toggle";
import { CategoryChart } from "@/components/category-chart";
import type { Totals, TransactionDto, TransactionType } from "@/types/transactions";

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY"
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const createDefaultForm = (): FormState => ({
  amount: "",
  category: "",
  note: "",
  date: new Date().toISOString().split("T")[0],
  type: "EXPENSE"
});

type FormState = {
  amount: string;
  category: string;
  note: string;
  date: string;
  type: TransactionType;
};

const calculateTotals = (transactions: TransactionDto[]): Totals => {
  return transactions.reduce<Totals>(
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
};

interface TransactionsDashboardProps {
  initialTransactions: TransactionDto[];
  initialTotals: Totals;
}

export default function TransactionsDashboard({
  initialTransactions,
  initialTotals
}: TransactionsDashboardProps) {
  const [transactions, setTransactions] = useState<TransactionDto[]>(initialTransactions);
  const [totals, setTotals] = useState<Totals>(initialTotals);
  const [form, setForm] = useState<FormState>(() => createDefaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setForm(createDefaultForm());
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("请输入大于 0 的金额");
      return;
    }

    if (!form.category.trim()) {
      setError("请输入类别");
      return;
    }

    if (!form.date) {
      setError("请选择日期");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          category: form.category.trim(),
          note: form.note.trim(),
          date: form.date,
          type: form.type
        })
      });

      if (!response.ok) {
        throw new Error("保存失败，请稍后重试");
      }

      const created: TransactionDto = await response.json();
      const nextTransactions = [created, ...transactions];
      setTransactions(nextTransactions);
      setTotals(calculateTotals(nextTransactions));
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "未知错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("删除失败，请稍后重试");
      }

      const nextTransactions = transactions.filter((transaction) => transaction.id !== id);
      setTransactions(nextTransactions);
      setTotals(calculateTotals(nextTransactions));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "未知错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  const summary = useMemo(
    () => [
      { label: "总收入", value: totals.income, accent: "text-income" },
      { label: "总支出", value: totals.expense, accent: "text-expense" },
      { label: "结余", value: totals.balance, accent: totals.balance >= 0 ? "text-income" : "text-expense" }
    ],
    [totals]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">个人记账</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">添加、查看和管理你的收支记录。</p>
        </div>
        <ThemeToggle />
      </div>

      <motion.section
        layout
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {summary.map((item) => (
          <motion.div
            key={item.label}
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white p-6 shadow-soft transition-colors dark:bg-slate-900"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${item.accent}`}>
              {currencyFormatter.format(item.value)}
            </p>
          </motion.div>
        ))}
      </motion.section>

      <motion.section
        layout
        className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">添加新记录</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">支持收入与支出，金额将自动汇总。</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="amount">
              金额
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="category">
              类别
            </label>
            <input
              id="category"
              type="text"
              required
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-1">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">类型</span>
            <div className="mt-2 flex items-center gap-3">
              {(
                [
                  { label: "支出", value: "EXPENSE" },
                  { label: "收入", value: "INCOME" }
                ] satisfies { label: string; value: TransactionType }[]
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    form.type === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200"
                      : "border-slate-200 text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:text-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={form.type === option.value}
                    onChange={() => setForm((prev) => ({ ...prev, type: option.value }))}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="date">
              日期
            </label>
            <input
              id="date"
              type="date"
              required
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="note">
              备注
            </label>
            <textarea
              id="note"
              rows={2}
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              placeholder="可选"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-500"
            />
          </div>

          {error ? (
            <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-700 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="sm:col-span-2 flex justify-end">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "处理中..." : "添加记录"}
            </motion.button>
          </div>
        </form>
      </motion.section>

      <motion.section
        layout
        className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">收支记录</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hover 查看高亮，支持删除操作。</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 shadow-inner dark:border-slate-800">
          {transactions.length ? (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-3">日期</th>
                  <th className="px-6 py-3">类别</th>
                  <th className="px-6 py-3">备注</th>
                  <th className="px-6 py-3 text-right">金额</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900">
                <AnimatePresence initial={false}>
                  {transactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {dateFormatter.format(new Date(transaction.date))}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {transaction.note || "-"}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-base font-semibold ${
                          transaction.type === "INCOME" ? "text-income" : "text-expense"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {currencyFormatter.format(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(transaction.id)}
                          disabled={isSubmitting}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 transition-colors hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600/60 dark:text-red-300 dark:hover:bg-red-500/10"
                        >
                          删除
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center px-6 py-12 text-sm text-slate-500 dark:text-slate-400">
              暂无记录，快来添加第一笔吧！
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        layout
        className="rounded-2xl bg-white p-6 shadow-soft dark:bg-slate-900"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">支出类别占比</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">快速了解你的资金流向。</p>
        <div className="mt-6">
          <CategoryChart transactions={transactions} />
        </div>
      </motion.section>
    </div>
  );
}
