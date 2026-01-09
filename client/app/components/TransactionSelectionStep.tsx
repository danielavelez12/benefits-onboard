"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckSquare, Square } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Transaction } from "../schema";
import type { ConnectionMethod } from "./SNAPApplicationWizard";
import { SnapClassificationIcon } from "./SnapClassificationIcon";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface TransactionSelectionStepProps {
  transactions: Transaction[];
  connectionMethod: ConnectionMethod;
  onComplete: (selected: Set<number>) => void;
  onBack: () => void;
}

export function TransactionSelectionStep({
  transactions,
  connectionMethod,
  onComplete,
  onBack,
}: TransactionSelectionStepProps) {
  // Auto-select transactions that are COUNTABLE_INCOME or COUNTABLE_DEDUCTION
  const initialSelected = useMemo(() => {
    const autoSelected = new Set<number>();
    transactions.forEach((transaction, index) => {
      if (
        transaction.snap_classification?.final_state === "COUNTABLE_INCOME" ||
        transaction.snap_classification?.final_state === "COUNTABLE_DEDUCTION"
      ) {
        autoSelected.add(index);
      }
    });
    return autoSelected;
  }, [transactions]);

  const [selected, setSelected] = useState<Set<number>>(initialSelected);

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    setSelected(new Set(transactions.map((_, index) => index)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const selectedTransactions = transactions.filter((_, index) =>
    selected.has(index)
  );
  const totalIncome = selectedTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = selectedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const allSelected =
    selected.size === transactions.length && transactions.length > 0;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Step 2: Select Transactions for SNAP Application
        </h2>
        <p className="text-slate-600 text-lg">
          Review your transactions and select which ones to include in your SNAP
          application. Transactions marked as COUNTABLE INCOME or COUNTABLE
          EXPENSE have been pre-selected.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-slate-600 mb-1">
                Selected Transactions
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {selected.size}{" "}
                <span className="text-lg font-normal text-slate-500">
                  of {transactions.length}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 mb-1">
                Total Income
              </div>
              <div className="text-2xl font-bold text-green-600">
                ${totalIncome.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-600 mb-1">
                Total Expenses
              </div>
              <div className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button onClick={selectAll} variant="outline" size="sm">
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All
          </Button>
          <Button onClick={deselectAll} variant="outline" size="sm">
            <Square className="h-4 w-4 mr-2" />
            Deselect All
          </Button>
        </div>
        <Badge variant="secondary" className="text-sm">
          {selected.size} transaction{selected.size !== 1 ? "s" : ""} selected
        </Badge>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) =>
                        checked ? selectAll() : deselectAll()
                      }
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  {connectionMethod === "direct" && (
                    <>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Category</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="min-w-[240px] whitespace-nowrap">
                    SNAP Classification
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => (
                  <TableRow
                    key={index}
                    className={cn(
                      "cursor-pointer",
                      selected.has(index) && "bg-primary/5"
                    )}
                    onClick={() => toggleSelection(index)}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(index)}
                        onCheckedChange={() => toggleSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.date}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    {connectionMethod === "direct" && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.logo_url && (
                              <Image
                                src={transaction.logo_url}
                                alt={transaction.merchant_name || ""}
                                width={20}
                                height={20}
                                className="rounded"
                                unoptimized
                              />
                            )}
                            <span>{transaction.merchant_name || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.personal_finance_category?.primary ||
                              "-"}
                          </Badge>
                        </TableCell>
                      </>
                    )}
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <SnapClassificationIcon
                        state={transaction.snap_classification?.final_state}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onComplete(selected)}
          disabled={selected.size === 0}
          size="lg"
        >
          Continue to Review ({selected.size} selected)
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
