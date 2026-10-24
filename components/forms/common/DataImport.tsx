"use client";

import React, { useState } from "react";
import { TreeView, TreeNode } from "@/components/inputs/TreeView";
import { FileUpload } from "@/components/inputs/FileUpload";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Select } from "@/components/inputs/Select";
import { useLanguage } from "@/lib/stores/languageStore";

const TEMPLATE_COLUMNS: Record<string, Record<string, string[]>> = {
  BusinessStructure: {
    fa: ["* شناسه (اجباری)", "* نام (اجباری)", "* نوع (اجباری)", "کد ساختار (اختیاری)", "توضیحات/مدیر (اختیاری)"],
    en: ["* ID (Required)", "* Name (Required)", "* Type (Required)", "Structure Code (Optional)", "Manager/Desc (Optional)"],
    ar: ["* المعرف (مطلوب)", "* الاسم (مطلوب)", "* النوع (مطلوب)", "رمز الهيكل (اختياري)", "الوصف (اختياري)"],
    zh: ["* ID (必填)", "* 名称 (必填)", "* 类型 (必填)", "结构代码 (选填)", "描述 (选填)"]
  },
  Party: {
    fa: ["* شناسه (اجباری)", "* نوع شخص (حقیقی/حقوقی)", "کد تفصیل (اختیاری)", "* نام (اجباری)", "نام خانوادگی (اختیاری)", "کد ملی (اختیاری)", "کد اقتصادی (اختیاری)", "تلفن (اختیاری)", "موبایل (اختیاری)", "ایمیل (اختیاری)", "وبسایت (اختیاری)", "آدرس (اختیاری)"],
    en: ["* ID (Required)", "* Person Type (Real/Legal)", "Detailed Code (Optional)", "* First Name (Required)", "Last Name (Optional)", "National ID (Optional)", "Economic Code (Optional)", "Phone (Optional)", "Mobile (Optional)", "Email (Optional)", "Website (Optional)", "Address (Optional)"],
    ar: ["* المعرف (مطلوب)", "* نوع الشخص (طبيعي/اعتباري)", "رمز التفصيلي (اختياري)", "* الاسم (مطلوب)", "اسم العائلة (اختياري)", "الرقم القومي (اختياري)", "الرقم الاقتصادي (اختياري)", "هاتف (اختياري)", "جوال (اختياري)", "البريد الإلكتروني (اختياري)", "موقع الويب (اختياري)", "العنوان (اختياري)"],
    zh: ["* ID (必填)", "* 人员类型 (自然人/法人)", "明细代码 (选填)", "* 名字 (必填)", "姓氏 (选填)", "身份证号 (选填)", "经济代码 (选填)", "电话 (选填)", "手机 (选填)", "电子邮件 (选填)", "网站 (选填)", "地址 (选填)"]
  },
  Currency: {
    fa: ["* شناسه (اجباری)", "* کد ارز (اجباری)", "* نام ارز (اجباری)", "نماد (اختیاری)", "نرخ برابری (اختیاری)"],
    en: ["* ID (Required)", "* Currency Code (Required)", "* Currency Name (Required)", "Symbol (Optional)", "Exchange Rate (Optional)"],
    ar: ["* المعرف (مطلوب)", "* رمز العملة (مطلوب)", "* اسم العملة (مطلوب)", "رمز (اختياري)", "سعر الصرف (اختياري)"],
    zh: ["* ID (必填)", "* 货币代码 (必填)", "* 货币名称 (必填)", "符号 (选填)", "汇率 (选填)"]
  },
  FiscalYear: {
    fa: ["* شناسه (اجباری)", "* عنوان (اجباری)", "* تاریخ شروع (اجباری)", "* تاریخ پایان (اجباری)", "وضعیت بسته (اختیاری - بلی/خیر)"],
    en: ["* ID (Required)", "* Title (Required)", "* Start Date (Required)", "* End Date (Required)", "Is Closed (Optional - Yes/No)"],
    ar: ["* المعرف (مطلوب)", "* عنوان (مطلوب)", "* تاريخ البدء (مطلوب)", "* تاريخ الانتهاء (مطلوب)", "مغلق (اختياري - نعم/لا)"],
    zh: ["* ID (必填)", "* 标题 (必填)", "* 开始日期 (必填)", "* 结束日期 (必填)", "是否关闭 (选填 - 是/否)"]
  },
  Accounts: {
    fa: ["* شناسه (اجباری)", "* کد حساب (اجباری)", "* نام حساب (اجباری)", "* سطح حساب (گروه/کل/معین/تفصیلی)", "کد والد (اختیاری)", "ماهیت حساب (بدهکار/بستانکار)"],
    en: ["* ID (Required)", "* Account Code (Required)", "* Account Name (Required)", "* Account Level (Group/Ledger/Sub/Detailed)", "Parent Code (Optional)", "Nature (Debit/Credit)"],
    ar: ["* المعرف (مطلوب)", "* رمز الحساب (مطلوب)", "* اسم الحساب (مطلوب)", "* مستوى الحساب (مجموعة/رئيسي/فرعي/تفصيلي)", "رمز الوالد (اختياري)", "الطبيعة (مدين/دائن)"],
    zh: ["* ID (必填)", "* 账户代码 (必填)", "* 账户名称 (必填)", "* 账户级别 (组/总账/明细/详细)", "父代码 (选填)", "性质 (借/贷)"]
  },
  CostCenter: {
    fa: ["* شناسه (اجباری)", "* کد مرکز (اجباری)", "* نام مرکز هزینه (اجباری)", "توضیحات (اختیاری)"],
    en: ["* ID (Required)", "* Center Code (Required)", "* Cost Center Name (Required)", "Description (Optional)"],
    ar: ["* المعرف (مطلوب)", "* رمز المركز (مطلوب)", "* اسم مركز التكلفة (مطلوب)", "الوصف (اختياري)"],
    zh: ["* ID (必填)", "* 中心代码 (必填)", "* 成本中心名称 (必填)", "描述 (选填)"]
  },
  Voucher: {
    fa: ["* شناسه (اجباری)", "* شماره سند (اجباری)", "* تاریخ سند (اجباری)", "* کد حساب معین (اجباری)", "شرح آرتیکل (اختیاری)", "کد تفصیلی (اختیاری)", "کد مرکز هزینه (اختیاری)", "بدهکار (اجباری)", "بستانکار (اجباری)"],
    en: ["* ID (Required)", "* Voucher No (Required)", "* Voucher Date (Required)", "* Account Code (Required)", "Item Description (Optional)", "Party Code (Optional)", "Cost Center (Optional)", "Debit (Required)", "Credit (Required)"],
    ar: ["* المعرف (مطلوب)", "* رقم القسيمة (مطلوب)", "* تاريخ القسيمة (مطلوب)", "* رمز الحساب (مطلوب)", "وصف العنصر (اختياري)", "رمز التفصيلي (اختياري)", "مركز التكلفة (اختياري)", "المدين (مطلوب)", "الدائن (مطلوب)"],
    zh: ["* ID (必填)", "* 凭证号 (必填)", "* 凭证日期 (必填)", "* 账户代码 (必填)", "项目描述 (选填)", "明细代码 (选填)", "成本中心 (选填)", "借方 (必填)", "贷方 (必填)"]
  },
  Bank: {
    fa: ["* شناسه (اجباری)", "* نام بانک (اجباری)", "شعبه (اختیاری)", "* شماره حساب (اجباری)", "شماره شبا (اختیاری)"],
    en: ["* ID (Required)", "* Bank Name (Required)", "Branch (Optional)", "* Account Number (Required)", "IBAN (Optional)"],
    ar: ["* المعرف (مطلوب)", "* اسم البنك (مطلوب)", "فرع (اختياري)", "* رقم الحساب (مطلوب)", "رقم الآيبان (اختياري)"],
    zh: ["* ID (必填)", "* 银行名称 (必填)", "分行 (选填)", "* 账号 (必填)", "IBAN (选填)"]
  },
  Cash: {
    fa: ["* شناسه (اجباری)", "* کد صندوق (اجباری)", "* نام صندوق (اجباری)", "موجودی اولیه (اختیاری)"],
    en: ["* ID (Required)", "* Cash Code (Required)", "* Cash Name (Required)", "Initial Balance (Optional)"],
    ar: ["* المعرف (مطلوب)", "* رمز الصندوق (مطلوب)", "* اسم الصندوق (مطلوب)", "الرصيد الافتتاحي (اختياري)"],
    zh: ["* ID (必填)", "* 现金代码 (必填)", "* 现金名称 (必填)", "初始余额 (选填)"]
  },
  PaymentNotification: {
    fa: ["* شناسه (اجباری)", "* شماره (اجباری)", "* تاریخ پرداخت (اجباری)", "* کد طرف حساب (اجباری)", "* مبلغ (اجباری)", "بابت / شرح (اختیاری)", "کد حساب بانکی/صندوق (اجباری)"],
    en: ["* ID (Required)", "* Number (Required)", "* Payment Date (Required)", "* Party Code (Required)", "* Amount (Required)", "Reason (Optional)", "Bank/Cash Code (Required)"],
    ar: ["* المعرف (مطلوب)", "* رقم (مطلوب)", "* تاريخ الدفع (مطلوب)", "* رمز الطرف (مطلوب)", "* المبلغ (مطلوب)", "السبب (اختياري)", "رمز البنك/الصندوق (مطلوب)"],
    zh: ["* ID (必填)", "* 编号 (必填)", "* 付款日期 (必填)", "* 收款人代码 (必填)", "* 金额 (必填)", "原因 (选填)", "银行/现金代码 (必填)"]
  },
  ReceiptNotification: {
    fa: ["* شناسه (اجباری)", "* شماره (اجباری)", "* تاریخ دریافت (اجباری)", "* کد طرف حساب (اجباری)", "* مبلغ (اجباری)", "بابت / شرح (اختیاری)", "کد حساب بانکی/صندوق (اجباری)"],
    en: ["* ID (Required)", "* Number (Required)", "* Receipt Date (Required)", "* Party Code (Required)", "* Amount (Required)", "Reason (Optional)", "Bank/Cash Code (Required)"],
    ar: ["* المعرف (مطلوب)", "* رقم (مطلوب)", "* تاريخ الاستلام (مطلوب)", "* رمز الطرف (مطلوب)", "* المبلغ (مطلوب)", "السبب (اختياري)", "رمز البنك/الصندوق (مطلوب)"],
    zh: ["* ID (必填)", "* 编号 (必填)", "* 收款日期 (必填)", "* 付款人代码 (必填)", "* 金额 (必填)", "原因 (选填)", "银行/现金代码 (必填)"]
  }
};

