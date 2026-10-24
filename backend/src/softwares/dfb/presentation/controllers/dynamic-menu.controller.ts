import { Body, Controller, Delete, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { DynamicFormService } from '../../application/services/dynamic-form.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dfb/menus')
export class DynamicMenuController {
  constructor(private readonly service: DynamicFormService) {}

  @Get()
  async getMenus(@Headers('x-company-id') companyId?: string) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const data = await this.service.getMenus(compId);
    return { data };
  }

  @Post('sync')
  async syncMenus(
    @Body() dto: { customMainMenus?: any[]; customSubMenus?: any[]; hiddenMenus?: string[] },
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 2;
    const res = await this.service.syncMenus(dto, compId);
    return res;
  }

  @Delete(':key')
  async deleteMenuKey(@Param('key') key: string) {
    const res = await this.service.deleteMenuByKey(key);
    return res;
  }
}
