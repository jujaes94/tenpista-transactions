export interface TransactionStatus {
  id: number;
  name: string;
  description: string;
}

export interface Transaction {
  id: number;
  amount: number;
  merchant: string;
  description?: string;
  userName: string;
  transactionDate: string;
  status?: TransactionStatus;
}

export interface CreateTransactionDTO {
  amount: number;
  merchant: string;
  description?: string;
  userName?: string;
}

export interface UpdateTransactionDTO {
  amount: number;
  merchant: string;
  description?: string;
  userName?: string;
}
