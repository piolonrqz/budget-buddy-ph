import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { AllocationBucket, PaymentSource, ExpenseCategory } from '../expenses.service';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 500, description: 'Amount of the expense in PHP' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ enum: PaymentSource })
  @IsOptional()
  @IsEnum(PaymentSource)
  paymentSource?: PaymentSource;

  @ApiPropertyOptional({ enum: AllocationBucket })
  @IsOptional()
  @IsEnum(AllocationBucket)
  allocationBucket?: AllocationBucket;

  @ApiPropertyOptional({ example: 'SM Supermarket' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-15T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

