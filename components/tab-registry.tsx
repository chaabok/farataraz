'use client';
/**
 * Typed tab registry (Task 5-c) — single source of truth mapping tab
 * `componentName` strings (used by tabsStore / menus / dropdowns) to the lazy
 * components rendered by components/layout/PageContainer.tsx.
 *
 * HOW TO ADD A NEW TAB
 * 1. Import the component file lazily at module scope, exactly like the other
 *    `lazyTab(...)` constants below (this preserves code splitting):
 *      const MyForm = lazyTab(() => import('@/components/forms/inv/MyForm'), 'MyForm', 'MyForm');
 * 2. Register every componentName string that menus/pages may pass to addTab():
 *      'MyForm': { component: MyForm },
 *    If the old PageContainer branch passed `tabId={tab.id}` after the spread,
 *    use `getProps: withTabIdAfterProps` (or `withTabIdBeforeProps` when the
 *    old branch passed tabId BEFORE the spread).
 * 3. Add the menu/sidebar metadata (components/layout/ParsaStartMenu.tsx,
 *    components/layout/Sidebar.tsx, lib/sidebar-metadata.ts) and, for URL
 *    entry points, a thin page under app/forms/**.
 *
 * PROP CONTRACT (must mirror the historical PageContainer ternary exactly):
 *  - entry without getProps  → `<Comp {...(tab.props || {})} />`
 *  - getProps                → full control over the props object, e.g.
 *    `(tab) => ({ ...(tab.props || {}), tabId: tab.id })`
 */

import React from 'react';
import dynamic from 'next/dynamic';
import type { Tab } from '@/lib/stores/tabsStore';
import { FormSkeleton } from '@/components/ui/FormSkeleton';

// Generic loader with automatic skeleton type selection based on component name
function lazyTab<T extends React.ComponentType<any>>(
  importFn: () => Promise<any>,
  componentName: string,
  exportName?: string
) {
  let type: 'list' | 'tree' | 'form' = 'form';
  const lowerName = componentName.toLowerCase();

  if (
    lowerName.endsWith('list') ||
    lowerName.includes('grid') ||
    lowerName.includes('review') ||
    lowerName.includes('viewer') ||
    lowerName === 'documenttypes' ||
    lowerName === 'rapreason' ||
    lowerName === 'rapreasons'
  ) {
    type = 'list';
  } else if (
    lowerName.includes('structure') ||
    lowerName.includes('tree') ||
    lowerName === 'accounts' ||
    lowerName.includes('hierarchy')
  ) {
    type = 'tree';
  }

  return dynamic(
    () => importFn().then((mod: any) => {
      if (exportName && mod[exportName]) {
        return mod[exportName];
      }
      if (mod.default) return mod.default;
      if (mod[componentName]) return mod[componentName];
      // Fallback
      const keys = Object.keys(mod);
      for (const key of keys) {
        if (typeof mod[key] === 'function' || typeof mod[key] === 'object') {
          return mod[key];
        }
      }
      return mod;
    }),
    {
      ssr: false,
      loading: () => <FormSkeleton type={type} />
    }
  );
}

export type TabPropsBuilder = (tab: Tab) => Record<string, any>;

export interface TabRegistryEntry {
  component: React.ComponentType<any>;
  /** Builds the props for the component. Default (when omitted): `tab.props || {}`. */
  getProps?: TabPropsBuilder;
}

// Shared prop builders mirroring the historical per-branch behaviors:
// `{...(tab.props || {})} tabId={tab.id}`  (tabId wins over props.tabId)
export const withTabIdAfterProps: TabPropsBuilder = (tab) => ({ ...(tab.props || {}), tabId: tab.id });
// `tabId={tab.id} {...(tab.props || {})}`  (props.win over tabId)
export const withTabIdBeforeProps: TabPropsBuilder = (tab) => ({ tabId: tab.id, ...(tab.props || {}) });
// Historical branches that rendered `<Comp />` with no props at all.
export const noProps: TabPropsBuilder = () => ({});

