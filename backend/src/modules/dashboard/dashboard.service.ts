import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class DashboardService {
  constructor(private readonly supabase: SupabaseService) {}

  async getSummary(userId: string, monthYear: string) {
    // 1. Fetch Salary Profile
    const { data: profile } = await this.supabase.getClient()
      .from('salary_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      throw new NotFoundException('Salary profile not found. Please set up your salary first.');
    }

    // 2. Fetch Deductions for the month
    let { data: deductions } = await this.supabase.getClient()
      .from('monthly_deductions')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .maybeSingle();

    // 3. Date boundaries for the month
    const startDate = new Date(`${monthYear}-01T00:00:00.000Z`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);

    // 4. Fetch Actual Incomes
    const { data: incomes } = await this.supabase.getClient()
      .from('incomes')
      .select('amount')
      .eq('user_id', userId)
      .gte('income_date', startDate.toISOString())
      .lt('income_date', endDate.toISOString());

    const actualReceivedCash = incomes?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0;

    // Expected per cutoff from the deduction snapshot
    const expectedPerCutoff = deductions ? Number(deductions.net_salary) : 0;
    const payFrequency = profile.pay_frequency || 'monthly';
    const divisor = payFrequency === 'bi-monthly' ? 2 : (payFrequency === 'weekly' ? 4 : 1);
    const expectedTotalMonth = expectedPerCutoff * divisor;
    
    // Calculate Budgets based on profile percentages applied to ACTUAL RECEIVED CASH (Option 2)
    const needsBudget = (actualReceivedCash * Number(profile.needs_percentage)) / 100;
    const wantsBudget = (actualReceivedCash * Number(profile.wants_percentage)) / 100;
    const savingsBudget = (actualReceivedCash * Number(profile.savings_percentage)) / 100;

    // 5. Fetch Expenses for the month
    
    const { data: expenses, error: expensesError } = await this.supabase.getClient()
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('expense_date', startDate.toISOString())
      .lt('expense_date', endDate.toISOString());

    if (expensesError) throw new Error(expensesError.message);

    // Aggregate Expenses by Bucket
    let needsSpent = 0;
    let wantsSpent = 0;
    let savingsSpent = 0;
    let totalSpent = 0;

    expenses.forEach((exp: any) => {
      const amt = Number(exp.amount);
      totalSpent += amt;
      if (exp.allocation_bucket === 'needs') needsSpent += amt;
      else if (exp.allocation_bucket === 'wants') wantsSpent += amt;
      else if (exp.allocation_bucket === 'savings') savingsSpent += amt;
    });

    return {
      monthYear,
      payFrequency,
      expectedPerCutoff,
      expectedTotalMonth,
      actualReceivedCash,
      totalSpent,
      allocations: {
        needs: {
          budget: needsBudget,
          spent: needsSpent,
          remaining: needsBudget - needsSpent,
          percentageUsed: needsBudget > 0 ? (needsSpent / needsBudget) * 100 : 0,
        },
        wants: {
          budget: wantsBudget,
          spent: wantsSpent,
          remaining: wantsBudget - wantsSpent,
          percentageUsed: wantsBudget > 0 ? (wantsSpent / wantsBudget) * 100 : 0,
        },
        savings: {
          budget: savingsBudget,
          spent: savingsSpent,
          remaining: savingsBudget - savingsSpent,
          percentageUsed: savingsBudget > 0 ? (savingsSpent / savingsBudget) * 100 : 0,
        },
      },
      deductions: deductions || null,
      recentExpenses: expenses.slice(0, 5),
    };
  }
}
