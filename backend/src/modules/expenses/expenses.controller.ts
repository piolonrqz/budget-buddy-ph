import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @ApiOperation({ summary: 'Add a new expense' })
  @Post()
  create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(req.user.id, createExpenseDto);
  }

  @ApiOperation({ summary: 'List all expenses, optionally filtered by month' })
  @ApiQuery({ name: 'month', required: false, description: 'Format YYYY-MM' })
  @Get()
  findAll(@Request() req, @Query('month') month?: string) {
    return this.expensesService.findAll(req.user.id, month);
  }

  @ApiOperation({ summary: 'Get a specific expense' })
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.expensesService.findOne(req.user.id, id);
  }

  @ApiOperation({ summary: 'Update an existing expense' })
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(req.user.id, id, updateExpenseDto);
  }

  @ApiOperation({ summary: 'Delete an expense' })
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.expensesService.remove(req.user.id, id);
  }
}


