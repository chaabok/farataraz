import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesPermissionService } from '../../application/services/sales-permission.service';
import { CreateSalesPermissionDto, UpdateSalesPermissionDto } from '../../application/dtos/sales-permission.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

// ---------------------------------------------------------------------------
// Task 133: کنترلر مجوز فروش — الگوی SalesInvoiceController (Task 130)
// ---------------------------------------------------------------------------
@Controller('sle/sales-permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesPermissionController {
  constructor(private readonly service: SalesPermissionService) {}

  @Post()
  create(@Body() createDto: CreateSalesPermissionDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesPermissionDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
