export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
}

export interface BankStatementData {
  transactions: Transaction[];
  totalExpenses: number;
  totalIncome: number;
  period: string;
}
