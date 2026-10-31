"use client";
import { apiFetch } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage, useCompany } from '@/components/Providers';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { useConfirm } from '@/components/ConfirmProvider';
import { CloseButton } from '@/components/buttons/CloseButton';
import { SaveButton } from '@/components/buttons/SaveButton';
import { TextInput } from '@/components/inputs/TextInput';
import { TextArea } from '@/components/inputs/TextArea';
import { Select } from '@/components/inputs/Select';
import { MultiCheckbox } from '@/components/inputs/MultiCheckbox';
import { Checkbox } from '@/components/inputs/Checkbox';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { NumberInput } from '@/components/inputs/NumberInput';
import { safeStringify } from '@/lib/utils';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { FileUpload } from '@/components/inputs/FileUpload';
import { MultiColumnDropdown } from '@/components/inputs/MultiColumnDropdown';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { BUSINESS_STRUCTURE_TYPES } from '@/lib/constants';
import { GroupField } from '@/components/inputs/GroupField';

import { Trash2 } from 'lucide-react';

export enum SystemDateEnum {
  Jalali = 'Jalali',
  Hijri = 'Hijri',
  Gregorian = 'Gregorian'
}

type TabConfig = {
  id: string;
  tabRef: number;
  title: string;
  colorClass: string;
  textColorClass: string;
  borderColorClass: string;
  activeBgClass: string;
  fields: { 
    key: string; 
    label: string; 
    type: 'text' | 'textarea' | 'select' | 'multi-checkbox' | 'checkbox' | 'checkbox-right-label' | 'number' | 'group' | 'multicolumn' | 'singleselect';
    options?: { label: string; value: string }[]
    defaultValue?: string;
    dependsOn?: { key: string; value: string };
    dependsOnIncludes?: { key: string; value: string };
    disabled?: boolean;
    required?: boolean;
    min?: number;
    max?: number;
    integerOnly?: boolean;
    fields?: { key: string; label: string; type: 'number' | 'text' | 'checkbox' | 'checkbox-right-label' | 'select'; defaultValue?: string; disabled?: boolean; required?: boolean; min?: number; max?: number; integerOnly?: boolean; options?: { label: string; value: string }[]; dependsOn?: { key: string; value: string }; }[];
    listApiUrl?: string;
    columns?: { key: string; label: string; width?: number; hideFilter?: boolean; sortable?: boolean; hidden?: boolean; }[];
    displayKey?: string;
  }[];
};

