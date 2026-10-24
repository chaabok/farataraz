import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { PaymentNotificationService } from '../../application/services/payment-notification.service';
import { CreatePaymentNotificationDto } from '../../application/dtos/create-payment-notification.dto';
import { UpdatePaymentNotificationDto } from '../../application/dtos/update-payment-notification.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/payment-notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentNotificationController {
  constructor(private readonly paymentNotificationService: PaymentNotificationService) {}

  @Post()
  @Permissions('rap:payment-notifications:create')
  create(@Body() createPaymentNotificationDto: CreatePaymentNotificationDto) {
    return this.paymentNotificationService.create(createPaymentNotificationDto);
  }

  @Get()
  @Permissions('rap:payment-notifications:view')
  findAll() {
    return this.paymentNotificationService.findAll();
  }

  @Get('next-numbers')
  @Permissions('rap:payment-notifications:view')
  getNextNumbers(@Query('date') date: string) {
    return this.paymentNotificationService.getNextNumbers(date || '');
  }

  @Get('cheques/payable')
  @Permissions('rap:paid-document-clearings:view')
  getPayableCheques() {
    return this.paymentNotificationService.getPayableCheques();
  }

  @Get('promissory-notes/payable')
  @Permissions('rap:paid-document-clearings:view')
  getPayablePromissoryNotes() {
    return this.paymentNotificationService.getPayablePromissoryNotes();
  }

  @Get(':id')
  @Permissions('rap:payment-notifications:view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentNotificationService.findOne(+id);
  }

  @Put(':id')
  @Permissions('rap:payment-notifications:edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentNotificationDto: UpdatePaymentNotificationDto
  ) {
    return this.paymentNotificationService.update(+id, updatePaymentNotificationDto);
  }

  @Delete(':id')
  @Permissions('rap:payment-notifications:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentNotificationService.remove(+id);
  }
}
