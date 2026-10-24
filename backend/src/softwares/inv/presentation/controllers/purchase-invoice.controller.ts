import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { PurchaseInvoiceService } from '../../application/services/purchase-invoice.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from '../../application/dtos/purchase-invoice.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/purchase-invoices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseInvoiceController {
  constructor(private readonly service: PurchaseInvoiceService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseInvoiceDto) {
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
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new NotFoundException(`شناسه ${id} نامعتبر است`);
    }
    return this.service.findOne(numId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseInvoiceDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
