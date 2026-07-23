import { Controller, Get, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get aggregated dashboard summary' })
  @ApiQuery({ name: 'month', required: false, description: 'Format YYYY-MM. Defaults to current month.' })
  @Get('summary')
  async getSummary(@Request() req, @Query('month') month?: string) {
    if (!month) {
      // Default to current month if not provided
      month = new Date().toISOString().substring(0, 7);
    }
    
    // Validate month format YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Month must be in YYYY-MM format');
    }

    return this.dashboardService.getSummary(req.user.id, month);
  }
}


