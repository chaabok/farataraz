import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ReconcileBankStatementService } from '../../application/services/reconcile-bank-statement.service';
import { CreateReconcileBankStatementDto } from '../../application/dtos/create-reconcile-bank-statement.dto';
import { UpdateReconcileBankStatementDto } from '../../application/dtos/update-reconcile-bank-statement.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/reconcile-bank-statements')
@UseGuards(JwtAuthGuard)
export class ReconcileBankStatementController {
  constructor(private readonly service: ReconcileBankStatementService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('next-numbers')
  getNextNumbers(@Query('date') date: string) {
    return this.service.getNextNumbers(date || '');
  }

  @Get('suggested-dates')
  getSuggestedDates(@Query('bankAccountRef', ParseIntPipe) bankAccountRef: number) {
    return this.service.getSuggestedDates(bankAccountRef);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateReconcileBankStatementDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReconcileBankStatementDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(+id);
  }
}
