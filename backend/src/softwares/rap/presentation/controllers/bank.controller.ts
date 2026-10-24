import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BankService } from '../../application/services/bank.service';
import { CreateBankDto } from '../../application/dtos/create-bank.dto';
import { UpdateBankDto } from '../../application/dtos/update-bank.dto';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/banks')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @Permissions('Banks:Create')
  async create(@Body() createBankDto: CreateBankDto) {
    return this.bankService.create(createBankDto);
  }

  @Get()
  @Permissions('Banks:View')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined && pageSize !== undefined) {
      return this.bankService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize, 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.bankService.findAll();
  }

  @Get(':id')
  @Permissions('Banks:View')
  async findOne(@Param('id') id: string) {
    return this.bankService.findOne(+id);
  }

  @Put(':id')
  @Permissions('Banks:Edit')
  async update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
    return this.bankService.update(+id, updateBankDto);
  }

  @Delete(':id')
  @Permissions('Banks:Delete')
  async remove(@Param('id') id: string) {
    await this.bankService.remove(+id);
    return { success: true };
  }

  @Get('advanced/check-duplicate')
  @Permissions('Banks:View')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    // value could be a string representing a number, convert if field is code
    const val = field === 'code' ? +value : value;
    const isDuplicate = await this.bankService.checkDuplicate(field, val, excludeId ? +excludeId : undefined);
    return { isDuplicate };
  }
}
