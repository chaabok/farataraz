import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesOrderService } from '../../application/services/sales-order.service';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../../application/dtos/sales-order.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/sales-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesOrderController {
  constructor(private readonly service: SalesOrderService) {}

  @Post()
  create(@Body() createDto: CreateSalesOrderDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateSalesOrderDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
