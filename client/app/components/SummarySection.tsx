import type { BankStatementData } from "../schema";

interface SummarySectionProps {
  data: BankStatementData;
}

export function SummarySection({ data }: SummarySectionProps) {
  const net = data.totalIncome - data.totalExpenses;

  return (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
        Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Total Income
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${data.totalIncome.toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Total Expenses
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${data.totalExpenses.toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Net</div>
          <div
            className={`text-2xl font-bold ${
              net >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            ${net.toFixed(2)}
          </div>
        </div>
      </div>
      {data.period && (
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Period: {data.period}
        </div>
      )}
    </div>
  );
}
