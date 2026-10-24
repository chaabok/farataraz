import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BankReconciliationService } from '../../application/services/bank-reconciliation.service';
import { CreateBankReconciliationDto } from '../../application/dtos/create-bank-reconciliation.dto';
import { UpdateBankReconciliationDto } from '../../application/dtos/update-bank-reconciliation.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/bank-reconciliations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BankReconciliationController {
  constructor(private readonly bankReconciliationService: BankReconciliationService) {}

  @Post()
  @Permissions('rap.bankReconciliations.create')
  create(@Body() createDto: CreateBankReconciliationDto) {
    return this.bankReconciliationService.create(createDto);
  }

  @Get()
  @Permissions('rap.bankReconciliations.view')
  findAll() {
    return this.bankReconciliationService.findAll();
  }

  @Get('next-numbers')
  @Permissions('rap.bankReconciliations.view')
  getNextNumbers(@Query('date') date: string) {
    return this.bankReconciliationService.getNextNumbers(date || '');
  }

  @Get(':id')
  @Permissions('rap.bankReconciliations.view')
  findOne(@Param('id') id: string) {
    return this.bankReconciliationService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('rap.bankReconciliations.update')
  update(@Param('id') id: string, @Body() updateDto: UpdateBankReconciliationDto) {
    return this.bankReconciliationService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('rap.bankReconciliations.delete')
  remove(@Param('id') id: string) {
    return this.bankReconciliationService.remove(+id);
  }
}
