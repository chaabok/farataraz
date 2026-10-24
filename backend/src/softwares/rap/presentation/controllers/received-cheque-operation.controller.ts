import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ReceivedChequeOperationService } from '../../application/services/received-cheque-operation.service';
import { CreateReceivedChequeOperationDto } from '../../application/dtos/create-received-cheque-operation.dto';
import { UpdateReceivedChequeOperationDto } from '../../application/dtos/update-received-cheque-operation.dto';

@Controller('rap/received-cheque-operations')
export class ReceivedChequeOperationController {
  constructor(private readonly service: ReceivedChequeOperationService) {}

  @Post()
  async create(@Body() dto: CreateReceivedChequeOperationDto) {
    const data = await this.service.create(dto);
    return { data, message: 'عملیات با موفقیت ثبت شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateReceivedChequeOperationDto) {
    const data = await this.service.update(+id, dto);
    return { data, message: 'عملیات با موفقیت ویرایش شد' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(+id);
    return { message: 'عملیات با موفقیت حذف شد' };
  }

  @Get('next-numbers')
  async getNextNumbers(@Query('date') date: string) {
    return this.service.getNextNumbers(date || '');
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data };
  }

  @Get()
  async findAll(@Query() query: any) {
    const [data, total] = await this.service.findAll(query);
    return { data, total };
  }
}
