import { Controller, Get, Put, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { DetailedAccountsNumberingService } from '../../application/services/detailed-accounts-numbering.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';
import { DetailedAccountsNumbering } from '../../domain/entities/detailed-accounts-numbering.entity';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('common/detailed-accounts-numbering')
export class DetailedAccountsNumberingController {
  constructor(private readonly service: DetailedAccountsNumberingService) {}

  @Get()
  @Permissions('DetailedAccountsNumbering:Read')
  async getNumbering() {
    const data = await this.service.getViewList();
    return { data };
  }

  @Get('next-code/:detailedTypeId')
  @Permissions('DetailedAccountsNumbering:Read')
  async getNextCode(@Param('detailedTypeId', ParseIntPipe) detailedTypeId: number) {
    const nextCode = await this.service.getNextCode(detailedTypeId);
    return { data: nextCode };
  }

  @Put()
  @Permissions('DetailedAccountsNumbering:Update')
  async saveNumbering(@Body() body: { dataList: Partial<DetailedAccountsNumbering>[] }) {
    await this.service.saveList(body.dataList);
    return { message: 'Numbering settings saved successfully' };
  }
}
