import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SalesTypeService } from '../../application/services/sales-type.service';
import { CreateSalesTypeDto, UpdateSalesTypeDto } from '../../application/dtos/create-sales-type.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sle/sales-types')
export class SalesTypeController {
  constructor(private readonly service: SalesTypeService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, data };
  }

  @Get('next-code')
  async getNextCode() {
    const data = await this.service.getNextCode();
    return { success: true, data: data.code };
  }

  @Get('check-duplicate')
  async checkDuplicate(@Query('field') field: string, @Query('value') value: string, @Query('excludeId') excludeId?: string) {
    const isDuplicate = await this.service.checkDuplicate(field, value, excludeId ? Number(excludeId) : undefined);
    return { success: true, data: { isDuplicate } };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(Number(id));
    return { success: true, data };
  }

  @Post('upsert')
  async upsert(@Body() dto: CreateSalesTypeDto & { SalesTypeID?: number }) {
    if (dto.SalesTypeID) {
      const data = await this.service.update(dto.SalesTypeID, dto);
      return { success: true, data };
    } else {
      const data = await this.service.create(dto);
      return { success: true, data };
    }
  }

  @Post()
  async create(@Body() dto: CreateSalesTypeDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSalesTypeDto) {
    const data = await this.service.update(Number(id), dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(Number(id));
    return { success: true, message: 'Deleted successfully' };
  }
}
