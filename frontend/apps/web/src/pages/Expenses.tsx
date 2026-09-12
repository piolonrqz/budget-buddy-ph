import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@salary-tracker/shared';
import type { PaymentSource, ExpenseCategory } from '@salary-tracker/shared';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

const formatDate = (isoString: string) => 
  new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(isoString));

export const Expenses = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [allocationBucket, setAllocationBucket] = useState('needs');
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('cash');
  const [description, setDescription] = useState('');
  
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await apiClient.get('/expenses');
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newExpense: any) => {
      const response = await apiClient.post('/expenses', newExpense);
      return response.data;
    },
    // Optimistic UI updates
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      const previousExpenses = queryClient.getQueryData(['expenses']);
      
      const optimisticExpense = {
        id: Math.random().toString(),
        ...newExpense,
        expense_date: newExpense.expenseDate,
        allocation_bucket: newExpense.allocationBucket,
        payment_source: newExpense.paymentSource,
      };

      queryClient.setQueryData(['expenses'], (old: any) => {
        return old ? [optimisticExpense, ...old] : [optimisticExpense];
      });

      return { previousExpenses };
    },
    onError: (err, newExpense, context: any) => {
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(['expenses'], context.previousExpenses);
      }
      console.error('Failed to add expense', err);
    },
    onSettled: () => {
      // Always refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      // Also invalidate dashboard since balances changed
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      amount: Number(amount),
      category,
      allocationBucket,
      description,
      expenseDate: new Date().toISOString(),
      paymentSource,
    });
    // Reset form and close modal immediately
    setIsModalOpen(false);
    setAmount('');
    setCategory('');
    setDescription('');
    setAllocationBucket('needs');
    setPaymentSource('cash');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as ExpenseCategory;
    setCategory(val);
    
    // Auto-map bucket
    const needs = ['Food', 'Transpo', 'Internet Bill', 'Parents Allowance'];
    const wants = ['Personal Allowance', 'Leisure Money to Spend'];
    const savings = ['Emergency Funds', 'Travel Fund', 'Savings'];

    if (needs.includes(val)) setAllocationBucket('needs');
    else if (wants.includes(val)) setAllocationBucket('wants');
    else if (savings.includes(val)) setAllocationBucket('savings');
  };

  const getPaymentSourceLabel = (source?: string) => {
    switch (source) {
      case 'gcash': return 'GCash';
      case 'maya': return 'Maya';
      case 'maribank': return 'Maribank';
      case 'gotyme': return 'GoTyme';
      case 'cash':
      default: return 'Cash';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-section px-xl space-y-block">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-display-lg font-display tracking-tight leading-[1.0] mb-xs">Expenses</h1>
          <p className="text-mute dark:text-on-dark-mute">Track every peso.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>Add Expense</Button>
      </header>

      {/* Expense List */}
      <Card variant="light">
        {isLoading ? (
          <p className="text-mute dark:text-on-dark-mute py-md text-center">Loading expenses...</p>
        ) : expenses?.length > 0 ? (
          <div className="divide-y divide-hairline-light dark:divide-hairline-dark">
            {expenses.map((expense: any) => (
              <div key={expense.id} className="py-md flex justify-between items-center">
                <div>
                  <p className="font-semibold text-ink dark:text-on-dark">{expense.category}</p>
                  <div className="flex items-center gap-xs mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-soft border border-hairline-light dark:bg-surface-elevated dark:border-hairline-dark text-mute dark:text-on-dark-mute">
                      {getPaymentSourceLabel(expense.payment_source)}
                    </span>
                    <span className="text-sm text-mute dark:text-on-dark-mute">
                      • {formatDate(expense.expense_date)} • <span className="capitalize">{expense.allocation_bucket}</span>
                    </span>
                  </div>
                  {expense.description && <p className="text-sm text-mute dark:text-on-dark-mute">{expense.description}</p>}
                </div>
                <p className="font-semibold text-ink dark:text-on-dark">{formatCurrency(expense.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-mute dark:text-on-dark-mute py-md text-center">No expenses yet. Start tracking!</p>
        )}
      </Card>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-xl">
          <Card variant="light" className="w-full max-w-md">
            <h2 className="text-heading-md font-semibold mb-lg">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-md">
              <Input 
                label="Amount (PHP)" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Category</label>
                <select 
                  className="h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={category}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="Food">Food</option>
                  <option value="Transpo">Transpo</option>
                  <option value="Internet Bill">Internet Bill</option>
                  <option value="Parents Allowance">Parents Allowance</option>
                  <option value="Personal Allowance">Personal Allowance</option>
                  <option value="Leisure Money to Spend">Leisure Money to Spend</option>
                  <option value="Emergency Funds">Emergency Funds</option>
                  <option value="Travel Fund">Travel Fund</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Bucket</label>
                <select 
                  className="h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={allocationBucket}
                  onChange={(e) => setAllocationBucket(e.target.value)}
                >
                  <option value="needs">Needs</option>
                  <option value="wants">Wants</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Payment Source</label>
                <select 
                  className="h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value as PaymentSource)}
                >
                  <option value="cash">Cash</option>
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="maribank">Maribank</option>
                  <option value="gotyme">GoTyme</option>
                </select>
              </div>
              <Input 
                label="Description (Optional)" 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
              
              <div className="flex gap-md pt-md">
                <Button type="button" variant="soft" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="dark" fullWidth>Save</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
