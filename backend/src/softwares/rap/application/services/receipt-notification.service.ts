import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { DocumentAccountingInfoService } from './document-accounting-info.service';
import { IReceiptNotificationRepository, IReceiptNotificationRepositoryToken } from '../../domain/repositories/receipt-notification.repository.interface';
import { CreateReceiptNotificationDto } from '../dtos/create-receipt-notification.dto';
import { UpdateReceiptNotificationDto } from '../dtos/update-receipt-notification.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import momentJalaali from 'moment-jalaali';

function parseToJalaliStr(date: any): string {
  if (!date) return '';
  if (date instanceof Date) {
    return momentJalaali(date).format('jYYYY/jMM/jDD');
  }
  if (typeof date === 'string') {
    const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const aDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const cleanStr = date
      .replace(/[۰-۹]/g, w => pDigits.indexOf(w).toString())
      .replace(/[٠-٩]/g, w => aDigits.indexOf(w).toString())
      .replace(/-/g, '/');
    
    const match = cleanStr.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1300 && year < 1500) {
        const m = momentJalaali(cleanStr, 'jYYYY/jMM/jDD');
        if (m.isValid()) return m.format('jYYYY/jMM/jDD');
      } else {
        const m = momentJalaali(cleanStr, 'YYYY/MM/DD');
        if (m.isValid()) return m.format('jYYYY/jMM/jDD');
      }
    }
    const m = momentJalaali(cleanStr);
    if (m.isValid()) {
      return m.format('jYYYY/jMM/jDD');
    }
  }
  return '';
}

@Injectable()
export class ReceiptNotificationService {
  constructor(
    @Inject(IReceiptNotificationRepositoryToken)
    private readonly repository: IReceiptNotificationRepository,
    private readonly requestContextService: RequestContextService,
    private readonly autoVoucherService: AutoVoucherService,
    @Inject(forwardRef(() => DocumentAccountingInfoService))
    private readonly documentAccountingInfoService: DocumentAccountingInfoService
  ) {}

  private getScope() {
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    return { businessStructureId, companyId };
  }

  async findAll() {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.findAll(businessStructureId, companyId);
  }

  async findOne(id: number) {
    const { businessStructureId, companyId } = this.getScope();
    const notification = await this.repository.findById(id, businessStructureId, companyId);
    if (!notification) {
      throw new NotFoundException(`Payment Notification with ID ${id} not found`);
    }
    return notification;
  }

  async getNextNumbers(jalaliDateStr: string) {
    const { businessStructureId, companyId } = this.getScope();
    
    let dateStr = parseToJalaliStr(jalaliDateStr);
    if (!dateStr) {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    
    return {
      documentNumber: docRes.nextValue,
      isDocumentNumberAuto: docRes.numberingMethod === '2',
      error: docRes.error || null,
    };
  }

  async getAvailableCheques(operationType?: string, bankAccountRef?: number) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getAvailableCheques(businessStructureId, companyId, operationType, bankAccountRef);
  }

  async getAvailableChequesForAssignment() {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getAvailableChequesForAssignment(businessStructureId, companyId);
  }

