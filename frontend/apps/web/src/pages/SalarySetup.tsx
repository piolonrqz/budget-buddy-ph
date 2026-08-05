import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@salary-tracker/shared';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const SalarySetup = () => {
  const navigate = useNavigate();
  const [grossSalary, setGrossSalary] = useState('');
  const [employmentType, setEmploymentType] = useState('regular');
  const [payFrequency, setPayFrequency] = useState('bi-monthly');
  const [needs, setNeeds] = useState('50');
  const [wants, setWants] = useState('30');
  const [savings, setSavings] = useState('20');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/salary-profile', data);
      return response.data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(needs) + Number(wants) + Number(savings) !== 100) {
      setError('Allocations must add up to 100%');
      return;
    }
    setError('');
    mutation.mutate({
      grossSalary: Number(grossSalary),
      employmentType,
      payFrequency,
      needsPercentage: Number(needs),
      wantsPercentage: Number(wants),
      savingsPercentage: Number(savings),
      effectiveDate: new Date().toISOString(),
    });
  };
  return (
    <div className="max-w-3xl mx-auto py-section px-xl space-y-block">
      <header>
        <h1 className="text-display-lg font-display tracking-tight leading-[1.0] mb-xs">Salary Profile</h1>
        <p className="text-body-lg text-mute dark:text-on-dark-mute">Set up your income and allocation strategy</p>
      </header>

      <Card variant="light" className="space-y-xl">
        <form onSubmit={handleSubmit} className="space-y-xl">
          <section className="space-y-md">
            <h2 className="text-heading-md font-semibold">Income Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <Input 
                label="Gross Monthly Salary (PHP)" 
                type="number" 
                placeholder="50000" 
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                required
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Employment Type</label>
                <select 
                  className="h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="regular">Regular Employee</option>
                  <option value="contractual">Contractual</option>
                  <option value="self_employed">Self Employed</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink dark:text-on-dark-mute">Pay Frequency</label>
                <select 
                  className="h-[56px] px-4 rounded-md bg-canvas-light dark:bg-surface-elevated text-ink dark:text-on-dark border border-hairline-light dark:border-hairline-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  value={payFrequency}
                  onChange={(e) => setPayFrequency(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-monthly">Bi-Monthly (2 cutoffs)</option>
                  <option value="weekly">Weekly (4 cutoffs)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-md">
            <h2 className="text-heading-md font-semibold">Allocation Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <Input label="Needs (%)" type="number" value={needs} onChange={(e) => setNeeds(e.target.value)} required />
              <Input label="Wants (%)" type="number" value={wants} onChange={(e) => setWants(e.target.value)} required />
              <Input label="Savings (%)" type="number" value={savings} onChange={(e) => setSavings(e.target.value)} required />
            </div>
          </section>

          {error && <p className="text-accent-danger text-sm">{error}</p>}

          <Button type="submit" variant="dark" size="lg" fullWidth disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