const TEMPLATE_SAMPLES: Record<string, Record<string, string[][]>> = {
  BusinessStructure: {
    fa: [
      ["101", "شرکت پارسا", "شرکت سهامی خاص", "1001", "دفتر مرکزی"],
      ["102", "شعبه شمال", "شعبه", "1002", ""]
    ],
    en: [
      ["101", "Parsa Co", "Private Joint Stock", "1001", "Headquarters"],
      ["102", "North Branch", "Branch", "1002", ""]
    ]
  },
  Party: {
    fa: [
      ["P01", "حقیقی", "10001", "علی", "احمدی", "1234567890", "", "0214444444", "09121111111", "ali@test.com", "www.ali.com", "تهران، خ آزادی"],
      ["P02", "حقوقی", "10002", "شرکت تست", "", "", "10101112223", "021-88888888", "", "info@test.com", "www.test.com", ""]
    ],
    en: [
      ["P01", "Real", "10001", "Ali", "Ahmadi", "1234567890", "", "0214444444", "09121111111", "ali@test.com", "www.ali.com", "Tehran, Azadi St"],
      ["P02", "Legal", "10002", "Test Co", "", "", "10101112223", "021-88888888", "", "info@test.com", "www.test.com", ""]
    ]
  },
  Currency: {
    fa: [
      ["C1", "USD", "دلار آمریکا", "$", "600000"],
      ["C2", "EUR", "یورو", "€", "650000"]
    ],
    en: [
      ["C1", "USD", "US Dollar", "$", "600000"],
      ["C2", "EUR", "Euro", "€", "650000"]
    ]
  },
  FiscalYear: {
    fa: [
      ["F1", "سال مالی 1403", "1403/01/01", "1403/12/30", "خیر"],
      ["F2", "سال مالی 1402", "1402/01/01", "1402/12/29", "بلی"]
    ],
    en: [
      ["F1", "Fiscal Year 2024", "2024/01/01", "2024/12/31", "No"],
      ["F2", "Fiscal Year 2023", "2023/01/01", "2023/12/31", "Yes"]
    ]
  },
  Accounts: {
    fa: [
      ["A1", "11", "دارایی های جاری", "گروه", "", "بدهکار"],
      ["A2", "1101", "موجودی نقد و بانک", "کل", "11", "بدهکار"],
      ["A3", "110101", "صندوق ریالی", "معین", "1101", "بدهکار"]
    ],
    en: [
      ["A1", "11", "Current Assets", "Group", "", "Debit"],
      ["A2", "1101", "Cash and Bank", "Ledger", "11", "Debit"],
      ["A3", "110101", "IRR Cash", "Sub", "1101", "Debit"]
    ]
  },
  CostCenter: {
    fa: [
      ["CC1", "C-01", "مرکز هزینه تولید", "مربوط به بخش تولید"],
      ["CC2", "C-02", "مرکز هزینه اداری", ""]
    ],
    en: [
      ["CC1", "C-01", "Production Center", "Production Dept"],
      ["CC2", "C-02", "Admin Center", ""]
    ]
  },
  Voucher: {
    fa: [
      ["V1", "101", "1403/02/15", "110101", "واریز سرمایه اولیه", "", "", "10000000", "0"],
      ["V2", "101", "1403/02/15", "310101", "تامین سرمایه", "P-100", "", "0", "10000000"]
    ],
    en: [
      ["V1", "101", "2024/05/04", "110101", "Initial capital", "", "", "10000000", "0"],
      ["V2", "101", "2024/05/04", "310101", "Capital provider", "P-100", "", "0", "10000000"]
    ]
  },
  Bank: {
    fa: [
      ["B1", "بانک ملت", "شعبه مرکزی", "1122334455", "IR120120000000001122334455"],
      ["B2", "بانک ملی", "شعبه بازار", "99887766", ""]
    ],
    en: [
      ["B1", "Mellat Bank", "Central Branch", "1122334455", "IR120120000000001122334455"],
      ["B2", "Melli Bank", "Bazaar Branch", "99887766", ""]
    ]
  },
  Cash: {
    fa: [
      ["CS1", "CH-01", "صندوق مرکزی", "5000000"],
      ["CS2", "CH-02", "صندوق تنخواه", "1000000"]
    ],
    en: [
      ["CS1", "CH-01", "Central Cash", "5000000"],
      ["CS2", "CH-02", "Petty Cash", "1000000"]
    ]
  },
  PaymentNotification: {
    fa: [
      ["PN1", "1", "1403/05/10", "P-100", "5000000", "بابت تسویه فاکتور 102", "1122334455"],
      ["PN2", "2", "1403/05/12", "P-200", "2500000", "بابت پیش پرداخت", "CH-01"]
    ],
    en: [
      ["PN1", "1", "2024/07/31", "P-100", "5000000", "Invoice 102 settlement", "1122334455"],
      ["PN2", "2", "2024/08/02", "P-200", "2500000", "Prepayment", "CH-01"]
    ]
  },
  ReceiptNotification: {
    fa: [
      ["RN1", "1", "1403/05/10", "P-100", "5000000", "بابت وصول مطالبات", "1122334455"],
      ["RN2", "2", "1403/05/12", "P-200", "2500000", "بابت پیش دریافت", "CH-01"]
    ],
    en: [
      ["RN1", "1", "2024/07/31", "P-100", "5000000", "Receivables collection", "1122334455"],
      ["RN2", "2", "2024/08/02", "P-200", "2500000", "Pre-receipt", "CH-01"]
    ]
  }
};

