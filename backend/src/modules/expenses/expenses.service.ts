import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AllocationBucket } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  private mapCategoryToBucket(category: string): AllocationBucket {
    const lower = category.toLowerCase();
    if (['groceries', 'rent', 'utilities', 'insurance'].includes(lower)) return AllocationBucket.NEEDS;
    if (['dining out', 'entertainment', 'shopping', 'dining'].includes(lower)) return AllocationBucket.WANTS;
    if (['transfer to savings', 'savings'].includes(lower)) return AllocationBucket.SAVINGS;
    return AllocationBucket.WANTS; // Default fallback if unknown and unassigned
  }

  async create(userId: string, dto: CreateExpenseDto) {
    const bucket = dto.allocationBucket || this.mapCategoryToBucket(dto.category);
    
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        category: dto.category,
        allocationBucket: bucket,
        description: dto.description,
        expenseDate: new Date(dto.expenseDate),
        // receiptUrl could be added later if schema is updated, wait schema didn't include receipt_url?
        // Ah, the schema does not have receipt_url! The plan mentioned it was optional but I didn't add it in schema.prisma.
        // Let's omit receipt_url for now, or if it's there I will include it. I will omit it to be safe since I didn't add it to schema.prisma.
      },
    });

    await this.auditLog.logEvent({
      userId,
      entityType: 'Expense',
      entityId: expense.id,
      action: 'CREATE',
      payloadAfter: expense,
    });

    return expense;
  }

  async findAll(userId: string, month?: string) {
    // If month is provided as YYYY-MM
    let whereClause: any = { userId };
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      whereClause.expenseDate = {
        gte: startDate,
        lt: endDate,
      };
    }
    
    return this.prisma.expense.findMany({
      where: whereClause,
      orderBy: { expenseDate: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const existing = await this.findOne(userId, id);

    let bucket = existing.allocationBucket;
    if (dto.allocationBucket) bucket = dto.allocationBucket;
    else if (dto.category) bucket = this.mapCategoryToBucket(dto.category);

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        amount: dto.amount,
        category: dto.category,
        allocationBucket: bucket,
        description: dto.description,
        ...(dto.expenseDate ? { expenseDate: new Date(dto.expenseDate) } : {}),
      },
    });

    await this.auditLog.logEvent({
      userId,
      entityType: 'Expense',
      entityId: updated.id,
      action: 'UPDATE',
      payloadBefore: existing,
      payloadAfter: updated,
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    await this.prisma.expense.delete({ where: { id } });

    await this.auditLog.logEvent({
      userId,
      entityType: 'Expense',
      entityId: existing.id,
      action: 'DELETE',
      payloadBefore: existing,
    });

    return { deleted: true };
  }
}

