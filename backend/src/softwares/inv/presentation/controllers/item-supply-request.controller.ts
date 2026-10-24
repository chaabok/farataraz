import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ItemSupplyRequestService } from '../../application/services/item-supply-request.service';
import { CreateItemSupplyRequestDto, UpdateItemSupplyRequestDto } from '../../application/dtos/item-supply-request.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/item-supply-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ItemSupplyRequestController {
  constructor(private readonly service: ItemSupplyRequestService) {}

  @Post()
  create(@Body() createDto: CreateItemSupplyRequestDto) {
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
  update(@Param('id') id: string, @Body() updateDto: UpdateItemSupplyRequestDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
