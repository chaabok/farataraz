import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { RecieptAndPaymentAccountingSettingService } from '../../application/services/reciept-and-payment-accounting-setting.service';
import { CreateRecieptAndPaymentAccountingSettingDto } from '../../application/dtos/create-reciept-and-payment-accounting-setting.dto';
import { UpdateRecieptAndPaymentAccountingSettingDto } from '../../application/dtos/update-reciept-and-payment-accounting-setting.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/accounting-setting')
@UseGuards(JwtAuthGuard)
export class RecieptAndPaymentAccountingSettingController {
  constructor(private readonly service: RecieptAndPaymentAccountingSettingService) {}

  @Post()
  async create(
    @Body() createDto: CreateRecieptAndPaymentAccountingSettingDto
  ) {
    const created = await this.service.create(createDto);
    return { data: created, message: 'Settings created successfully' };
  }

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.service.findAll(query);
    return {
      data: result.items,
      total: result.total,
    };
  }

  @Get('next-number')
  async getNextNumber() {
    const res = await this.service.getNextNumber();
    return res;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateRecieptAndPaymentAccountingSettingDto) {
    const updated = await this.service.update(+id, updateDto);
    return { data: updated, message: 'Settings updated successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.delete(+id);
    return { message: 'Settings deleted successfully' };
  }
}
