import { IsEnum, IsNumber, IsDateString, Min, Max } from 'class-validator';
export enum EmploymentType {
  REGULAR = 'regular',
  CONTRACTUAL = 'contractual',
  SELF_EMPLOYED = 'self_employed'
}
import { ApiProperty } from '@nestjs/swagger';

export class UpsertSalaryProfileDto {
  @ApiProperty({ example: 50000, description: 'Gross monthly salary in PHP' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grossSalary: number;

  @ApiProperty({ enum: EmploymentType, example: EmploymentType.REGULAR, description: 'Type of employment for tax calculations' })
  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @ApiProperty({ example: 50.0, description: 'Percentage allocation for Needs' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  needsPercentage: number;

  @ApiProperty({ example: 30.0, description: 'Percentage allocation for Wants' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  wantsPercentage: number;

  @ApiProperty({ example: 20.0, description: 'Percentage allocation for Savings' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  savingsPercentage: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Date when this salary profile becomes effective' })
  @IsDateString()
  effectiveDate: string;
}

