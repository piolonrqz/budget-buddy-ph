import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { SalaryProfileModule } from './modules/salary-profile/salary-profile.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IncomesModule } from './modules/incomes/incomes.module';

@Module({
  imports: [SupabaseModule, AuditLogModule, AuthModule, SalaryProfileModule, ExpensesModule, DashboardModule, IncomesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
