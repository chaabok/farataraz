import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PettyCashRequestService } from '../../application/services/petty-cash-request.service';
import { CreatePettyCashRequestDto } from '../../application/dtos/create-petty-cash-request.dto';
import { UpdatePettyCashRequestDto } from '../../application/dtos/update-petty-cash-request.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/petty-cash-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PettyCashRequestController {
  constructor(private readonly service: PettyCashRequestService) {}

  @Post()
  @Permissions('rap.pettyCashRequests.create')
  async create(@Body() createDto: CreatePettyCashRequestDto) {
    const data = await this.service.create(createDto);
    return { success: true, data };
  }

  @Get()
  @Permissions('rap.pettyCashRequests.view')
  async findAll(@Query() query: any) {
    const [data, total] = await this.service.findAll(query);
    return { success: true, data, total };
  }

  @Get('next-numbers')
  @Permissions('rap.pettyCashRequests.view')
  async getNextNumbers(@Query('date') date: string) {
    const data = await this.service.getNextNumbers(date);
    return { success: true, data };
  }

  @Get(':id')
  @Permissions('rap.pettyCashRequests.view')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(+id);
    return { success: true, data };
  }

  @Patch(':id')
  @Permissions('rap.pettyCashRequests.edit')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePettyCashRequestDto) {
    const data = await this.service.update(+id, updateDto);
    return { success: true, data };
  }

  @Delete(':id')
  @Permissions('rap.pettyCashRequests.delete')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true };
  }
}
