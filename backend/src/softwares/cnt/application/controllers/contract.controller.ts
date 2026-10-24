import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ContractService } from '../services/contract.service';
import { Contract } from '../../domain/entities/contract.entity';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('cnt/contracts')
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('check-duplicate')
  async checkDuplicate(@Query('field') field: string, @Query('value') value: string) {
    if (!field || !value) {
      return { isDuplicate: false };
    }
    const isDuplicate = await this.contractService.checkDuplicate(field, value);
    return { isDuplicate };
  }

  @Get()
  findAll() {
    return this.contractService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(+id);
  }

  @Post()
  create(@Body() data: Partial<Contract>) {
    return this.contractService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Contract>) {
    return this.contractService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(+id);
  }
}