const TEMPLATE_INSTRUCTIONS: Record<string, Record<string, string[]>> = {
  BusinessStructure: {
    fa: ["شناسه یکتای عددی/متنی", "نام کامل ساختار", "1: دفتر مرکزی، 2: شرکت، 3: شعبه، 4: نمایندگی", "کد سیستمی", "توضیحات تکمیلی"],
    en: ["Unique ID", "Full Name", "1: HQ, 2: Company, 3: Branch, 4: Department", "System Code", "Description"],
  },
  Party: {
    fa: ["شناسه یکتا", "حقیقی / حقوقی", "کد حسابداری", "نام شخص یا شرکت", "نام خانوادگی (اشخاص حقیقی)", "کد ملی 10 رقمی", "کد اقتصادی", "تلفن ثابت", "موبایل", "ایمیل", "وبسایت", "آدرس کامل"],
    en: ["Unique ID", "Real / Legal", "Acc Code", "First Name or Co Name", "Last Name", "National ID", "Economic Code", "Phone", "Mobile", "Email", "Website", "Address"],
  },
  Currency: {
    fa: ["شناسه یکتا", "مثلا USD", "نام ارز", "مثلا $", "نرخ تبدیل"],
    en: ["Unique ID", "e.g. USD", "Currency Name", "e.g. $", "Exchange Rate"],
  },
  FiscalYear: {
    fa: ["شناسه یکتا", "مثال: سال مالی 1403", "تاریخ شمسی (YYYY/MM/DD)", "تاریخ شمسی (YYYY/MM/DD)", "بلی / خیر"],
    en: ["Unique ID", "e.g. FY2024", "Start Date", "End Date", "Yes / No"],
  },
  Accounts: {
    fa: ["شناسه یکتا", "کد حساب", "نام حساب", "1: گروه، 2: کل، 3: معین، 4: تفصیلی", "کد حساب سرشاخه", "بدهکار / بستانکار"],
    en: ["Unique ID", "Account Code", "Account Name", "1: Group, 2: Ledger, 3: Sub, 4: Detail", "Parent Code", "Debit / Credit"],
  },
  CostCenter: {
    fa: ["شناسه یکتا", "کد مرکز هزینه", "نام مرکز", "توضیحات"],
    en: ["Unique ID", "Center Code", "Center Name", "Description"],
  },
  Voucher: {
    fa: ["شناسه یکتا", "شماره برگه", "تاریخ شمسی", "کد حساب", "شرح ردیف", "کد شخص", "کد مرکز هزینه", "مبلغ بدهکار", "مبلغ بستانکار"],
    en: ["Unique ID", "Voucher No", "Date", "Account Code", "Description", "Party Code", "Cost Center", "Debit Amount", "Credit Amount"],
  },
  Bank: {
    fa: ["شناسه یکتا", "نام بانک", "نام شعبه", "شماره حساب", "شماره شبا"],
    en: ["Unique ID", "Bank Name", "Branch", "Account Number", "IBAN"],
  },
  Cash: {
    fa: ["شناسه یکتا", "کد صندوق", "نام صندوق", "موجودی اولیه"],
    en: ["Unique ID", "Cash Code", "Cash Name", "Initial Balance"],
  },
  PaymentNotification: {
    fa: ["شناسه یکتا", "شماره برگه", "تاریخ شمسی", "کد شخص", "مبلغ", "شرح پرداخت", "کد بانک/صندوق"],
    en: ["Unique ID", "Doc No", "Date", "Party Code", "Amount", "Description", "Bank/Cash Code"],
  },
  ReceiptNotification: {
    fa: ["شناسه یکتا", "شماره برگه", "تاریخ شمسی", "کد شخص", "مبلغ", "شرح دریافت", "کد بانک/صندوق"],
    en: ["Unique ID", "Doc No", "Date", "Party Code", "Amount", "Description", "Bank/Cash Code"],
  }
};

