import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesInvoiceService } from '../../application/services/sales-invoice.service';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../../application/dtos/sales-invoice.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

// ---------------------------------------------------------------------------
// Task 130: کنترلر فاکتور فروش — الگوی SalesContractController (Task 128)
// ---------------------------------------------------------------------------
@Controller('sle/sales-invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesInvoiceController {
  constructor(private readonly service: SalesInvoiceService) {}

  @Post()
  create(@Body() createDto: CreateSalesInvoiceDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('next-number')
  async getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesInvoiceDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
