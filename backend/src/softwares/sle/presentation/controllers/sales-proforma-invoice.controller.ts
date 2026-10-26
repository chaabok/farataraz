import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesProformaInvoiceService } from '../../application/services/sales-proforma-invoice.service';
import { CreateSalesProformaInvoiceDto, UpdateSalesProformaInvoiceDto } from '../../application/dtos/sales-proforma-invoice.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

// ---------------------------------------------------------------------------
// Task 88: کنترلر پیش فاکتور فروش — الگوی SalesOrderController
// ---------------------------------------------------------------------------
@Controller('sle/sales-proforma-invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesProformaInvoiceController {
  constructor(private readonly service: SalesProformaInvoiceService) {}

  @Post()
  create(@Body() createDto: CreateSalesProformaInvoiceDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesProformaInvoiceDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
