import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrencyService } from '../../application/services/currency.service';
import { CreateCurrencyDto } from '../../application/dtos/create-currency.dto';
import { UpdateCurrencyDto } from '../../application/dtos/update-currency.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('common/currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @Permissions('Currency:Create')
  async create(
    @Body() createCurrencyDto: CreateCurrencyDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    const data = await this.currencyService.create(createCurrencyDto, compId, brId, agnId);
    return { data, message: 'ارز با موفقیت ایجاد شد.' };
  }

  @Get('next-code')
  @Permissions('Currency:Read')
  async getNextCode(
    @Headers('x-company-id') companyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const code = await this.currencyService.getNextCode(compId);
    return { data: code };
  }

  @Get()
  @Permissions('Currency:Read')
  async findAll() {
    const data = await this.currencyService.findAll();
    return { data };
  }

  @Get(':id')
  @Permissions('Currency:Read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.currencyService.findOne(id);
    return { data };
  }

  @Put(':id')
  @Permissions('Currency:Update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
    @Headers('x-company-id') companyId?: string,
    @Headers('x-branch-id') branchId?: string,
    @Headers('x-agency-id') agencyId?: string,
  ) {
    const compId = companyId ? parseInt(companyId, 10) : 1;
    const brId = branchId ? parseInt(branchId, 10) : undefined;
    const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
    const data = await this.currencyService.update(id, updateCurrencyDto, compId, brId, agnId);
    return { data, message: 'ارز با موفقیت بروزرسانی شد.' };
  }

  @Delete(':id')
  @Permissions('Currency:Delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.currencyService.remove(id);
    return { message: 'ارز با موفقیت حذف شد.' };
  }
}
