"use client";

import { useState } from "react";
import type { BankStatementData } from "./schema";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BankStatementData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:8000/api/upload-bank-statement",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between py-16 px-8 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <h1 className="text-3xl font-semibold mb-8 text-black dark:text-zinc-50">
            Bank Statement Upload
          </h1>

          {/* Upload Section */}
          <div className="mb-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Select Bank Statement (PDF or Image)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-zinc-100 file:text-zinc-700
                  hover:file:bg-zinc-200
                  dark:file:bg-zinc-800 dark:file:text-zinc-300"
              />
            </div>

            {file && (
              <div className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Selected: {file.name}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {uploading ? "Processing..." : "Upload & Process"}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="w-full space-y-6">
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
                      ${result.totalIncome.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      Total Expenses
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${result.totalExpenses.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      Net
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        result.totalIncome - result.totalExpenses >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ${(result.totalIncome - result.totalExpenses).toFixed(2)}
                    </div>
                  </div>
                </div>
                {result.period && (
                  <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Period: {result.period}
                  </div>
                )}
              </div>

              <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
                  Transactions ({result.transactions.length})
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
                        <th className="text-right py-2 px-4 text-zinc-700 dark:text-zinc-300">
                          Amount
                        </th>
                        <th className="text-center py-2 px-4 text-zinc-700 dark:text-zinc-300">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.transactions.map((transaction, index) => (
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
                          <td
                            className={`py-2 px-4 text-right font-medium ${
                              transaction.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
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
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
