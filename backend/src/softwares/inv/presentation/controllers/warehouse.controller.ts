import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Headers, Req } from '@nestjs/common';
import { WarehouseService } from '../../application/services/warehouse.service';
import { CreateWarehouseDto } from '../../application/dtos/create-warehouse.dto';
import { UpdateWarehouseDto } from '../../application/dtos/update-warehouse.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('inv/warehouses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @Get()
  @Permissions('Warehouse:Read')
  findAll(
    @Headers('x-business-structure-id') businessStructureId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    return this.service.findAll(
      businessStructureId ? parseInt(businessStructureId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined
    );
  }

  @Get('next-number')
  @Permissions('Warehouse:Read')
  getNextNumber(
    @Headers('x-business-structure-id') businessStructureId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    return this.service.getNextNumber(
      businessStructureId ? parseInt(businessStructureId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined
    );
  }

  @Get(':id')
  @Permissions('Warehouse:Read')
  findById(
    @Param('id') id: string,
    @Headers('x-business-structure-id') businessStructureId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    return this.service.findById(
      +id,
      businessStructureId ? parseInt(businessStructureId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined
    );
  }

  @Post()
  @Permissions('Warehouse:Create')
  create(
    @Body() createDto: CreateWarehouseDto,
    @Req() req: any,
    @Headers('x-business-structure-id') businessStructureId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    return this.service.create(
      createDto,
      businessStructureId ? parseInt(businessStructureId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined,
      req.user?.userId
    );
  }

  @Put(':id')
  @Permissions('Warehouse:Update')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWarehouseDto,
    @Req() req: any,
    @Headers('x-business-structure-id') businessStructureId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    return this.service.update(
      +id,
      updateDto,
      businessStructureId ? parseInt(businessStructureId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined,
      req.user?.userId
    );
  }

  @Delete(':id')
  @Permissions('Warehouse:Delete')
  remove(
    @Param('id') id: string,
    @Headers('x-business-structure-id') businessStructureId?: string,
    @Headers('x-company-id') companyId?: string,
  ) {
    return this.service.remove(
      +id,
      businessStructureId ? parseInt(businessStructureId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined
    );
  }
}
