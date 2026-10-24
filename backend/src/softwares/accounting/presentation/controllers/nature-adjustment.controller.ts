import { Controller, Get, Post, Body, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { NatureAdjustmentService } from '../../application/services/nature-adjustment.service';

@Controller('accounting/nature-adjustment')
@UseGuards(JwtAuthGuard)
export class NatureAdjustmentController {
  constructor(private readonly natureAdjustmentService: NatureAdjustmentService) {}

  @Get('contrary-balances')
  async getContraryBalances(@Query('fiscalYearId') fiscalYearId: number) {
    if (!fiscalYearId) {
      throw new BadRequestException('fiscalYearId is required');
    }
    const lines = await this.natureAdjustmentService.getContraryBalances(fiscalYearId);
    return { success: true, data: lines };
  }

  @Post('save')
  async saveAdjustment(@Body() payload: any) {
    const result = await this.natureAdjustmentService.saveAdjustmentVoucher(payload);
    return { success: true, message: 'سند تعدیل ماهیت با موفقیت ثبت شد', data: result };
  }
}
