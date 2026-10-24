import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { UsageCheckService } from '../services/usage-check.service';

@Controller('core/usage-check')
export class UsageCheckController {
  constructor(private readonly usageCheckService: UsageCheckService) {}

  @Get()
  async checkUsage(@Query('tableName') tableName: string, @Query('id') id: string) {
    if (!tableName || !id) {
      throw new BadRequestException('tableName and id are required');
    }

    const result = await this.usageCheckService.isRecordUsed(tableName, id);
    return result;
  }
}
