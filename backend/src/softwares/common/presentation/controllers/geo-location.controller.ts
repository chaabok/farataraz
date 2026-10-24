import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { GeoLocationService } from '../../application/services/geo-location.service';
import { CreateGeoLocationDto } from '../../application/dtos/create-geo-location.dto';
import { UpdateGeoLocationDto } from '../../application/dtos/update-geo-location.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller(['geo-locations', 'common/geo-locations'])
@UseGuards(JwtAuthGuard)
export class GeoLocationController {
  constructor(private readonly service: GeoLocationService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { data };
  }

  @Get('cities')
  async getCities() {
    const data = await this.service.findAllCitiesFlattened();
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findById(id);
    return { data };
  }

  @Post()
  async create(@Body() dto: CreateGeoLocationDto) {
    const data = await this.service.create(dto);
    return { data, message: 'GeoLocation created successfully' };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGeoLocationDto,
  ) {
    const data = await this.service.update(id, dto);
    return { data, message: 'GeoLocation updated successfully' };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { message: 'GeoLocation deleted successfully' };
  }
}
