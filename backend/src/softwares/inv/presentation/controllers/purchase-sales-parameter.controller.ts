import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { PurchaseSalesParameterService } from '../../application/services/purchase-sales-parameter.service';
import { CreatePurchaseSalesParameterDto } from '../../application/dtos/create-purchase-sales-parameter.dto';
import { UpdatePurchaseSalesParameterDto } from '../../application/dtos/update-purchase-sales-parameter.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/purchase-sales-parameters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseSalesParameterController {
  constructor(private readonly service: PurchaseSalesParameterService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseSalesParameterDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.service.checkDuplicate(
      field,
      value,
      excludeId ? parseInt(excludeId, 10) : undefined,
    );
    return { isDuplicate };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseSalesParameterDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
