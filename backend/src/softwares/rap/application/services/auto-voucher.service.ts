import { Injectable } from '@nestjs/common';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { VoucherService } from '../../../accounting/application/services/voucher.service';
import { AccountService } from '../../../accounting/application/services/account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { CreateVoucherDto } from '../../../accounting/application/dtos/create-voucher.dto';
import { DocumentAccountingInfoService } from './document-accounting-info.service';

@Injectable()
export class AutoVoucherService {
  constructor(
    private readonly baseSettingsService: BaseSettingsService,
    private readonly voucherService: VoucherService,
    private readonly accountService: AccountService,
    private readonly requestContextService: RequestContextService,
    private readonly documentAccountingInfoService: DocumentAccountingInfoService
  ) {}

  async generateAutoVoucherIfNeeded(
    formType: string,
    status: number,
    documentDate: Date | string,
    documentNumber: string,
    existingVoucherId?: number | null,
    documentRef?: number
  ): Promise<number | null> {
    if (status !== 2 && status !== 5) {
      return existingVoucherId || null; // Only for approved status (2 or 5)
    }
    
    if (existingVoucherId) {
      return existingVoucherId; // Already generated
    }

    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const settings = await this.baseSettingsService.getSettingsByTab(6, companyId);
    
    let isAutoVoucherEnabled = false;
    let formTitle = '';
    
    switch (formType) {
      case 'ReceiptNotification':
        isAutoVoucherEnabled = settings['autoVoucherReceiptNotification'] === 'true' || settings['autoVoucherReceiptNotification'] === undefined;
        formTitle = 'رسید دریافت';
        break;
      case 'PaymentNotification':
        isAutoVoucherEnabled = settings['autoVoucherPaymentNotification'] === 'true' || settings['autoVoucherPaymentNotification'] === undefined;
        formTitle = 'اعلامیه پرداخت';
        break;
      case 'PettyCashSummary':
        isAutoVoucherEnabled = settings['autoVoucherPettyCashSummary'] === 'true' || settings['autoVoucherPettyCashSummary'] === undefined;
        formTitle = 'صورتخلاصه تنخواه';
        break;
      case 'PaidDocumentClearing':
        isAutoVoucherEnabled = settings['autoVoucherPaidDocumentClearing'] === 'true' || settings['autoVoucherPaidDocumentClearing'] === undefined;
        formTitle = 'وصول اسناد پرداختنی';
        break;
      case 'ReceivedChequeOperation':
        isAutoVoucherEnabled = settings['autoVoucherReceivedChequeOperation'] === 'true' || settings['autoVoucherReceivedChequeOperation'] === undefined;
        formTitle = 'عملیات چک دریافتنی';
        break;
    }

    if (!isAutoVoucherEnabled) {
      return null;
    }

    let accItems: any[] = [];
    if (documentRef) {
      await this.documentAccountingInfoService.saveDefaults(formType, documentRef);
      const result = await this.documentAccountingInfoService.getByDocumentWithAccounts(formType, documentRef);
      accItems = result.items || [];
    }

    const dto: CreateVoucherDto = {
      voucherNumber: 0,
      voucherDate: typeof documentDate === 'string' ? new Date(documentDate) : documentDate,
      description: `صدور سند خودکار برای فرم ${formTitle} شماره ${documentNumber}`,
      status: 1, // Draft
      items: [],
    };

    try {
      const accounts = await this.accountService.findAll(undefined, undefined, { limit: 1 });
      const firstAccountId = accounts.length > 0 ? accounts[0].id : 1;

       let rowNum = 1;
      if (accItems.length > 0) {
        for (const item of accItems) {
           const data = item.data || {};
           const opAccId = item.opAccountInfo?.id;
           const forAccId = item.forAccountInfo?.id;

           if (!opAccId || !forAccId) {
             console.log(`AutoVoucherService: Missing opAccId (${opAccId}) or forAccId (${forAccId}) for document ${documentNumber}. Aborting auto voucher.`);
             return null;
           }

           const amount = Number(item.amount || 0);

           const opDetail1 = data.opDetail1Ref || item.suggestedOpDetailedAccountId || item.suggestedOpPartyDetailedAccountId || null;
           const forDetail1 = data.forDetail1Ref || item.suggestedPartyDetailedAccountId || item.suggestedBankDetailedAccountId || null;

           const isPayment = formType === 'PaymentNotification';

           let opDebit = isPayment ? 0 : amount;
           let opCredit = isPayment ? amount : 0;
           let forDebit = isPayment ? amount : 0;
           let forCredit = isPayment ? 0 : amount;

           if (item.isReverse) {
             const tempOpDebit = opDebit;
             opDebit = opCredit;
             opCredit = tempOpDebit;

             const tempForDebit = forDebit;
             forDebit = forCredit;
             forCredit = tempForDebit;
           }

           dto.items.push({
             rowNumber: rowNum++,
             accountId: opAccId,
             debit: opDebit,
             credit: opCredit,
             description: `ثبت خودکار بابت ${formTitle} شماره ${documentNumber} - ${item.rowType || ''}`,
             detailedAccountId1: opDetail1,
             detailedAccountId2: data.opDetail2Ref || null,
             detailedAccountId3: data.opDetail3Ref || null,
             detailedAccountId4: data.opDetail4Ref || null,
             detailedAccountId5: data.opDetail5Ref || null,
             detailedAccountId6: data.opDetail6Ref || null,
             isSystemGenerated: true,
           });
           
           dto.items.push({
             rowNumber: rowNum++,
             accountId: forAccId,
             debit: forDebit,
             credit: forCredit,
             description: `طرف حساب - ${formTitle} شماره ${documentNumber} - ${item.rowType || ''}`,
             detailedAccountId1: forDetail1,
             detailedAccountId2: data.forDetail2Ref || null,
             detailedAccountId3: data.forDetail3Ref || null,
             detailedAccountId4: data.forDetail4Ref || null,
             detailedAccountId5: data.forDetail5Ref || null,
             detailedAccountId6: data.forDetail6Ref || null,
             isSystemGenerated: true,
           });
        }
      } else {
        console.log(`AutoVoucherService: No accItems found for document ${documentNumber}. Aborting auto voucher.`);
        return null;
      }

      const createdVoucher = await this.voucherService.create(dto);
      if (createdVoucher && createdVoucher.voucherId) {
        return createdVoucher.voucherId;
      }
    } catch (e) {
      console.error('Failed to create auto voucher', e);
    }
    
    return null;
  }
}
