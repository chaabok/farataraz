import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { VoucherService } from '../../application/services/voucher.service';
import { CreateVoucherDto } from '../../application/dtos/create-voucher.dto';
import { UpdateVoucherDto } from '../../application/dtos/update-voucher.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('accounting/vouchers')
@UseGuards(JwtAuthGuard)
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.voucherService.create(createVoucherDto);
  }

  @Get('next-numbers')
  getNextNumbers(@Query('date') date: string) {
    return this.voucherService.getNextNumbers(date);
  }

  @Get('last-date')
  getLastVoucherDate(@Query('fiscalYearId') fiscalYearId: string) {
    return this.voucherService.getLastVoucherDate(fiscalYearId);
  }

  @Get('finalize-initial-values')
  getFinalizeInitialValues(@Query('fiscalYearId') fiscalYearId: string) {
    return this.voucherService.getFinalizeInitialValues(fiscalYearId);
  }

  @Post('finalize')
  finalizeVouchers(@Body() body: { fromDate: string; toDate: string; fromVoucherNumber: number; toVoucherNumber: number; fiscalYearId?: string }) {
    return this.voucherService.finalizeVouchers(body);
  }

  @Get('reverse-finalize-initial-values')
  getReverseFinalizeInitialValues(@Query('fiscalYearId') fiscalYearId: string) {
    return this.voucherService.getReverseFinalizeInitialValues(fiscalYearId);
  }

  @Post('reverse-finalize')
  reverseFinalizeVouchers(@Body() body: { fromDate: string; toDate: string; fromVoucherNumber: number; toVoucherNumber: number; fiscalYearId?: string }) {
    return this.voucherService.reverseFinalizeVouchers(body);
  }

  @Get('number-range-by-date')
  getNumberRangeByDate(@Query('fromDate') fromDate: string, @Query('toDate') toDate: string, @Query('fiscalYearId') fiscalYearId?: string) {
    return this.voucherService.getNumberRangeByDate(fromDate, toDate, fiscalYearId);
  }

  @Get()
  findAll() {
    return this.voucherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voucherService.findOne(+id);
  }

  @Put(':id')
  updatePut(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.voucherService.update(+id, updateVoucherDto);
  }

  @Patch(':id')
  updatePatch(@Param('id') id: string, @Body() updateVoucherDto: UpdateVoucherDto) {
    return this.voucherService.update(+id, updateVoucherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voucherService.remove(+id);
  }

  @Post('renumber')
  renumber(@Body() body: { fromDate: string; toDate: string; renumberVoucher: boolean; renumberReference: boolean }) {
    return this.voucherService.renumber(body);
  }
}

