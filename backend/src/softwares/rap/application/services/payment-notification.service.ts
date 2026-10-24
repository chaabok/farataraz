import { Injectable, Inject, NotFoundException, BadRequestException, forwardRef } from '@nestjs/common';
import { DocumentAccountingInfoService } from './document-accounting-info.service';
import { IPaymentNotificationRepository, IPaymentNotificationRepositoryToken } from '../../domain/repositories/payment-notification.repository.interface';
import { CreatePaymentNotificationDto } from '../dtos/create-payment-notification.dto';
import { UpdatePaymentNotificationDto } from '../dtos/update-payment-notification.dto';
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
export class PaymentNotificationService {
  constructor(
    @Inject(IPaymentNotificationRepositoryToken)
    private readonly repository: IPaymentNotificationRepository,
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

  async getPayableCheques() {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.findPayableCheques(businessStructureId, companyId);
  }

  async getPayablePromissoryNotes() {
    const { businessStructureId, companyId } = this.getScope();
    return this.repository.findPayablePromissoryNotes(businessStructureId, companyId);
  }

  async create(createPaymentNotificationDto: CreatePaymentNotificationDto) {
    if (!createPaymentNotificationDto.cashItems?.length && !createPaymentNotificationDto.chequeItems?.length && !createPaymentNotificationDto.withdrawalItems?.length && !createPaymentNotificationDto.assignmentItems?.length && !createPaymentNotificationDto.promissoryNoteItems?.length && !createPaymentNotificationDto.returnedReceivedCheques?.length && !createPaymentNotificationDto.returnedReceivedPromissoryNotes?.length && !createPaymentNotificationDto.guaranteeItems?.length) {
      throw new BadRequestException('اعلامیه پرداخت باید حداقل یک قلم (نقد، چک، اعلامیه برداشت یا واگذاری به غیر) داشته باشد.');
    }

    const { businessStructureId, companyId } = this.getScope();
    
    let dateStr = '';
    if (createPaymentNotificationDto.documentDate) {
      dateStr = parseToJalaliStr(createPaymentNotificationDto.documentDate);
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }
    
    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.error) {
      throw new Error(docRes.error);
    }
    if (docRes.numberingMethod === '2' || !createPaymentNotificationDto.documentNumber) {
      createPaymentNotificationDto.documentNumber = docRes.nextValue;
    }

    if (!createPaymentNotificationDto.fiscalYearRef) {
      createPaymentNotificationDto.fiscalYearRef = this.requestContextService.getFiscalYearId() || 1;
    }

    const saved = await this.repository.create(createPaymentNotificationDto, businessStructureId, companyId);
    
    // Auto Voucher
    if (saved?.status === 2 || saved?.status === 5) { await this.documentAccountingInfoService.saveDefaults('PaymentNotification', saved.paymentNotificationId); }
    const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded(
      'PaymentNotification',
      saved.status,
      saved.documentDate,
      saved.documentNumber,
      saved.voucherHeaderRef,
      saved.paymentNotificationId
    );
    if (voucherId) {
      await this.repository.update(saved.paymentNotificationId, { voucherHeaderRef: voucherId }, businessStructureId, companyId);
    }
    
    return this.findOne(saved.paymentNotificationId);
  }

  async update(id: number, updatePaymentNotificationDto: UpdatePaymentNotificationDto) {
    if (updatePaymentNotificationDto.cashItems || updatePaymentNotificationDto.chequeItems || updatePaymentNotificationDto.withdrawalItems || updatePaymentNotificationDto.assignmentItems || updatePaymentNotificationDto.promissoryNoteItems || updatePaymentNotificationDto.returnedReceivedCheques || updatePaymentNotificationDto.returnedReceivedPromissoryNotes || updatePaymentNotificationDto.guaranteeItems) {
      if (!updatePaymentNotificationDto.cashItems?.length && !updatePaymentNotificationDto.chequeItems?.length && !updatePaymentNotificationDto.withdrawalItems?.length && !updatePaymentNotificationDto.assignmentItems?.length && !updatePaymentNotificationDto.promissoryNoteItems?.length && !updatePaymentNotificationDto.returnedReceivedCheques?.length && !updatePaymentNotificationDto.returnedReceivedPromissoryNotes?.length && !updatePaymentNotificationDto.guaranteeItems?.length) {
        throw new BadRequestException('اعلامیه پرداخت باید حداقل یک قلم (نقد، چک، اعلامیه برداشت یا واگذاری به غیر) داشته باشد.');
      }
    }

    const { businessStructureId, companyId } = this.getScope();

    const existing = await this.repository.findById(id, businessStructureId, companyId);
    if (!existing) {
      throw new NotFoundException(`Payment Notification with ID ${id} not found`);
    }

    let dateStr = '';
    if (updatePaymentNotificationDto.documentDate) {
      dateStr = parseToJalaliStr(updatePaymentNotificationDto.documentDate);
    } else if (existing.documentDate) {
      dateStr = parseToJalaliStr(existing.documentDate);
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.numberingMethod === '2') {
       // if numbering is automatic, keep the original document number to prevent it from changing on every update
       updatePaymentNotificationDto.documentNumber = existing.documentNumber;
    }

    if (!updatePaymentNotificationDto.fiscalYearRef) {
       updatePaymentNotificationDto.fiscalYearRef = this.requestContextService.getFiscalYearId() || 1;
    }

    await this.repository.update(id, updatePaymentNotificationDto, businessStructureId, companyId);
    
    const updated = await this.repository.findById(id, businessStructureId, companyId);
    if (updated) {
      if (updated?.status === 2 || updated?.status === 5) { await this.documentAccountingInfoService.saveDefaults('PaymentNotification', updated.paymentNotificationId); }
    const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded(
        'PaymentNotification',
        updated.status,
        updated.documentDate,
        updated.documentNumber,
        updated.voucherHeaderRef,
        updated.paymentNotificationId
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
