import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpsertSalaryProfileDto } from './dto/upsert-salary-profile.dto';
import { PhilippineTaxCalculator } from './calculators/philippine-tax.calculator';

@Injectable()
export class SalaryProfileService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly auditLog: AuditLogService,
  ) {}

  async upsertProfile(userId: string, dto: UpsertSalaryProfileDto) {
    const totalPercentage = dto.needsPercentage + dto.wantsPercentage + dto.savingsPercentage;
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException('Allocations (needs + wants + savings) must equal exactly 100%');
    }

    const { data: existingProfile } = await this.supabase.getClient()
      .from('salary_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const action = existingProfile ? 'update' : 'create';

    const profileData = {
      user_id: userId,
      gross_salary: dto.grossSalary,
      employment_type: dto.employmentType,
      needs_percentage: dto.needsPercentage,
      wants_percentage: dto.wantsPercentage,
      savings_percentage: dto.savingsPercentage,
      pay_frequency: dto.payFrequency,
      effective_date: new Date(dto.effectiveDate).toISOString(),
    };

    const { data: profile, error } = await this.supabase.getClient()
      .from('salary_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    await this.auditLog.logEvent({
      userId,
      entityType: 'SalaryProfile',
      entityId: profile.id,
      action: action,
      payloadBefore: existingProfile || null,
      payloadAfter: profile,
    });

    // Run calculator to generate deduction snapshot for the current month per-cutoff
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    const calculatedDeductions = PhilippineTaxCalculator.calculate(Number(dto.grossSalary), dto.payFrequency);

    const deductionData = {
      user_id: userId,
      salary_profile_id: profile.id,
      month_year: currentMonthStr,
      gross_salary: calculatedDeductions.grossSalary,
      sss_contribution: calculatedDeductions.sssContribution,
      pagibig_contribution: calculatedDeductions.pagibigContribution,
      philhealth_contribution: calculatedDeductions.philhealthContribution,
      income_tax: calculatedDeductions.incomeTax,
      total_deductions: calculatedDeductions.totalDeductions,
      net_salary: calculatedDeductions.netSalary,
    };

    await this.supabase.getClient()
      .from('monthly_deductions')
      .upsert(deductionData, { onConflict: 'user_id,month_year' });

    return profile;
  }

  async getProfile(userId: string) {
    const { data: profile, error } = await this.supabase.getClient()
      .from('salary_profiles')
      .select('*, monthly_deductions(*)')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) throw new Error(error.message);
    return profile;
  }
}
