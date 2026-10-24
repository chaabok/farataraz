import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { StocktakingSettingService } from '../../application/services/stocktaking-setting.service';
import { CreateStocktakingSettingDto } from '../../application/dtos/stocktaking-setting.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('inv/stocktaking-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StocktakingSettingController {
  constructor(private readonly service: StocktakingSettingService) {}

  @Get()
  @Permissions('Warehouse:Read')
  getSetting() {
    return this.service.getAllSettings();
  }

  @Post()
  @Permissions('Warehouse:Update')
  saveSetting(@Body() dto: CreateStocktakingSettingDto) {
    return this.service.saveSetting(dto);
  }

  @Put(':id')
  @Permissions('Warehouse:Update')
  updateSetting(@Param('id') id: string, @Body() dto: CreateStocktakingSettingDto) {
    dto.StocktakingSettingID = Number(id);
    return this.service.saveSetting(dto);
  }

  @Delete(':id')
  @Permissions('Warehouse:Delete')
  deleteSetting(@Param('id') id: string) {
    return this.service.deleteSetting(Number(id));
  }
}
