import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ReceiptNotificationService } from '../../application/services/receipt-notification.service';
import { CreateReceiptNotificationDto } from '../../application/dtos/create-receipt-notification.dto';
import { UpdateReceiptNotificationDto } from '../../application/dtos/update-receipt-notification.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';
import { Permissions } from '../../../../auth/permissions.decorator';

@Controller('rap/receipt-notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReceiptNotificationController {
  constructor(private readonly receiptNotificationService: ReceiptNotificationService) {}

  @Post()
  @Permissions('rap:receipt-notifications:create')
  create(@Body() createReceiptNotificationDto: CreateReceiptNotificationDto) {
    return this.receiptNotificationService.create(createReceiptNotificationDto);
  }

  @Get()
  @Permissions('rap:receipt-notifications:view')
  findAll() {
    return this.receiptNotificationService.findAll();
  }

  @Get('next-numbers')
  @Permissions('rap:receipt-notifications:view')
  getNextNumbers(@Query('date') date: string) {
    return this.receiptNotificationService.getNextNumbers(date || '');
  }

  @Get('cheques/available-for-assignment')
  @Permissions('rap:receipt-notifications:view')
  getAvailableCheques(@Query('operationType') operationType?: string, @Query('bankAccountRef') bankAccountRef?: string) {
    return this.receiptNotificationService.getAvailableCheques(operationType, bankAccountRef ? parseInt(bankAccountRef, 10) : undefined);
  }

  @Get('cheques/available-for-transfer')
  @Permissions('rap:receipt-notifications:view')
  getAvailableChequesForTransfer() {
    return this.receiptNotificationService.getAvailableChequesForAssignment();
  }

  @Get('cheques/assigned-to-others')
  @Permissions('rap:receipt-notifications:view')
  getAssignedCheques(@Query('partyRef') partyRef?: string) {
    return this.receiptNotificationService.getAssignedCheques(partyRef);
  }

  @Get('cheques/paid-to-party')
  @Permissions('rap:receipt-notifications:view')
  getPaidChequesByParty(@Query('partyRef') partyRef?: string) {
    return this.receiptNotificationService.getPaidChequesByParty(partyRef);
  }

  @Get('promissory-notes/paid-to-party')
  @Permissions('rap:receipt-notifications:view')
  getPaidPromissoryNotesByParty(@Query('partyRef') partyRef?: string) {
    return this.receiptNotificationService.getPaidPromissoryNotesByParty(partyRef);
  }

  @Get('cheques/returnable')
  @Permissions('rap:receipt-notifications:view')
  getReturnableCheques(@Query('partyRef') partyRef?: string, @Query('excludeIds') excludeIds?: string) {
    return this.receiptNotificationService.getReturnableCheques(partyRef, excludeIds);
  }

  @Get('promissory-notes/returnable')
  @Permissions('rap:receipt-notifications:view')
  getReturnablePromissoryNotes(@Query('partyRef') partyRef?: string, @Query('excludeIds') excludeIds?: string) {
    return this.receiptNotificationService.getReturnablePromissoryNotes(partyRef, excludeIds);
  }

  @Get(':id')
  @Permissions('rap:receipt-notifications:view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receiptNotificationService.findOne(+id);
  }

  @Put(':id')
  @Permissions('rap:receipt-notifications:edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReceiptNotificationDto: UpdateReceiptNotificationDto
  ) {
    return this.receiptNotificationService.update(+id, updateReceiptNotificationDto);
  }

  @Delete(':id')
  @Permissions('rap:receipt-notifications:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.receiptNotificationService.remove(+id);
  }
}
