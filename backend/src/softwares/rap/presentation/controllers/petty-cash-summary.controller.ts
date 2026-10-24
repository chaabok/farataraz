import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PettyCashSummaryService } from '../../application/services/petty-cash-summary.service';
import { CreatePettyCashSummaryDto } from '../../application/dtos/create-petty-cash-summary.dto';
import { UpdatePettyCashSummaryDto } from '../../application/dtos/update-petty-cash-summary.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rap/petty-cash-summaries')
export class PettyCashSummaryController {
  constructor(private readonly service: PettyCashSummaryService) {}

  @Get()
  @Permissions('rap.pettyCashSummaries.view')
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('next-numbers')
  getNextNumbers(@Query('date') date: string) {
    return this.service.getNextNumbers(date || '');
  }

  @Get(':id')
  @Permissions('rap.pettyCashSummaries.view')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  @Permissions('rap.pettyCashSummaries.create')
  create(@Body() createDto: CreatePettyCashSummaryDto) {
    return this.service.create(createDto);
  }

  @Get('is-used/:id')
  isUsed(@Param('id') id: string) {
    return this.service.isUsed(+id);
  }

  @Put(':id')
  @Permissions('rap.pettyCashSummaries.edit')
  update(@Param('id') id: string, @Body() updateDto: UpdatePettyCashSummaryDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('rap.pettyCashSummaries.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
