import { AlertTriangle, CheckCircle2, Minus, X } from "lucide-react";
import { Badge } from "./ui/badge";

interface SnapClassificationIconProps {
  state?: string;
}

export function SnapClassificationIcon({ state }: SnapClassificationIconProps) {
  if (!state) {
    return (
      <Badge variant="outline" className="gap-2">
        <X className="h-3 w-3" />
        N/A
      </Badge>
    );
  }

  if (state === "COUNTABLE_INCOME") {
    return (
      <Badge variant="success" className="gap-2">
        <CheckCircle2 className="h-3.5 w-3.5" />
        COUNTABLE INCOME
      </Badge>
    );
  }

  if (state === "COUNTABLE_DEDUCTION") {
    return (
      <Badge
        variant="secondary"
        className="gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200"
      >
        <Minus className="h-3.5 w-3.5" />
        COUNTABLE EXPENSE
      </Badge>
    );
  }

  if (state === "FLAG_FOR_REVIEW") {
    return (
      <Badge variant="warning" className="gap-2">
        <AlertTriangle className="h-3.5 w-3.5" />
        FLAG FOR REVIEW
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-2">
      <X className="h-3 w-3" />
      N/A
    </Badge>
  );
}
