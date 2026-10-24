import { Controller, Get, Post, Body, Param, Put, Delete, Query, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { WarehouseReceiptService } from '../../application/services/warehouse-receipt.service';
import { CreateWarehouseReceiptDto, UpdateWarehouseReceiptDto, PriceReceiptItemsDto } from '../../application/dtos/warehouse-receipt.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller(['inv/warehouse-receipts', 'inv/warehouse-receipt', 'inv/warehouse-issues', 'inv/warehouse-issue'])
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehouseReceiptController {
  constructor(private readonly service: WarehouseReceiptService) {}

  @Post('price-items')
  priceItems(@Body() dto: PriceReceiptItemsDto) {
    return this.service.priceReceiptItems(dto);
  }

  @Post()
  create(@Body() createDto: CreateWarehouseReceiptDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any, @Req() req: any) {
    let nature = query?.nature;
    if (!nature && req) {
      const url = req.originalUrl || req.url || '';
      if (url.includes('warehouse-issues') || url.includes('warehouse-issue')) {
        nature = 2;
      } else if (url.includes('warehouse-receipts') || url.includes('warehouse-receipt')) {
        nature = 1;
      }
    }
    return this.service.findAll({ ...query, nature });
  }

  @Get('next-number')
  async getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get('registered-tracking-factors')
  getRegisteredTrackingFactors(
    @Query('itemRef') itemRef?: string,
    @Query('warehouseRef') warehouseRef?: string,
    @Query('itemCode') itemCode?: string,
  ) {
    return this.service.getRegisteredTrackingFactors(
      itemRef ? Number(itemRef) : undefined,
      warehouseRef ? Number(warehouseRef) : undefined,
      itemCode,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new NotFoundException(`شناسه ${id} نامعتبر است`);
    }
    return this.service.findOne(numId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateWarehouseReceiptDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
