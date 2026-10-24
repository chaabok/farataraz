import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CashService } from '../../application/services/cash.service';
import { CreateCashDto } from '../../application/dtos/create-cash.dto';
import { UpdateCashDto } from '../../application/dtos/update-cash.dto';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/cashes')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post()
  @Permissions('Cashes:Create')
  async create(@Body() createCashDto: CreateCashDto) {
    return this.cashService.create(createCashDto);
  }

  @Get()
  @Permissions('Cashes:View')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined && pageSize !== undefined) {
      return this.cashService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize, 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.cashService.findAll();
  }

  @Get(':id')
  @Permissions('Cashes:View')
  async findOne(@Param('id') id: string) {
    return this.cashService.findOne(+id);
  }

  @Put(':id')
  @Permissions('Cashes:Edit')
  async update(@Param('id') id: string, @Body() updateCashDto: UpdateCashDto) {
    return this.cashService.update(+id, updateCashDto);
  }

  @Delete(':id')
  @Permissions('Cashes:Delete')
  async remove(@Param('id') id: string) {
    await this.cashService.remove(+id);
    return { success: true };
  }

  @Get('advanced/check-duplicate')
  @Permissions('Cashes:View')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.cashService.checkDuplicate(field, value, excludeId ? +excludeId : undefined);
    return { isDuplicate };
  }
}
