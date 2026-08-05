import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { AllocationBucket } from '../expenses.service';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 500, description: 'Amount of the expense in PHP' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Groceries', description: 'Category of the expense (e.g. Groceries, Rent, Dining)' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ enum: AllocationBucket, description: 'Optional: manual override for allocation bucket' })
  @IsOptional()
  @IsEnum(AllocationBucket)
  allocationBucket?: AllocationBucket;

  @ApiPropertyOptional({ example: 'SM Supermarket', description: 'Optional description of the expense' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-15T08:00:00.000Z', description: 'Date the expense occurred' })
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({ description: 'Optional URL to uploaded receipt image' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

