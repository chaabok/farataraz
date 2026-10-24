/**
 * Enum انواع سند فروش — source of truth for the «تنظیمات اسناد فروش» form.
 * The numeric ID is persisted in Sle.SalesDocumentSettings.SalesDocumentType
 * (and comma-separated in BaseDocumentTypes), never the Persian label.
 */
export enum SalesDocumentType {
  SalesOrder = 1, // سفارش فروش
  SalesProformaInvoice = 2, // پیش فاکتور فروش
  SalesContract = 3, // قرارداد فروش
  SalesPermit = 4, // مجوز فروش
  SalesInvoice = 5, // فاکتور فروش
  SalesReturnPermit = 6, // مجوز برگشت از فروش
  SalesReturnInvoice = 7, // فاکتور برگشت از فروش
}

export const SALES_DOCUMENT_TYPE_LABELS: { value: number; label: string }[] = [
  { value: SalesDocumentType.SalesOrder, label: 'سفارش فروش' },
  { value: SalesDocumentType.SalesProformaInvoice, label: 'پیش فاکتور فروش' },
  { value: SalesDocumentType.SalesContract, label: 'قرارداد فروش' },
  { value: SalesDocumentType.SalesPermit, label: 'مجوز فروش' },
  { value: SalesDocumentType.SalesInvoice, label: 'فاکتور فروش' },
  { value: SalesDocumentType.SalesReturnPermit, label: 'مجوز برگشت از فروش' },
  { value: SalesDocumentType.SalesReturnInvoice, label: 'فاکتور برگشت از فروش' },
];

export function salesDocumentTypeLabel(value: number | string | null | undefined): string {
  const v = Number(value);
  return SALES_DOCUMENT_TYPE_LABELS.find((x) => x.value === v)?.label || 'نامشخص';
}

export function isValidSalesDocumentType(value: unknown): boolean {
  return SALES_DOCUMENT_TYPE_LABELS.some((x) => x.value === Number(value));
}
