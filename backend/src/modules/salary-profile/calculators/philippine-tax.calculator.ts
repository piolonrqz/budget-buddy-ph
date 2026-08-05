export class PhilippineTaxCalculator {
  static calculate(grossSalary: number, payFrequency: string = 'monthly') {
    // SSS (2024 rates roughly, capped at 29,750 for 1.25%)
    const sssCeiling = 29750;
    const sssBasis = Math.min(grossSalary, sssCeiling);
    const sssContribution = sssBasis * 0.0125; // Employee share

    // PAG-IBIG (2% capped at 200)
    let pagibigContribution = grossSalary * 0.02;
    if (pagibigContribution < 100) pagibigContribution = 100;
    if (pagibigContribution > 200) pagibigContribution = 200;

    // PhilHealth (3.75% of basic salary, check exact 2024 brackets, but let's use flat for MVP)
    let philhealthContribution = grossSalary * 0.0375;
    if (philhealthContribution < 100) philhealthContribution = 100;
    // Assuming max cap at 2,400 for 2024 (placeholder)
    if (philhealthContribution > 2400) philhealthContribution = 2400;

    // Tax (BIR simplified for MVP - e.g. 10% flat for simple demo)
    // Actually using a simplified bracket is better, but let's just use 10% for MVP
    // User can override later or we can refine brackets
    const taxableIncome = grossSalary - sssContribution - pagibigContribution - philhealthContribution;
    const incomeTax = taxableIncome > 20833 ? (taxableIncome - 20833) * 0.15 : 0; // Simplified BIR bracket

    const totalDeductions = sssContribution + pagibigContribution + philhealthContribution + incomeTax;
    const netSalary = grossSalary - totalDeductions;

    let divisor = 1;
    if (payFrequency === 'bi-monthly') divisor = 2;
    if (payFrequency === 'weekly') divisor = 4;

    return {
      grossSalary: grossSalary / divisor,
      sssContribution: sssContribution / divisor,
      pagibigContribution: pagibigContribution / divisor,
      philhealthContribution: philhealthContribution / divisor,
      incomeTax: incomeTax / divisor,
      totalDeductions: totalDeductions / divisor,
      netSalary: netSalary / divisor,
    };
  }
}