const tabsConfig: TabConfig[] = [
  { 
    id: 'general', 
    tabRef: 1,
    title: 'عمومی', 
    colorClass: 'bg-blue-600', 
    textColorClass: 'text-blue-600',
    borderColorClass: 'border-blue-600',
    activeBgClass: 'bg-blue-50',
    fields: [
      { 
        key: 'systemDate', 
        label: 'تاریخ سیستم', 
        type: 'select',
        defaultValue: SystemDateEnum.Jalali,
        options: [
          { label: 'تاریخ شمسی', value: SystemDateEnum.Jalali },
          { label: 'تاریخ قمری', value: SystemDateEnum.Hijri },
          { label: 'تاریخ میلادی', value: SystemDateEnum.Gregorian }
        ]
      },
      {
        key: 'enable2StepLogin',
        label: 'تنظیم ورود 2مرحله فعال باشد',
        type: 'checkbox',
        defaultValue: 'false'
      },
      {
        key: 'twoStepMethod',
        label: 'روش ورود دومرحله‌ای',
        type: 'select',
        defaultValue: 'sms',
        options: [
          { label: 'پیامک', value: 'sms' },
          { label: 'ایمیل', value: 'email' },
          { label: 'اپلیکیشن Authenticator', value: 'app' }
        ],
        dependsOn: { key: 'enable2StepLogin', value: 'true' }
      }
    ]
  },
  { 
    id: 'accounting', 
    tabRef: 2,
    title: 'حسابداری', 
    colorClass: 'bg-emerald-500', 
    textColorClass: 'text-emerald-500',
    borderColorClass: 'border-emerald-500',
    activeBgClass: 'bg-emerald-50',
    fields: [
      {
        key: 'showTrackingColumnsInVoucher',
        label: 'ستون تاریخ و شماره پیگیری در سند نمایش داده شود',
        type: 'checkbox',
        defaultValue: 'true'
      },
      {
        key: 'requireTrackingInfoIfEnabled',
        label: 'ورود اطلاعات تاریخ و شماره پیگیری اجباری باشد',
        type: 'checkbox',
        defaultValue: 'false',
        dependsOn: { key: 'showTrackingColumnsInVoucher', value: 'true' }
      },
      {
        key: 'showCurrencyColumnsInVoucher',
        label: 'ستون های ارزی نمایش داده شود',
        type: 'checkbox',
        defaultValue: 'false'
      },
      {
        key: 'enableLedgerAccessControl',
        label: 'دسترسی مجاز در سطح معین فعال باشد',
        type: 'checkbox',
        defaultValue: 'false'
      },
      { 
        key: 'defaultCurrency', 
        label: 'ارز پایه', 
        type: 'multicolumn', 
        defaultValue: 'ریال',
        displayKey: 'title',
        listApiUrl: '/api/common/currencies',
        columns: [ { key: 'code', label: 'کد', width: 60 }, { key: 'title', label: 'عنوان', width: 120 }, { key: 'titleEn', label: 'عنوان لاتین', width: 120 }
        ]
      },
      { key: 'fiscalYearStart', label: 'شروع سال مالی', type: 'text' },
      { key: 'detailedCodeLength', label: 'طول کد تفصیلی', type: 'number', defaultValue: '6' },
      { key: 'detailedLevelsCount', label: 'تعداد سطوح تفصیلی', type: 'number', defaultValue: '10', required: true, min: 0, max: 10, integerOnly: true },
      {
        key: 'accountCodeLengthsGroup',
        label: 'طول کد حسابها',
        type: 'group',
        fields: [
          { key: 'totalAccountCodeLength', label: 'طول کد حسابها', type: 'number', defaultValue: '6', required: true },
          { key: 'groupAccountLength', label: 'طول گروه حساب', type: 'number', defaultValue: '2', required: true },
          { key: 'totalAccountLength', label: 'طول حساب کل', type: 'number', defaultValue: '4', required: true },
          { key: 'specificAccountLength', label: 'طول حساب معین', type: 'number', defaultValue: '0', disabled: true, required: true }
        ]
      }
    ]
  },
  { 
    id: 'warehouse', 
    tabRef: 3,
    title: 'انبار', 
    colorClass: 'bg-cyan-600', 
    textColorClass: 'text-cyan-600',
    borderColorClass: 'border-cyan-600',
    activeBgClass: 'bg-cyan-50',
    fields: [
      { 
        key: 'defaultWarehouse', 
        label: 'قیمت گذاری در سطح', 
        type: 'select',
        defaultValue: '1',
        options: [
          { label: 'در سطح انبار', value: '1' },
          { label: 'در سطح طبقه حساب', value: '2' }
        ]
      },
      {
        key: 'controlNegativeStock',
        label: 'کنترل موجودی منفی',
        type: 'checkbox-right-label',
        defaultValue: 'true'
      },
      { 
        key: 'valuationMethod', 
        label: 'روش ارزیابی', 
        type: 'multi-checkbox',
        defaultValue: '1,2,5',
        options: [
          { label: 'میانگین موزون', value: '1' },
          { label: 'اولین وارده اولین صادره (FIFO)', value: '2' },
          { label: 'آخرین وارده اولین صادره (LIFO)', value: '3' },
          { label: 'نرخ استاندارد', value: '4' },
          { label: 'شناسایی ویژه', value: '5' }
        ]
      },
      { key: 'trackingFactorLevelsCount', label: 'تعداد سطوح عامل ردیابی', type: 'number', defaultValue: '20', min: 0, max: 20, integerOnly: true },
      {
        key: 'itemCodeSettingsGroup',
        label: 'تنظیمات کد کالا',
        type: 'group',
        fields: [
          { key: 'itemCodeLength', label: 'طول کد کالا', type: 'number', defaultValue: '10', min: 1, max: 100, integerOnly: true },
          { key: 'isItemCodeLengthFixed', label: 'طول کد کالا ثابت', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'allowItemCodeLetters', label: 'کد کالا شامل حرف باشد', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'allowDuplicateItemName', label: 'امکان ثبت کالای با عنوان تکراری', type: 'checkbox-right-label', defaultValue: 'false' }
        ]
      },
      {
        key: 'warehouseTrackingSettingsGroup',
        label: 'تنظیمات انبار ردیابی',
        type: 'group',
        fields: [
          {
            key: 'isTrackingFactorActiveInWarehouse',
            label: 'عامل ردیابی در سیستم انبار فعال باشد.',
            type: 'checkbox-right-label',
            defaultValue: 'false'
          },
          {
            key: 'isTrackingFactorActiveInItemRequest',
            label: 'عامل ردیابی در فرم درخواست کالا فعال باشد.',
            type: 'checkbox-right-label',
            defaultValue: 'false'
          },
          {
            key: 'isTrackingFactorActiveInItemSupplyRequest',
            label: 'عامل ردیابی در فرم درخواست تامین کالا فعال باشد.',
            type: 'checkbox-right-label',
            defaultValue: 'false'
          },
          {
            key: 'isTrackingFactorActiveInPurchaseInvoice',
            label: 'عامل ردیابی در فرم فاکتور خرید کالا فعال باشد.',
            type: 'checkbox-right-label',
            defaultValue: 'false'
          },
          {
            key: 'isTrackingFactorActiveInTemporaryReceipt',
            label: 'عامل ردیابی در فرم رسید موقت فعال باشد.',
            type: 'checkbox-right-label',
            defaultValue: 'false'
          }
        ]
      },
      {
        key: 'productServiceCategoryGroup',
        label: 'طول گروه کالا خدمت',
        type: 'group',
        fields: [
          { key: 'totalProductServiceGroupLength', label: 'طول کد گروه کالا خدمت', type: 'number', defaultValue: '6', disabled: true },
          { key: 'mainBranchLength', label: 'طول کد شاخه اصلی', type: 'number', defaultValue: '2', required: true },
          { key: 'level1BranchLength', label: 'طول کد شاخه سطح اول', type: 'number', defaultValue: '2' },
          { key: 'level2BranchLength', label: 'طول کد شاخه سطح دوم', type: 'number', defaultValue: '2' },
          { key: 'level3BranchLength', label: 'طول کد شاخه سطح سوم', type: 'number', defaultValue: '0' },
          { key: 'level4BranchLength', label: 'طول کد شاخه سطح چهارم', type: 'number', defaultValue: '0' },
          { key: 'level5BranchLength', label: 'طول کد شاخه سطح پنجم', type: 'number', defaultValue: '0' }
        ]
      },
      {
        key: 'itemCodingMethodGroup',
        label: 'روش کدگذاری کالا خدمت',
        type: 'group',
        fields: [
          {
            key: 'itemCodingMethod',
            label: 'نحوه کدگذاری',
            type: 'select',
            defaultValue: '1',
            options: [
              { label: 'سریالی', value: '1' },
              { label: 'اتوماتیک', value: '2' }
            ]
          },
          {
            key: 'groupCodeLength',
            label: 'طول کد گروه',
            type: 'number',
            disabled: true,
            dependsOn: { key: 'itemCodingMethod', value: '2' }
          },
          {
            key: 'itemVariableCodeLength',
            label: 'طول جزء متغیر کد کالا',
            type: 'number',
            disabled: true,
            dependsOn: { key: 'itemCodingMethod', value: '2' }
          },
          {
            key: 'counterStart',
            label: 'شروع شمارنده',
            type: 'number',
            defaultValue: '1',
            min: 1,
            integerOnly: true,
            dependsOn: { key: 'itemCodingMethod', value: '2' }
          }
        ]
      }
    ]
  },
  { 
    id: 'sales', 
    tabRef: 4,
    title: 'فروش', 
    colorClass: 'bg-indigo-500', 
    textColorClass: 'text-indigo-500',
    borderColorClass: 'border-indigo-500',
    activeBgClass: 'bg-indigo-50',
    fields: [
      { key: 'defaultTaxRate', label: 'نرخ مالیات پیش‌فرض (%)', type: 'text' },
      { key: 'invoiceTemplate', label: 'قالب فاکتور', type: 'text' },
      {
        key: 'isWalletActive',
        label: 'کیف پول فعال باشد',
        type: 'checkbox-right-label',
        defaultValue: 'true'
      },
      {
        key: 'showPriceInSalesPermission',
        label: 'نمایش قیمت در مجوز فروش',
        type: 'checkbox-right-label',
        defaultValue: 'true'
      },
      {
        // Task 139: «نمایش قیمت در مجوز برگشت از فروش» — مشابه مجوز فروش
        key: 'showPriceInSalesReturnPermission',
        label: 'نمایش قیمت در مجوز برگشت از فروش',
        type: 'checkbox-right-label',
        defaultValue: 'true'
      },
      {
        key: 'showTrackingFactorInSalesDocumentsGroup',
        label: 'نمایش عامل ردیابی در اسناد فروش',
        type: 'group',
        fields: [
          { key: 'showTrackingFactorInSalesOrder', label: 'سفارش فروش', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'showTrackingFactorInSalesProforma', label: 'پیش فاکتور فروش', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'showTrackingFactorInSalesContract', label: 'قرارداد فروش', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'showTrackingFactorInSalesPermission', label: 'مجوز فروش', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'showTrackingFactorInSalesInvoice', label: 'فاکتور فروش', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'showTrackingFactorInSalesReturnPermission', label: 'مجوز برگشت از فروش', type: 'checkbox-right-label', defaultValue: 'false' },
          { key: 'showTrackingFactorInSalesReturnInvoice', label: 'فاکتور برگشت از فروش', type: 'checkbox-right-label', defaultValue: 'false' }
        ]
      }
    ]
  },
  { 
    id: 'payroll', 
    tabRef: 5,
    title: 'حقوق و دستمزد', 
    colorClass: 'bg-purple-500', 
    textColorClass: 'text-purple-500',
    borderColorClass: 'border-purple-500',
    activeBgClass: 'bg-purple-50',
    fields: [
      { key: 'standardWorkingHours', label: 'ساعات کار استاندارد', type: 'text' },
    ]
  },
  { 
    id: 'receipts_payments', 
    tabRef: 6,
    title: 'دریافت و پرداخت', 
    colorClass: 'bg-rose-500', 
    textColorClass: 'text-rose-500',
    borderColorClass: 'border-rose-500',
    activeBgClass: 'bg-rose-50',
    fields: [
      { key: 'defaultBankAccount', label: 'حساب بانکی پیش‌فرض', type: 'text' },
      { key: 'maxPromissoryNoteLeaves', label: 'حداکثر تعداد برگ سفته', type: 'number', defaultValue: '500' },
      { 
        key: 'establishmentYearRef', 
        label: 'سال استقرار', 
        type: 'singleselect', 
        displayKey: 'title',
        listApiUrl: '/api/common/fiscalyear',
        columns: [
          { key: 'title', label: 'عنوان', width: 150 },
          { key: 'startDate', label: 'تاریخ شروع', width: 120 },
          { key: 'endDate', label: 'تاریخ پایان', width: 120 },
        ]
      },
      {
        key: 'autoVoucherGroup',
        label: 'صدور سند خودکار',
        type: 'group',
        fields: [
          {
            key: 'autoVoucherReceiptNotification',
            label: 'صدور سند خودکار برای فرم رسید دریافت',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'autoVoucherPaymentNotification',
            label: 'صدور سند خودکار برای فرم اعلامیه پرداخت',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'autoVoucherPettyCashSummary',
            label: 'صدور سند خودکار برای فرم صورتخلاصه تنخواه',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'autoVoucherPaidDocumentClearing',
            label: 'صدور سند خودکار برای فرم وصول اسناد پرداختنی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'autoVoucherReceivedChequeOperation',
            label: 'صدور سند خودکار برای فرم عملیات چک دریافتنی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          }
        ]
      },
      {
        key: 'showDetailedLevelsInRapForms',
        label: 'نمایش اطلاعات سطوح تفصیلی در قلم فرم های دریافت و پرداخت',
        type: 'checkbox-right-label',
        defaultValue: 'false'
      },
      {
        key: 'activeTabsInReceiptNotificationGroup',
        label: 'تب های فعال در فرم رسید دریافت',
        type: 'group',
        fields: [
          {
            key: 'receiptTabCash',
            label: 'نقد',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabCheque',
            label: 'چک',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabWithdrawal',
            label: 'اعلامیه واریز',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabTransfer',
            label: 'برگشت واگذار به غیر',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabRefund1',
            label: 'استرداد چک پرداختنی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabPromissoryNote',
            label: 'سفته',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabRefund2',
            label: 'استرداد سفته پرداختنی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabGuarantee',
            label: 'تضمین',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'receiptTabRefund3',
            label: 'استرداد تضمین پرداختی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          }
        ]
      },
      {
        key: 'activeTabsInPaymentNotificationGroup',
        label: 'تب های فعال در فرم اعلامیه پرداخت',
        type: 'group',
        fields: [
          {
            key: 'paymentTabCash',
            label: 'نقد',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabCheque',
            label: 'چک',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabWithdrawal',
            label: 'اعلامیه برداشت',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabTransfer',
            label: 'واگذار به غیر',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabRefund1',
            label: 'استرداد چک دریافتنی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabPromissoryNote',
            label: 'سفته',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabRefund2',
            label: 'استرداد سفته دریافتنی',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabGuarantee',
            label: 'تضمین',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          },
          {
            key: 'paymentTabRefund3',
            label: 'استرداد تضمین',
            type: 'checkbox-right-label',
            defaultValue: 'true'
          }
        ]
      }
    ]
  }
];

function FontManager() {
  const [fonts, setFonts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const fetchFonts = async () => {
    try {
      const res = await apiFetch('/api/fonts');
      if (res.ok) {
        const data = await res.json();
        setFonts(data.fonts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFonts();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await apiFetch('/api/fonts', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
           showToast(data.error, 'error');
        } else {
           showToast('فونت با موفقیت آپلود شد.', 'success');
           setSelectedFile(null);
           fetchFonts();
        }
      } else {
         const data = await res.json();
         showToast(data.error || 'خطا در آپلود فونت', 'error');
      }
    } catch (e) {
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    const isConfirmed = await confirm({ message: 'آیا از حذف این فونت اطمینان دارید؟' });
    if (!isConfirmed) return;
    
    try {
      const res = await apiFetch(`/api/fonts?filename=${encodeURIComponent(filename)}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          showToast(data.error, 'error');
        } else {
          showToast('فونت با موفقیت حذف شد.', 'success');
          fetchFonts();
        }
      } else {
         const data = await res.json();
         showToast(data.error || 'خطا در حذف فونت', 'error');
      }
    } catch (e) {
      showToast('خطا در ارتباط با سرور', 'error');
    }
  };

  return (
    <div className="md:col-span-2 mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 rounded-full bg-blue-600"></div>
        <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">مدیریت فونت‌ها</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
         <FileUpload 
           label="آپلود فونت جدید"
           accept=".ttf,.otf,.woff,.woff2"
           selectedFile={selectedFile}
           onChange={setSelectedFile}
         />
         <div>
            <button 
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {uploading ? 'در حال آپلود...' : 'آپلود فونت'}
            </button>
         </div>
      </div>
      
      {fonts.length > 0 && (
         <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">فونت‌های آپلود شده</h4>
            <div className="flex flex-wrap gap-3">
               {fonts.map((f, i) => (
                  <div key={i} className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700 shadow-sm relative group pr-10">
                     <button
                        onClick={() => handleDelete(f.filename)}
                        className="absolute right-2 text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف فونت"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <span className="text-gray-700 dark:text-gray-300 font-medium">{f.filename}</span>
                     <style dangerouslySetInnerHTML={{__html: `@font-face { font-family: 'CustomFont_${i}'; src: url('${f.url}'); }`}} />
                     <span className="mr-3 text-lg" style={{fontFamily: `CustomFont_${i}`}}>آا</span>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  )
}

export function BaseSettings() {
  const { removeTab, activeTabId } = useTabs();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { t } = useLanguage();
  const { currentCompany } = useCompany();

  const isHeadquarter = currentCompany && Number(currentCompany.businessStructure) === 1;

  const availableTabs = tabsConfig;

  const [activeInnerTab, setActiveInnerTab] = useState<string>(tabsConfig[0].id);
  const [settingsValues, setSettingsValues] = useState<Record<number, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasBusinessStructures, setHasBusinessStructures] = useState(false);
  const [has2FAUsers, setHas2FAUsers] = useState(false);

  const currentTabConfig = availableTabs.find(t => t.id === activeInnerTab) || availableTabs[0];
  const currentTabRef = currentTabConfig.tabRef;

  const checkDependencies = async () => {
    try {
      if (activeInnerTab === 'general') {
        const res = await apiFetch('/api/business-structure');
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            setHasBusinessStructures(true);
          } else {
            setHasBusinessStructures(false);
          }
        }
        const res2FA = await apiFetch('/api/iam/2fa-in-use');
        if (res2FA.ok) {
          const is2FAInUse = await res2FA.json();
          setHas2FAUsers(is2FAInUse === true || is2FAInUse?.inUse === true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSettings = async (tabRef: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/common/base-settings/tab/${tabRef}`);
      if (res.ok) {
        const result = await res.json();
        const loadedData = result.data || {};
        if (tabRef === 2) {
          const total = parseInt(loadedData.totalAccountCodeLength || '6', 10) || 6;
          const group = parseInt(loadedData.groupAccountLength || '2', 10) || 2;
          const totalAcc = parseInt(loadedData.totalAccountLength || '4', 10) || 4;
          loadedData.specificAccountLength = (total - group - totalAcc).toString();
        }
        if (tabRef === 3) {
          if (loadedData.mainBranchLength === undefined) loadedData.mainBranchLength = '2';
          if (loadedData.level1BranchLength === undefined) loadedData.level1BranchLength = '2';
          if (loadedData.level2BranchLength === undefined) loadedData.level2BranchLength = '2';
          const main = parseInt(loadedData.mainBranchLength || '2', 10) || 0;
          const lvl1 = parseInt(loadedData.level1BranchLength || '2', 10) || 0;
          const lvl2 = parseInt(loadedData.level2BranchLength || '2', 10) || 0;
          const lvl3 = parseInt(loadedData.level3BranchLength || '0', 10) || 0;
          const lvl4 = parseInt(loadedData.level4BranchLength || '0', 10) || 0;
          const lvl5 = parseInt(loadedData.level5BranchLength || '0', 10) || 0;
          const totalGroup = main + lvl1 + lvl2 + lvl3 + lvl4 + lvl5;
          loadedData.totalProductServiceGroupLength = totalGroup.toString();
          loadedData.groupCodeLength = totalGroup.toString();

          const itemLen = parseInt(loadedData.itemCodeLength || '10', 10) || 0;
          const variableLen = Math.max(0, itemLen - totalGroup);
          loadedData.itemVariableCodeLength = variableLen.toString();

          if (!loadedData.counterStart) {
            loadedData.counterStart = '1';
          }
          if (!loadedData.itemCodingMethod) {
            loadedData.itemCodingMethod = '1';
          }
          if (!loadedData.trackingFactorLevelsCount) {
            loadedData.trackingFactorLevelsCount = '20';
          }
          if (loadedData.controlNegativeStock === undefined || loadedData.controlNegativeStock === '') {
            loadedData.controlNegativeStock = 'true';
          }
          if (!loadedData.valuationMethod) {
            loadedData.valuationMethod = '1,2,5';
          }
        }
        setSettingsValues(prev => ({
          ...prev,
          [tabRef]: loadedData
        }));
      }
    } catch (error) {
      console.error('Error loading settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings(currentTabRef);
    checkDependencies();
  }, [currentTabRef, activeInnerTab]);

  const handleClose = () => {
    if (activeTabId) {
      removeTab(activeTabId);
    }
  };

  const handleSave = async () => {
    // Apply default values first
    const currentValues = { ...settingsValues[currentTabRef] };
    currentTabConfig.fields.forEach(field => {
      if (field.type === 'group') {
        field.fields?.forEach(subField => {
          if (currentValues[subField.key] === undefined && subField.defaultValue !== undefined) {
            currentValues[subField.key] = subField.defaultValue;
          }
        });
      } else {
        if (currentValues[field.key] === undefined && field.defaultValue !== undefined) {
          currentValues[field.key] = field.defaultValue;
        }
      }
    });

    if (currentTabRef === 2) {
      const total = parseInt(currentValues.totalAccountCodeLength || '6', 10) || 0;
      const group = parseInt(currentValues.groupAccountLength || '2', 10) || 0;
      const totalAcc = parseInt(currentValues.totalAccountLength || '4', 10) || 0;
      const specific = total - group - totalAcc;
      currentValues.specificAccountLength = specific.toString();

      if (specific < 0) {
        showToast('مجموع طول گروه حساب و طول حساب کل نمی‌تواند از طول کد حساب‌ها بیشتر باشد.', 'error');
        return;
      }
    }

    if (currentTabRef === 3) {
      if (currentValues.mainBranchLength === undefined) currentValues.mainBranchLength = '2';
      if (currentValues.level1BranchLength === undefined) currentValues.level1BranchLength = '2';
      if (currentValues.level2BranchLength === undefined) currentValues.level2BranchLength = '2';
      const main = parseInt(currentValues.mainBranchLength || '2', 10) || 0;
      const lvl1 = parseInt(currentValues.level1BranchLength || '2', 10) || 0;
      const lvl2 = parseInt(currentValues.level2BranchLength || '2', 10) || 0;
      const lvl3 = parseInt(currentValues.level3BranchLength || '0', 10) || 0;
      const lvl4 = parseInt(currentValues.level4BranchLength || '0', 10) || 0;
      const lvl5 = parseInt(currentValues.level5BranchLength || '0', 10) || 0;
      const sum = main + lvl1 + lvl2 + lvl3 + lvl4 + lvl5;
      currentValues.totalProductServiceGroupLength = sum.toString();
      currentValues.groupCodeLength = sum.toString();

      const itemLen = parseInt(currentValues.itemCodeLength || '10', 10) || 0;
      const variableLen = Math.max(0, itemLen - sum);
      currentValues.itemVariableCodeLength = variableLen.toString();

      if (!currentValues.counterStart) {
        currentValues.counterStart = '1';
      }
      if (!currentValues.itemCodingMethod) {
        currentValues.itemCodingMethod = '1';
      }
      if (!currentValues.trackingFactorLevelsCount) {
        currentValues.trackingFactorLevelsCount = '20';
      }
      if (!currentValues.defaultWarehouse) {
        currentValues.defaultWarehouse = '1';
      }
      if (currentValues.controlNegativeStock === undefined || currentValues.controlNegativeStock === '') {
        currentValues.controlNegativeStock = 'true';
      }
      if (!currentValues.valuationMethod) {
        currentValues.valuationMethod = '1,2,5';
      }
    }

    // validation
    for (const field of currentTabConfig.fields) {
      if (field.type === 'group') {
        for (const subField of field.fields || []) {
           if (subField.required && (currentValues[subField.key] === undefined || currentValues[subField.key] === '')) {
             if (subField.type === 'number' && currentValues[subField.key] === '0') {
               continue;
             }
             showToast(`پر کردن فیلد ${t(`settings.${subField.key}`, subField.label)} الزامی است.`, 'error');
             return;
           }
           if (subField.type === 'number' && currentValues[subField.key] !== undefined && currentValues[subField.key] !== '') {
             const numVal = parseInt(currentValues[subField.key], 10);
             if (subField.max !== undefined && numVal > subField.max) {
               showToast(`مقدار فیلد ${t(`settings.${subField.key}`, subField.label)} نمی‌تواند بیشتر از ${subField.max} باشد.`, 'error');
               return;
             }
             if (subField.min !== undefined && numVal < subField.min) {
               showToast(`مقدار فیلد ${t(`settings.${subField.key}`, subField.label)} نمی‌تواند کمتر از ${subField.min} باشد.`, 'error');
               return;
             }
           }
        }
      } else {
        if (field.required && (currentValues[field.key] === undefined || currentValues[field.key] === '')) {
           // Allow 0 for numeric fields
           if (field.type === 'number' && currentValues[field.key] === '0') {
             continue;
           }
           showToast(`پر کردن فیلد ${t(`settings.${field.key}`, field.label)} الزامی است.`, 'error');
           return;
        }
        if (field.type === 'number' && currentValues[field.key] !== undefined && currentValues[field.key] !== '') {
          const numVal = parseInt(currentValues[field.key], 10);
          if (field.max !== undefined && numVal > field.max) {
            showToast(`مقدار فیلد ${t(`settings.${field.key}`, field.label)} نمی‌تواند بیشتر از ${field.max} باشد.`, 'error');
            return;
          }
          if (field.min !== undefined && numVal < field.min) {
            showToast(`مقدار فیلد ${t(`settings.${field.key}`, field.label)} نمی‌تواند کمتر از ${field.min} باشد.`, 'error');
            return;
          }
        }
      }
    }

    setSaving(true);
    try {
      const groupKeyNames = ['accountCodeLengthsGroup', 'productServiceCategoryGroup', 'autoVoucherGroup', 'activeTabsInReceiptNotificationGroup', 'activeTabsInPaymentNotificationGroup', 'itemCodingMethodGroup', 'itemCodeSettingsGroup', 'warehouseTrackingSettingsGroup', 'showTrackingFactorInSalesDocumentsGroup'];
      const settingsArray = Object.entries(currentValues)
        .filter(([key]) => key && !groupKeyNames.includes(key))
        .map(([key, value]) => ({ 
          key, 
          value: value !== null && value !== undefined ? String(value) : '' 
        }));
      
      const res = await apiFetch(`/api/common/base-settings/tab/${currentTabRef}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({ settings: settingsArray }),
      });
      
      if (res.ok) {
        showToast('اطلاعات با موفقیت ذخیره گردید.', 'success');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('parsa_base_settings_updated'));
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Save settings failed:', errData);
        showToast(errData?.message || 'خطا در ذخیره تنظیمات.', 'error');
      }
    } catch (error) {
      console.error('Error saving settings', error);
      showToast('خطا در ذخیره تنظیمات.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettingsValues(prev => {
      const currentTabValues = { ...(prev[currentTabRef] || {}) };
      currentTabValues[key] = value;
      
      if (currentTabRef === 2) {
        if (key === 'totalAccountCodeLength' || key === 'groupAccountLength' || key === 'totalAccountLength') {
          const total = parseInt(currentTabValues.totalAccountCodeLength || '6') || 0;
          const group = parseInt(currentTabValues.groupAccountLength || '0') || 0;
          const totalAcc = parseInt(currentTabValues.totalAccountLength || '0') || 0;
          const specific = total - group - totalAcc;
          currentTabValues['specificAccountLength'] = specific.toString();
        }
      }

      if (currentTabRef === 3) {
        if (key === 'isTrackingFactorActiveInWarehouse' && value === 'false') {
          currentTabValues['isTrackingFactorActiveInItemRequest'] = 'false';
          currentTabValues['isTrackingFactorActiveInItemSupplyRequest'] = 'false';
          currentTabValues['isTrackingFactorActiveInPurchaseInvoice'] = 'false';
          currentTabValues['isTrackingFactorActiveInTemporaryReceipt'] = 'false';
        }

        if (['mainBranchLength', 'level1BranchLength', 'level2BranchLength', 'level3BranchLength', 'level4BranchLength', 'level5BranchLength', 'itemCodeLength'].includes(key)) {
          const main = parseInt(currentTabValues.mainBranchLength || '0') || 0;
          const lvl1 = parseInt(currentTabValues.level1BranchLength || '0') || 0;
          const lvl2 = parseInt(currentTabValues.level2BranchLength || '0') || 0;
          const lvl3 = parseInt(currentTabValues.level3BranchLength || '0') || 0;
          const lvl4 = parseInt(currentTabValues.level4BranchLength || '0') || 0;
          const lvl5 = parseInt(currentTabValues.level5BranchLength || '0') || 0;
          const sum = main + lvl1 + lvl2 + lvl3 + lvl4 + lvl5;
          currentTabValues['totalProductServiceGroupLength'] = sum.toString();
          currentTabValues['groupCodeLength'] = sum.toString();

          const itemLen = parseInt(currentTabValues.itemCodeLength || '10', 10) || 0;
          const variableLen = Math.max(0, itemLen - sum);
          currentTabValues['itemVariableCodeLength'] = variableLen.toString();
        }
      }

      return {
        ...prev,
        [currentTabRef]: currentTabValues
      };
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 relative">
      <LoadingOverlay visible={saving} message={t('saving' as any) || 'در حال ذخیره سازی...'} />
      {/* Action Buttons Toolbar */}
      <div className="flex flex-nowrap items-center justify-between p-2 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 shrink-0">
          <SaveButton onClick={handleSave} disabled={saving || loading} />
        </div>
        <div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 shrink-0">
          <CloseButton onClick={handleClose} />
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap overflow-x-auto border-b border-gray-200 dark:border-gray-800 flex-shrink-0" role="tablist">
        {availableTabs.map((tab) => {
          const isActive = activeInnerTab === tab.id;
          return (
            <button
               key={tab.id}
               role="tab"
               aria-selected={isActive}
               onClick={() => setActiveInnerTab(tab.id)}
               className={`
                 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap outline-none
                 ${isActive 
                   ? `${tab.textColorClass} ${tab.activeBgClass} border-b-2 ${tab.borderColorClass} dark:bg-gray-800` 
                   : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/50 border-b-2 border-transparent'
                 }
               `}
            >
              {tab.title}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-[5px] bg-gray-50/50 dark:bg-gray-900/50">
        <div className="w-full h-full">
          <div className={`p-6 min-h-full border rounded-xl ${currentTabConfig.borderColorClass} bg-white dark:bg-gray-800 shadow-sm`}>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="text-gray-500">در حال دریافت تنظیمات...</span>
              </div>
            ) : (() => {
              const visibleFields = currentTabConfig.fields.filter(field => {
                let isVisible = true;
                if (field.dependsOn) {
                  const dependentValue = (settingsValues[currentTabRef] || {})[field.dependsOn.key] || currentTabConfig.fields.find(f => f.key === field.dependsOn!.key)?.defaultValue;
                  if (dependentValue !== field.dependsOn.value) isVisible = false;
                }
                if (field.dependsOnIncludes) {
                  const dependentValue = String((settingsValues[currentTabRef] || {})[field.dependsOnIncludes.key] || currentTabConfig.fields.find(f => f.key === field.dependsOnIncludes!.key)?.defaultValue || '');
                  if (!dependentValue.split(',').includes(field.dependsOnIncludes.value)) isVisible = false;
                }
                return isVisible;
              });

              const renderFieldItem = (field: any, customGroupClass?: string) => {
                const isGeneralOrHolding = currentTabConfig.id === 'general';
                const isThreeColumnGroup = field.key === 'activeTabsInReceiptNotificationGroup' || field.key === 'activeTabsInPaymentNotificationGroup';
                const isCompactGroup = field.key === 'autoVoucherGroup' || isThreeColumnGroup;
                const isVerticalGroup = field.key === 'autoVoucherGroup' || field.key === 'productServiceCategoryGroup' || field.key === 'itemCodingMethodGroup' || field.key === 'itemCodeSettingsGroup' || field.key === 'warehouseTrackingSettingsGroup';
                let colSpanClass = '';
                if (isThreeColumnGroup) {
                  colSpanClass = 'md:col-span-2';
                } else if (field.key === 'autoVoucherGroup' || field.key === 'productServiceCategoryGroup' || field.key === 'itemCodingMethodGroup' || field.key === 'itemCodeSettingsGroup' || field.key === 'warehouseTrackingSettingsGroup') {
                  colSpanClass = 'md:col-span-1';
                } else if (isGeneralOrHolding) {
                  if (field.key === 'systemDate') {
                    colSpanClass = 'md:col-span-2';
                  } else if (field.key === 'enable2StepLogin' || field.key === 'twoStepMethod') {
                    colSpanClass = 'md:col-span-1';
                  } else {
                    colSpanClass = field.type === 'textarea' || field.type === 'checkbox' || field.type === 'group' || field.type === 'multi-checkbox' ? 'md:col-span-2' : '';
                  }
                } else {
                  colSpanClass = field.type === 'textarea' || field.type === 'checkbox' || field.type === 'group' || field.type === 'multi-checkbox' ? 'md:col-span-2' : '';
                }

                return (
                  <div key={field.key} className={colSpanClass}>
                    {field.type === 'group' ? (
                      <GroupField 
                        label={t(`settings.${field.key}`, field.label) as string}
                        className={customGroupClass !== undefined ? customGroupClass : "mt-4"}
                      >
                        <div className={isThreeColumnGroup ? "grid grid-cols-1 md:grid-cols-3 gap-4 w-full" : (isVerticalGroup ? "flex flex-col gap-3 items-start w-full" : "grid grid-cols-1 md:grid-cols-2 gap-6")}>
                          {(field.fields || [])
                            .filter(subField => {
                              if (subField.dependsOn) {
                                const depVal = (settingsValues[currentTabRef] || {})[subField.dependsOn.key] || field.fields?.find(sf => sf.key === subField.dependsOn!.key)?.defaultValue;
                                if (depVal !== subField.dependsOn.value) return false;
                              }
                              return true;
                            })
                            .map(subField => (
                            <div key={subField.key} className={isThreeColumnGroup ? "w-full" : (isVerticalGroup ? "w-full max-w-md" : "")}>
                              {subField.type === 'select' ? (
                                <Select
                                  label={t(`settings.${subField.key}`, subField.label) as string}
                                  value={(settingsValues[currentTabRef] || {})[subField.key] || subField.defaultValue || ''}
                                  onChange={(val) => handleChange(subField.key, val)}
                                  options={(subField.options || []).map(o => ({ ...o, label: t(`settings.${subField.key}_${o.value}`, o.label) as string }))}
                                  disabled={subField.disabled}
                                  required={subField.required}
                                  labelWidth={currentTabConfig.id === 'warehouse' ? "150px" : undefined}
                                  labelClassName={currentTabConfig.id === 'warehouse' ? "text-[9px]" : undefined}
                                />
                              ) : subField.type === 'number' ? (
                                <NumberInput 
                                  label={t(`settings.${subField.key}`, subField.label) as string}
                                  value={
                                    subField.key === 'totalProductServiceGroupLength' || subField.key === 'groupCodeLength'
                                      ? (
                                          (parseInt((settingsValues[currentTabRef] || {}).mainBranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level1BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level2BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level3BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level4BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level5BranchLength || '0', 10) || 0)
                                        ).toString()
                                      : subField.key === 'itemVariableCodeLength'
                                      ? Math.max(
                                          0,
                                          (parseInt((settingsValues[currentTabRef] || {}).itemCodeLength || '10', 10) || 0) -
                                          ((parseInt((settingsValues[currentTabRef] || {}).mainBranchLength || '0', 10) || 0) +
                                           (parseInt((settingsValues[currentTabRef] || {}).level1BranchLength || '0', 10) || 0) +
                                           (parseInt((settingsValues[currentTabRef] || {}).level2BranchLength || '0', 10) || 0) +
                                           (parseInt((settingsValues[currentTabRef] || {}).level3BranchLength || '0', 10) || 0) +
                                           (parseInt((settingsValues[currentTabRef] || {}).level4BranchLength || '0', 10) || 0) +
                                           (parseInt((settingsValues[currentTabRef] || {}).level5BranchLength || '0', 10) || 0))
                                        ).toString()
                                      : subField.key === 'specificAccountLength'
                                      ? (
                                          (parseInt((settingsValues[currentTabRef] || {}).totalAccountCodeLength || '6', 10) || 0) -
                                          (parseInt((settingsValues[currentTabRef] || {}).groupAccountLength || '2', 10) || 0) -
                                          (parseInt((settingsValues[currentTabRef] || {}).totalAccountLength || '4', 10) || 0)
                                        ).toString()
                                      : (settingsValues[currentTabRef] || {})[subField.key] !== undefined
                                      ? (settingsValues[currentTabRef] || {})[subField.key]
                                      : subField.defaultValue || ''
                                  }
                                  onChange={(val) => handleChange(subField.key, val)}
                                  placeholder={`مقدار ${t(`settings.${subField.key}`, subField.label) as string} را وارد کنید`}
                                  disabled={subField.disabled}
                                  required={subField.required}
                                  min={subField.min}
                                  max={subField.max}
                                  integerOnly={subField.integerOnly}
                                  labelWidth={currentTabConfig.id === 'warehouse' ? "150px" : undefined}
                                  labelClassName={currentTabConfig.id === 'warehouse' ? "text-[9px]" : undefined}
                                />
                              ) : subField.type === 'checkbox' ? (
                                <div className={isCompactGroup ? "flex items-center gap-2 py-1" : "flex items-center gap-2 px-1 py-2"}>
                                  <Checkbox
                                    text={t(`settings.${subField.key}`, subField.label) as string}
                                    checked={(settingsValues[currentTabRef] || {})[subField.key] === 'true' || (!(settingsValues[currentTabRef] || {}).hasOwnProperty(subField.key) && subField.defaultValue === 'true')}
                                    onChange={(val) => handleChange(subField.key, val ? 'true' : 'false')}
                                    disabled={subField.disabled}
                                    className="w-full"
                                  />
                                </div>
                              ) : subField.type === 'checkbox-right-label' ? (
                                <div className={isCompactGroup ? "flex items-center gap-2 py-1" : "flex items-center gap-2 px-1 py-2"}>
                                  <CheckBoxRightLabel
                                    text={t(`settings.${subField.key}`, subField.label) as string}
                                    checked={(settingsValues[currentTabRef] || {})[subField.key] === 'true' || (!(settingsValues[currentTabRef] || {}).hasOwnProperty(subField.key) && subField.defaultValue === 'true')}
                                    onChange={(val) => handleChange(subField.key, val ? 'true' : 'false')}
                                    disabled={
                                      subField.disabled ||
                                      (
                                        currentTabConfig.id === 'warehouse' &&
                                        ['isTrackingFactorActiveInItemRequest', 'isTrackingFactorActiveInItemSupplyRequest', 'isTrackingFactorActiveInPurchaseInvoice', 'isTrackingFactorActiveInTemporaryReceipt'].includes(subField.key) &&
                                        ((settingsValues[3] || {})['isTrackingFactorActiveInWarehouse'] ?? 'false') !== 'true'
                                      )
                                    }
                                    className="w-full"
                                  />
                                </div>
                              ) : (
                                <TextInput
                                  label={t(`settings.${subField.key}`, subField.label) as string}
                                  value={
                                    subField.key === 'totalProductServiceGroupLength'
                                      ? (
                                          (parseInt((settingsValues[currentTabRef] || {}).mainBranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level1BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level2BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level3BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level4BranchLength || '0', 10) || 0) +
                                          (parseInt((settingsValues[currentTabRef] || {}).level5BranchLength || '0', 10) || 0)
                                        ).toString()
                                      : subField.key === 'specificAccountLength'
                                      ? (
                                          (parseInt((settingsValues[currentTabRef] || {}).totalAccountCodeLength || '6', 10) || 0) -
                                          (parseInt((settingsValues[currentTabRef] || {}).groupAccountLength || '2', 10) || 0) -
                                          (parseInt((settingsValues[currentTabRef] || {}).totalAccountLength || '4', 10) || 0)
                                        ).toString()
                                      : (settingsValues[currentTabRef] || {})[subField.key] || subField.defaultValue || ''
                                  }
                                  onChange={(val) => handleChange(subField.key, val)}
                                  placeholder={`مقدار ${t(`settings.${subField.key}`, subField.label) as string} را وارد کنید`}
                                  disabled={subField.disabled}
                                  required={subField.required}
                                  labelWidth={currentTabConfig.id === 'warehouse' ? "150px" : undefined}
                                  labelClassName={currentTabConfig.id === 'warehouse' ? "text-[9px]" : undefined}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </GroupField>
                    ) : field.type === 'textarea' ? (
                      <TextArea
                        label={t(`settings.${field.key}`, field.label) as string}
                        value={(settingsValues[currentTabRef] || {})[field.key] || ''}
                        onChange={(val) => handleChange(field.key, val)}
                        placeholder={`مقدار ${t(`settings.${field.key}`, field.label) as string} را وارد کنید`}
                      />
                    ) : field.type === 'select' ? (
                      <Select
                        label={t(`settings.${field.key}`, field.label) as string}
                        value={(settingsValues[currentTabRef] || {})[field.key] || field.defaultValue || ''}
                        onChange={(val) => handleChange(field.key, val)}
                        options={(field.options || []).map(o => ({ ...o, label: t(`settings.${field.key}_${o.value}`, o.label) as string }))}
                        placeholder={`انتخاب ${t(`settings.${field.key}`, field.label) as string}`}
                      />
                    ) : field.type === 'multi-checkbox' ? (
                      field.key === 'valuationMethod' ? (
                        <GroupField label={t(`settings.${field.key}`, field.label) as string} className="mt-0">
                          <MultiCheckbox
                            values={((settingsValues[currentTabRef] || {})[field.key] || field.defaultValue || '').split(',').filter(v => v)}
                            onChange={(vals) => handleChange(field.key, vals.join(','))}
                            options={(field.options || []).map(o => ({ ...o, label: t(`settings.${field.key}_${o.value}`, o.label) as string }))}
                          />
                        </GroupField>
                      ) : (
                        <div className={`${field.key === 'activeBusinessStructures' ? 'mt-4' : 'md:col-span-2 mt-4'}`}>
                          <div className="flex items-center gap-2 mb-4">
                            <div className={`w-1.5 h-6 rounded-full ${currentTabConfig.colorClass}`}></div>
                            <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">{t(`settings.${field.key}`, field.label) as string}</h3>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <MultiCheckbox
                              values={((settingsValues[currentTabRef] || {})[field.key] || field.defaultValue || '').split(',').filter(v => v)}
                              onChange={(vals) => handleChange(field.key, vals.join(','))}
                              options={(field.options || []).map(o => ({ ...o, label: t(`settings.${field.key}_${o.value}`, o.label) as string }))}
                              disabled={field.key === 'activeBusinessStructures' && hasBusinessStructures}
                            />
                          </div>
                          {field.key === 'activeBusinessStructures' && hasBusinessStructures && (
                            <div className="text-xs text-orange-500 mt-2">
                              با توجه به تعریف ساختار کسب و کار، امکان تغییر این فیلد وجود ندارد.
                            </div>
                          )}
                        </div>
                      )
                    ) : field.type === 'checkbox' ? (
                      <div className={`flex items-center gap-2 px-1 py-2 ${
                        field.key === 'shareHeadquarterData' ? 'md:mt-[40px] mt-4' : 
                        field.key === 'enable2StepLogin' ? '' : 'mt-4'
                      }`}>
                        <Checkbox
                          text={t(`settings.${field.key}`, field.label) as string}
                          checked={(settingsValues[currentTabRef] || {})[field.key] === 'true' || (!(settingsValues[currentTabRef] || {}).hasOwnProperty(field.key) && field.defaultValue === 'true')}
                          onChange={(val) => handleChange(field.key, val ? 'true' : 'false')}
                          disabled={field.key === 'enable2StepLogin' && has2FAUsers}
                          className="w-full"
                        />
                      </div>
                    ) : field.type === 'checkbox-right-label' ? (
                      <div className={`flex items-center gap-2 px-1 py-2 ${field.key === 'controlNegativeStock' ? '' : 'mt-4'}`}>
                        <CheckBoxRightLabel
                          text={t(`settings.${field.key}`, field.label) as string}
                          checked={(settingsValues[currentTabRef] || {})[field.key] === 'true' || (!(settingsValues[currentTabRef] || {}).hasOwnProperty(field.key) && field.defaultValue === 'true')}
                          onChange={(val) => handleChange(field.key, val ? 'true' : 'false')}
                          disabled={
                            field.disabled ||
                            (
                              currentTabConfig.id === 'warehouse' &&
                              ['isTrackingFactorActiveInItemRequest', 'isTrackingFactorActiveInItemSupplyRequest', 'isTrackingFactorActiveInPurchaseInvoice', 'isTrackingFactorActiveInTemporaryReceipt'].includes(field.key) &&
                              ((settingsValues[3] || {})['isTrackingFactorActiveInWarehouse'] ?? 'false') !== 'true'
                            )
                          }
                          className="w-full"
                        />
                      </div>
                    ) : field.type === 'number' ? (
                      <NumberInput 
                        label={t(`settings.${field.key}`, field.label) as string}
                        value={(settingsValues[currentTabRef] || {})[field.key] || field.defaultValue || ''}
                        onChange={(val) => handleChange(field.key, val)}
                        placeholder={`مقدار ${t(`settings.${field.key}`, field.label) as string} را وارد کنید`}
                        required={field.required}
                        min={field.min}
                        max={field.max}
                        integerOnly={field.integerOnly}
                        labelWidth={currentTabConfig.id === 'warehouse' ? "150px" : undefined}
                        labelClassName={currentTabConfig.id === 'warehouse' ? "text-[9px]" : undefined}
                      />
                    ) : field.type === 'multicolumn' ? (
                      <MultiColumnDropdown
                        label={t(`settings.${field.key}`, field.label) as string}
                        listApiUrl={field.listApiUrl}
                        columns={field.columns || []}
                        value={
                          (settingsValues[currentTabRef] || {})[field.key] 
                            ? { [field.displayKey!]: (settingsValues[currentTabRef] || {})[field.key] } 
                            : (field.defaultValue ? { [field.displayKey!]: field.defaultValue } : null)
                        }
                        onChange={(val: any) => handleChange(field.key, val[field.displayKey!])}
                        displayKey={field.displayKey as any}
                        placeholder={`انتخاب ${t(`settings.${field.key}`, field.label) as string}`}
                        required={field.required}
                      />
                    ) : field.type === 'singleselect' ? (
                      <SingleSelectDropDown
                        label={t(`settings.${field.key}`, field.label) as string}
                        listApiUrl={field.listApiUrl}
                        columns={field.columns || []}
                        value={
                          (settingsValues[currentTabRef] || {})[field.key] 
                            ? { [field.displayKey!]: (settingsValues[currentTabRef] || {})[field.key] } 
                            : (field.defaultValue ? { [field.displayKey!]: field.defaultValue } : null)
                        }
                        onChange={(val: any) => handleChange(field.key, val[field.displayKey!])}
                        displayKey={field.displayKey as any}
                        placeholder={`انتخاب ${t(`settings.${field.key}`, field.label) as string}`}
                        required={field.required}
                      />
                    ) : (
                      <TextInput
                        label={t(`settings.${field.key}`, field.label) as string}
                        value={(settingsValues[currentTabRef] || {})[field.key] || ''}
                        onChange={(val) => handleChange(field.key, val)}
                        placeholder={`مقدار ${t(`settings.${field.key}`, field.label) as string} را وارد کنید`}
                        required={field.required}
                        labelWidth={currentTabConfig.id === 'warehouse' ? "150px" : undefined}
                        labelClassName={currentTabConfig.id === 'warehouse' ? "text-[9px]" : undefined}
                      />
                    )}
                  </div>
                );
              };

              if (currentTabConfig.id === 'warehouse') {
                const getField = (key: string) => visibleFields.find(f => f.key === key);
                const defaultWarehouseField = getField('defaultWarehouse');
                const controlNegativeStockField = getField('controlNegativeStock');
                const trackingFactorLevelsCountField = getField('trackingFactorLevelsCount');
                const warehouseTrackingSettingsGroupField = getField('warehouseTrackingSettingsGroup');
                const valuationMethodField = getField('valuationMethod');
                const itemCodeSettingsGroupField = getField('itemCodeSettingsGroup');
                const productServiceCategoryGroupField = getField('productServiceCategoryGroup');
                const itemCodingMethodGroupField = getField('itemCodingMethodGroup');

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Right Column */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        {defaultWarehouseField && <div className="flex-1">{renderFieldItem(defaultWarehouseField)}</div>}
                        {controlNegativeStockField && <div className="flex-1 flex items-center pt-2">{renderFieldItem(controlNegativeStockField)}</div>}
                      </div>
                      <div className="flex flex-col gap-[5px]">
                        {trackingFactorLevelsCountField && renderFieldItem(trackingFactorLevelsCountField)}
                        {warehouseTrackingSettingsGroupField && renderFieldItem(warehouseTrackingSettingsGroupField, "mt-0")}
                      </div>
                    </div>

                    {/* Left Column */}
                    <div className="flex flex-col gap-4">
                      {valuationMethodField && renderFieldItem(valuationMethodField)}
                      {itemCodeSettingsGroupField && renderFieldItem(itemCodeSettingsGroupField)}
                      {productServiceCategoryGroupField && renderFieldItem(productServiceCategoryGroupField)}
                      {itemCodingMethodGroupField && renderFieldItem(itemCodingMethodGroupField)}
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visibleFields.map(field => renderFieldItem(field))}
                  {!loading && currentTabConfig.id === 'general' && (
                    <FontManager />
                  )}
                </div>
              );
            })()}
            
            {currentTabConfig.fields.length === 0 && (
              <div className={`p-8 text-center flex flex-col items-center justify-center min-h-[200px]`}>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  فیلدی برای {currentTabConfig.title} تعریف نشده است.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
