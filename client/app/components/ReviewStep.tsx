"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, FileCheck } from "lucide-react";
import Image from "next/image";
import type { Transaction } from "../schema";
import type { ConnectionMethod } from "./SNAPApplicationWizard";
import { SnapClassificationIcon } from "./SnapClassificationIcon";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface ReviewStepProps {
  transactions: Transaction[];
  selectedIndices: Set<number>;
  connectionMethod: ConnectionMethod;
  onBack: () => void;
}

export function ReviewStep({
  transactions,
  selectedIndices,
  connectionMethod,
  onBack,
}: ReviewStepProps) {
  const selectedTransactions = transactions.filter((_, index) =>
    selectedIndices.has(index)
  );

  const countableIncome = selectedTransactions
    .filter(
      (t) =>
        t.type === "income" &&
        t.snap_classification?.final_state === "COUNTABLE_INCOME"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const countableExpenses = selectedTransactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.snap_classification?.final_state === "COUNTABLE_DEDUCTION"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = countableIncome - countableExpenses;

  const handleSubmit = () => {
    // In a real application, this would submit to the backend
    alert(
      `Application submitted successfully!\n\nSelected ${
        selectedTransactions.length
      } transactions.\nTotal Countable Income: $${countableIncome.toFixed(
        2
      )}\nTotal Countable Expenses: $${countableExpenses.toFixed(2)}`
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Step 3: Review Your SNAP Application
        </h2>
        <p className="text-slate-600 text-lg">
          Please review the transactions you&apos;ve selected for your SNAP
          application. Once you submit, your application will be processed.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Total Transactions
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {selectedTransactions.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Countable Income
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${countableIncome.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Countable Expenses
            </div>
            <div className="text-3xl font-bold text-blue-600">
              ${countableExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            "border-2",
            netAmount >= 0
              ? "border-green-200 bg-green-50/50"
              : "border-red-200 bg-red-50/50"
          )}
        >
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600 mb-1">
              Net Amount
            </div>
            <div
              className={cn(
                "text-3xl font-bold",
                netAmount >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              ${netAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Review */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            Selected Transactions ({selectedTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                {selectedTransactions.map((transaction, index) => (
                  <TableRow key={index}>
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

      {/* Important Notice */}
      <Alert variant="warning" className="mb-8 bg-yellow-50">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-base font-semibold text-slate-900">
          Important Information
        </AlertTitle>
        <AlertDescription className="text-sm text-slate-800 leading-relaxed mt-2">
          By submitting this application, you certify that the information
          provided is accurate and complete. False statements may result in
          penalties. Your application will be reviewed by NYC Human Resources
          Administration.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" size="lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          size="lg"
          className="!bg-green-600 !hover:bg-green-700 !active:bg-green-800 text-white shadow-sm hover:shadow"
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Submit Application
        </Button>
      </div>
    </div>
  );
}
