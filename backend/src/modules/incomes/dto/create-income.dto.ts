import { IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncomeDto {
  @ApiProperty({ example: 11900, description: 'Amount of income received in PHP' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: '1st Cutoff Salary', description: 'Optional description of the income' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-15T08:00:00.000Z', description: 'Date the income was received' })
  @IsDateString()
  incomeDate: string;
}
