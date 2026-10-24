import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { BankAccountTypeService } from '../../application/services/bank-account-type.service';
import { CreateBankAccountTypeDto } from '../../application/dtos/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from '../../application/dtos/update-bank-account-type.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/bank-account-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BankAccountTypeController {
  constructor(private readonly service: BankAccountTypeService) {}

  @Get()
  @Permissions('view_bank_account_types')
  async findAll(
    @Query('pageIndex') pageIndex?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sorting') sorting?: string,
    @Query('columnFilters') columnFilters?: string,
    @Query('globalFilter') globalFilter?: string,
    @Query('advancedFilters') advancedFilters?: string,
  ) {
    if (pageIndex !== undefined && pageSize !== undefined) {
      return this.service.findWithPagination({
        pageIndex: parseInt(pageIndex, 10),
        pageSize: parseInt(pageSize, 10),
        sorting,
        columnFilters,
        globalFilter,
        advancedFilters,
      });
    }
    return await this.service.findAll();
  }

  @Get(':id')
  @Permissions('view_bank_account_types')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.service.findById(id);
  }

  @Post()
  @Permissions('create_bank_account_types')
  async create(@Body() dto: CreateBankAccountTypeDto) {
    return await this.service.create(dto);
  }

  @Put(':id')
  @Permissions('edit_bank_account_types')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBankAccountTypeDto) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('delete_bank_account_types')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { success: true };
  }
}
