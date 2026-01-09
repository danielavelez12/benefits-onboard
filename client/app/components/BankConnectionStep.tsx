"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Lock, Upload } from "lucide-react";
import { useState } from "react";
import type { BankStatementData } from "../schema";
import type { ConnectionMethod } from "./SNAPApplicationWizard";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface BankConnectionStepProps {
  onComplete: (
    method: ConnectionMethod,
    data: BankStatementData | null
  ) => void;
  onError: (error: string) => void;
}

export function BankConnectionStep({
  onComplete,
  onError,
}: BankConnectionStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<ConnectionMethod>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedMethod("file");
    }
  };

  const handleDirectConnection = () => {
    setSelectedMethod("direct");
    setFile(null);
  };

  const handleFileUpload = async () => {
    if (!file) {
      onError("Please select a file");
      return;
    }

    setUploading(true);
    onError("");

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
      onComplete("file", data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleDirectConnectionSubmit = async () => {
    setUploading(true);
    onError("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/enrich-transactions",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Connection failed");
      }

      const data = await response.json();
      onComplete("direct", data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (selectedMethod === "file") {
      handleFileUpload();
    } else if (selectedMethod === "direct") {
      handleDirectConnectionSubmit();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Step 1: Connect Your Bank Account
        </h2>
        <p className="text-slate-600 text-lg">
          Choose how you would like to provide your bank transaction information
          for your SNAP application.
        </p>
      </div>

      <RadioGroup
        value={selectedMethod || undefined}
        onValueChange={(value) => {
          if (value === "direct") handleDirectConnection();
          else if (value === "file")
            document.getElementById("file-input")?.click();
        }}
        className="space-y-4 mb-8"
      >
        {/* Direct Bank Connection Option */}
        <div>
          <Label
            htmlFor="direct"
            className={cn(
              "flex cursor-pointer rounded-lg border-2 p-6 transition-all hover:border-primary/50",
              selectedMethod === "direct"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-slate-300 bg-white"
            )}
          >
            <div className="flex items-start gap-4 w-full">
              <RadioGroupItem value="direct" id="direct" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Direct Bank Connection
                  </h3>
                </div>
                <p className="text-slate-600 mb-3">
                  Securely connect your bank account through our partner. Your
                  transactions will be automatically imported and categorized.
                </p>
                <div className="flex items-center text-sm text-slate-500 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Bank-level security encryption
                </div>
              </div>
            </div>
          </Label>
        </div>

        {/* File Upload Option */}
        <div>
          <Label
            htmlFor="file"
            className={cn(
              "flex cursor-pointer rounded-lg border-2 p-6 transition-all hover:border-primary/50",
              selectedMethod === "file"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-slate-300 bg-white"
            )}
          >
            <div className="flex items-start gap-4 w-full">
              <RadioGroupItem value="file" id="file" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-slate-900">
                    Upload Bank Statement
                  </h3>
                </div>
                <p className="text-slate-600 mb-3">
                  Upload a PDF or image of your bank statement. We&apos;ll
                  extract and process your transactions.
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-md text-sm text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedMethod || uploading}
          size="lg"
          className="min-w-[140px]"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>

      {/* Loading Dialog */}
      <Dialog open={uploading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing Bank Statement</DialogTitle>
            <DialogDescription>
              {selectedMethod === "file"
                ? "Analyzing your bank statement and extracting transactions. This may take a minute..."
                : "Connecting to your bank and importing transactions..."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <Progress value={60} className="w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
