import { 
  LayoutDashboard, 
  Calculator, 
  ShoppingCart, 
  CreditCard, 
  Building2, 
  Users, 
  Box, 
  Factory, 
  Briefcase, 
  Settings, 
  FileText, 
  Archive, 
  BarChart, 
  PackageSearch,
  Truck,
  FolderOpen,
  Plus,
  List,
  Wallet,
  ListTree,
  RefreshCw,
  CheckCircle,
  ClipboardList
} from 'lucide-react';
import React from 'react';

export interface SidebarSubItem {
  id?: string;
  title: string;
  icon?: any;
  componentName?: string;
  subItems?: SidebarSubItem[];
  keywords?: string[];
  path?: string;
}

export interface SidebarItem {
  title: string;
  icon?: any;
  subItems?: SidebarSubItem[];
  componentName?: string;
  id?: string;
  keywords?: string[];
  path?: string;
  forceOpen?: boolean;
}

export interface SidebarGroup {
  id: string;
  title: string;
  icon: any;
  colorClass: string;
  textColorClass: string;
  scrollbarClass: string;
  items: SidebarItem[];
  forceOpen?: boolean;
}

export const SIDEBAR_STRUCTURE: SidebarGroup[] = [
  {
    id: 'general_group',
    title: 'تنظیمات و عمومی',
    icon: LayoutDashboard,
    colorClass: 'bg-blue-600',
    textColorClass: 'text-blue-600',
    scrollbarClass: '[&::-webkit-scrollbar-thumb]:bg-blue-600 dark:[&::-webkit-scrollbar-thumb]:bg-blue-500',
    items: [
      {
        id: 'structural_settings',
        title: 'تنظیمات ساختاری',
        icon: Settings,
        subItems: [
          { id: 'BaseSettings', title: 'تنظیمات پایه', icon: Settings, componentName: 'BaseSettings' },
          { id: 'BusinessStructure', title: 'ساختار کسب و کار', icon: Building2, componentName: 'BusinessStructure' },
          { id: 'NewFiscalYear', title: 'سال مالی جدید', icon: Plus, componentName: 'FiscalYear' },
          { id: 'FormNumbering', title: 'روش شماره گذاری جدید', icon: Settings, componentName: 'FormNumbering' },
          {
            id: 'fiscal_and_numbering_lists',
            title: 'فهرست',
            icon: List,
            subItems: [
              { id: 'FiscalYearList', title: 'دوره های مالی', icon: List, componentName: 'FiscalYearList' },
              { id: 'EntityNumberingList', title: 'روش های شماره گذاری', icon: List, componentName: 'EntityNumberingList' },
              { id: 'DetailedAccountsNumbering', title: 'شماره گذاری تفصیلی', icon: List, componentName: 'DetailedAccountsNumbering' }
            ]
          }
        ]
      },
      {
        id: 'user_management',
        title: 'مدیریت کاربران',
        icon: Users,
        subItems: [
          {
            id: 'operations_user',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'UserForm', title: 'تعریف کاربر', icon: Plus, componentName: 'UserForm' },
              { id: 'UserGroupForm', title: 'تعریف گروه کاربری', icon: Plus, componentName: 'UserGroupForm' }
            ]
          },
          {
            id: 'reports_user',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'activity_log', title: 'مدیریت لاگ ها', icon: FileText, componentName: 'ActivityLogList' }
            ]
          },
          {
            id: 'lists_user',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'UserList', title: 'فهرست کاربران', icon: List, componentName: 'UserList' },
              { id: 'UserGroupList', title: 'فهرست گروه‌های کاربری', icon: List, componentName: 'UserGroupList' }
            ]
          }
        ]
      },
      {
        id: 'general',
        title: 'سیستم عمومی',
        icon: LayoutDashboard,
        subItems: [
          {
            id: 'operations_general',
            title: 'اطلاعات پایه',
            icon: FolderOpen,
            subItems: [
              { id: 'dashboard_main', title: 'صفحه اصلی', icon: LayoutDashboard },
              { id: 'DataImport', title: 'دریافت اطلاعات', icon: FolderOpen, componentName: 'DataImport', path: '/forms/common/data-import' },
              { id: 'GeoLocation', title: 'محل های جغرافیایی', icon: FolderOpen, componentName: 'GeoLocation' },
              { id: 'NewParty', title: 'طرف حساب جدید', icon: Plus, componentName: 'Party' },
              { id: 'Currency', title: 'ارز / ارز جدید', icon: Plus, componentName: 'Currency' },
              { id: 'CurrencyExchangeRate', title: 'نرخ برابری ارز', icon: Plus, componentName: 'CurrencyExchangeRate' }
            ]
          },
          {
            id: 'reports_general',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'ReportBuilderList', title: 'گزارش ساز پویا', icon: FileText, componentName: 'ReportBuilderList', path: '/forms/common/report-builders' }
            ]
          },
          {
            id: 'lists_general',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'CurrencyList', title: 'فهرست ارزها', icon: List, componentName: 'CurrencyList' },
              { id: 'PartyList', title: 'فهرست طرف حساب‌ها', icon: List, componentName: 'PartyList' }
            ]
          }
        ]
      },
      {
        id: 'dynamic_form_builder',
        title: 'فرم ساز پویا (DFB)',
        icon: Settings,
        subItems: [
          { id: 'DfbBuilder', title: 'طراحی فرم پویا', icon: Plus, componentName: 'DfbBuilder' },
          {
            id: 'dynamic_user_forms_menu',
            title: 'فرم‌های ایجاد شده',
            icon: List,
            subItems: []
          }
        ]
      }
    ]
  },
  {
    id: 'financial_group',
    title: 'حسابداری و مالی',
    icon: Calculator,
    colorClass: 'bg-emerald-600',
    textColorClass: 'text-emerald-600',
    scrollbarClass: '[&::-webkit-scrollbar-thumb]:bg-emerald-600 dark:[&::-webkit-scrollbar-thumb]:bg-emerald-500',
    items: [
      {
        id: 'accounting',
        title: 'حسابداری',
        icon: Calculator,
        subItems: [
          {
            id: 'basic_info_accounting',
            title: 'اطلاعات پایه',
            icon: FolderOpen,
            subItems: [
              { id: 'coding', title: 'کدینگ حساب‌ها', icon: ListTree, componentName: 'Accounts' },
              { id: 'DetailedType', title: 'نوع تفصیلی جدید', icon: Plus, componentName: 'DetailedType' },
              { id: 'CostCenter', title: 'مراکز هزینه جدید', icon: Plus, componentName: 'CostCenter' },
              { id: 'ProjectForm', title: 'پروژه جدید', icon: Plus, componentName: 'ProjectForm' },
              { id: 'Contract', title: 'قرارداد جدید', icon: Plus, componentName: 'Contract' },
              { id: 'NewDocumentType', title: 'نوع سند جدید', icon: Plus, componentName: 'NewDocumentType' },
              { id: 'OtherDetails', title: 'تفصیلی سایر جدید', icon: Plus, componentName: 'OtherDetails' }
            ]
          },
          {
            id: 'operations_accounting',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'NewVoucher', title: 'سند حسابداری جدید', icon: Plus, componentName: 'Voucher' },
              { id: 'RenumberVouchers', title: 'شماره گذاری مجدد', icon: RefreshCw, componentName: 'RenumberVouchers' },
              { id: 'FinalizeVouchers', title: 'دائمی کردن اسناد', icon: CheckCircle, componentName: 'FinalizeVouchers' }
            ]
          },
          {
            id: 'end_of_fiscal_year_menu',
            title: 'پایان سال مالی',
            icon: Settings,
            subItems: [
              { id: 'Closingtemporaryaccounts', title: 'بستن حسابهای موقت', icon: Settings, componentName: 'Closingtemporaryaccounts' },
              { id: 'NatureAdjustmentVoucher', title: 'سند تعدیل ماهیت', icon: FileText, componentName: 'NatureAdjustmentVoucher' }
            ]
          },
          {
            id: 'reports_accounting',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'AccountReview', title: 'گزارش مرور حساب‌ها', icon: BarChart, componentName: 'AccountReview' },
              { id: 'seasonal_reports', title: 'گزارشات تراز و دفتر', icon: FileText, componentName: 'TrialBalanceAndLedgerReport' },
              { id: 'tax_stats', title: 'آمار مالیاتی', icon: BarChart },
              { id: 'budget', title: 'بودجه و تخصیص', icon: Calculator }
            ]
          },
          {
            id: 'lists_accounting',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'VouchersList', title: 'فهرست اسناد حسابداری', icon: List, componentName: 'VouchersList' },
              { id: 'DetailedTypeList', title: 'فهرست انواع تفصیلی', icon: List, componentName: 'DetailedTypeList' },
              { id: 'DetailedAccount', title: 'حساب های تفصیلی', icon: List, componentName: 'DetailedAccount' },
              { id: 'ProjectList', title: 'فهرست پروژه‌ها', icon: List, componentName: 'ProjectList' },
              { id: 'CostCenterList', title: 'مراکز هزینه', icon: Building2, componentName: 'CostCenterList' },
              { id: 'OtherDetailsList', title: 'فهرست تفصیلی سایر', icon: List, componentName: 'OtherDetailsList' },
              { id: 'DocumentTypes', title: 'فهرست انواع سند', icon: List, componentName: 'DocumentTypes' }
            ]
          }
        ]
      },
      {
        id: 'receipt_payment',
        title: 'دریافت و پرداخت',
        icon: CreditCard,
        subItems: [
          {
            id: 'basic_info_rp',
            title: 'اطلاعات پایه',
            icon: FolderOpen,
            subItems: [
              { id: 'CashForm', title: 'صندوق جدید', icon: Plus, componentName: 'CashForm' },
              { id: 'RapReasons', title: 'بابت ها', icon: FileText, componentName: 'RapReasons' },
              { id: 'BankAccountType', title: 'نوع حساب بانکی جدید', icon: Plus, componentName: 'BankAccountType' },
              { id: 'PaymentGatewayForm', title: 'درگاه پرداخت جدید', icon: Plus, componentName: 'PaymentGatewayForm', path: '/forms/rap/payment-gateway-new' },
              { id: 'BankForm', title: 'بانک جدید', icon: Plus, componentName: 'BankForm' },
              { id: 'BankBranchForm', title: 'شعبه بانکی جدید', icon: Plus, componentName: 'BankBranchForm' },
              { id: 'BankAccount', title: 'حساب بانکی جدید', icon: Plus, componentName: 'BankAccountForm' },
              { id: 'ChequebookForm', title: 'دسته چک جدید', icon: Plus, componentName: 'ChequebookForm', path: '/forms/rap/chequebook-new' },
              { id: 'ChequeTemplateSettings', title: 'تنظیمات قالب چک', icon: Plus, componentName: 'ChequeTemplateSettings' },
              { id: 'PromissoryNoteForm', title: 'سفته جدید', icon: Plus, componentName: 'PromissoryNoteForm', path: '/forms/rap/promissory-note-new' },
              { id: 'AccountingSettingForm', title: 'عملیات حسابداری جدید', icon: Plus, componentName: 'RecieptAndPaymentAccountingSetting', path: '/forms/rap/accounting-setting-new' }
            ]
          },
          {
            id: 'operations_rp',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'ReceiptNotification', title: 'رسید دریافت', icon: Plus, componentName: 'ReceiptNotificationForm', path: '/forms/rap/receipt-notification' },
              { id: 'ReceivedChequeOperation', title: 'عملیات چک دریافتنی جدید', icon: Plus, componentName: 'ReceivedChequeOperation', path: '/forms/rap/received-cheque-operation-new' },
              { id: 'PaymentNotification', title: 'اعلامیه پرداخت', icon: Plus, componentName: 'PaymentNotificationForm' },
              { id: 'PaidDocumentClearing', title: 'وصول اسناد پرداختنی جدید', icon: Plus, componentName: 'PaidDocumentClearingForm', path: '/forms/rap/paid-document-clearing-new' }
            ]
          },
          {
            id: 'bank_reconciliation_rp',
            title: 'مغایرت بانکی',
            icon: RefreshCw,
            subItems: [
              { id: 'BankReconciliationForm', title: 'مغایرت بانکی جدید', icon: Plus, componentName: 'BankReconciliationForm' },
              { id: 'BankStatementForm', title: 'صورت حساب بانکی جدید', icon: Plus, componentName: 'BankStatementForm', path: '/forms/rap/bank-statement-new' }
            ]
          },
          {
            id: 'petty_cash_rp',
            title: 'تنخواه گردان',
            icon: Wallet,
            subItems: [
              { id: 'PettyCashForm', title: 'تنخواه گردان جدید', icon: Plus, componentName: 'PettyCashForm', path: '/forms/rap/petty-cash-new' },
              { id: 'PettyCashRequestForm', title: 'درخواست تنخواه', icon: Plus, componentName: 'PettyCashRequestForm', path: '/forms/rap/petty-cash-request-new' },
              { id: 'PettyCashSummaryForm', title: 'خلاصه تنخواه جدید', icon: Plus, componentName: 'PettyCashSummaryForm', path: '/forms/rap/petty-cash-summary-new' }
            ]
          },
          {
            id: 'reports_rp',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'RapReview', title: 'مرور دریافت و پرداخت', icon: BarChart, componentName: 'RapReview' }
            ]
          },
          {
            id: 'lists_rp',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              {
                id: 'basic_info_rp_lists',
                title: 'اطلاعات پایه',
                icon: FolderOpen,
                subItems: [
                  { id: 'CashList', title: 'صندوق‌ها', icon: List, componentName: 'CashList' },
                  { id: 'BankList', title: 'بانک‌ها', icon: List, componentName: 'BankList' },
                  { id: 'BankBranchList', title: 'شعب بانکی', icon: List, componentName: 'BankBranchList' },
                  { id: 'BankAccountTypeList', title: 'انواع حساب بانکی', icon: List, componentName: 'BankAccountTypeList' },
                  { id: 'BankAccountList', title: 'حساب‌های بانکی', icon: List, componentName: 'BankAccountList' },
                  { id: 'PaymentGatewayList', title: 'درگاههای پرداخت', icon: List, componentName: 'PaymentGatewayList', path: '/forms/rap/payment-gateways' },
                  { id: 'ChequebookList', title: 'دسته چک‌ها', icon: List, componentName: 'ChequebookList', path: '/forms/rap/chequebooks' },
                  { id: 'PromissoryNoteList', title: 'سفته‌ها', icon: List, componentName: 'PromissoryNoteList', path: '/forms/rap/promissory-notes' },
                  { id: 'ChequePrintTemplateList', title: 'قالب‌های چاپ چک', icon: List, componentName: 'ChequePrintTemplateList' },
                  { id: 'AccountingSettingList', title: 'عملیات حسابداری', icon: List, componentName: 'AccountingSettingList', path: '/forms/rap/accounting-settings' }
                ]
              },
              {
                id: 'operations_rp_lists',
                title: 'عملیات',
                icon: Settings,
                subItems: [
                  { id: 'ReceiptNotificationList', title: 'رسیدهای دریافت', icon: List, componentName: 'ReceiptNotificationList', path: '/forms/rap/receipt-notifications' },
                  { id: 'PaymentNotificationList', title: 'اعلامیه پرداخت', icon: List, componentName: 'PaymentNotificationList', path: '/forms/rap/payment-notifications' },
                  { id: 'ReceivedChequeOperationList', title: 'عملیات چک دریافتنی', icon: List, componentName: 'ReceivedChequeOperationList', path: '/forms/rap/received-cheque-operations' },
                  { id: 'PaidDocumentClearingList', title: 'وصول اسناد پرداختنی', icon: List, componentName: 'PaidDocumentClearingList', path: '/forms/rap/paid-document-clearings' }
                ]
              },
              {
                id: 'bank_recon_lists',
                title: 'مغایرت بانکی',
                icon: RefreshCw,
                subItems: [
                  { id: 'BankStatementList', title: 'فهرست صورت‌حساب‌ها', icon: List, componentName: 'BankStatementList', path: '/forms/rap/bank-statements' }
                ]
              },
              {
                id: 'petty_cash_rp_lists',
                title: 'تنخواه گردان',
                icon: Wallet,
                subItems: [
                  { id: 'PettyCashList', title: 'فهرست تنخواه گردان', icon: List, componentName: 'PettyCashList', path: '/forms/rap/petty-cashes' },
                  { id: 'PettyCashRequestList', title: 'فهرست درخواست های تنخواه', icon: List, componentName: 'PettyCashRequestList', path: '/forms/rap/petty-cash-requests' },
                  { id: 'PettyCashSummaryList', title: 'فهرست خلاصه تنخواه', icon: List, componentName: 'PettyCashSummaryList', path: '/forms/rap/petty-cash-summaries' }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'fixed_assets',
        title: 'اموال',
        icon: Building2,
        subItems: [

          {
            id: 'operations_assets',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'new_asset', title: 'تعریف دارایی', icon: Plus }
            ]
          },
          {
            id: 'reports_assets',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
               { id: 'depreciation_report', title: 'گزارش استهلاک', icon: FileText }
            ]
          },
          {
            id: 'lists_assets',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'asset_list', title: 'فهرست دارایی‌ها', icon: List }
            ]
          }
        ]
      },
      {
        id: 'payroll',
        title: 'حقوق و دستمزد',
        icon: Wallet,
        subItems: [

          {
            id: 'operations_payroll',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              // moved to accounting
            ]
          },
          {
            id: 'reports_payroll',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'salary_slips', title: 'فیش‌های حقوقی', icon: FileText }
            ]
          },
          {
            id: 'lists_payroll',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'staff_list', title: 'فهرست پرسنل', icon: List }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'supply_chain_group',
    title: 'تامین و تولید',
    icon: Factory,
    colorClass: 'bg-orange-500',
    textColorClass: 'text-orange-500',
    scrollbarClass: '[&::-webkit-scrollbar-thumb]:bg-orange-500 dark:[&::-webkit-scrollbar-thumb]:bg-orange-600',
    items: [
      {
        id: 'production',
        title: 'تولید',
        icon: Factory,
        subItems: [
          {
            id: 'operations_production',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'new_bom', title: 'فرمول تولید جدید (BOM)', icon: Plus },
              { id: 'new_production_order', title: 'سفارش تولید جدید', icon: Plus }
            ]
          },
          {
            id: 'reports_production',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'efficiency_report', title: 'گزارش راندمان', icon: BarChart }
            ]
          },
          {
            id: 'lists_production',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'production_planning', title: 'برنامه‌ریزی تولید', icon: List },
              { id: 'qc', title: 'کنترل کیفیت', icon: FileText },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'warehouse_logistics_group',
    title: 'انبار و بازرگانی',
    icon: Box,
    colorClass: 'bg-indigo-500',
    textColorClass: 'text-indigo-500',
    scrollbarClass: '[&::-webkit-scrollbar-thumb]:bg-indigo-500 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-600',
    items: [
      {
        id: 'sales',
        title: 'فروش',
        icon: ShoppingCart,
        subItems: [
          {
            id: 'basic_info_sales',
            title: 'اطلاعات پایه',
            icon: FolderOpen,
            subItems: [
              { id: 'CustomerForm', title: 'مشتری جدید', icon: Plus, componentName: 'CustomerForm', path: '/forms/sle/customer-new' },
              { id: 'CustomerGroupForm', title: 'گروه بندی مشتریان', icon: Plus, componentName: 'CustomerGroupForm', path: '/forms/sle/customer-groups' },
              { id: 'SalesAccountCategoryForm', title: 'طبقه حساب فروش', icon: Plus, componentName: 'SalesAccountCategoryForm', path: '/forms/sle/sales-account-categories' },
              { id: 'SalesItemGroupForm', title: 'گروه بندی کالا فروش', icon: Plus, componentName: 'SalesItemGroupForm', path: '/forms/sle/sales-item-groups' },
              { id: 'WalletForm', title: 'کیف پول جدید', icon: Plus, componentName: 'WalletForm', path: '/forms/sle/wallet-new' },
              { id: 'SalesChannelForm', title: 'کانال فروش', icon: Plus, componentName: 'SalesChannelForm', path: '/forms/sle/sales-channel-new' },
              { id: 'SalesTypeForm', title: 'نوع فروش جدید', icon: Plus, componentName: 'SalesTypeForm', path: '/forms/sle/sales-type-new' },
              { id: 'DeliveryLocationForm', title: 'مکان های تحویل', icon: Plus, componentName: 'DeliveryLocationForm', path: '/forms/sle/delivery-location-new' },
              { id: 'SalesCenterForm', title: 'مراکز فروش جدید', icon: Plus, componentName: 'SalesCenterForm', path: '/forms/sle/sales-center-new' },
              { id: 'SettlementMethodForm', title: 'روش تسویه جدید', icon: Plus, componentName: 'SettlementMethodForm', path: '/forms/sle/settlement-method-new' },
              { id: 'PurchaseSalesParametersForm', title: 'پارامترهای خرید و فروش', icon: Plus, componentName: 'PurchaseSalesParametersForm', path: '/forms/inv/purchase-sales-parameters' },
              { id: 'SalesDocumentSettingsForm', title: 'تنظیمات اسناد فروش', icon: Settings, componentName: 'SalesDocumentSettingsForm', path: '/forms/sle/sales-document-settings' }
            ]
          },
          {
            id: 'operations_sales',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'new_invoice', title: 'فاکتور جدید', icon: Plus },
              { id: 'SalesOrderForm', title: 'سفارش فروش جدید', icon: Plus, componentName: 'SalesOrderForm', path: '/forms/sle/sales-order-new' },
              // Task 88: پیش فاکتور فروش — فرم مشابه سفارش فروش + فیلد تاریخ اعتبار
              { id: 'SalesProformaForm', title: 'پیش فاکتور فروش جدید', icon: Plus, componentName: 'SalesProformaForm', path: '/forms/sle/sales-proforma-new' }
            ]
          },
          {
            id: 'reports_sales',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'sales_report', title: 'گزارش فروش', icon: BarChart }
            ]
          },
          {
            id: 'lists_sales',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'invoice_list', title: 'فهرست فاکتورها', icon: List },
              { id: 'customer_list', title: 'فهرست مشتریان', icon: List }
            ]
          }
        ]
      },
      {
        id: 'warehouse',
        title: 'نرم افزار انبار',
        icon: Box,
        subItems: [
          {
            id: 'basic_info_warehouse',
            title: 'اطلاعات پایه',
            icon: FolderOpen,
            subItems: [
              { id: 'ProductServiceForm', title: 'کالا خدمت جدید', icon: Plus, componentName: 'ProductServiceForm', path: '/forms/inv/product-service-new' },
              { id: 'ItemPackageForm', title: 'پک کالا خدمت جدید', icon: Plus, componentName: 'ItemPackageForm', path: '/forms/inv/package-new' },
              { id: 'MeasurementUnitForm', title: 'واحد سنجش جدید', icon: Plus, componentName: 'MeasurementUnitForm', path: '/forms/inv/measurement-unit-new' },
              { id: 'ItemAccountCategoryForm', title: 'طبقه حساب کالا جدید', icon: Plus, componentName: 'ItemAccountCategoryForm', path: '/forms/inv/item-account-category-new' },
              { id: 'StandardItemRateForm', title: 'نرخ استاندارد کالا', icon: Plus, componentName: 'StandardItemRateForm', path: '/forms/inv/standard-item-rate-new' },
              { id: 'ItemServiceGroupForm', title: 'گروه بندی کالا انبار', icon: Plus, componentName: 'ItemServiceGroupForm', path: '/forms/inv/item-service-group' },
              { id: 'TrackingFactorForm', title: 'تعریف عامل ردیابی', icon: Plus, componentName: 'TrackingFactorForm', path: '/forms/inv/tracking-factor-new' },
              { id: 'BarcodeLabelForm', title: 'تولید برچسب بارکد', icon: Plus, componentName: 'BarcodeLabelForm', path: '/forms/inv/barcode-label-new' },
              { id: 'WarehouseForm', title: 'انبار و محل فیزیکی کالا', icon: Plus, componentName: 'WarehouseForm', path: '/forms/inv/warehouses' },
              { id: 'WarehouseDocumentTypeForm', title: 'نوع سند انبار جدید', icon: Plus, componentName: 'WarehouseDocumentTypeForm', path: '/forms/inv/warehouse-document-type-new' },
              { id: 'PurchaseSalesParametersForm', title: 'پارامترهای خرید و فروش', icon: Plus, componentName: 'PurchaseSalesParametersForm', path: '/forms/inv/purchase-sales-parameters' }
            ]
          },
          {
            id: 'requests_warehouse',
            title: 'درخواست کالا خدمت',
            icon: FileText,
            subItems: [
              { id: 'ItemRequestForm', title: 'درخواست کالا جدید', icon: Plus, componentName: 'ItemRequestForm', path: '/forms/inv/item-request-new' },
              { id: 'ServiceRequestForm', title: 'درخواست خدمت جدید', icon: Plus, componentName: 'ServiceRequestForm', path: '/forms/inv/service-request-new' }
            ]
          },
          {
            id: 'supply_requests_warehouse',
            title: 'درخواست تامین کالا خدمت',
            icon: FileText,
            subItems: [
              { id: 'ItemSupplyRequestForm', title: 'درخواست تامین کالا جدید', icon: Plus, componentName: 'ItemSupplyRequestForm', path: '/forms/inv/item-supply-request-new' },
              { id: 'ServiceSupplyRequestForm', title: 'درخواست تامین خدمت جدید', icon: Plus, componentName: 'ServiceSupplyRequestForm', path: '/forms/inv/service-supply-request-new' }
            ]
          },
          {
            id: 'purchase_invoice_warehouse',
            title: 'فاکتور خرید کالا',
            icon: FileText,
            subItems: [
              { id: 'PurchaseInvoiceForm', title: 'فاکتور خرید کالا جدید', icon: Plus, componentName: 'PurchaseInvoiceForm', path: '/forms/inv/purchase-invoice-new' },
              { id: 'ServicePurchaseInvoiceForm', title: 'فاکتور خرید خدمت', icon: Plus, componentName: 'ServicePurchaseInvoiceForm', path: '/forms/inv/service-purchase-invoice-new' }
            ]
          },
          {
            id: 'operations_warehouse',
            title: 'رسید و حواله انبار',
            icon: Settings,
            subItems: [
              { id: 'TemporaryItemReceiptForm', title: 'رسید موقت کالا', icon: Plus, componentName: 'TemporaryItemReceiptForm', path: '/forms/inv/temporary-receipt-new' },
              { id: 'ReturnTemporaryItemReceiptForm', title: 'برگشت رسید موقت کالا', icon: Plus, componentName: 'ReturnTemporaryItemReceiptForm', path: '/forms/inv/temporary-receipt-return-new' },
              { id: 'WarehouseReceiptForm', title: 'رسید انبار جدید', icon: Plus, componentName: 'WarehouseReceiptForm', path: '/forms/inv/warehouse-receipt-new' },
              { id: 'WarehouseIssueForm', title: 'حواله انبار جدید', icon: Plus, componentName: 'WarehouseIssueForm', path: '/forms/inv/warehouse-issue-new' }
            ]
          },
          {
            id: 'pricing_and_voucher_warehouse',
            title: 'حسابداری کالا',
            icon: Calculator,
            subItems: [
              { id: 'WarehousePricingForm', title: 'قیمت گذاری اسناد انبار', icon: Plus, componentName: 'WarehousePricingForm', path: '/forms/inv/warehouse-pricing-new' },
              { id: 'WarehouseVoucherForm', title: 'صدور سند حسابداری انبار', icon: Plus, componentName: 'WarehouseVoucherForm', path: '/forms/inv/warehouse-voucher-new' },
              { id: 'WarehousePricingList', title: 'فهرست اسناد قیمت‌گذاری شده', icon: List, componentName: 'WarehousePricingList', path: '/forms/inv/warehouse-pricing-list' }
            ]
          },
          {
            id: 'stocktaking_warehouse',
            title: 'انبارگردانی',
            icon: ClipboardList,
            subItems: [
              { id: 'StocktakingSettingsForm', title: 'تنظیمات انبارگردانی', icon: Settings, componentName: 'StocktakingSettingsForm', path: '/forms/inv/stocktaking-settings' },
              { id: 'StocktakingTagForm', title: 'صدور تگ انبارگردانی', icon: Plus, componentName: 'StocktakingTagForm', path: '/forms/inv/stocktaking-tag-new' },
              { id: 'StocktakingForm', title: 'شمارش انبارگردانی', icon: Plus, componentName: 'StocktakingForm', path: '/forms/inv/stocktaking-new' }
            ]
          },
          {
            id: 'reports_warehouse',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'inventory_report', title: 'کاردکس کالا', icon: FileText, componentName: 'ItemCardexReport', path: '/forms/inv/item-cardex' }
            ]
          },
          {
            id: 'lists_warehouse',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'ProductServiceList', title: 'فهرست کالا و خدمات', icon: List, componentName: 'ProductServiceList', path: '/forms/inv/product-services' },
              { id: 'ItemPackageList', title: 'فهرست پک کالا خدمت', icon: List, componentName: 'ItemPackageList', path: '/forms/inv/packages' },
              { id: 'ItemAccountCategoryList', title: 'طبقات حساب کالا', icon: List, componentName: 'ItemAccountCategoryList', path: '/forms/inv/item-account-categories' },
              { id: 'SalesItemGroupList', title: 'فهرست گروه‌بندی کالا فروش', icon: List, componentName: 'SalesItemGroupList', path: '/forms/sle/sales-item-groups' },
              { id: 'TrackingFactorList', title: 'عوامل ردیابی', icon: List, componentName: 'TrackingFactorList', path: '/forms/inv/tracking-factors' },
              { id: 'StocktakingList', title: 'فهرست شمارش انبارگردانی', icon: List, componentName: 'StocktakingList', path: '/forms/inv/stocktakings' },
              { id: 'inventory', title: 'موجودی کالا', icon: PackageSearch },
              { id: 'warehouse_transfer', title: 'حواله انبار', icon: Truck }
            ]
          }
        ]
      },
      {
        id: 'quantity_warehouse',
        title: 'انبار تعدادی',
        icon: Archive,
        subItems: [
          {
            id: 'operations_qty_warehouse',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'qty_receipt', title: 'رسید تعدادی', icon: Plus },
              { id: 'qty_issue', title: 'حواله تعدادی', icon: Plus }
            ]
          },
          {
            id: 'reports_qty_warehouse',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'qty_inventory', title: 'موجودی تعدادی', icon: FileText }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'org_management_group',
    title: 'مدیریت و سازمان',
    icon: Users,
    colorClass: 'bg-rose-500',
    textColorClass: 'text-rose-500',
    scrollbarClass: '[&::-webkit-scrollbar-thumb]:bg-rose-500 dark:[&::-webkit-scrollbar-thumb]:bg-rose-600',
    items: [
      {
        id: 'hr',
        title: 'منابع انسانی',
        icon: Users,
        subItems: [
          {
            id: 'operations_hr',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'new_employee', title: 'ثبت پرسنل جدید', icon: Plus },
              { id: 'record_attendance', title: 'ثبت کارکرد', icon: Plus }
            ]
          },
          {
            id: 'reports_hr',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
              { id: 'attendance_report', title: 'گزارش حضور و غیاب', icon: FileText }
            ]
          },
          {
            id: 'lists_hr',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'hr_files', title: 'پرونده پرسنلی', icon: Users },
              { id: 'attendance', title: 'حضور و غیاب', icon: List },
            ]
          }
        ]
      },
      {
        id: 'admin',
        title: 'اداری',
        icon: Briefcase,
        subItems: [
          {
            id: 'operations_admin',
            title: 'عملیات',
            icon: Settings,
            subItems: [
              { id: 'new_letter', title: 'نامه جدید', icon: Plus },
              { id: 'new_meeting', title: 'جلسه جدید', icon: Plus }
            ]
          },
          {
            id: 'reports_admin',
            title: 'گزارشات',
            icon: BarChart,
            subItems: [
               { id: 'automation_report', title: 'گزارش عملکرد', icon: BarChart }
            ]
          },
          {
            id: 'lists_admin',
            title: 'فهرست‌ها',
            icon: List,
            subItems: [
              { id: 'automation', title: 'اتوماسیون اداری', icon: Briefcase },
              { id: 'meetings', title: 'مدیریت جلسات', icon: Users },
            ]
          }
        ]
      }
    ]
  }
];
