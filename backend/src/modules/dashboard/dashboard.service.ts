import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, monthYear: string) {
    // 1. Fetch Salary Profile
    const profile = await this.prisma.salaryProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Salary profile not found. Please set up your salary first.');
    }

    // 2. Fetch Deductions for the month
    let deductions = await this.prisma.monthlyDeduction.findUnique({
      where: {
        userId_monthYear: { userId, monthYear },
      },
    });

    // If no deductions found for this specific month, we could either return 0 or fall back to the most recent one if we assume salary is static, but for MVP let's just return 0s if not found
    const netSalary = deductions ? Number(deductions.netSalary) : 0;
    const grossSalary = deductions ? Number(deductions.grossSalary) : Number(profile.grossSalary);
    
    // Calculate Budgets based on profile percentages applied to Net Salary
    const needsBudget = (netSalary * Number(profile.needsPercentage)) / 100;
    const wantsBudget = (netSalary * Number(profile.wantsPercentage)) / 100;
    const savingsBudget = (netSalary * Number(profile.savingsPercentage)) / 100;

    // 3. Fetch Expenses for the month
    const startDate = new Date(`${monthYear}-01T00:00:00.000Z`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Aggregate Expenses by Bucket
    let needsSpent = 0;
    let wantsSpent = 0;
    let savingsSpent = 0;
    let totalSpent = 0;

    expenses.forEach((exp) => {
      const amt = Number(exp.amount);
      totalSpent += amt;
      if (exp.allocationBucket === 'NEEDS') needsSpent += amt;
      else if (exp.allocationBucket === 'WANTS') wantsSpent += amt;
      else if (exp.allocationBucket === 'SAVINGS') savingsSpent += amt;
    });

    return {
      monthYear,
      grossSalary,
      netSalary,
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
      recentExpenses: expenses.slice(0, 5), // top 5 recent (assuming we want to sort, let's sort them above)
    };
  }
}

