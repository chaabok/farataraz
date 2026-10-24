import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BankBranchService } from '../../application/services/bank-branch.service';
import { CreateBankBranchDto } from '../../application/dtos/create-bank-branch.dto';
import { UpdateBankBranchDto } from '../../application/dtos/update-bank-branch.dto';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/bank-branchs')
export class BankBranchController {
  constructor(private readonly bankBranchService: BankBranchService) {}

  @Post()
  @Permissions('BankBranchs:Create')
  async create(@Body() createBankBranchDto: CreateBankBranchDto) {
    return this.bankBranchService.create(createBankBranchDto);
  }

  @Get()
  @Permissions('BankBranchs:View')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined && pageSize !== undefined) {
      return this.bankBranchService.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize, 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return this.bankBranchService.findAll();
  }

  @Get(':id')
  @Permissions('BankBranchs:View')
  async findOne(@Param('id') id: string) {
    return this.bankBranchService.findOne(+id);
  }

  @Put(':id')
  @Permissions('BankBranchs:Edit')
  async update(@Param('id') id: string, @Body() updateBankBranchDto: UpdateBankBranchDto) {
    return this.bankBranchService.update(+id, updateBankBranchDto);
  }

  @Delete(':id')
  @Permissions('BankBranchs:Delete')
  async remove(@Param('id') id: string) {
    await this.bankBranchService.remove(+id);
    return { success: true };
  }

  @Get('advanced/check-duplicate')
  @Permissions('BankBranchs:View')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.bankBranchService.checkDuplicate(field, value, excludeId ? +excludeId : undefined);
    return { isDuplicate };
  }
}
