import { Module } from '@nestjs/common';
import { SalaryProfileController } from './salary-profile.controller';
import { SalaryProfileService } from './salary-profile.service';

@Module({
  controllers: [SalaryProfileController],
  providers: [SalaryProfileService]
})
export class SalaryProfileModule {}
