"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { BankStatementData } from "../schema";
import { BankConnectionStep } from "./BankConnectionStep";
import { ReviewStep } from "./ReviewStep";
import { TransactionSelectionStep } from "./TransactionSelectionStep";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardContent } from "./ui/card";

export type ConnectionMethod = "file" | "direct" | null;

export function SNAPApplicationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [connectionMethod, setConnectionMethod] =
    useState<ConnectionMethod>(null);
  const [bankData, setBankData] = useState<BankStatementData | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  const handleStep1Complete = (
    method: ConnectionMethod,
    data: BankStatementData | null
  ) => {
    setConnectionMethod(method);
    setBankData(data);
    setError(null);
    setCurrentStep(2);
  };

  const handleStep2Complete = (selected: Set<number>) => {
    setSelectedTransactions(selected);
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Connect Bank Account",
      description: "Choose your connection method",
    },
    {
      number: 2,
      title: "Select Transactions",
      description: "Review and select transactions",
    },
    {
      number: 3,
      title: "Review & Submit",
      description: "Final review of your application",
    },
  ];

  return (
    <Card className="shadow-lg border-slate-200">
      {/* Progress Indicator */}
      <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isPending = currentStep < step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all text-base",
                      isCompleted && "bg-primary text-white shadow-md",
                      isCurrent &&
                        "bg-primary text-white shadow-lg ring-4 ring-primary/20",
                      isPending && "bg-slate-200 text-slate-600"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-3 text-center max-w-[140px]">
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        isCompleted || isCurrent
                          ? "text-primary"
                          : "text-slate-500"
                      )}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-4 transition-colors",
                      isCompleted ? "bg-primary" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <CardContent className="p-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 1 && (
          <BankConnectionStep
            onComplete={handleStep1Complete}
            onError={setError}
          />
        )}

        {currentStep === 2 && bankData && (
          <TransactionSelectionStep
            transactions={bankData.transactions}
            connectionMethod={connectionMethod}
            onComplete={handleStep2Complete}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && bankData && (
          <ReviewStep
            transactions={bankData.transactions}
            selectedIndices={selectedTransactions}
            connectionMethod={connectionMethod}
            onBack={handleBack}
          />
        )}
      </CardContent>
    </Card>
  );
}
