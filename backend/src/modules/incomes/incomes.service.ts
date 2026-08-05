import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateIncomeDto } from './dto/create-income.dto';

@Injectable()
export class IncomesService {
  constructor(private readonly supabase: SupabaseService) {}

  async logIncome(userId: string, dto: CreateIncomeDto) {
    const { data: income, error } = await this.supabase.getClient()
      .from('incomes')
      .insert({
        user_id: userId,
        amount: dto.amount,
        description: dto.description,
        income_date: new Date(dto.incomeDate).toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return income;
  }

  async getIncomesForMonth(userId: string, monthYear: string) {
    const startDate = new Date(`${monthYear}-01T00:00:00.000Z`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    
    const { data: incomes, error } = await this.supabase.getClient()
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .gte('income_date', startDate.toISOString())
      .lt('income_date', endDate.toISOString())
      .order('income_date', { ascending: false });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return incomes;
  }
}