const DocumentTypes = lazyTab(() => import('@/components/forms/DocumentTypes'), 'DocumentTypes', 'DocumentTypes');
const NewDocumentType = lazyTab(() => import('@/components/forms/NewDocumentType'), 'NewDocumentType', 'NewDocumentType');
const BusinessStructure = lazyTab(() => import('@/components/forms/BusinessStructure'), 'BusinessStructure', 'BusinessStructure');
const GeoLocation = lazyTab(() => import('@/components/forms/common/GeoLocation'), 'GeoLocation', 'GeoLocation');
const FiscalYear = lazyTab(() => import('@/components/forms/common/FiscalYear'), 'FiscalYear', 'FiscalYear');
const FiscalYearList = lazyTab(() => import('@/components/forms/common/FiscalYearList'), 'FiscalYearList', 'FiscalYearList');
const BaseSettings = lazyTab(() => import('@/components/forms/common/BaseSettings'), 'BaseSettings', 'BaseSettings');
const FormNumbering = lazyTab(() => import('@/components/forms/common/FormNumbering'), 'FormNumbering', 'FormNumbering');
const EntityNumberingList = lazyTab(() => import('@/components/forms/common/EntityNumberingList'), 'EntityNumberingList', 'EntityNumberingList');
const Currency = lazyTab(() => import('@/components/forms/common/Currency'), 'Currency', 'Currency');
const CurrencyList = lazyTab(() => import('@/components/forms/common/CurrencyList'), 'CurrencyList', 'CurrencyList');
const CurrencyExchangeRate = lazyTab(() => import('@/components/forms/common/CurrencyExchangeRate'), 'CurrencyExchangeRate');
const DetailedAccountsNumbering = lazyTab(() => import('@/components/forms/common/DetailedAccountsNumbering'), 'DetailedAccountsNumbering', 'DetailedAccountsNumbering');
const DetailedTypeForm = lazyTab(() => import('@/components/forms/accounting/DetailedType'), 'DetailedTypeForm', 'DetailedTypeForm');
const DetailedTypeList = lazyTab(() => import('@/components/forms/accounting/DetailedTypeList'), 'DetailedTypeList', 'DetailedTypeList');
const DetailedAccountForm = lazyTab(() => import('@/components/forms/accounting/DetailedAccount'), 'DetailedAccountForm', 'DetailedAccountForm');
const DetailedAccountList = lazyTab(() => import('@/components/forms/accounting/DetailedAccountList'), 'DetailedAccountList', 'DetailedAccountList');
const AccountsForm = lazyTab(() => import('@/components/forms/accounting/Accounts'), 'Accounts');
const CostCenter = lazyTab(() => import('@/components/forms/accounting/CostCenter'), 'CostCenter', 'CostCenter');
const CostCenterList = lazyTab(() => import('@/components/forms/accounting/CostCenterList'), 'CostCenterList', 'CostCenterList');
const UserForm = lazyTab(() => import('@/components/forms/iam/UserForm'), 'UserForm', 'UserForm');
const UserList = lazyTab(() => import('@/components/forms/iam/UserList'), 'UserList', 'UserList');
const UserGroupForm = lazyTab(() => import('@/components/forms/iam/UserGroupForm'), 'UserGroupForm', 'UserGroupForm');
const UserGroupList = lazyTab(() => import('@/components/forms/iam/UserGroupList'), 'UserGroupList', 'UserGroupList');
const ActivityLogList = lazyTab(() => import('@/components/forms/common/ActivityLogList'), 'ActivityLogList', 'ActivityLogList');
const CashForm = lazyTab(() => import('@/components/forms/rap/Cash'), 'CashForm', 'CashForm');
const CashList = lazyTab(() => import('@/components/forms/rap/CashList'), 'CashList', 'CashList');
const BankForm = lazyTab(() => import('@/components/forms/rap/Bank'), 'BankForm', 'BankForm');
const BankList = lazyTab(() => import('@/components/forms/rap/BankList'), 'BankList', 'BankList');
const BankAccountTypeForm = lazyTab(() => import('@/components/forms/rap/BankAccountType'), 'BankAccountTypeForm', 'BankAccountTypeForm');
const BankAccountTypeList = lazyTab(() => import('@/components/forms/rap/BankAccountTypeList'), 'BankAccountTypeList', 'BankAccountTypeList');
const BankBranchForm = lazyTab(() => import('@/components/forms/rap/BankBranch'), 'BankBranchForm', 'BankBranchForm');
const BankBranchList = lazyTab(() => import('@/components/forms/rap/BankBranchList'), 'BankBranchList', 'BankBranchList');
const BankAccountForm = lazyTab(() => import('@/components/forms/rap/BankAccount'), 'BankAccountForm', 'BankAccountForm');
const BankAccountList = lazyTab(() => import('@/components/forms/rap/BankAccountList'), 'BankAccountList', 'BankAccountList');
const PaymentGatewayForm = lazyTab(() => import('@/components/forms/rap/PaymentGateway'), 'PaymentGatewayForm');
const PaymentGatewayList = lazyTab(() => import('@/components/forms/rap/PaymentGatewayList'), 'PaymentGatewayList');
const PaymentNotificationForm = lazyTab(() => import('@/components/forms/rap/PaymentNotification'), 'PaymentNotificationForm', 'PaymentNotificationForm');
const PaymentNotificationList = lazyTab(() => import('@/components/forms/rap/PaymentNotificationList'), 'PaymentNotificationList', 'PaymentNotificationList');
const ReceiptNotificationForm = lazyTab(() => import('@/components/forms/rap/ReceiptNotification'), 'ReceiptNotificationForm', 'ReceiptNotificationForm');
const ReceiptNotificationList = lazyTab(() => import('@/components/forms/rap/ReceiptNotificationList'), 'ReceiptNotificationList', 'ReceiptNotificationList');
const ChequebookForm = lazyTab(() => import('@/components/forms/rap/Chequebook'), 'ChequebookForm');
const ChequeTemplateSettings = lazyTab(() => import('@/components/forms/rap/ChequeTemplateSettings'), 'ChequeTemplateSettings', 'ChequeTemplateSettings');
const Party = lazyTab(() => import('@/components/forms/common/Party'), 'Party', 'Party');
const PartyList = lazyTab(() => import('@/components/forms/common/PartyList'), 'PartyList', 'PartyList');
const ProjectForm = lazyTab(() => import('@/components/forms/cnt/Project'), 'ProjectForm', 'ProjectForm');
const ProjectList = lazyTab(() => import('@/components/forms/cnt/ProjectList'), 'ProjectList', 'ProjectList');
const OtherDetailsForm = lazyTab(() => import('@/components/forms/accounting/OtherDetails'), 'OtherDetailsForm', 'OtherDetailsForm');
const OtherDetailsList = lazyTab(() => import('@/components/forms/accounting/OtherDetailsList'), 'OtherDetailsList', 'OtherDetailsList');
const Contract = lazyTab(() => import('@/components/forms/cnt/Contract'), 'Contract');
const ReceivedChequeOperation = lazyTab(() => import('@/components/forms/rap/ReceivedChequeOperation'), 'ReceivedChequeOperation');
const ReceivedChequeOperationList = lazyTab(() => import('@/components/forms/rap/ReceivedChequeOperationList'), 'ReceivedChequeOperationList');
const Voucher = lazyTab(() => import('@/components/forms/accounting/Voucher'), 'Voucher');
const VouchersList = lazyTab(() => import('@/components/forms/accounting/VouchersList'), 'VouchersList', 'VouchersList');
const RenumberVouchers = lazyTab(() => import('@/components/forms/accounting/RenumberVouchers'), 'RenumberVouchers');
const FinalizeVouchers = lazyTab(() => import('@/components/forms/accounting/FinalizeVouchers').then(m => ({ default: m.FinalizeVouchers })), 'FinalizeVouchers');
const Closingtemporaryaccounts = lazyTab(() => import('@/components/forms/accounting/Closingtemporaryaccounts'), 'Closingtemporaryaccounts');
const NatureAdjustmentVoucher = lazyTab(() => import('@/components/forms/accounting/NatureAdjustmentVoucher'), 'NatureAdjustmentVoucher');
const AccountReview = lazyTab(() => import('@/components/forms/accounting/AccountReview'), 'AccountReview', 'AccountReview');
const TrialBalanceAndLedgerReport = lazyTab(() => import('@/components/forms/accounting/TrialBalanceAndLedgerReport'), 'TrialBalanceAndLedgerReport', 'TrialBalanceAndLedgerReport');
const RapReview = lazyTab(() => import('@/components/forms/rap/RapReview'), 'RapReview', 'RapReview');
const PromissoryNoteForm = lazyTab(() => import('@/components/forms/rap/PromissoryNote'), 'PromissoryNoteForm');
const PromissoryNoteList = lazyTab(() => import('@/components/forms/rap/PromissoryNoteList'), 'PromissoryNoteList');
const RecieptAndPaymentAccountingSetting = lazyTab(() => import('@/components/forms/rap/RecieptAndPaymentAccountingSetting'), 'RecieptAndPaymentAccountingSetting');
const AccountingSettingList = lazyTab(() => import('@/components/forms/rap/AccountingSettingList'), 'AccountingSettingList');
const ChequebookList = lazyTab(() => import('@/components/forms/rap/ChequebookList'), 'ChequebookList');
const ChequePrintTemplateList = lazyTab(() => import('@/components/forms/rap/ChequePrintTemplateList'), 'ChequePrintTemplateList');
const RapReason = lazyTab(() => import('@/components/forms/rap/RapReason'), 'RapReason');
const ReportBuilderList = lazyTab(() => import('@/components/forms/common/ReportBuilderList'), 'ReportBuilderList', 'ReportBuilderList');
const ReportBuilder = lazyTab(() => import('@/components/forms/common/ReportBuilder'), 'ReportBuilder', 'ReportBuilder');
const ReportViewer = lazyTab(() => import('@/components/forms/common/ReportViewer'), 'ReportViewer', 'ReportViewer');
const AiChatWidget = lazyTab(() => import('@/components/ai/AiChatWidget'), 'AiChatWidget', 'AiChatWidget');
const PettyCashForm = lazyTab(() => import('@/components/forms/rap/PettyCash'), 'PettyCashForm');
const PettyCashList = lazyTab(() => import('@/components/forms/rap/PettyCashList'), 'PettyCashList');
const PettyCashSummaryList = lazyTab(() => import('@/components/forms/rap/PettyCashSummaryList'), 'PettyCashSummaryList');
const PettyCashRequestList = lazyTab(() => import('@/components/forms/rap/PettyCashRequestList'), 'PettyCashRequestList');
const PettyCashSummaryForm = lazyTab(() => import('@/components/forms/rap/PettyCashSummary'), 'PettyCashSummaryForm');
const PettyCashRequestForm = lazyTab(() => import('@/components/forms/rap/PettyCashRequest'), 'PettyCashRequestForm');
const PaidDocumentClearingList = lazyTab(() => import('@/components/forms/rap/PaidDocumentClearingList'), 'PaidDocumentClearingList');
const PaidDocumentClearingForm = lazyTab(() => import('@/components/forms/rap/PaidDocumentClearing'), 'PaidDocumentClearingForm');
const BankStatementForm = lazyTab(() => import('@/components/forms/rap/BankStatement'), 'BankStatementForm');
const BankStatementList = lazyTab(() => import('@/components/forms/rap/BankStatementList'), 'BankStatementList');
const BankReconciliationForm = lazyTab(() => import('@/components/forms/rap/BankReconciliation'), 'BankReconciliationForm');
const MeasurementUnit = lazyTab(() => import('@/components/forms/inv/MeasurementUnit'), 'MeasurementUnit', 'MeasurementUnit');
const ItemServiceGroup = lazyTab(() => import('@/components/forms/inv/ItemServiceGroup'), 'ItemServiceGroup', 'ItemServiceGroup');
const CustomerForm = lazyTab(() => import('@/components/forms/sle/Customer'), 'CustomerForm', 'CustomerForm');
const CustomerGroupForm = lazyTab(() => import('@/components/forms/sle/CustomerGroup'), 'CustomerGroupForm', 'CustomerGroupForm');
const WalletForm = lazyTab(() => import('@/components/forms/sle/Wallet'), 'WalletForm', 'WalletForm');
const SalesChannelForm = lazyTab(() => import('@/components/forms/sle/SalesChannel'), 'SalesChannelForm', 'SalesChannelForm');
const SalesTypeForm = lazyTab(() => import('@/components/forms/sle/SalesType'), 'SalesTypeForm', 'SalesTypeForm');
const DeliveryLocationForm = lazyTab(() => import('@/components/forms/sle/DeliveryLocation'), 'DeliveryLocationForm', 'DeliveryLocationForm');
const SalesCenterForm = lazyTab(() => import('@/components/forms/sle/SalesCenter'), 'SalesCenterForm', 'SalesCenterForm');
const SalesAccountCategoryForm = lazyTab(() => import('@/components/forms/sle/SalesAccountCategory'), 'SalesAccountCategoryForm', 'SalesAccountCategoryForm');
const SalesItemGroup = lazyTab(() => import('@/components/forms/sle/SalesItemGroup'), 'SalesItemGroup', 'SalesItemGroup');
const SalesItemGroupList = lazyTab(() => import('@/components/forms/sle/SalesItemGroupList'), 'SalesItemGroupList', 'SalesItemGroupList');
const SalesDocumentSettingsForm = lazyTab(() => import('@/components/forms/sle/SalesDocumentSettings'), 'SalesDocumentSettingsForm', 'SalesDocumentSettingsForm');
const SettlementMethodForm = lazyTab(() => import('@/components/forms/sle/SettlementMethod'), 'SettlementMethodForm', 'SettlementMethodForm');
const SalesOrderForm = lazyTab(() => import('@/components/forms/sle/SalesOrder'), 'SalesOrderForm', 'SalesOrder');
// Task 88: پیش فاکتور فروش
const SalesProformaForm = lazyTab(() => import('@/components/forms/sle/SalesProforma'), 'SalesProformaForm', 'SalesProforma');
// Task 128: قرارداد فروش
const SalesContractForm = lazyTab(() => import('@/components/forms/sle/SalesContract'), 'SalesContractForm', 'SalesContract');

