import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { SeedInitializerService } from '../../application/services/seed-initializer.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedInitializerService: SeedInitializerService) {}

  @Post(':companyId/:step')
  async runSeedStep(
    @Param('companyId') companyId: number,
    @Param('step') step: string
  ) {
    return this.seedInitializerService.runStep(companyId, step);
  }

  @Delete(':companyId/:step')
  async unseedStep(
    @Param('companyId') companyId: number,
    @Param('step') step: string
  ) {
    return this.seedInitializerService.unseedStep(companyId, step);
  }
}
