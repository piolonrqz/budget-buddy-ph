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

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  allocationBucket: 'needs' | 'wants' | 'savings';
  description?: string;
  expenseDate: string;
  receiptUrl?: string;
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
