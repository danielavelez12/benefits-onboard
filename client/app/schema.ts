export interface PersonalFinanceCategory {
  detailed?: string;
  primary?: string;
}

export interface Location {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postal_code?: string;
  store_number?: string;
  lat?: number;
  lon?: number;
}

export interface Counterparty {
  name?: string;
  type?: string;
  logo_url?: string;
  website?: string;
  entity_id?: string;
}

export interface SnapClassification {
  final_state: string;
  income_type?: string;
  deduction_type?: string;
  category?: string;
  reason_code?: string;
  confidence?: string;
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "expense" | "income";
  merchant_name?: string;
  logo_url?: string;
  website?: string;
  payment_channel?: string;
  personal_finance_category?: PersonalFinanceCategory;
  location?: Location;
  counterparties?: Counterparty[];
  entity_id?: string;
  snap_classification?: SnapClassification;
}

export interface BankStatementData {
  transactions: Transaction[];
  totalExpenses: number;
  totalIncome: number;
  period: string;
}
