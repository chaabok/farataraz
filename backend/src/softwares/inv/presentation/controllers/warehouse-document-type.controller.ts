import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { WarehouseDocumentTypeService } from '../../application/services/warehouse-document-type.service';
import { CreateWarehouseDocumentTypeDto } from '../../application/dtos/create-warehouse-document-type.dto';
import { UpdateWarehouseDocumentTypeDto } from '../../application/dtos/update-warehouse-document-type.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/warehouse-document-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehouseDocumentTypeController {
  constructor(private readonly service: WarehouseDocumentTypeService) {}

  @Post()
  create(@Body() createDto: CreateWarehouseDocumentTypeDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateWarehouseDocumentTypeDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
