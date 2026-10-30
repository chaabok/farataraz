import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesContractService } from '../../application/services/sales-contract.service';
import { CreateSalesContractDto, UpdateSalesContractDto } from '../../application/dtos/sales-contract.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

// ---------------------------------------------------------------------------
// Task 128: کنترلر قرارداد فروش — الگوی SalesProformaInvoiceController (Task 88)
// ---------------------------------------------------------------------------
@Controller('sle/sales-contracts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesContractController {
  constructor(private readonly service: SalesContractService) {}

  @Post()
  create(@Body() createDto: CreateSalesContractDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesContractDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
