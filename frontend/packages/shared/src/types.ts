export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SalaryProfile {
  id: string;
  userId: string;
  grossSalary: number;
  employmentType: 'regular' | 'contractual' | 'self_employed';
  payFrequency: 'monthly' | 'bi-monthly' | 'weekly';
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  effectiveDate: string;
}

export type PaymentSource = 'cash' | 'gcash' | 'maya' | 'maribank' | 'gotyme';

export type ExpenseCategory = 
  | 'Food' 
  | 'Transpo' 
  | 'Internet Bill' 
  | 'Parents Allowance' 
  | 'Personal Allowance' 
  | 'Leisure Money to Spend' 
  | 'Emergency Funds' 
  | 'Travel Fund' 
  | 'Savings';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory | string; // Fallback to string for older records
  allocationBucket: 'needs' | 'wants' | 'savings';
  description?: string;
  expenseDate: string;
  receiptUrl?: string;
  paymentSource?: PaymentSource; // Optional for older records, but newly created will have it
}

export interface MonthlyDeductions {
  month: string;
  grossSalary: number;
  sssContribution: number;
  pagibigContribution: number;
  philhealthContribution: number;
  incomeTax: number;
  netSalary: number;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  incomeDate: string;
}
