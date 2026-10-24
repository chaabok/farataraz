import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { StocktakingCountService } from '../../application/services/stocktaking-count.service';
import { CreateStocktakingCountDto, UpdateStocktakingCountDto } from '../../application/dtos/stocktaking-count.dto';

@Controller('inv/stocktaking-counts')
export class StocktakingCountController {
  constructor(private readonly service: StocktakingCountService) {}

  @Get('periods')
  async getPeriods(@Query('fiscalYearId') fiscalYearId?: string) {
    const fyId = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
    return this.service.getPeriods(fyId);
  }

  @Get('warehouses')
  async getWarehouses(
    @Query('tagHeaderId', ParseIntPipe) tagHeaderId: number,
    @Query('excludeCompleted') excludeCompleted?: string,
    @Query('currentCountId') currentCountId?: string,
  ) {
    const exclude = excludeCompleted === undefined ? true : (excludeCompleted === 'true' || excludeCompleted === '1');
    const countId = currentCountId ? parseInt(currentCountId, 10) : undefined;
    return this.service.getWarehousesForTagHeader(tagHeaderId, exclude, countId);
  }

  @Get('warehouse-count-info')
  async getWarehouseCountInfo(
    @Query('tagHeaderId', ParseIntPipe) tagHeaderId: number,
    @Query('warehouseId', ParseIntPipe) warehouseId: number,
  ) {
    return this.service.getWarehouseCountStatus(tagHeaderId, warehouseId);
  }

  @Get('items')
  async getItems(
    @Query('tagHeaderId', ParseIntPipe) tagHeaderId: number,
    @Query('warehouseId', ParseIntPipe) warehouseId: number,
    @Query('countId') countId?: string,
    @Query('round') round?: string,
  ) {
    const cId = countId ? parseInt(countId, 10) : undefined;
    const rNum = round ? parseInt(round, 10) : undefined;
    return this.service.getItemsForCount(tagHeaderId, warehouseId, cId, rNum);
  }

  @Get('next-number')
  async getNextNumber(
    @Query('fiscalYearId') fiscalYearId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    const fyId = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
    const whId = warehouseId ? parseInt(warehouseId, 10) : undefined;
    return this.service.getNextNumber(fyId, whId);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateStocktakingCountDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStocktakingCountDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
