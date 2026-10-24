import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { MeasurementUnitService } from '../../application/services/measurement-unit.service';
import { CreateMeasurementUnitDto } from '../../application/dtos/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../../application/dtos/update-measurement-unit.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/measurement-units')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MeasurementUnitController {
  constructor(private readonly service: MeasurementUnitService) {}

  @Post()
  create(@Body() createDto: CreateMeasurementUnitDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateMeasurementUnitDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
