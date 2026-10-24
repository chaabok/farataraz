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
    fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] parseDateString received: ${JSON.stringify(value)} (type: ${typeof value})\n`);
  } catch (e) {}
  if (!value) {
    try {
      fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] returning falsy value: ${JSON.stringify(value)}\n`);
    } catch (e) {}
    return value;
  }
  if (value instanceof Date) {
    try {
      fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] returning Date instance: ${value.toISOString()}\n`);
    } catch (e) {}
    return value;
  }
  if (typeof value === 'string') {
    value = toEnglishDigits(value);
    if (value.includes('T') && value.endsWith('Z')) {
      const d = new Date(value);
      try {
        fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] ISO String returning: ${d.toISOString()}\n`);
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
              fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] Hijri returning: ${d.toISOString()}\n`);
            } catch (e) {}
            return d;
          }
        } else {
          const jDate = momentJalaali(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
          if (jDate.isValid()) {
            const d = jDate.toDate();
            try {
              fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] Jalaali returning: ${d.toISOString()}\n`);
            } catch (e) {}
            return d;
          }
        }
      } else {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          try {
            fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] standard date returning: ${d.toISOString()}\n`);
          } catch (e) {}
          return d;
        }
      }
    }
    const fallBack = new Date(value);
    if (!isNaN(fallBack.getTime())) {
      try {
        fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] fallback date returning: ${fallBack.toISOString()}\n`);
      } catch (e) {}
      return fallBack;
    }
  }
  try {
    fs.appendFileSync('/app/applet/backend_debug.log', `[PAYMENT DTO] fallback original returning: ${JSON.stringify(value)}\n`);
  } catch (e) {}
  return value;
}

export class PaymentCashDto {
  @IsOptional() @IsNumber() paymentCashId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsNotEmpty() @IsNumber() cashRef: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() equivalentAmount?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
}

export class PaymentChequeDto {
  @IsOptional() @IsNumber() paymentChequeId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() bankAccountRef?: number;
  @IsOptional() @IsNumber() chequebookRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() chequeNumber?: string;
  @IsOptional() @IsString() dueDate?: string | Date;
  @IsOptional() @IsString() sayyadNumber?: string;
  @IsOptional() @IsString() endorsementNumber?: string;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
}

export class PaymentWithdrawalDto {
  @IsOptional() @IsNumber() paymentWithdrawalId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsNotEmpty() @IsNumber() bankAccountRef: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() trackingNumber?: string;
  @IsOptional() @IsNumber() equivalentAmount?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class PaymentAssignmentDto {
  @IsOptional() @IsNumber() paymentAssignmentId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsOptional() @IsNumber() receiptChequeRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class PaymentPromissoryNoteDto {
  @IsOptional() @IsNumber() paymentPromissoryNoteId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() promissoryNoteItemRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsNumber() currencyRef?: number;
  @IsOptional() @IsNumber() equivalentAmount?: number;
  @IsOptional() @IsString() dueDate?: string | Date;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
}

export class PaymentReturnedReceivedChequeDto {
  @IsOptional() @IsNumber() paymentReturnedReceivedChequeId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsOptional() @IsNumber() receiptChequeRef?: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class PaymentReturnedReceivedPromissoryNoteDto {
  @IsOptional() @IsNumber() paymentReturnedReceivedPromissoryNoteId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsOptional() @IsNumber() receiptPromissoryNoteRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
}

export class CreatePaymentNotificationDto {
  @IsNotEmpty() @IsNumber() baseType: number;
  @IsOptional() @IsString() baseNumber?: string;
  @IsNotEmpty() @IsNumber() paymentType: number;
  @IsOptional() @IsString() documentNumber?: string;
  @IsNotEmpty()
  @Transform(parseDateString)
  @IsDate()
  documentDate: Date;
  @IsOptional() @IsNumber() partyRef?: number;
  @IsOptional() @IsNumber() currencyRef?: number;
  @IsOptional() @IsNumber() voucherHeaderRef?: number;
  @IsOptional() @IsNumber() exchangeRate?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
  @IsOptional() @IsNumber() status?: number;
  @IsOptional() @IsNumber() fiscalYearRef?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentCashDto)
  cashItems?: PaymentCashDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentChequeDto)
  chequeItems?: PaymentChequeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentWithdrawalDto)
  withdrawalItems?: PaymentWithdrawalDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAssignmentDto)
  assignmentItems?: PaymentAssignmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentPromissoryNoteDto)
  promissoryNoteItems?: PaymentPromissoryNoteDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentGuaranteeDto)
  guaranteeItems?: PaymentGuaranteeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentReturnedReceivedChequeDto)
  returnedReceivedCheques?: PaymentReturnedReceivedChequeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentReturnedReceivedPromissoryNoteDto)
  returnedReceivedPromissoryNotes?: PaymentReturnedReceivedPromissoryNoteDto[];
}

export class PaymentGuaranteeDto {
  @IsOptional() @IsNumber() paymentGuaranteeId?: number;
  @IsOptional() @IsNumber() paymentNotificationRef?: number;
  @IsOptional() @IsNumber() accountingSettingRef?: number;
  @IsOptional() @IsNumber() cashRef?: number;
  @IsOptional() @IsNumber() reasonRef?: number;
  @IsNotEmpty() @IsNumber() amount: number;
  @IsOptional() @IsNumber() currencyRef?: number;
  @IsOptional() @IsNumber() equivalentAmount?: number;
  @IsOptional() dueDate?: Date;
  @IsNotEmpty() @IsString() guaranteeNumber: string;
  @IsOptional() @IsNumber() guaranteeType?: number;
  @IsOptional() @IsString() baseDocument?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() bankRef?: number;
  @IsOptional() @IsNumber() bankAccountRef?: number;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() notificationDate?: Date;
  @IsOptional() dynamicDetailedData?: any;
}
