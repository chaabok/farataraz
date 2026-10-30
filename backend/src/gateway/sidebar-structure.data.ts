// AUTO-DERIVED DATA (Task 5-a): server-side mirror of the frontend
// lib/sidebar-metadata.ts SIDEBAR_STRUCTURE. Icon component references are
// stripped (icons are irrelevant to the permissions-tree API); id/title/leaf
// hierarchy is preserved verbatim so permission node ids match the UI.
// Keep in sync with lib/sidebar-metadata.ts when sidebar menus change.

export interface SidebarStructureNode {
  id?: string;
  title: string;
  leaf?: boolean;
  items?: SidebarStructureNode[];
  subItems?: SidebarStructureNode[];
  [key: string]: any;
}

export const SIDEBAR_STRUCTURE: SidebarStructureNode[] = [
  {
    id: "general_group",
    title: "تنظیمات و عمومی",
    colorClass: "bg-blue-600",
    textColorClass: "text-blue-600",
    scrollbarClass: "[&::-webkit-scrollbar-thumb]:bg-blue-600 dark:[&::-webkit-scrollbar-thumb]:bg-blue-500",
    items: [
      {
        id: "structural_settings",
        title: "تنظیمات ساختاری",
        subItems: [
          {
            id: "BaseSettings",
            title: "تنظیمات پایه",
            componentName: "BaseSettings"
          },
          {
            id: "BusinessStructure",
            title: "ساختار کسب و کار",
            componentName: "BusinessStructure"
          },
          {
            id: "NewFiscalYear",
            title: "سال مالی جدید",
            componentName: "FiscalYear"
          },
          {
            id: "FormNumbering",
            title: "روش شماره گذاری جدید",
            componentName: "FormNumbering"
          },
          {
            id: "fiscal_and_numbering_lists",
            title: "فهرست",
            subItems: [
              {
                id: "FiscalYearList",
                title: "دوره های مالی",
                componentName: "FiscalYearList"
              },
              {
                id: "EntityNumberingList",
                title: "روش های شماره گذاری",
                componentName: "EntityNumberingList"
              },
              {
                id: "DetailedAccountsNumbering",
                title: "شماره گذاری تفصیلی",
                componentName: "DetailedAccountsNumbering"
              }
            ]
          }
        ]
      },
      {
        id: "user_management",
        title: "مدیریت کاربران",
        subItems: [
          {
            id: "operations_user",
            title: "عملیات",
            subItems: [
              {
                id: "UserForm",
                title: "تعریف کاربر",
                componentName: "UserForm"
              },
              {
                id: "UserGroupForm",
                title: "تعریف گروه کاربری",
                componentName: "UserGroupForm"
              }
            ]
          },
          {
            id: "reports_user",
            title: "گزارشات",
            subItems: [
              {
                id: "activity_log",
                title: "مدیریت لاگ ها",
                componentName: "ActivityLogList"
              }
            ]
          },
          {
            id: "lists_user",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "UserList",
                title: "فهرست کاربران",
                componentName: "UserList"
              },
              {
                id: "UserGroupList",
                title: "فهرست گروه‌های کاربری",
                componentName: "UserGroupList"
              }
            ]
          }
        ]
      },
      {
        id: "general",
        title: "سیستم عمومی",
        subItems: [
          {
            id: "operations_general",
            title: "اطلاعات پایه",
            subItems: [
              {
                id: "dashboard_main",
                title: "صفحه اصلی"
              },
              {
                id: "DataImport",
                title: "دریافت اطلاعات",
                componentName: "DataImport",
                path: "/forms/common/data-import"
              },
              {
                id: "GeoLocation",
                title: "محل های جغرافیایی",
                componentName: "GeoLocation"
              },
              {
                id: "NewParty",
                title: "طرف حساب جدید",
                componentName: "Party"
              },
              {
                id: "Currency",
                title: "ارز / ارز جدید",
                componentName: "Currency"
              },
              {
                id: "CurrencyExchangeRate",
                title: "نرخ برابری ارز",
                componentName: "CurrencyExchangeRate"
              }
            ]
          },
          {
            id: "reports_general",
            title: "گزارشات",
            subItems: [
              {
                id: "ReportBuilderList",
                title: "گزارش ساز پویا",
                componentName: "ReportBuilderList",
                path: "/forms/common/report-builders"
              }
            ]
          },
          {
            id: "lists_general",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "CurrencyList",
                title: "فهرست ارزها",
                componentName: "CurrencyList"
              },
              {
                id: "PartyList",
                title: "فهرست طرف حساب‌ها",
                componentName: "PartyList"
              }
            ]
          }
        ]
      },
      {
        id: "dynamic_form_builder",
        title: "فرم ساز پویا (DFB)",
        subItems: [
          {
            id: "DfbBuilder",
            title: "طراحی فرم پویا",
            componentName: "DfbBuilder"
          },
          {
            id: "dynamic_user_forms_menu",
            title: "فرم‌های ایجاد شده",
            subItems: []
          }
        ]
      }
    ]
  },
  {
    id: "financial_group",
    title: "حسابداری و مالی",
    colorClass: "bg-emerald-600",
    textColorClass: "text-emerald-600",
    scrollbarClass: "[&::-webkit-scrollbar-thumb]:bg-emerald-600 dark:[&::-webkit-scrollbar-thumb]:bg-emerald-500",
    items: [
      {
        id: "accounting",
        title: "حسابداری",
        subItems: [
          {
            id: "basic_info_accounting",
            title: "اطلاعات پایه",
            subItems: [
              {
                id: "coding",
                title: "کدینگ حساب‌ها",
                componentName: "Accounts"
              },
              {
                id: "DetailedType",
                title: "نوع تفصیلی جدید",
                componentName: "DetailedType"
              },
              {
                id: "CostCenter",
                title: "مراکز هزینه جدید",
                componentName: "CostCenter"
              },
              {
                id: "ProjectForm",
                title: "پروژه جدید",
                componentName: "ProjectForm"
              },
              {
                id: "Contract",
                title: "قرارداد جدید",
                componentName: "Contract"
              },
              {
                id: "NewDocumentType",
                title: "نوع سند جدید",
                componentName: "NewDocumentType"
              },
              {
                id: "OtherDetails",
                title: "تفصیلی سایر جدید",
                componentName: "OtherDetails"
              }
            ]
          },
          {
            id: "operations_accounting",
            title: "عملیات",
            subItems: [
              {
                id: "NewVoucher",
                title: "سند حسابداری جدید",
                componentName: "Voucher"
              },
              {
                id: "RenumberVouchers",
                title: "شماره گذاری مجدد",
                componentName: "RenumberVouchers"
              },
              {
                id: "FinalizeVouchers",
                title: "دائمی کردن اسناد",
                componentName: "FinalizeVouchers"
              }
            ]
          },
          {
            id: "end_of_fiscal_year_menu",
            title: "پایان سال مالی",
            subItems: [
              {
                id: "Closingtemporaryaccounts",
                title: "بستن حسابهای موقت",
                componentName: "Closingtemporaryaccounts"
              },
              {
                id: "NatureAdjustmentVoucher",
                title: "سند تعدیل ماهیت",
                componentName: "NatureAdjustmentVoucher"
              }
            ]
          },
          {
            id: "reports_accounting",
            title: "گزارشات",
            subItems: [
              {
                id: "AccountReview",
                title: "گزارش مرور حساب‌ها",
                componentName: "AccountReview"
              },
              {
                id: "seasonal_reports",
                title: "گزارشات تراز و دفتر",
                componentName: "TrialBalanceAndLedgerReport"
              },
              {
                id: "tax_stats",
                title: "آمار مالیاتی"
              },
              {
                id: "budget",
                title: "بودجه و تخصیص"
              }
            ]
          },
          {
            id: "lists_accounting",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "VouchersList",
                title: "فهرست اسناد حسابداری",
                componentName: "VouchersList"
              },
              {
                id: "DetailedTypeList",
                title: "فهرست انواع تفصیلی",
                componentName: "DetailedTypeList"
              },
              {
                id: "DetailedAccount",
                title: "حساب های تفصیلی",
                componentName: "DetailedAccount"
              },
              {
                id: "ProjectList",
                title: "فهرست پروژه‌ها",
                componentName: "ProjectList"
              },
              {
                id: "CostCenterList",
                title: "مراکز هزینه",
                componentName: "CostCenterList"
              },
              {
                id: "OtherDetailsList",
                title: "فهرست تفصیلی سایر",
                componentName: "OtherDetailsList"
              },
              {
                id: "DocumentTypes",
                title: "فهرست انواع سند",
                componentName: "DocumentTypes"
              }
            ]
          }
        ]
      },
      {
        id: "receipt_payment",
        title: "دریافت و پرداخت",
        subItems: [
          {
            id: "basic_info_rp",
            title: "اطلاعات پایه",
            subItems: [
              {
                id: "CashForm",
                title: "صندوق جدید",
                componentName: "CashForm"
              },
              {
                id: "RapReasons",
                title: "بابت ها",
                componentName: "RapReasons"
              },
              {
                id: "BankAccountType",
                title: "نوع حساب بانکی جدید",
                componentName: "BankAccountType"
              },
              {
                id: "PaymentGatewayForm",
                title: "درگاه پرداخت جدید",
                componentName: "PaymentGatewayForm",
                path: "/forms/rap/payment-gateway-new"
              },
              {
                id: "BankForm",
                title: "بانک جدید",
                componentName: "BankForm"
              },
              {
                id: "BankBranchForm",
                title: "شعبه بانکی جدید",
                componentName: "BankBranchForm"
              },
              {
                id: "BankAccount",
                title: "حساب بانکی جدید",
                componentName: "BankAccountForm"
              },
              {
                id: "ChequebookForm",
                title: "دسته چک جدید",
                componentName: "ChequebookForm",
                path: "/forms/rap/chequebook-new"
              },
              {
                id: "ChequeTemplateSettings",
                title: "تنظیمات قالب چک",
                componentName: "ChequeTemplateSettings"
              },
              {
                id: "PromissoryNoteForm",
                title: "سفته جدید",
                componentName: "PromissoryNoteForm",
                path: "/forms/rap/promissory-note-new"
              },
              {
                id: "AccountingSettingForm",
                title: "عملیات حسابداری جدید",
                componentName: "RecieptAndPaymentAccountingSetting",
                path: "/forms/rap/accounting-setting-new"
              }
            ]
          },
          {
            id: "operations_rp",
            title: "عملیات",
            subItems: [
              {
                id: "ReceiptNotification",
                title: "رسید دریافت",
                componentName: "ReceiptNotificationForm",
                path: "/forms/rap/receipt-notification"
              },
              {
                id: "ReceivedChequeOperation",
                title: "عملیات چک دریافتنی جدید",
                componentName: "ReceivedChequeOperation",
                path: "/forms/rap/received-cheque-operation-new"
              },
              {
                id: "PaymentNotification",
                title: "اعلامیه پرداخت",
                componentName: "PaymentNotificationForm"
              },
              {
                id: "PaidDocumentClearing",
                title: "وصول اسناد پرداختنی جدید",
                componentName: "PaidDocumentClearingForm",
                path: "/forms/rap/paid-document-clearing-new"
              }
            ]
          },
          {
            id: "bank_reconciliation_rp",
            title: "مغایرت بانکی",
            subItems: [
              {
                id: "BankReconciliationForm",
                title: "مغایرت بانکی جدید",
                componentName: "BankReconciliationForm"
              },
              {
                id: "BankStatementForm",
                title: "صورت حساب بانکی جدید",
                componentName: "BankStatementForm",
                path: "/forms/rap/bank-statement-new"
              }
            ]
          },
          {
            id: "petty_cash_rp",
            title: "تنخواه گردان",
            subItems: [
              {
                id: "PettyCashForm",
                title: "تنخواه گردان جدید",
                componentName: "PettyCashForm",
                path: "/forms/rap/petty-cash-new"
              },
              {
                id: "PettyCashRequestForm",
                title: "درخواست تنخواه",
                componentName: "PettyCashRequestForm",
                path: "/forms/rap/petty-cash-request-new"
              },
              {
                id: "PettyCashSummaryForm",
                title: "خلاصه تنخواه جدید",
                componentName: "PettyCashSummaryForm",
                path: "/forms/rap/petty-cash-summary-new"
              }
            ]
          },
          {
            id: "reports_rp",
            title: "گزارشات",
            subItems: [
              {
                id: "RapReview",
                title: "مرور دریافت و پرداخت",
                componentName: "RapReview"
              }
            ]
          },
          {
            id: "lists_rp",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "basic_info_rp_lists",
                title: "اطلاعات پایه",
                subItems: [
                  {
                    id: "CashList",
                    title: "صندوق‌ها",
                    componentName: "CashList"
                  },
                  {
                    id: "BankList",
                    title: "بانک‌ها",
                    componentName: "BankList"
                  },
                  {
                    id: "BankBranchList",
                    title: "شعب بانکی",
                    componentName: "BankBranchList"
                  },
                  {
                    id: "BankAccountTypeList",
                    title: "انواع حساب بانکی",
                    componentName: "BankAccountTypeList"
                  },
                  {
                    id: "BankAccountList",
                    title: "حساب‌های بانکی",
                    componentName: "BankAccountList"
                  },
                  {
                    id: "PaymentGatewayList",
                    title: "درگاههای پرداخت",
                    componentName: "PaymentGatewayList",
                    path: "/forms/rap/payment-gateways"
                  },
                  {
                    id: "ChequebookList",
                    title: "دسته چک‌ها",
                    componentName: "ChequebookList",
                    path: "/forms/rap/chequebooks"
                  },
                  {
                    id: "PromissoryNoteList",
                    title: "سفته‌ها",
                    componentName: "PromissoryNoteList",
                    path: "/forms/rap/promissory-notes"
                  },
                  {
                    id: "ChequePrintTemplateList",
                    title: "قالب‌های چاپ چک",
                    componentName: "ChequePrintTemplateList"
                  },
                  {
                    id: "AccountingSettingList",
                    title: "عملیات حسابداری",
                    componentName: "AccountingSettingList",
                    path: "/forms/rap/accounting-settings"
                  }
                ]
              },
              {
                id: "operations_rp_lists",
                title: "عملیات",
                subItems: [
                  {
                    id: "ReceiptNotificationList",
                    title: "رسیدهای دریافت",
                    componentName: "ReceiptNotificationList",
                    path: "/forms/rap/receipt-notifications"
                  },
                  {
                    id: "PaymentNotificationList",
                    title: "اعلامیه پرداخت",
                    componentName: "PaymentNotificationList",
                    path: "/forms/rap/payment-notifications"
                  },
                  {
                    id: "ReceivedChequeOperationList",
                    title: "عملیات چک دریافتنی",
                    componentName: "ReceivedChequeOperationList",
                    path: "/forms/rap/received-cheque-operations"
                  },
                  {
                    id: "PaidDocumentClearingList",
                    title: "وصول اسناد پرداختنی",
                    componentName: "PaidDocumentClearingList",
                    path: "/forms/rap/paid-document-clearings"
                  }
                ]
              },
              {
                id: "bank_recon_lists",
                title: "مغایرت بانکی",
                subItems: [
                  {
                    id: "BankStatementList",
                    title: "فهرست صورت‌حساب‌ها",
                    componentName: "BankStatementList",
                    path: "/forms/rap/bank-statements"
                  }
                ]
              },
              {
                id: "petty_cash_rp_lists",
                title: "تنخواه گردان",
                subItems: [
                  {
                    id: "PettyCashList",
                    title: "فهرست تنخواه گردان",
                    componentName: "PettyCashList",
                    path: "/forms/rap/petty-cashes"
                  },
                  {
                    id: "PettyCashRequestList",
                    title: "فهرست درخواست های تنخواه",
                    componentName: "PettyCashRequestList",
                    path: "/forms/rap/petty-cash-requests"
                  },
                  {
                    id: "PettyCashSummaryList",
                    title: "فهرست خلاصه تنخواه",
                    componentName: "PettyCashSummaryList",
                    path: "/forms/rap/petty-cash-summaries"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "fixed_assets",
        title: "اموال",
        subItems: [
          {
            id: "operations_assets",
            title: "عملیات",
            subItems: [
              {
                id: "new_asset",
                title: "تعریف دارایی"
              }
            ]
          },
          {
            id: "reports_assets",
            title: "گزارشات",
            subItems: [
              {
                id: "depreciation_report",
                title: "گزارش استهلاک"
              }
            ]
          },
          {
            id: "lists_assets",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "asset_list",
                title: "فهرست دارایی‌ها"
              }
            ]
          }
        ]
      },
      {
        id: "payroll",
        title: "حقوق و دستمزد",
        subItems: [
          {
            id: "operations_payroll",
            title: "عملیات",
            subItems: []
          },
          {
            id: "reports_payroll",
            title: "گزارشات",
            subItems: [
              {
                id: "salary_slips",
                title: "فیش‌های حقوقی"
              }
            ]
          },
          {
            id: "lists_payroll",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "staff_list",
                title: "فهرست پرسنل"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "supply_chain_group",
    title: "تامین و تولید",
    colorClass: "bg-orange-500",
    textColorClass: "text-orange-500",
    scrollbarClass: "[&::-webkit-scrollbar-thumb]:bg-orange-500 dark:[&::-webkit-scrollbar-thumb]:bg-orange-600",
    items: [
      {
        id: "production",
        title: "تولید",
        subItems: [
          {
            id: "operations_production",
            title: "عملیات",
            subItems: [
              {
                id: "new_bom",
                title: "فرمول تولید جدید (BOM)"
              },
              {
                id: "new_production_order",
                title: "سفارش تولید جدید"
              }
            ]
          },
          {
            id: "reports_production",
            title: "گزارشات",
            subItems: [
              {
                id: "efficiency_report",
                title: "گزارش راندمان"
              }
            ]
          },
          {
            id: "lists_production",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "production_planning",
                title: "برنامه‌ریزی تولید"
              },
              {
                id: "qc",
                title: "کنترل کیفیت"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "warehouse_logistics_group",
    title: "انبار و بازرگانی",
    colorClass: "bg-indigo-500",
    textColorClass: "text-indigo-500",
    scrollbarClass: "[&::-webkit-scrollbar-thumb]:bg-indigo-500 dark:[&::-webkit-scrollbar-thumb]:bg-indigo-600",
    items: [
      {
        id: "sales",
        title: "فروش",
        subItems: [
          {
            id: "basic_info_sales",
            title: "اطلاعات پایه",
            subItems: [
              {
                id: "CustomerForm",
                title: "مشتری جدید",
                componentName: "CustomerForm",
                path: "/forms/sle/customer-new"
              },
              {
                id: "CustomerGroupForm",
                title: "گروه بندی مشتریان",
                componentName: "CustomerGroupForm",
                path: "/forms/sle/customer-groups"
              },
              {
                id: "SalesAccountCategoryForm",
                title: "طبقه حساب فروش",
                componentName: "SalesAccountCategoryForm",
                path: "/forms/sle/sales-account-categories"
              },
              {
                id: "SalesItemGroupForm",
                title: "گروه بندی کالا فروش",
                componentName: "SalesItemGroupForm",
                path: "/forms/sle/sales-item-groups"
              },
              {
                id: "WalletForm",
                title: "کیف پول جدید",
                componentName: "WalletForm",
                path: "/forms/sle/wallet-new"
              },
              {
                id: "SalesChannelForm",
                title: "کانال فروش",
                componentName: "SalesChannelForm",
                path: "/forms/sle/sales-channel-new"
              },
              {
                id: "SalesTypeForm",
                title: "نوع فروش جدید",
                componentName: "SalesTypeForm",
                path: "/forms/sle/sales-type-new"
              },
              {
                id: "DeliveryLocationForm",
                title: "مکان های تحویل",
                componentName: "DeliveryLocationForm",
                path: "/forms/sle/delivery-location-new"
              },
              {
                id: "SalesCenterForm",
                title: "مراکز فروش جدید",
                componentName: "SalesCenterForm",
                path: "/forms/sle/sales-center-new"
              },
              {
                id: "SettlementMethodForm",
                title: "روش تسویه جدید",
                componentName: "SettlementMethodForm",
                path: "/forms/sle/settlement-method-new"
              },
              {
                id: "PurchaseSalesParametersForm",
                title: "پارامترهای خرید و فروش",
                componentName: "PurchaseSalesParametersForm",
                path: "/forms/inv/purchase-sales-parameters"
              },
              {
                id: "SalesDocumentSettingsForm",
                title: "تنظیمات اسناد فروش",
                componentName: "SalesDocumentSettingsForm",
                path: "/forms/sle/sales-document-settings"
              }
            ]
          },
          {
            id: "operations_sales",
            title: "عملیات",
            subItems: [
              {
                id: "SalesInvoiceForm",
                title: "فاکتور فروش جدید",
                componentName: "SalesInvoiceForm",
                path: "/forms/sle/sales-invoice-new"
              },
              {
                id: "SalesOrderForm",
                title: "سفارش فروش جدید",
                componentName: "SalesOrderForm",
                path: "/forms/sle/sales-order-new"
              },
              {
                id: "SalesProformaForm",
                title: "پیش فاکتور فروش جدید",
                componentName: "SalesProformaForm",
                path: "/forms/sle/sales-proforma-new"
              },
              {
                id: "SalesContractForm",
                title: "قرارداد فروش",
                componentName: "SalesContractForm",
                path: "/forms/sle/sales-contract-new"
              },
              {
                id: "SalesPermissionForm",
                title: "مجوز فروش",
                componentName: "SalesPermissionForm",
                path: "/forms/sle/sales-permission-new"
              }
            ]
          },
          {
            id: "reports_sales",
            title: "گزارشات",
            subItems: [
              {
                id: "sales_report",
                title: "گزارش فروش"
              }
            ]
          },
          {
            id: "lists_sales",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "invoice_list",
                title: "فهرست فاکتورها"
              },
              {
                id: "customer_list",
                title: "فهرست مشتریان"
              }
            ]
          }
        ]
      },
      {
        id: "warehouse",
        title: "نرم افزار انبار",
        subItems: [
          {
            id: "basic_info_warehouse",
            title: "اطلاعات پایه",
            subItems: [
              {
                id: "ProductServiceForm",
                title: "کالا خدمت جدید",
                componentName: "ProductServiceForm",
                path: "/forms/inv/product-service-new"
              },
              {
                id: "ItemPackageForm",
                title: "پک کالا خدمت جدید",
                componentName: "ItemPackageForm",
                path: "/forms/inv/package-new"
              },
              {
                id: "MeasurementUnitForm",
                title: "واحد سنجش جدید",
                componentName: "MeasurementUnitForm",
                path: "/forms/inv/measurement-unit-new"
              },
              {
                id: "ItemAccountCategoryForm",
                title: "طبقه حساب کالا جدید",
                componentName: "ItemAccountCategoryForm",
                path: "/forms/inv/item-account-category-new"
              },
              {
                id: "StandardItemRateForm",
                title: "نرخ استاندارد کالا",
                componentName: "StandardItemRateForm",
                path: "/forms/inv/standard-item-rate-new"
              },
              {
                id: "ItemServiceGroupForm",
                title: "گروه بندی کالا انبار",
                componentName: "ItemServiceGroupForm",
                path: "/forms/inv/item-service-group"
              },
              {
                id: "TrackingFactorForm",
                title: "تعریف عامل ردیابی",
                componentName: "TrackingFactorForm",
                path: "/forms/inv/tracking-factor-new"
              },
              {
                id: "BarcodeLabelForm",
                title: "تولید برچسب بارکد",
                componentName: "BarcodeLabelForm",
                path: "/forms/inv/barcode-label-new"
              },
              {
                id: "WarehouseForm",
                title: "انبار و محل فیزیکی کالا",
                componentName: "WarehouseForm",
                path: "/forms/inv/warehouses"
              },
              {
                id: "WarehouseDocumentTypeForm",
                title: "نوع سند انبار جدید",
                componentName: "WarehouseDocumentTypeForm",
                path: "/forms/inv/warehouse-document-type-new"
              },
              {
                id: "PurchaseSalesParametersForm",
                title: "پارامترهای خرید و فروش",
                componentName: "PurchaseSalesParametersForm",
                path: "/forms/inv/purchase-sales-parameters"
              }
            ]
          },
          {
            id: "requests_warehouse",
            title: "درخواست کالا خدمت",
            subItems: [
              {
                id: "ItemRequestForm",
                title: "درخواست کالا جدید",
                componentName: "ItemRequestForm",
                path: "/forms/inv/item-request-new"
              },
              {
                id: "ServiceRequestForm",
                title: "درخواست خدمت جدید",
                componentName: "ServiceRequestForm",
                path: "/forms/inv/service-request-new"
              }
            ]
          },
          {
            id: "supply_requests_warehouse",
            title: "درخواست تامین کالا خدمت",
            subItems: [
              {
                id: "ItemSupplyRequestForm",
                title: "درخواست تامین کالا جدید",
                componentName: "ItemSupplyRequestForm",
                path: "/forms/inv/item-supply-request-new"
              },
              {
                id: "ServiceSupplyRequestForm",
                title: "درخواست تامین خدمت جدید",
                componentName: "ServiceSupplyRequestForm",
                path: "/forms/inv/service-supply-request-new"
              }
            ]
          },
          {
            id: "purchase_invoice_warehouse",
            title: "فاکتور خرید کالا",
            subItems: [
              {
                id: "PurchaseInvoiceForm",
                title: "فاکتور خرید کالا جدید",
                componentName: "PurchaseInvoiceForm",
                path: "/forms/inv/purchase-invoice-new"
              },
              {
                id: "ServicePurchaseInvoiceForm",
                title: "فاکتور خرید خدمت",
                componentName: "ServicePurchaseInvoiceForm",
                path: "/forms/inv/service-purchase-invoice-new"
              }
            ]
          },
          {
            id: "operations_warehouse",
            title: "رسید و حواله انبار",
            subItems: [
              {
                id: "TemporaryItemReceiptForm",
                title: "رسید موقت کالا",
                componentName: "TemporaryItemReceiptForm",
                path: "/forms/inv/temporary-receipt-new"
              },
              {
                id: "ReturnTemporaryItemReceiptForm",
                title: "برگشت رسید موقت کالا",
                componentName: "ReturnTemporaryItemReceiptForm",
                path: "/forms/inv/temporary-receipt-return-new"
              },
              {
                id: "WarehouseReceiptForm",
                title: "رسید انبار جدید",
                componentName: "WarehouseReceiptForm",
                path: "/forms/inv/warehouse-receipt-new"
              },
              {
                id: "WarehouseIssueForm",
                title: "حواله انبار جدید",
                componentName: "WarehouseIssueForm",
                path: "/forms/inv/warehouse-issue-new"
              }
            ]
          },
          {
            id: "pricing_and_voucher_warehouse",
            title: "حسابداری کالا",
            subItems: [
              {
                id: "WarehousePricingForm",
                title: "قیمت گذاری اسناد انبار",
                componentName: "WarehousePricingForm",
                path: "/forms/inv/warehouse-pricing-new"
              },
              {
                id: "WarehouseVoucherForm",
                title: "صدور سند حسابداری انبار",
                componentName: "WarehouseVoucherForm",
                path: "/forms/inv/warehouse-voucher-new"
              },
              {
                id: "WarehousePricingList",
                title: "فهرست اسناد قیمت‌گذاری شده",
                componentName: "WarehousePricingList",
                path: "/forms/inv/warehouse-pricing-list"
              }
            ]
          },
          {
            id: "stocktaking_warehouse",
            title: "انبارگردانی",
            subItems: [
              {
                id: "StocktakingSettingsForm",
                title: "تنظیمات انبارگردانی",
                componentName: "StocktakingSettingsForm",
                path: "/forms/inv/stocktaking-settings"
              },
              {
                id: "StocktakingTagForm",
                title: "صدور تگ انبارگردانی",
                componentName: "StocktakingTagForm",
                path: "/forms/inv/stocktaking-tag-new"
              },
              {
                id: "StocktakingForm",
                title: "شمارش انبارگردانی",
                componentName: "StocktakingForm",
                path: "/forms/inv/stocktaking-new"
              }
            ]
          },
          {
            id: "reports_warehouse",
            title: "گزارشات",
            subItems: [
              {
                id: "inventory_report",
                title: "کاردکس کالا",
                componentName: "ItemCardexReport",
                path: "/forms/inv/item-cardex"
              }
            ]
          },
          {
            id: "lists_warehouse",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "ProductServiceList",
                title: "فهرست کالا و خدمات",
                componentName: "ProductServiceList",
                path: "/forms/inv/product-services"
              },
              {
                id: "ItemPackageList",
                title: "فهرست پک کالا خدمت",
                componentName: "ItemPackageList",
                path: "/forms/inv/packages"
              },
              {
                id: "ItemAccountCategoryList",
                title: "طبقات حساب کالا",
                componentName: "ItemAccountCategoryList",
                path: "/forms/inv/item-account-categories"
              },
              {
                id: "SalesItemGroupList",
                title: "فهرست گروه‌بندی کالا فروش",
                componentName: "SalesItemGroupList",
                path: "/forms/sle/sales-item-groups"
              },
              {
                id: "TrackingFactorList",
                title: "عوامل ردیابی",
                componentName: "TrackingFactorList",
                path: "/forms/inv/tracking-factors"
              },
              {
                id: "StocktakingList",
                title: "فهرست شمارش انبارگردانی",
                componentName: "StocktakingList",
                path: "/forms/inv/stocktakings"
              },
              {
                id: "inventory",
                title: "موجودی کالا"
              },
              {
                id: "warehouse_transfer",
                title: "حواله انبار"
              }
            ]
          }
        ]
      },
      {
        id: "quantity_warehouse",
        title: "انبار تعدادی",
        subItems: [
          {
            id: "operations_qty_warehouse",
            title: "عملیات",
            subItems: [
              {
                id: "qty_receipt",
                title: "رسید تعدادی"
              },
              {
                id: "qty_issue",
                title: "حواله تعدادی"
              }
            ]
          },
          {
            id: "reports_qty_warehouse",
            title: "گزارشات",
            subItems: [
              {
                id: "qty_inventory",
                title: "موجودی تعدادی"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "org_management_group",
    title: "مدیریت و سازمان",
    colorClass: "bg-rose-500",
    textColorClass: "text-rose-500",
    scrollbarClass: "[&::-webkit-scrollbar-thumb]:bg-rose-500 dark:[&::-webkit-scrollbar-thumb]:bg-rose-600",
    items: [
      {
        id: "hr",
        title: "منابع انسانی",
        subItems: [
          {
            id: "operations_hr",
            title: "عملیات",
            subItems: [
              {
                id: "new_employee",
                title: "ثبت پرسنل جدید"
              },
              {
                id: "record_attendance",
                title: "ثبت کارکرد"
              }
            ]
          },
          {
            id: "reports_hr",
            title: "گزارشات",
            subItems: [
              {
                id: "attendance_report",
                title: "گزارش حضور و غیاب"
              }
            ]
          },
          {
            id: "lists_hr",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "hr_files",
                title: "پرونده پرسنلی"
              },
              {
                id: "attendance",
                title: "حضور و غیاب"
              }
            ]
          }
        ]
      },
      {
        id: "admin",
        title: "اداری",
        subItems: [
          {
            id: "operations_admin",
            title: "عملیات",
            subItems: [
              {
                id: "new_letter",
                title: "نامه جدید"
              },
              {
                id: "new_meeting",
                title: "جلسه جدید"
              }
            ]
          },
          {
            id: "reports_admin",
            title: "گزارشات",
            subItems: [
              {
                id: "automation_report",
                title: "گزارش عملکرد"
              }
            ]
          },
          {
            id: "lists_admin",
            title: "فهرست‌ها",
            subItems: [
              {
                id: "automation",
                title: "اتوماسیون اداری"
              },
              {
                id: "meetings",
                title: "مدیریت جلسات"
              }
            ]
          }
        ]
      }
    ]
  }
];
