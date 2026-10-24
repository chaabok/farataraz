import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ClosingTemporaryAccountService } from '../../application/services/closing-temporary-account.service';

@Controller('accounting/closing-temporary-accounts')
export class ClosingTemporaryAccountController {
  constructor(private readonly service: ClosingTemporaryAccountService) {}

  @Get('temporary-accounts-tree')
  async getTemporaryAccountsTree(@Query('toDate') toDate?: string) {
    const data = await this.service.getTemporaryAccountsTree(toDate);
    return { success: true, data };
  }

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: any) {
    const data = await this.service.create(dto);
    return { success: true, data, message: 'اطلاعات بستن حسابهای موقت با موفقیت ثبت شد' };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.update(id, dto);
    return { success: true, data, message: 'اطلاعات بستن حسابهای موقت بروزرسانی شد' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.delete(id);
    return { success: true, message: 'حذف اطلاعات بستن حسابهای موقت انجام شد' };
  }
}
