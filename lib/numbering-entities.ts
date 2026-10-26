export interface NumberingEntityOption {
  label: string;
  value: string;
  menu: string;
  hasHeaderNumberInput: boolean;
}

export const NUMBERING_ENTITY_OPTIONS: NumberingEntityOption[] = [
  // حسابداری
  { label: 'شماره سند حسابداری', value: 'accounting_doc', menu: 'حسابداری', hasHeaderNumberInput: true },
  { label: 'شماره عطف حسابداری', value: 'accounting_ref', menu: 'حسابداری', hasHeaderNumberInput: true },
  { label: 'شماره ثابت حسابداری', value: 'accounting_fixed', menu: 'حسابداری', hasHeaderNumberInput: true },
  { label: 'حساب تفصیلی', value: 'detailed_account', menu: 'حسابداری', hasHeaderNumberInput: true },
  { label: 'مرکز هزینه', value: 'cost_center', menu: 'حسابداری', hasHeaderNumberInput: true },

  // اطلاعات پایه
  { label: 'کالا و خدمت', value: 'product', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'طبقه کالا', value: 'item_account_category', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'گروه کالا و خدمت', value: 'item_service_group', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'واحد سنجش', value: 'measurement_unit', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'انبار و محل فیزیکی کالا', value: 'warehouse', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'طرف حساب', value: 'party', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'سال مالی', value: 'fiscal_year', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },
  { label: 'ارز', value: 'currency', menu: 'اطلاعات پایه', hasHeaderNumberInput: true },

  // انبارداری
  { label: 'تنظیمات انبارگردانی', value: 'stocktaking_settings', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'شماره فرم صدور تگ انبارگردانی', value: 'stocktaking_tag_header', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'صدور تگ انبارگردانی', value: 'stocktaking_tag', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'شمارش انبارگردانی', value: 'stocktaking_count', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'رسید انبار', value: 'warehouse_receipt', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'حواله انبار', value: 'warehouse_issue', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'رسید موقت کالا', value: 'temporary_item_receipt', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'برگشت رسید موقت کالا', value: 'return_temporary_item_receipt', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'درخواست کالا', value: 'item_request', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'درخواست خدمت', value: 'service_request', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'درخواست تامین کالا', value: 'item_supply_request', menu: 'انبارداری', hasHeaderNumberInput: true },
  { label: 'درخواست تامین خدمت', value: 'service_supply_request', menu: 'انبارداری', hasHeaderNumberInput: true },

  // فروش
  { label: 'سفارش فروش', value: 'sales_order', menu: 'فروش', hasHeaderNumberInput: true },
  { label: 'پیش فاکتور فروش', value: 'sales_proforma', menu: 'فروش', hasHeaderNumberInput: true },
  { label: 'فاکتور فروش', value: 'sales_invoice', menu: 'فروش', hasHeaderNumberInput: true },

  // دریافت و پرداخت
  { label: 'اعلامیه پرداخت', value: 'payment_notification', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'رسید دریافت', value: 'receipt_notification', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'عملیات چک دریافتنی', value: 'received_cheque_operation', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'صورتخلاصه تنخواه', value: 'petty_cash_summary', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'درخواست تنخواه', value: 'petty_cash_request', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'صورتحساب بانکی', value: 'reconcile_bank_statement', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'مغایرت بانکی', value: 'bank_reconciliation', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'وصول اسناد پرداختنی', value: 'paid_document_clearing', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'عملیات حسابداری', value: 'rap_accounting_setting', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'صندوق', value: 'cash', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'تنخواه', value: 'petty_cash', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'حساب بانکی', value: 'bank_account', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },
  { label: 'دسته چک', value: 'chequebook', menu: 'دریافت و پرداخت', hasHeaderNumberInput: true },

  // پیمانکاری
  { label: 'پروژه', value: 'project', menu: 'پیمانکاری', hasHeaderNumberInput: true },
  { label: 'قرارداد', value: 'contract', menu: 'پیمانکاری', hasHeaderNumberInput: true },
];

export const getHeaderNumberInputEntities = () => {
  return NUMBERING_ENTITY_OPTIONS.filter(entity => entity.hasHeaderNumberInput);
};

export const NUMBERING_ENTITY_MAP: Record<string, string> = NUMBERING_ENTITY_OPTIONS.reduce((acc, curr) => {
  acc[curr.value] = curr.label;
  if (curr.value === 'product') acc['item'] = curr.label;
  if (curr.value === 'stocktaking_tag') {
    acc['stocktaking_tag_issuance'] = curr.label;
  }
  if (curr.value === 'stocktaking_tag_header') {
    acc['StocktakingTagForm'] = curr.label;
    acc['stocktaking_tag_form'] = curr.label;
  }
  if (curr.value === 'stocktaking_count') {
    acc['StocktakingForm'] = curr.label;
    acc['stocktaking_form'] = curr.label;
    acc['StocktakingCount'] = curr.label;
    acc['stocktaking_count'] = curr.label;
  }
  return acc;
}, {} as Record<string, string>);
