import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SalaryProfileService } from './salary-profile.service';
import { UpsertSalaryProfileDto } from './dto/upsert-salary-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Salary Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/salary-profile')
export class SalaryProfileController {
  constructor(private readonly salaryProfileService: SalaryProfileService) {}

  @ApiOperation({ summary: 'Create or update user salary profile and trigger deduction calculation' })
  @Post()
  async upsertProfile(@Request() req, @Body() dto: UpsertSalaryProfileDto) {
    return this.salaryProfileService.upsertProfile(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Get active salary profile with current monthly deductions' })
  @Get()
  async getProfile(@Request() req) {
    return this.salaryProfileService.getProfile(req.user.id);
  }
}


