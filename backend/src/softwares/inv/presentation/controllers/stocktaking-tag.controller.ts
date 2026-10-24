import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { StocktakingTagService } from '../../application/services/stocktaking-tag.service';
import { CreateStocktakingTagHeaderDto, UpdateStocktakingTagHeaderDto } from '../../application/dtos/stocktaking-tag.dto';

@Controller('inv/stocktaking-tags')
export class StocktakingTagController {
  constructor(private readonly service: StocktakingTagService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get('warehouses-summary')
  async getWarehousesSummary(
    @Query('settingId') settingId: string,
    @Query('headerId') headerId?: string,
  ) {
    const parsedSetting = settingId ? parseInt(settingId, 10) : 0;
    const sId = !isNaN(parsedSetting) ? parsedSetting : 0;
    const parsedHeader = headerId ? parseInt(headerId, 10) : undefined;
    const hId = parsedHeader && !isNaN(parsedHeader) ? parsedHeader : undefined;
    return this.service.getWarehousesForSetting(sId, hId);
  }

  @Get('warehouse-items')
  async getWarehouseItems(
    @Query('warehouseId') warehouseId: string,
    @Query('settingId') settingId?: string,
    @Query('headerId') headerId?: string,
  ) {
    const parsedWh = warehouseId ? parseInt(warehouseId, 10) : 0;
    const wId = !isNaN(parsedWh) ? parsedWh : 0;
    const parsedSetting = settingId ? parseInt(settingId, 10) : undefined;
    const sId = parsedSetting && !isNaN(parsedSetting) ? parsedSetting : undefined;
    const parsedHeader = headerId ? parseInt(headerId, 10) : undefined;
    const hId = parsedHeader && !isNaN(parsedHeader) ? parsedHeader : undefined;
    return this.service.getWarehouseItems(wId, sId, hId);
  }

  @Get('next-number')
  async getNextNumber(@Query('fiscalYearId') fiscalYearId?: string) {
    const fyId = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
    return this.service.getNextHeaderNumber(fyId);
  }

  @Get('latest-date')
  async getLatestDate(
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('excludeHeaderId') excludeHeaderId?: string,
  ) {
    const parsedFy = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
    const fyId = parsedFy && !isNaN(parsedFy) && parsedFy > 0 ? parsedFy : undefined;
    const parsedEx = excludeHeaderId ? parseInt(excludeHeaderId, 10) : undefined;
    const exId = parsedEx && !isNaN(parsedEx) && parsedEx > 0 ? parsedEx : undefined;
    return this.service.getLatestStocktaking(fyId, exId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateStocktakingTagHeaderDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStocktakingTagHeaderDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post('delete-warehouse-tags')
  async deleteWarehouseTagsPost(
    @Query('headerId') headerId: string,
    @Query('warehouseId') warehouseId: string,
    @Query('itemIds') itemIdsQuery?: string,
    @Body('itemIds') itemIdsBody?: number[],
  ) {
    const hId = parseInt(headerId, 10);
    const wId = parseInt(warehouseId, 10);
    let itemIds: number[] | undefined = itemIdsBody;
    if ((!itemIds || itemIds.length === 0) && itemIdsQuery) {
      itemIds = itemIdsQuery.split(',').map((id) => parseInt(id.trim(), 10)).filter((n) => !isNaN(n));
    }
    return this.service.deleteWarehouseTags(hId, wId, itemIds);
  }

  @Delete('delete-warehouse-tags')
  async deleteWarehouseTags(
    @Query('headerId') headerId: string,
    @Query('warehouseId') warehouseId: string,
    @Query('itemIds') itemIdsQuery?: string,
    @Body('itemIds') itemIdsBody?: number[],
  ) {
    const hId = parseInt(headerId, 10);
    const wId = parseInt(warehouseId, 10);
    let itemIds: number[] | undefined = itemIdsBody;
    if ((!itemIds || itemIds.length === 0) && itemIdsQuery) {
      itemIds = itemIdsQuery.split(',').map((id) => parseInt(id.trim(), 10)).filter((n) => !isNaN(n));
    }
    return this.service.deleteWarehouseTags(hId, wId, itemIds);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
