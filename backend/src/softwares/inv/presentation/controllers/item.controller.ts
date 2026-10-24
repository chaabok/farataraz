import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ItemService } from '../../application/services/item.service';
import { CreateItemDto } from '../../application/dtos/create-item.dto';
import { UpdateItemDto } from '../../application/dtos/update-item.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/items')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ItemController {
  constructor(private readonly service: ItemService) {}

  @Post()
  create(@Body() createDto: CreateItemDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('dropdown')
  async getDropdownItems(
    @Query('type') type?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    return this.service.getDropdownItems(type, warehouseId, onlyActive);
  }

  @Get('next-number')
  async getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get('kardex-active-items')
  async getKardexActiveItems(
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.getKardexActiveItems(warehouseId, fromDate, toDate, fiscalYearId, companyId);
  }

  @Get('kardex-warehouses')
  async getKardexWarehouses(
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.getKardexWarehouses(fiscalYearId, companyId);
  }

  @Get('kardex-date-bounds')
  async getKardexDateBounds(
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.getKardexDateBounds(fiscalYearId, companyId);
  }

  @Get(':id/stock-summary')
  async getStockSummary(
    @Param('id') id: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('excludeVoucherId') excludeVoucherId?: string,
    @Query('partyId') partyId?: string,
    @Query('currentDate') currentDate?: string,
    @Query('docType') docType?: string,
  ) {
    return this.service.getStockSummary(
      +id,
      warehouseId ? +warehouseId : undefined,
      excludeVoucherId ? +excludeVoucherId : undefined,
      partyId,
      currentDate,
      docType,
    );
  }

  @Get(':id/kardex')
  async getItemKardex(
    @Param('id') id: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.service.getItemKardex(+id, warehouseId, fromDate, toDate);
  }

  @Get(':id/tracking-factor-movements')
  async getItemTrackingFactorMovements(
    @Param('id') id: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.service.getItemTrackingFactorMovements(+id, warehouseId, fromDate, toDate);
  }

  @Get(':id/sub-units')
  getSubUnits(@Param('id') id: string) {
    return this.service.getSubUnits(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateItemDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
