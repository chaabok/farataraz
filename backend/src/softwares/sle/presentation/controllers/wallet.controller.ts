import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { WalletService } from '../../application/services/wallet.service';
import { CreateWalletDto, UpdateWalletDto } from '../../application/dtos/create-wallet.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/wallets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    return { data, success: true };
  }

  @Get('next-number')
  async getNextNumber() {
    const data = await this.service.getNextNumber();
    return { data, success: true };
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.service.checkDuplicate(
      field,
      value,
      excludeId ? Number(excludeId) : undefined,
    );
    return { data: { isDuplicate }, success: true };
  }

  @Post()
  async create(@Body() dto: CreateWalletDto) {
    const data = await this.service.create(dto);
    return { data, success: true, message: 'کیف پول با موفقیت ایجاد شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateWalletDto) {
    const data = await this.service.update(+id, dto);
    return { data, success: true, message: 'کیف پول با موفقیت به‌روزرسانی شد' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true, message: 'کیف پول با موفقیت حذف شد' };
  }
}
