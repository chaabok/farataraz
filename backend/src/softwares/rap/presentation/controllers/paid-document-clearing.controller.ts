import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaidDocumentClearingService } from '../../application/services/paid-document-clearing.service';
import { CreatePaidDocumentClearingDto } from '../../application/dtos/create-paid-document-clearing.dto';
import { UpdatePaidDocumentClearingDto } from '../../application/dtos/update-paid-document-clearing.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/paid-document-clearings')
@UseGuards(JwtAuthGuard)
export class PaidDocumentClearingController {
  constructor(private readonly service: PaidDocumentClearingService) {}

  @Get('next-numbers')
  async getNextNumbers(@Query('date') date: string) {
    return await this.service.getNextNumbers(date);
  }

  @Post()
  async create(@Body() dto: CreatePaidDocumentClearingDto) {
    const result = await this.service.create(dto);
    return { data: result };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePaidDocumentClearingDto) {
    const result = await this.service.update(parseInt(id, 10), dto);
    return { data: result };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(parseInt(id, 10));
    return { success: true };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.service.findById(parseInt(id, 10));
    return { data: result };
  }

  @Get()
  async findAll(@Query() query: any) {
    const filters = {
      ...query,
      skip: query.skip ? parseInt(query.skip, 10) : undefined,
      take: query.take ? parseInt(query.take, 10) : undefined,
    };
    const [data, total] = await this.service.findAll(filters);
    return { data, total };
  }
}