const IMPORT_TREE_DATA: TreeNode = {
  id: "root",
  name: "نرم افزارها",
  isRoot: true,
  children: [
    {
      id: "common",
      name: "اطلاعات پایه",
      children: [
        { id: "common_business_structure", name: "ساختار کسب و کار", children: [], data: { module: "common", entity: "BusinessStructure" } },
        { id: "common_party", name: "اشخاص", children: [], data: { module: "common", entity: "Party" } },
        { id: "common_currency", name: "ارزها", children: [], data: { module: "common", entity: "Currency" } },
        { id: "common_fiscal_year", name: "سال مالی", children: [], data: { module: "common", entity: "FiscalYear" } },
      ]
    },
    {
      id: "accounting",
      name: "حسابداری",
      children: [
        { id: "acc_accounts", name: "کدینگ حسابداری (گروه، کل، معین، تفصیلی)", children: [], data: { module: "accounting", entity: "Accounts" } },
        { id: "acc_cost_centers", name: "مراکز هزینه", children: [], data: { module: "accounting", entity: "CostCenter" } },
        { id: "acc_vouchers", name: "اسناد حسابداری", children: [], data: { module: "accounting", entity: "Voucher" } },
      ]
    },
    {
      id: "rap",
      name: "دریافت و پرداخت",
      children: [
        { id: "rap_banks", name: "بانک ها و حساب های بانکی", children: [], data: { module: "rap", entity: "Bank" } },
        { id: "rap_cashes", name: "صندوق ها", children: [], data: { module: "rap", entity: "Cash" } },
        { id: "rap_payment_notifications", name: "اعلامیه پرداخت", children: [], data: { module: "rap", entity: "PaymentNotification" } },
        { id: "rap_receipt_notifications", name: "اعلامیه دریافت", children: [], data: { module: "rap", entity: "ReceiptNotification" } },
      ]
    }
  ]
};

