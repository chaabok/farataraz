import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ChequePrintTemplateService } from '../../application/services/cheque-print-template.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/cheque-print-templates')
@UseGuards(JwtAuthGuard)
export class ChequePrintTemplateController {
  constructor(private readonly service: ChequePrintTemplateService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('advanced')
  findWithPagination(@Query() query: any) {
    return this.service.findWithPagination(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
