import Image from "next/image";
import type { Transaction } from "../schema";

interface TransactionsTableProps {
  transactions: Transaction[];
  autoClassify: boolean;
}

export function TransactionsTable({
  transactions,
  autoClassify,
}: TransactionsTableProps) {
  return (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
        Transactions ({transactions.length})
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                Date
              </th>
              <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                Description
              </th>
              {autoClassify && (
                <>
                  <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                    Merchant
                  </th>
                  <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                    Category
                  </th>
                  <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                    Payment Channel
                  </th>
                  <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                    Location
                  </th>
                </>
              )}
              <th className="text-right py-2 px-4 text-zinc-700 dark:text-zinc-300">
                Amount
              </th>
              <th className="text-center py-2 px-4 text-zinc-700 dark:text-zinc-300">
                Type
              </th>
              <th className="text-left py-2 px-4 text-zinc-700 dark:text-zinc-300">
                SNAP Classification
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">
                  {transaction.date}
                </td>
                <td className="py-2 px-4 text-zinc-900 dark:text-zinc-100">
                  {transaction.description}
                </td>
                {autoClassify && (
                  <>
                    <td className="py-2 px-4 text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        {transaction.logo_url && (
                          <Image
                            src={transaction.logo_url}
                            alt={transaction.merchant_name || ""}
                            width={24}
                            height={24}
                            className="rounded"
                            unoptimized
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {transaction.merchant_name || "-"}
                          </div>
                          {transaction.website && (
                            <a
                              href={`https://${transaction.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {transaction.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">
                      {transaction.personal_finance_category ? (
                        <div>
                          <div className="font-medium">
                            {transaction.personal_finance_category.primary ||
                              "-"}
                          </div>
                          {transaction.personal_finance_category.detailed && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-500">
                              {transaction.personal_finance_category.detailed}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">
                      {transaction.payment_channel || "-"}
                    </td>
                    <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">
                      {transaction.location ? (
                        <div>
                          {transaction.location.city &&
                          transaction.location.region ? (
                            <div>
                              {transaction.location.city},{" "}
                              {transaction.location.region}
                            </div>
                          ) : transaction.location.city ? (
                            <div>{transaction.location.city}</div>
                          ) : transaction.location.region ? (
                            <div>{transaction.location.region}</div>
                          ) : (
                            "-"
                          )}
                          {transaction.location.address && (
                            <div className="text-xs text-zinc-500 dark:text-zinc-500">
                              {transaction.location.address}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </>
                )}
                <td
                  className={`py-2 px-4 text-right font-medium ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td className="py-2 px-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      transaction.type === "income"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="py-2 px-4 text-zinc-600 dark:text-zinc-400">
                  <SnapClassificationCell
                    classification={transaction.snap_classification}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SnapClassificationCell({
  classification,
}: {
  classification?: { final_state: string };
}) {
  if (!classification) {
    return <span>N/A</span>;
  }

  const state = classification.final_state;

  if (state === "COUNTABLE_INCOME") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 dark:bg-green-400 shrink-0">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
        <span className="text-green-600 dark:text-green-400 font-bold">
          COUNTABLE INCOME
        </span>
      </div>
    );
  }

  if (state === "COUNTABLE_DEDUCTION") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-bold">
          COUNTABLE EXPENSE
        </span>
      </div>
    );
  }

  if (state === "FLAG_FOR_REVIEW") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-600 dark:bg-yellow-400 text-white text-xs font-bold shrink-0">
          !
        </span>
        <span className="text-yellow-600 dark:text-yellow-400 font-bold">
          FLAG FOR REVIEW
        </span>
      </div>
    );
  }

  return <span>N/A</span>;
}
