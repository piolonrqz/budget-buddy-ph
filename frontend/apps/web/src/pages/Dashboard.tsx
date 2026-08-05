import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@salary-tracker/shared';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

export const Dashboard = () => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const queryClient = useQueryClient();
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDescription, setIncomeDescription] = useState('Cutoff Salary');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary', currentMonth],
    queryFn: async () => {
      const response = await apiClient.get(`/dashboard/summary?month=${currentMonth}`);
      return response.data;
    },
  });

  const incomeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/incomes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setIsIncomeModalOpen(false);
    },
  });

  if (isLoading) {
    return <div className="max-w-5xl mx-auto py-section px-xl"><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-section px-xl text-accent-danger">
        <p>Failed to load dashboard. Have you set up your salary profile?</p>
      </div>
    );
  }



  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    incomeMutation.mutate({
      amount: Number(incomeAmount),
      description: incomeDescription,
      incomeDate: new Date().toISOString()
    });
  };

  const { allocations, recentExpenses, expectedPerCutoff, actualReceivedCash, expectedTotalMonth, payFrequency, totalSpent } = data;

  const handleOpenIncomeModal = () => {
    setIncomeAmount(expectedPerCutoff.toString());
    setIsIncomeModalOpen(true);
  };

  let healthMessage = "Log your income to see your financial health.";
  let healthColor = "bg-surface-soft text-mute border-hairline-light dark:bg-surface-elevated dark:text-on-dark-mute dark:border-hairline-dark";

  if (actualReceivedCash > 0) {
    const spentRatio = totalSpent / actualReceivedCash;
    if (spentRatio >= 1) {
      healthMessage = "Critical: You have overspent your available cash!";
      healthColor = "bg-accent-danger/10 text-accent-danger border-accent-danger/30";
    } else if (spentRatio >= 0.8) {
      healthMessage = "Warning: You've spent over 80% of your available cash.";
      healthColor = "bg-accent-warning/10 text-accent-warning border-accent-warning/30";
    } else {
      healthMessage = "Great: Your spending is well on track!";
      healthColor = "bg-accent-light-green/10 text-accent-light-green border-accent-light-green/30 dark:text-accent-light-green";
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-section px-xl space-y-block">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <h1 className="text-display-xl font-display tracking-tight leading-[1.0] mb-xs">Overview</h1>
          <p className="text-body-lg text-mute dark:text-on-dark-mute">
            Actual Cash: <span className="font-semibold text-ink dark:text-on-dark">{formatCurrency(actualReceivedCash)}</span>
            <span className="text-sm"> (out of {formatCurrency(expectedTotalMonth)} expected)</span>
          </p>
        </div>
        <div className="flex gap-sm">
          <Button variant="outline-dark" size="sm" onClick={handleOpenIncomeModal}>Receive Salary</Button>
          <Button variant="dark" size="sm">Add Expense</Button>
        </div>
      </header>

      {/* Financial Health Banner */}
      <div className={`px-lg py-md rounded-lg border flex items-center gap-sm ${healthColor}`}>
        <div className="w-2 h-2 rounded-full bg-current"></div>
        <p className="text-sm font-medium">{healthMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
        <Card variant="light" className="space-y-sm">
          <h3 className="text-heading-sm font-semibold text-mute dark:text-on-dark-mute">Needs</h3>
          <p className="text-display-md font-display tracking-tight">{formatCurrency(allocations?.needs?.budget || 0)}</p>
          <p className={`text-sm ${allocations?.needs?.remaining < 0 ? 'text-accent-danger' : 'text-accent-light-green'}`}>
            {formatCurrency(allocations?.needs?.remaining || 0)} remaining
          </p>
        </Card>
        <Card variant="light" className="space-y-sm">
          <h3 className="text-heading-sm font-semibold text-mute dark:text-on-dark-mute">Wants</h3>
          <p className="text-display-md font-display tracking-tight">{formatCurrency(allocations?.wants?.budget || 0)}</p>
          <p className={`text-sm ${allocations?.wants?.remaining < 0 ? 'text-accent-danger' : 'text-accent-warning'}`}>
            {formatCurrency(allocations?.wants?.remaining || 0)} remaining
          </p>
        </Card>
        <Card variant="plan-featured" className="space-y-sm">
          <h3 className="text-heading-sm font-semibold text-on-primary/80">Savings</h3>
          <p className="text-display-md font-display tracking-tight">{formatCurrency(allocations?.savings?.budget || 0)}</p>
          <p className="text-sm text-on-primary/90">
            {formatCurrency(allocations?.savings?.spent || 0)} saved
          </p>
        </Card>
      </div>

      <section className="space-y-xl">
        <h2 className="text-heading-lg font-display tracking-tight">Recent Expenses</h2>
        <Card variant="light">
          <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
            {recentExpenses?.length > 0 ? (
              recentExpenses.map((expense: any) => (
                <div key={expense.id} className="py-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{expense.category}</p>
                    <p className="text-sm text-mute dark:text-on-dark-mute capitalize">{expense.allocation_bucket}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                </div>
              ))
            ) : (
              <p className="text-mute dark:text-on-dark-mute py-md text-center">No recent expenses</p>
            )}
          </div>
        </Card>
      </section>

      {/* Income Modal */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-xl">
          <Card variant="light" className="w-full max-w-md p-xl space-y-lg relative">
            <h2 className="text-heading-lg font-display tracking-tight">Receive Salary</h2>
            <p className="text-sm text-mute dark:text-on-dark-mute">Your expected net salary per cutoff is {formatCurrency(expectedPerCutoff)}.</p>
            <form onSubmit={handleIncomeSubmit} className="space-y-md">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Amount (PHP)</label>
                <input
                  type="number"
                  required
                  className="w-full h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Description</label>
                <input
                  type="text"
                  className="w-full h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={incomeDescription}
                  onChange={(e) => setIncomeDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-sm pt-md">
                <Button variant="outline-light" type="button" onClick={() => setIsIncomeModalOpen(false)}>Cancel</Button>
                <Button variant="dark" type="submit" disabled={incomeMutation.isPending}>
                  {incomeMutation.isPending ? 'Logging...' : 'Confirm Received'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
