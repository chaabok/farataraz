import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BankAccountService } from '../../application/services/bank-account.service';
import { CreateBankAccountDto } from '../../application/dtos/create-bank-account.dto';
import { UpdateBankAccountDto } from '../../application/dtos/update-bank-account.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/bank-accounts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @Permissions('rap:bank-accounts:create')
  create(@Body() createDto: CreateBankAccountDto) {
    return this.bankAccountService.create(createDto);
  }

  @Get()
  @Permissions('rap:bank-accounts:read')
  findAll(@Query() query: any) {
    return this.bankAccountService.findAll(query);
  }

  @Get(':id')
  @Permissions('rap:bank-accounts:read')
  findById(@Param('id') id: string) {
    return this.bankAccountService.findById(+id);
  }

  @Put(':id')
  @Patch(':id')
  @Permissions('rap:bank-accounts:update')
  update(@Param('id') id: string, @Body() updateDto: UpdateBankAccountDto) {
    return this.bankAccountService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('rap:bank-accounts:delete')
  remove(@Param('id') id: string) {
    return this.bankAccountService.delete(+id);
  }
}
