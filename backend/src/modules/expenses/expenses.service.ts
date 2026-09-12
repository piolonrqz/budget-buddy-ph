import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

export enum AllocationBucket {
  NEEDS = 'needs',
  WANTS = 'wants',
  SAVINGS = 'savings'
}

export enum PaymentSource {
  CASH = 'cash',
  GCASH = 'gcash',
  MAYA = 'maya',
  MARIBANK = 'maribank',
  GOTYME = 'gotyme'
}

export enum ExpenseCategory {
  FOOD = 'Food',
  TRANSPO = 'Transpo',
  INTERNET_BILL = 'Internet Bill',
  PARENTS_ALLOWANCE = 'Parents Allowance',
  PERSONAL_ALLOWANCE = 'Personal Allowance',
  LEISURE_MONEY = 'Leisure Money to Spend',
  EMERGENCY_FUNDS = 'Emergency Funds',
  TRAVEL_FUND = 'Travel Fund',
  SAVINGS = 'Savings'
}

@Injectable()
export class ExpensesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly auditLog: AuditLogService,
  ) {}

  private mapCategoryToBucket(category: string): AllocationBucket {
    const lower = category.toLowerCase();
    
    const needs = ['food', 'transpo', 'internet bill', 'parents allowance'];
    const wants = ['personal allowance', 'leisure money to spend'];
    const savings = ['emergency funds', 'travel fund', 'savings'];

    if (needs.includes(lower)) return AllocationBucket.NEEDS;
    if (wants.includes(lower)) return AllocationBucket.WANTS;
    if (savings.includes(lower)) return AllocationBucket.SAVINGS;
    
    // Fallback if unknown
    if (['groceries', 'rent', 'utilities', 'insurance'].includes(lower)) return AllocationBucket.NEEDS;
    if (['dining out', 'entertainment', 'shopping', 'dining'].includes(lower)) return AllocationBucket.WANTS;
    if (['transfer to savings'].includes(lower)) return AllocationBucket.SAVINGS;
    
    return AllocationBucket.WANTS;
  }

  async create(userId: string, dto: CreateExpenseDto) {
    const bucket = dto.allocationBucket || this.mapCategoryToBucket(dto.category);
    
    const { data: expense, error } = await this.supabase.getClient().from('expenses').insert({
      user_id: userId,
      amount: dto.amount,
      category: dto.category,
      allocation_bucket: bucket,
      description: dto.description,
      expense_date: new Date(dto.expenseDate).toISOString(),
      payment_source: dto.paymentSource || PaymentSource.CASH,
    }).select('*').single();

    if (error) throw new Error(error.message);

    await this.auditLog.logEvent({
      userId,
      entityType: 'Expense',
      entityId: expense.id,
      action: 'create',
      payloadAfter: expense,
    });

    return expense;
  }

  async findAll(userId: string, month?: string) {
    let query = this.supabase.getClient().from('expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false });
    
    if (month) {
      const startDate = new Date(`${month}-01T00:00:00.000Z`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
      query = query.gte('expense_date', startDate.toISOString()).lt('expense_date', endDate.toISOString());
    }
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(userId: string, id: string) {
    const { data: expense, error } = await this.supabase.getClient().from('expenses').select('*').eq('id', id).eq('user_id', userId).single();
    if (error || !expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const existing = await this.findOne(userId, id);

    let bucket = existing.allocation_bucket;
    if (dto.allocationBucket) bucket = dto.allocationBucket;
    else if (dto.category) bucket = this.mapCategoryToBucket(dto.category);

    const updateData: any = {
      amount: dto.amount,
      category: dto.category,
      allocation_bucket: bucket,
      description: dto.description,
    };
    if (dto.expenseDate) updateData.expense_date = new Date(dto.expenseDate).toISOString();
    if (dto.paymentSource) updateData.payment_source = dto.paymentSource;

    const { data: updated, error } = await this.supabase.getClient().from('expenses').update(updateData).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);

    await this.auditLog.logEvent({
      userId,
      entityType: 'Expense',
      entityId: updated.id,
      action: 'update',
      payloadBefore: existing,
      payloadAfter: updated,
    });

    return updated;
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);
    const { error } = await this.supabase.getClient().from('expenses').delete().eq('id', id);
    if (error) throw new Error(error.message);

    await this.auditLog.logEvent({
      userId,
      entityType: 'Expense',
      entityId: existing.id,
      action: 'delete',
      payloadBefore: existing,
    });

    return { deleted: true };
  }
}
