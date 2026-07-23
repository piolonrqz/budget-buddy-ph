import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpsertSalaryProfileDto } from './dto/upsert-salary-profile.dto';
import { PhilippineTaxCalculator } from './calculators/philippine-tax.calculator';

@Injectable()
export class SalaryProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async upsertProfile(userId: string, dto: UpsertSalaryProfileDto) {
    const totalPercentage = dto.needsPercentage + dto.wantsPercentage + dto.savingsPercentage;
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException('Allocations (needs + wants + savings) must equal exactly 100%');
    }

    const existingProfile = await this.prisma.salaryProfile.findUnique({
      where: { userId },
    });

    const action = existingProfile ? 'UPDATE' : 'CREATE';

    const profile = await this.prisma.salaryProfile.upsert({
      where: { userId },
      update: {
        grossSalary: dto.grossSalary,
        employmentType: dto.employmentType,
        needsPercentage: dto.needsPercentage,
        wantsPercentage: dto.wantsPercentage,
        savingsPercentage: dto.savingsPercentage,
        effectiveDate: new Date(dto.effectiveDate),
      },
      create: {
        userId,
        grossSalary: dto.grossSalary,
        employmentType: dto.employmentType,
        needsPercentage: dto.needsPercentage,
        wantsPercentage: dto.wantsPercentage,
        savingsPercentage: dto.savingsPercentage,
        effectiveDate: new Date(dto.effectiveDate),
      },
    });

    await this.auditLog.logEvent({
      userId,
      entityType: 'SalaryProfile',
      entityId: profile.id,
      action: action,
      payloadBefore: existingProfile || null,
      payloadAfter: profile,
    });

    // Run calculator to generate deduction snapshot for the current month
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
    const calculatedDeductions = PhilippineTaxCalculator.calculate(Number(dto.grossSalary));

    await this.prisma.monthlyDeduction.upsert({
      where: {
        userId_monthYear: {
          userId,
          monthYear: currentMonthStr,
        },
      },
      update: {
        ...calculatedDeductions,
      },
      create: {
        userId,
        salaryProfileId: profile.id,
        monthYear: currentMonthStr,
        ...calculatedDeductions,
      },
    });

    return profile;
  }

  async getProfile(userId: string) {
    return this.prisma.salaryProfile.findUnique({
      where: { userId },
      include: { deductions: true },
    });
  }
}

