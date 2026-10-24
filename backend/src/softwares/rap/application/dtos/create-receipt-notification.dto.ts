import { IsOptional, IsNumber, IsString, IsArray, ValidateNested, IsNotEmpty, IsDate } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import momentJalaali from 'moment-jalaali';
import momentHijri from 'moment-hijri';
import * as fs from 'fs';

export function toEnglishDigits(str: string): string {
  if (typeof str !== 'string') return str;
  const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  const arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
  for (let i = 0; i < 10; i++) {
    str = str.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
  }
  return str;
}

export function parseDateString({ value }: { value: any }): any {
  try {
    fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] parseDateString received: ${JSON.stringify(value)} (type: ${typeof value})\n`);
  } catch (e) {}
  if (!value) {
    try {
      fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] returning falsy value: ${JSON.stringify(value)}\n`);
    } catch (e) {}
    return value;
  }
  if (value instanceof Date) {
    try {
      fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] returning Date instance: ${value.toISOString()}\n`);
    } catch (e) {}
    return value;
  }
  if (typeof value === 'string') {
    value = toEnglishDigits(value);
    if (value.includes('T') && value.endsWith('Z')) {
      const d = new Date(value);
      try {
        fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] ISO String returning: ${d.toISOString()}\n`);
      } catch (e) {}
      return d;
    }
    const match = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);

      if (year >= 1300 && year <= 1499) {
        if (year > 1415 && year <= 1499) {
          const hDate = momentHijri(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
          if (hDate.isValid()) {
            const d = hDate.toDate();
            try {
              fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] Hijri returning: ${d.toISOString()}\n`);
            } catch (e) {}
            return d;
          }
        } else {
          const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (jDate.isValid()) {
            const d = jDate.toDate();
            try {
              fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] Jalaali returning: ${d.toISOString()}\n`);
            } catch (e) {}
            return d;
          }
        }
      } else {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          try {
            fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] standard date returning: ${d.toISOString()}\n`);
          } catch (e) {}
          return d;
        }
      }
    }
    const fallBack = new Date(value);
    if (!isNaN(fallBack.getTime())) {
      try {
        fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] fallback date returning: ${fallBack.toISOString()}\n`);
      } catch (e) {}
      return fallBack;
    }
  }
  try {
    fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] fallback original returning: ${JSON.stringify(value)}\n`);
  } catch (e) {}
  return value;
}

export class ReceiptCashDto {
  @IsOptional() @IsNumber() receiptCashId?: number;
  @IsOptional() @IsNumber() receiptNotificationRef?: number;
  @IsNotEmpty() @IsNumber() cashRef: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() equivalentAmount?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
}

export class ReceiptChequeDto {
  @IsOptional() @IsNumber() receiptChequeId?: number;
  @IsOptional() @IsNumber() receiptNotificationRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsOptional() @IsString() branchName?: string;
  @IsNotEmpty() @IsString() accountNumber: string;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() chequeNumber?: string;
  @IsOptional() @IsString() dueDate?: string | Date;
  @IsOptional() @IsString() sayyadNumber?: string;
  @IsOptional() @IsString() endorsementNumber?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
}

export class ReceiptDepositDto {
  @IsOptional() @IsNumber() receiptDepositId?: number;
  @IsOptional() @IsNumber() receiptNotificationRef?: number;
  @IsNotEmpty() @IsNumber() bankAccountRef: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsNumber() equivalentAmount?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class ReceiptReturnedPaidChequeDto {
  @IsOptional() @IsNumber() receiptReturnedPaidChequeId?: number;
  @IsOptional() @IsNumber() paymentChequeRef?: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class ReceiptPromissoryNoteDto {
  @IsOptional() @IsNumber() receiptPromissoryNoteId?: number;
  @IsOptional() @IsNumber() receiptNotificationRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsNotEmpty() @IsString() promissoryNoteNumber: string;
  @IsOptional() @IsNumber() promissoryNoteValue?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
}

export class ReceiptReturnedPaymentAssignmentDto {
  @IsOptional() @IsNumber() receiptReturnedPaymentAssignmentId?: number;
  @IsOptional() @IsNumber() paymentAssignmentRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class ReceiptReturnedPaymentPromissoryNoteDto {
  @IsOptional() @IsNumber() receiptReturnedPaymentPromissoryNoteId?: number;
  @IsOptional() @IsNumber() paymentPromissoryNoteRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class CreateReceiptNotificationDto {
  @IsNotEmpty() @IsString() baseType: string;
  @IsOptional() @IsString() baseNumber?: string;
  @IsNotEmpty() @IsString() receiptType: string;
  @IsOptional() @IsString() documentNumber?: string;
  @IsNotEmpty()
  @Transform(parseDateString)
  @IsDate()
  documentDate: Date;
  @IsOptional() @IsNumber() partyRef?: number;
  @IsOptional() @IsNumber() voucherHeaderRef?: number;
  @IsOptional() @IsNumber() currencyRef?: number;
  @IsOptional() @IsNumber() exchangeRate?: number;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() status?: number;
  @IsOptional() @IsNumber() fiscalYearRef?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptCashDto)
  cashItems?: ReceiptCashDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptChequeDto)
  chequeItems?: ReceiptChequeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptDepositDto)
  depositItems?: ReceiptDepositDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptReturnedPaidChequeDto)
  returnedPaymentChequesItems?: ReceiptReturnedPaidChequeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptReturnedPaymentAssignmentDto)
  returnedPaymentAssignments?: ReceiptReturnedPaymentAssignmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptReturnedPaymentPromissoryNoteDto)
  returnedPaymentPromissoryNotes?: ReceiptReturnedPaymentPromissoryNoteDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptPromissoryNoteDto)
  promissoryNoteItems?: ReceiptPromissoryNoteDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptGuaranteeDto)
  guaranteeItems?: ReceiptGuaranteeDto[];
}

export class ReceiptGuaranteeDto {
  @IsOptional() @IsNumber() receiptGuaranteeId?: number;
  @IsOptional() @IsNumber() receiptNotificationRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsNotEmpty() @IsString() guaranteeNumber: string;
  @IsOptional() @IsNumber() guaranteeType?: number;
  @IsOptional() @IsString() baseDocument?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
}