  async getAssignedCheques(partyRef?: string) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getAssignedCheques(businessStructureId, companyId, partyRef);
  }

  async getPaidChequesByParty(partyRef?: string) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getPaidChequesByParty(businessStructureId, companyId, partyRef);
  }

  async getPaidPromissoryNotesByParty(partyRef?: string) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getPaidPromissoryNotesByParty(businessStructureId, companyId, partyRef);
  }

  async getReturnableCheques(partyRef?: string, excludeIds?: string) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getReturnableCheques(businessStructureId, companyId, partyRef, excludeIds);
  }

  async getReturnablePromissoryNotes(partyRef?: string, excludeIds?: string) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.getReturnablePromissoryNotes(businessStructureId, companyId, partyRef, excludeIds);
  }

  async create(createReceiptNotificationDto: CreateReceiptNotificationDto) {
    if (!createReceiptNotificationDto.cashItems?.length && !createReceiptNotificationDto.chequeItems?.length && !createReceiptNotificationDto.depositItems?.length && !createReceiptNotificationDto.returnedPaymentChequesItems?.length && !createReceiptNotificationDto.promissoryNoteItems?.length && !createReceiptNotificationDto.returnedPaymentAssignments?.length && !createReceiptNotificationDto.returnedPaymentPromissoryNotes?.length && !createReceiptNotificationDto.guaranteeItems?.length) {
      throw new BadRequestException('اعلامیه دریافت باید حداقل یک قلم داشته باشد.');
    }

    const { businessStructureId, companyId } = this.getScope();
    
    let dateStr = '';
    if (createReceiptNotificationDto.documentDate) {
      dateStr = parseToJalaliStr(createReceiptNotificationDto.documentDate);
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }
    
    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.error) {
      throw new Error(docRes.error);
    }
    if (docRes.numberingMethod === '2' || !createReceiptNotificationDto.documentNumber) {
      createReceiptNotificationDto.documentNumber = docRes.nextValue;
    }

    if (!createReceiptNotificationDto.fiscalYearRef) {
      createReceiptNotificationDto.fiscalYearRef = this.requestContextService.getFiscalYearId() || 1;
    }

    const saved = await this.repository.create(createReceiptNotificationDto, businessStructureId, companyId);
    
    // Auto Voucher
    if (saved?.status === 2 || saved?.status === 5) { await this.documentAccountingInfoService.saveDefaults('ReceiptNotification', saved.receiptNotificationId); }
    const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded(
      'ReceiptNotification',
      saved.status,
      saved.documentDate,
      saved.documentNumber,
      saved.voucherHeaderRef,
      saved.receiptNotificationId
    );
    if (voucherId) {
      await this.repository.update(saved.receiptNotificationId, { voucherHeaderRef: voucherId }, businessStructureId, companyId);
    }
    
    return this.findOne(saved.receiptNotificationId);
  }

  async update(id: number, updateReceiptNotificationDto: UpdateReceiptNotificationDto) {
    if (updateReceiptNotificationDto.cashItems || updateReceiptNotificationDto.chequeItems || updateReceiptNotificationDto.depositItems || updateReceiptNotificationDto.returnedPaymentChequesItems || updateReceiptNotificationDto.promissoryNoteItems || updateReceiptNotificationDto.returnedPaymentAssignments || updateReceiptNotificationDto.returnedPaymentPromissoryNotes || updateReceiptNotificationDto.guaranteeItems) {
      if (!updateReceiptNotificationDto.cashItems?.length && !updateReceiptNotificationDto.chequeItems?.length && !updateReceiptNotificationDto.depositItems?.length && !updateReceiptNotificationDto.returnedPaymentChequesItems?.length && !updateReceiptNotificationDto.promissoryNoteItems?.length && !updateReceiptNotificationDto.returnedPaymentAssignments?.length && !updateReceiptNotificationDto.returnedPaymentPromissoryNotes?.length && !updateReceiptNotificationDto.guaranteeItems?.length) {
        throw new BadRequestException('اعلامیه دریافت باید حداقل یک قلم داشته باشد.');
      }
    }

    const { businessStructureId, companyId } = this.getScope();

    const existing = await this.repository.findById(id, businessStructureId, companyId);
    if (!existing) {
      throw new NotFoundException(`Payment Notification with ID ${id} not found`);
    }

    let dateStr = '';
    if (updateReceiptNotificationDto.documentDate) {
      dateStr = parseToJalaliStr(updateReceiptNotificationDto.documentDate);
    } else if (existing.documentDate) {
      dateStr = parseToJalaliStr(existing.documentDate);
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.numberingMethod === '2') {
       // if numbering is automatic, keep the original document number to prevent it from changing on every update
       updateReceiptNotificationDto.documentNumber = existing.documentNumber;
    }

    if (!updateReceiptNotificationDto.fiscalYearRef) {
       updateReceiptNotificationDto.fiscalYearRef = this.requestContextService.getFiscalYearId() || 1;
    }

    await this.repository.update(id, updateReceiptNotificationDto, businessStructureId, companyId);
    
    const updated = await this.repository.findById(id, businessStructureId, companyId);
    if (updated) {
      if (updated?.status === 2 || updated?.status === 5) { await this.documentAccountingInfoService.saveDefaults('ReceiptNotification', updated.receiptNotificationId); }
    const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded(
        'ReceiptNotification',
        updated.status,
        updated.documentDate,
        updated.documentNumber,
        updated.voucherHeaderRef,
        updated.receiptNotificationId
      );
      if (voucherId && voucherId !== updated.voucherHeaderRef) {
        await this.repository.update(id, { voucherHeaderRef: voucherId }, businessStructureId, companyId);
      }
    }
    
    return this.findOne(id);
  }

  async remove(id: number) {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.remove(id, businessStructureId, companyId);
  }
}
