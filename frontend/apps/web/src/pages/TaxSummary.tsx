import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@salary-tracker/shared';
import { Card } from '../components/ui/Card';

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

export const TaxSummary = () => {
  const currentMonth = new Date().toISOString().substring(0, 7);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['salaryProfile'],
    queryFn: async () => {
      const response = await apiClient.get('/salary-profile');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="max-w-5xl mx-auto py-section px-xl"><p>Loading tax summary...</p></div>;
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto py-section px-xl text-accent-danger">
        <p>Failed to load salary profile. Please set it up first.</p>
      </div>
    );
  }

  // Find the deductions for the current month
  const currentDeductions = profile.monthly_deductions?.find((d: any) => d.month_year === currentMonth) || profile.monthly_deductions?.[0];

  return (
    <div className="max-w-5xl mx-auto py-section px-xl space-y-block">
      <header>
        <h1 className="text-display-lg font-display tracking-tight leading-[1.0] mb-xs">Tax Summary</h1>
        <p className="text-mute dark:text-on-dark-mute">Your exact deductions and net pay breakdown per cutoff.</p>
      </header>

      {currentDeductions ? (
        <Card variant="light" className="space-y-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="space-y-sm">
              <h3 className="text-heading-sm font-semibold text-mute dark:text-on-dark-mute">Gross Salary (Per Cutoff)</h3>
              <p className="text-display-md font-display tracking-tight">{formatCurrency(currentDeductions.gross_salary)}</p>
            </div>
            <div className="space-y-sm">
              <h3 className="text-heading-sm font-semibold text-on-primary/80">Net Salary (Per Cutoff)</h3>
              <p className="text-display-md font-display tracking-tight text-primary-base">{formatCurrency(currentDeductions.net_salary)}</p>
            </div>
          </div>

          <section className="space-y-md">
            <h2 className="text-heading-md font-semibold">Deductions Breakdown (Per Cutoff)</h2>
            <div className="divide-y divide-hairline-light dark:divide-hairline-dark border-t border-hairline-light dark:border-hairline-dark">
              <div className="py-md flex justify-between items-center">
                <span className="font-semibold text-ink dark:text-on-dark">Income Tax</span>
                <span className="text-accent-danger">-{formatCurrency(currentDeductions.income_tax)}</span>
              </div>
              <div className="py-md flex justify-between items-center">
                <span className="font-semibold text-ink dark:text-on-dark">SSS Contribution</span>
                <span className="text-accent-danger">-{formatCurrency(currentDeductions.sss_contribution)}</span>
              </div>
              <div className="py-md flex justify-between items-center">
                <span className="font-semibold text-ink dark:text-on-dark">PhilHealth Contribution</span>
                <span className="text-accent-danger">-{formatCurrency(currentDeductions.philhealth_contribution)}</span>
              </div>
              <div className="py-md flex justify-between items-center">
                <span className="font-semibold text-ink dark:text-on-dark">Pag-IBIG Contribution</span>
                <span className="text-accent-danger">-{formatCurrency(currentDeductions.pagibig_contribution)}</span>
              </div>
              <div className="py-md flex justify-between items-center bg-canvas-dark text-on-dark dark:bg-canvas-light dark:text-canvas-dark px-md rounded-md mt-md">
                <span className="font-semibold">Total Deductions</span>
                <span className="font-semibold">{formatCurrency(currentDeductions.total_deductions)}</span>
              </div>
            </div>
          </section>
        </Card>
      ) : (
        <p className="text-mute dark:text-on-dark-mute py-md">No deduction records found for this month.</p>
      )}
    </div>
  );
};