const WarehouseForm = lazyTab(() => import('@/components/forms/inv/Warehouse'), 'WarehouseForm');
const ItemAccountCategoryForm = lazyTab(() => import('@/components/forms/inv/ItemAccountCategory'), 'ItemAccountCategoryForm', 'ItemAccountCategory');
const ItemAccountCategoryList = lazyTab(() => import('@/components/forms/inv/ItemAccountCategoryList'), 'ItemAccountCategoryList', 'ItemAccountCategoryList');
const ProductServiceForm = lazyTab(() => import('@/components/forms/inv/ProductService'), 'ProductServiceForm', 'ProductService');
const ProductServiceList = lazyTab(() => import('@/components/forms/inv/ProductServiceList'), 'ProductServiceList', 'ProductServiceList');
const ItemPackageForm = lazyTab(() => import('@/components/forms/inv/ItemPackage'), 'ItemPackageForm', 'ItemPackage');
const ItemPackageList = lazyTab(() => import('@/components/forms/inv/ItemPackageList'), 'ItemPackageList', 'ItemPackageList');
const StandardItemRateForm = lazyTab(() => import('@/components/forms/inv/StandardItemRate'), 'StandardItemRateForm', 'StandardItemRate');
const TrackingFactorForm = lazyTab(() => import('@/components/forms/inv/TrackingFactor'), 'TrackingFactorForm', 'TrackingFactor');
const TrackingFactorList = lazyTab(() => import('@/components/forms/inv/TrackingFactorList'), 'TrackingFactorList', 'TrackingFactorList');
const BarcodeLabelForm = lazyTab(() => import('@/components/forms/inv/BarcodeLabelForm'), 'BarcodeLabelForm', 'BarcodeLabelForm');
const WarehouseDocumentTypeForm = lazyTab(() => import('@/components/forms/inv/WarehouseDocumentType'), 'WarehouseDocumentTypeForm', 'WarehouseDocumentType');
const ItemRequestForm = lazyTab(() => import('@/components/forms/inv/ItemRequest'), 'ItemRequestForm', 'ItemRequest');
const ServiceRequestForm = lazyTab(() => import('@/components/forms/inv/ServiceRequest'), 'ServiceRequestForm', 'ServiceRequest');
const ItemSupplyRequestForm = lazyTab(() => import('@/components/forms/inv/ItemSupplyRequest'), 'ItemSupplyRequestForm', 'ItemSupplyRequest');
const ServiceSupplyRequestForm = lazyTab(() => import('@/components/forms/inv/ServiceSupplyRequest'), 'ServiceSupplyRequest', 'ServiceSupplyRequest');
const PurchaseInvoiceForm = lazyTab(() => import('@/components/forms/inv/PurchaseInvoice'), 'PurchaseInvoiceForm', 'PurchaseInvoice');
const TemporaryItemReceiptForm = lazyTab(() => import('@/components/forms/inv/TemporaryItemReceipt'), 'TemporaryItemReceiptForm', 'TemporaryItemReceipt');
const WarehouseReceiptForm = lazyTab(() => import('@/components/forms/inv/WarehouseReceipt'), 'WarehouseReceiptForm', 'WarehouseReceipt');
const WarehouseIssueForm = lazyTab(() => import('@/components/forms/inv/WarehouseIssue'), 'WarehouseIssueForm', 'WarehouseIssue');
const ReturnTemporaryItemReceiptForm = lazyTab(() => import('@/components/forms/inv/ReturnTemporaryItemReceipt'), 'ReturnTemporaryItemReceiptForm', 'ReturnTemporaryItemReceipt');
const ServicePurchaseInvoiceForm = lazyTab(() => import('@/components/forms/inv/ServicePurchaseInvoice'), 'ServicePurchaseInvoiceForm', 'ServicePurchaseInvoice');
const PurchaseSalesParametersForm = lazyTab(() => import('@/components/forms/inv/PurchaseSalesParameters'), 'PurchaseSalesParametersForm', 'PurchaseSalesParametersForm');
const WarehousePricingForm = lazyTab(() => import('@/components/forms/inv/WarehousePricingForm'), 'WarehousePricingForm', 'WarehousePricing');
const WarehouseVoucherForm = lazyTab(() => import('@/components/forms/inv/WarehouseVoucherForm'), 'WarehouseVoucherForm', 'WarehouseVoucher');
const WarehousePricingList = lazyTab(() => import('@/components/forms/inv/WarehousePricingList'), 'WarehousePricingList', 'WarehousePricingList');
const StocktakingSettingsForm = lazyTab(() => import('@/components/forms/inv/StocktakingSettingsForm'), 'StocktakingSettingsForm', 'StocktakingSettingsForm');
const StocktakingTagForm = lazyTab(() => import('@/components/forms/inv/StocktakingTagForm'), 'StocktakingTagForm', 'StocktakingTagForm');
const StocktakingForm = lazyTab(() => import('@/components/forms/inv/StocktakingForm'), 'StocktakingForm', 'StocktakingForm');
const StocktakingList = lazyTab(() => import('@/components/forms/inv/StocktakingList'), 'StocktakingList', 'StocktakingList');
const ItemCardexReport = lazyTab(() => import('@/components/forms/inv/ItemCardexReport'), 'ItemCardexReport', 'inventory_report');
const DataImport = lazyTab(() => import('@/components/forms/common/DataImport'), 'DataImport');
const DfbBuilder = lazyTab(() => import('@/components/forms/DfbBuilder'), 'DfbBuilder', 'DfbBuilder');
const DynamicFormRunner = lazyTab(() => import('@/components/forms/DynamicFormRunner'), 'DynamicFormRunner', 'DynamicFormRunner');

