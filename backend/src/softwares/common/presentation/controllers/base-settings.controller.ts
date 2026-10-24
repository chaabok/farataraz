import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards, Headers } from '@nestjs/common';
import { BaseSettingsService } from '../../application/services/base-settings.service';
import { BusinessStructureService } from '../../application/services/business-structure.service';
import { UpdateBaseSettingsDto } from '../../application/dtos/update-base-settings.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('common/base-settings')
export class BaseSettingsController {
  constructor(
    private readonly baseSettingsService: BaseSettingsService,
    private readonly businessStructureService: BusinessStructureService,
  ) {}

  @Get('tab/:tabRef')
  @Permissions('BaseSettings:Read')
  async getSettings(
    @Param('tabRef', ParseIntPipe) tabRef: number,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    const settings = await this.baseSettingsService.getSettingsByTab(tabRef, compId, brId, agnId);
    return { data: settings };
  }

  @Put('tab/:tabRef')
  @Permissions('BaseSettings:Update')
  async updateSettings(
    @Param('tabRef', ParseIntPipe) tabRef: number,
    @Body() dto: UpdateBaseSettingsDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    await this.baseSettingsService.saveSettings(tabRef, dto, compId, brId, agnId);
    if (tabRef === 1 && dto.settings) {
      const shareSetting = dto.settings.find(s => s.key.trim() === 'shareHeadquarterData');
      if (shareSetting) {
        const isShared = shareSetting.value === 'true' || shareSetting.value === '1';
        try {
          await this.businessStructureService.updateAllSharing(isShared);
        } catch (e) {
          console.error('Error updating sharing from BaseSettingsController:', e);
        }
      }
    }
    return { message: 'Settings saved successfully' };
  }
}
