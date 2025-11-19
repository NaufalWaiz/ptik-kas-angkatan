export interface DashboardSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
}

export interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionsResponse {
  status: string;
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_page: number;
  };
}

export interface DashboardResponse {
  status: string;
  data: DashboardSummary;
}

export interface MutationResponse {
  status: string;
  data: {
    message: string;
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}
