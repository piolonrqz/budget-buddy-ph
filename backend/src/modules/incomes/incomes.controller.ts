import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Incomes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/incomes')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new received income (e.g., cutoff salary)' })
  async logIncome(@Request() req, @Body() dto: CreateIncomeDto) {
    return this.incomesService.logIncome(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all incomes received for a specific month (YYYY-MM)' })
  async getIncomes(@Request() req, @Query('month') month: string) {
    if (!month) {
      month = new Date().toISOString().substring(0, 7);
    }
    return this.incomesService.getIncomesForMonth(req.user.userId, month);
  }
}
