import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesReturnPermissionService } from '../../application/services/sales-return-permission.service';
import { CreateSalesReturnPermissionDto, UpdateSalesReturnPermissionDto } from '../../application/dtos/sales-return-permission.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

// ---------------------------------------------------------------------------
// Task 139: کنترلر مجوز برگشت از فروش — کلون SalesPermissionController (Task 133)
// ---------------------------------------------------------------------------
@Controller('sle/sales-return-permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesReturnPermissionController {
  constructor(private readonly service: SalesReturnPermissionService) {}

  @Post()
  create(@Body() createDto: CreateSalesReturnPermissionDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesReturnPermissionDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