export default function DataImport() {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [format, setFormat] = useState("sepidar_sql");
  const { language } = useLanguage();

  const handleSelect = (node: TreeNode) => {
    if (node.children && node.children.length > 0) return; // Only allow selecting leaves
    setSelectedNode(node);
    setImportStatus("idle");
    setLogs([]);
    setFileUrl("");
  };

  const downloadTemplate = async () => {
    if (!selectedNode || !selectedNode.data || !selectedNode.data.entity) return;
    const entity = selectedNode.data.entity;
    
    const columns = TEMPLATE_COLUMNS[entity]?.[language] || TEMPLATE_COLUMNS[entity]?.fa || [];
    const instructions = TEMPLATE_INSTRUCTIONS[entity]?.[language] || TEMPLATE_INSTRUCTIONS[entity]?.fa || [];
    const samples = TEMPLATE_SAMPLES[entity]?.[language] || TEMPLATE_SAMPLES[entity]?.fa || [];
    
    if (columns.length === 0) {
      alert("الگویی برای این فرم تعریف نشده است.");
      return;
    }

    const data = [columns, instructions, ...samples];
    // Dynamic import: xlsx is large; load it only when the template is actually downloaded.
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Template_${entity}_${language}.xlsx`);
  };

  const handleImport = async () => {
    if (!fileUrl) return;
    setIsImporting(true);
    setImportStatus("idle");
    setLogs((prev) => [...prev, `شروع انتقال اطلاعات برای ${selectedNode?.name}...`]);

    // Simulate import process
    setTimeout(() => {
      setLogs((prev) => [...prev, `در حال خواندن فایل و پردازش رکوردهای ${selectedNode?.name}...`]);
    }, 1000);

    setTimeout(() => {
      setLogs((prev) => [...prev, `تبدیل ساختار داده های مبدا به جداول سیستم...`]);
    }, 2500);

    setTimeout(() => {
      setLogs((prev) => [...prev, `عملیات با موفقیت انجام شد. کانورت اطلاعات صورت گرفت.`]);
      setIsImporting(false);
      setImportStatus("success");
    }, 4500);
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full w-full p-4 gap-4">
        {/* Right Sidebar - Tree View */}
        <div className="w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">نرم افزارها و فرم ها</h2>
          </div>
          <div className="flex-1 overflow-auto p-2" dir={language === 'en' || language === 'zh' ? 'ltr' : 'rtl'}>
            <TreeView
              data={IMPORT_TREE_DATA}
              onChange={() => {}}
              onSelect={handleSelect}
              readOnly={true}
              defaultExpandAll={true}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 flex flex-col overflow-hidden" dir={language === 'en' || language === 'zh' ? 'ltr' : 'rtl'}>
          {!selectedNode ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <UploadCloud className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">فرم مورد نظر را از لیست سمت راست انتخاب کنید</h3>
              <p className="text-sm">برای شروع انتقال اطلاعات، ابتدا فرم مقصد را مشخص نمایید.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">دریافت اطلاعات: {selectedNode.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">فایل پشتیبان یا اسکریپت خروجی سیستم مبدا را برای انتقال به فرم "{selectedNode.name}" بارگذاری کنید.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                >
                  <Download className="w-4 h-4" />
                  دانلود فایل نمونه (تمپلیت اکسل)
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">فرمت سیستم مبدا</label>
                  <Select
                    value={format}
                    onChange={(val) => setFormat(val)}
                    options={[
                      { value: "sepidar_sql", label: "فایل پشتیبان (SQL Bak) یا اسکریپت سپیدار سیستم" },
                      { value: "excel", label: "فایل اکسل (Excel/CSV) ساختار استاندارد" },
                      { value: "holoo", label: "فایل خروجی نرم افزار هلو" }
                    ]}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">فایل اطلاعات</label>
                <div className="max-w-xl">
                  <FileUpload
                    onChange={(url) => setFileUrl(url)}
                    accept={format === "sepidar_sql" ? ".bak,.sql" : ".xlsx,.xls,.csv"}
                  />
                </div>
              </div>

              <div className="mb-8">
                <Button 
                  onClick={handleImport} 
                  disabled={!fileUrl || isImporting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-40"
                >
                  {isImporting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال پردازش...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileType className="w-4 h-4" />
                      شروع انتقال اطلاعات
                    </span>
                  )}
                </Button>
              </div>

              {/* Logs Area */}
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
                <div className="p-2 border-b border-slate-200 dark:border-gray-700 bg-slate-100/50 dark:bg-gray-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">گزارش عملیات انتقال</span>
                  {importStatus === "success" && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> با موفقیت پایان یافت
                    </span>
                  )}
                  {importStatus === "error" && (
                    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> خطا در انتقال
                    </span>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed">
                  {logs.length === 0 ? (
                    <span className="text-slate-400">آماده برای شروع فرآیند...</span>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-slate-700 dark:text-slate-300 mb-1">
                        <span className="text-slate-400 mr-2">[{new Date().toLocaleTimeString('fa-IR')}]</span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