export const TAB_COMPONENTS: Record<string, TabRegistryEntry> = {
  // ---- common / gnr ----
  DocumentTypes: { component: DocumentTypes },
  NewDocumentType: { component: NewDocumentType },
  BusinessStructure: { component: BusinessStructure },
  GeoLocation: { component: GeoLocation },
  FiscalYear: { component: FiscalYear },
  NewFiscalYear: { component: FiscalYear },
  FiscalYearList: { component: FiscalYearList },
  BaseSettings: { component: BaseSettings },
  FormNumbering: { component: FormNumbering },
  EntityNumberingList: { component: EntityNumberingList },
  Currency: { component: Currency },
  CurrencyList: { component: CurrencyList },
  CurrencyExchangeRate: { component: CurrencyExchangeRate },
  DetailedAccountsNumbering: { component: DetailedAccountsNumbering },
  ActivityLogList: { component: ActivityLogList },
  Party: { component: Party },
  PartyList: { component: PartyList },
  ReportBuilderList: { component: ReportBuilderList },
  ReportBuilder: { component: ReportBuilder },
  ReportViewer: { component: ReportViewer },
  DataImport: { component: DataImport, getProps: noProps },

  // ---- accounting ----
  DetailedType: { component: DetailedTypeForm },
  DetailedTypeList: { component: DetailedTypeList },
  DetailedAccount: { component: DetailedAccountList },
  DetailedAccountForm: { component: DetailedAccountForm },
  Accounts: { component: AccountsForm },
  CostCenter: { component: CostCenter },
  CostCenterList: { component: CostCenterList },
  UserForm: { component: UserForm },
  UserList: { component: UserList },
  UserGroupForm: { component: UserGroupForm },
  UserGroupList: { component: UserGroupList },
  Voucher: { component: Voucher },
  VouchersList: { component: VouchersList },
  OtherDetails: { component: OtherDetailsForm },
  OtherDetailsList: { component: OtherDetailsList },
  RenumberVouchers: { component: RenumberVouchers },
  FinalizeVouchers: { component: FinalizeVouchers },
  Closingtemporaryaccounts: { component: Closingtemporaryaccounts },
  NatureAdjustmentVoucher: { component: NatureAdjustmentVoucher },
  AccountReview: { component: AccountReview },
  TrialBalanceAndLedgerReport: { component: TrialBalanceAndLedgerReport },

  // ---- rap (treasury) ----
  CashForm: { component: CashForm },
  CashList: { component: CashList },
  BankForm: { component: BankForm },
  BankList: { component: BankList },
  BankAccountType: { component: BankAccountTypeForm },
  BankAccountTypeList: { component: BankAccountTypeList },
  BankBranchForm: { component: BankBranchForm },
  BankBranchList: { component: BankBranchList },
  BankAccountForm: { component: BankAccountForm },
  BankAccount: { component: BankAccountForm },
  BankAccountList: { component: BankAccountList },
  PaymentGatewayForm: { component: PaymentGatewayForm },
  PaymentGatewayList: { component: PaymentGatewayList },
  PaymentNotificationForm: { component: PaymentNotificationForm, getProps: withTabIdBeforeProps },
  PaymentNotificationList: { component: PaymentNotificationList },
  ReceiptNotificationForm: { component: ReceiptNotificationForm, getProps: withTabIdBeforeProps },
  ReceiptNotificationList: { component: ReceiptNotificationList },
  ChequebookForm: { component: ChequebookForm },
  ChequebookList: { component: ChequebookList },
  ChequePrintTemplateList: { component: ChequePrintTemplateList },
  ChequeTemplateSettings: { component: ChequeTemplateSettings },
  ReceivedChequeOperation: { component: ReceivedChequeOperation, getProps: withTabIdBeforeProps },
  ReceivedChequeOperationList: { component: ReceivedChequeOperationList },
  PromissoryNoteForm: { component: PromissoryNoteForm },
  PromissoryNoteList: { component: PromissoryNoteList },
  RecieptAndPaymentAccountingSetting: { component: RecieptAndPaymentAccountingSetting },
  AccountingSettingList: { component: AccountingSettingList },
  RapReason: { component: RapReason, getProps: noProps },
  RapReasons: { component: RapReason, getProps: noProps },
  RapReview: { component: RapReview },
  PettyCashForm: { component: PettyCashForm },
  PettyCashList: { component: PettyCashList },
  PettyCashSummaryForm: { component: PettyCashSummaryForm },
  PettyCashSummaryList: { component: PettyCashSummaryList },
  PettyCashRequestForm: { component: PettyCashRequestForm },
  PettyCashRequestList: { component: PettyCashRequestList },
  PaidDocumentClearingForm: { component: PaidDocumentClearingForm, getProps: withTabIdBeforeProps },
  PaidDocumentClearing: { component: PaidDocumentClearingForm, getProps: withTabIdBeforeProps },
  PaidDocumentClearingList: { component: PaidDocumentClearingList },
  BankStatementForm: { component: BankStatementForm },
  BankStatementList: { component: BankStatementList, getProps: noProps },
  BankReconciliationForm: { component: BankReconciliationForm },

  // ---- cnt (contracts) ----
  ProjectForm: { component: ProjectForm },
  ProjectList: { component: ProjectList },
  Contract: { component: Contract },

  // ---- sle (sales) ----
  CustomerForm: { component: CustomerForm, getProps: withTabIdAfterProps },
  Customer: { component: CustomerForm, getProps: withTabIdAfterProps },
  CustomerGroupForm: { component: CustomerGroupForm, getProps: withTabIdAfterProps },
  CustomerGroup: { component: CustomerGroupForm, getProps: withTabIdAfterProps },
  WalletForm: { component: WalletForm, getProps: withTabIdAfterProps },
  Wallet: { component: WalletForm, getProps: withTabIdAfterProps },
  SalesChannelForm: { component: SalesChannelForm, getProps: withTabIdAfterProps },
  SalesChannel: { component: SalesChannelForm, getProps: withTabIdAfterProps },
  SettlementMethodForm: { component: SettlementMethodForm, getProps: withTabIdAfterProps },
  SettlementMethod: { component: SettlementMethodForm, getProps: withTabIdAfterProps },
  SalesOrderForm: { component: SalesOrderForm, getProps: withTabIdAfterProps },
  SalesOrder: { component: SalesOrderForm, getProps: withTabIdAfterProps },
  // Task 88: پیش فاکتور فروش
  SalesProformaForm: { component: SalesProformaForm, getProps: withTabIdAfterProps },
  SalesProforma: { component: SalesProformaForm, getProps: withTabIdAfterProps },
  // Task 128: قرارداد فروش
  SalesContractForm: { component: SalesContractForm, getProps: withTabIdAfterProps },
  SalesContract: { component: SalesContractForm, getProps: withTabIdAfterProps },
  SalesTypeForm: { component: SalesTypeForm, getProps: withTabIdAfterProps },
  SalesType: { component: SalesTypeForm, getProps: withTabIdAfterProps },
  DeliveryLocationForm: { component: DeliveryLocationForm, getProps: withTabIdAfterProps },
  DeliveryLocation: { component: DeliveryLocationForm, getProps: withTabIdAfterProps },
  SalesCenterForm: { component: SalesCenterForm, getProps: withTabIdAfterProps },
  SalesCenter: { component: SalesCenterForm, getProps: withTabIdAfterProps },
  SalesAccountCategoryForm: { component: SalesAccountCategoryForm, getProps: withTabIdAfterProps },
  SalesAccountCategory: { component: SalesAccountCategoryForm, getProps: withTabIdAfterProps },
  SalesItemGroupForm: { component: SalesItemGroup, getProps: withTabIdAfterProps },
  SalesItemGroup: { component: SalesItemGroup, getProps: withTabIdAfterProps },
  SalesItemGroupList: { component: SalesItemGroupList },
  SalesDocumentSettingsForm: { component: SalesDocumentSettingsForm, getProps: withTabIdAfterProps },
  SalesDocumentSettings: { component: SalesDocumentSettingsForm, getProps: withTabIdAfterProps },

  // ---- inv (inventory) ----
  MeasurementUnitForm: { component: MeasurementUnit },
  ItemServiceGroupForm: { component: ItemServiceGroup },
  ItemServiceGroup: { component: ItemServiceGroup },
  ProductServiceGroupForm: { component: ItemServiceGroup },
  WarehouseForm: { component: WarehouseForm },
  ItemAccountCategoryForm: { component: ItemAccountCategoryForm },
  ItemAccountCategory: { component: ItemAccountCategoryForm },
  ItemAccountCategoryList: { component: ItemAccountCategoryList },
  ProductServiceForm: { component: ProductServiceForm },
  ProductService: { component: ProductServiceForm },
  ProductServiceList: { component: ProductServiceList },
  ItemPackageForm: { component: ItemPackageForm, getProps: withTabIdAfterProps },
  ItemPackage: { component: ItemPackageForm, getProps: withTabIdAfterProps },
  ItemPackageList: { component: ItemPackageList },
  StandardItemRateForm: { component: StandardItemRateForm },
  StandardItemRate: { component: StandardItemRateForm },
  TrackingFactorForm: { component: TrackingFactorForm, getProps: withTabIdAfterProps },
  TrackingFactor: { component: TrackingFactorForm, getProps: withTabIdAfterProps },
  TrackingFactorList: { component: TrackingFactorList },
  WarehouseDocumentTypeForm: { component: WarehouseDocumentTypeForm, getProps: withTabIdAfterProps },
  WarehouseDocumentType: { component: WarehouseDocumentTypeForm, getProps: withTabIdAfterProps },
  BarcodeLabelForm: { component: BarcodeLabelForm },
  BarcodeLabel: { component: BarcodeLabelForm },
  ItemRequestForm: { component: ItemRequestForm, getProps: withTabIdAfterProps },
  ItemRequest: { component: ItemRequestForm, getProps: withTabIdAfterProps },
  ServiceRequestForm: { component: ServiceRequestForm, getProps: withTabIdAfterProps },
  ServiceRequest: { component: ServiceRequestForm, getProps: withTabIdAfterProps },
  ItemSupplyRequestForm: { component: ItemSupplyRequestForm, getProps: withTabIdAfterProps },
  ItemSupplyRequest: { component: ItemSupplyRequestForm, getProps: withTabIdAfterProps },
  ItemServiceSupplyRequestForm: { component: ItemSupplyRequestForm, getProps: withTabIdAfterProps },
  ItemServiceSupplyRequest: { component: ItemSupplyRequestForm, getProps: withTabIdAfterProps },
  ServiceSupplyRequestForm: { component: ServiceSupplyRequestForm, getProps: withTabIdAfterProps },
  ServiceSupplyRequest: { component: ServiceSupplyRequestForm, getProps: withTabIdAfterProps },
  PurchaseInvoiceForm: { component: PurchaseInvoiceForm, getProps: withTabIdAfterProps },
  PurchaseInvoice: { component: PurchaseInvoiceForm, getProps: withTabIdAfterProps },
  TemporaryItemReceiptForm: { component: TemporaryItemReceiptForm, getProps: withTabIdAfterProps },
  TemporaryItemReceipt: { component: TemporaryItemReceiptForm, getProps: withTabIdAfterProps },
  WarehouseReceiptForm: { component: WarehouseReceiptForm, getProps: withTabIdAfterProps },
  WarehouseReceipt: { component: WarehouseReceiptForm, getProps: withTabIdAfterProps },
  WarehouseIssueForm: { component: WarehouseIssueForm, getProps: withTabIdAfterProps },
  WarehouseIssue: { component: WarehouseIssueForm, getProps: withTabIdAfterProps },
  ReturnTemporaryItemReceiptForm: { component: ReturnTemporaryItemReceiptForm, getProps: withTabIdAfterProps },
  ReturnTemporaryItemReceipt: { component: ReturnTemporaryItemReceiptForm, getProps: withTabIdAfterProps },
  TemporaryItemReceiptReturnForm: { component: ReturnTemporaryItemReceiptForm, getProps: withTabIdAfterProps },
  TemporaryItemReceiptReturn: { component: ReturnTemporaryItemReceiptForm, getProps: withTabIdAfterProps },
  ServicePurchaseInvoiceForm: { component: ServicePurchaseInvoiceForm, getProps: withTabIdAfterProps },
  ServicePurchaseInvoice: { component: ServicePurchaseInvoiceForm, getProps: withTabIdAfterProps },
  PurchaseSalesParametersForm: { component: PurchaseSalesParametersForm, getProps: withTabIdAfterProps },
  PurchaseSalesParameters: { component: PurchaseSalesParametersForm, getProps: withTabIdAfterProps },
  WarehousePricingForm: { component: WarehousePricingForm, getProps: withTabIdAfterProps },
  WarehousePricing: { component: WarehousePricingForm, getProps: withTabIdAfterProps },
  WarehouseVoucherForm: { component: WarehouseVoucherForm, getProps: withTabIdAfterProps },
  WarehouseVoucher: { component: WarehouseVoucherForm, getProps: withTabIdAfterProps },
  WarehousePricingList: { component: WarehousePricingList },
  StocktakingSettingsForm: { component: StocktakingSettingsForm, getProps: withTabIdAfterProps },
  StocktakingTagForm: { component: StocktakingTagForm, getProps: withTabIdAfterProps },
  StocktakingForm: { component: StocktakingForm, getProps: withTabIdAfterProps },
  StocktakingCountForm: { component: StocktakingForm, getProps: withTabIdAfterProps },
  StocktakingList: { component: StocktakingList, getProps: withTabIdAfterProps },
  StocktakingCountList: { component: StocktakingList, getProps: withTabIdAfterProps },
  ItemCardexReport: { component: ItemCardexReport, getProps: withTabIdAfterProps },
  ItemKardexReport: { component: ItemCardexReport, getProps: withTabIdAfterProps },
  inventory_report: { component: ItemCardexReport, getProps: withTabIdAfterProps },

  // ---- platform / special ----
  AiChatWidget: { component: AiChatWidget, getProps: () => ({ inline: true }) },
  DfbBuilder: { component: DfbBuilder, getProps: noProps },
  DynamicFormBuilder: { component: DfbBuilder, getProps: noProps },
  DynamicFormRunner: {
    component: DynamicFormRunner,
    // Historical branch: `<DynamicFormRunner formCode={tab.props?.formCode} title={tab.title} />`
    getProps: (tab) => ({ formCode: tab.props?.formCode, title: tab.title }),
  },
};

/** Resolve a tab to its registry entry (undefined → "Component not found" fallback). */
export function getTabRegistryEntry(componentName: string | undefined): TabRegistryEntry | undefined {
  if (!componentName) return undefined;
  return TAB_COMPONENTS[componentName];
}
