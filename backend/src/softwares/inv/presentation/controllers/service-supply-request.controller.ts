import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ServiceSupplyRequestService } from '../../application/services/service-supply-request.service';
import { CreateServiceSupplyRequestDto, UpdateServiceSupplyRequestDto } from '../../application/dtos/service-supply-request.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/service-supply-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiceSupplyRequestController {
  constructor(private readonly service: ServiceSupplyRequestService) {}

  @Post()
  create(@Body() createDto: CreateServiceSupplyRequestDto) {
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

  @Get('requesters')
  async getRequesters() {
    return this.service.getRequesters();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    if (isNaN(numId)) {
      throw new NotFoundException(`شناسه ${id} نامعتبر است`);
    }
    return this.service.findOne(numId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateServiceSupplyRequestDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
