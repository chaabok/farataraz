"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { TreeView, TreeNode } from "@/components/inputs/TreeView";
import { SimpleForm } from "@/components/forms/SimpleForm";
import { ActionButton } from "@/components/buttons/ActionButton";
import { NewButton } from "@/components/buttons/NewButton";
import { SaveButton } from "@/components/buttons/SaveButton";
import { SaveNewButton } from "@/components/buttons/SaveNewButton";
import { SaveCloseButton } from "@/components/buttons/SaveCloseButton";
import { X, ArrowLeft, ArrowRight, ArrowDown, Trash2, XCircle, Search, Save, Layout, FileText, Database, Folder, Table2, FileCode, CheckCircle2, Play, AlertCircle, Plus, Edit2, Settings, PlusSquare, MinusSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/utils";
import { useLanguage } from "@/components/Providers";
import { ReportDesigner } from "@/components/forms/common/ReportDesigner";
import { useReportBuilderStore } from "@/lib/stores/reportBuilderStore";
import { useReportDesignerStore } from "@/lib/stores/reportDesignerStore";
import { useToast } from "@/components/ToastProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

function FormulaFunctionCategory({ 
  title, 
  icon,
  items,
  onItemDoubleClick
}: { 
  title: string, 
  icon?: React.ReactNode,
  items: (string | { label: string, value: string })[],
  onItemDoubleClick?: (value: string) => void
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <div 
        className="font-semibold text-gray-800 cursor-pointer flex items-center gap-1 hover:bg-gray-200 px-1 py-0.5 select-none text-xs" 
        onClick={() => setOpen(!open)}
      >
        {open ? <MinusSquare className="w-3.5 h-3.5 text-gray-500" /> : <PlusSquare className="w-3.5 h-3.5 text-gray-500" />}
        {icon && <div className="shrink-0">{icon}</div>}
        <span>{title}</span>
      </div>
      {open && (
        <ul className="flex flex-col">
          {items.map((item, idx) => {
            const label = typeof item === 'string' ? item : item.label;
            const value = typeof item === 'string' ? item : item.value;
            return (
              <li 
                key={idx} 
                className="pr-6 hover:bg-blue-50 cursor-pointer py-0.5 text-gray-700 flex items-center gap-1.5 text-xs"
                onDoubleClick={() => onItemDoubleClick && onItemDoubleClick(value)}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: "radial-gradient(circle at 3px 3px, #ff9999, #cc0000)" }}></div>
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const TABS = [
  { id: "tables", label: "جدول‌ها" },
  { id: "fields", label: "فیلدها" },
  { id: "grouping", label: "گروه‌بندی" },
  { id: "aggregates", label: "سرجمع‌ها" },
  { id: "structure", label: "ساختار گزارش" },
  { id: "filter", label: "فیلتر و پارامتر" },
  { id: "order", label: "ترتیب" },
  { id: "matrix", label: "ماتریس" },
  { id: "chart", label: "نمودار" },
  { id: "specs", label: "مشخصات" },
];

const SCHEMA_TRANSLATIONS: Record<string, string> = {
  "Acc": "حسابداری",
  "Gnr": "عمومی و ساختار کسب و کار",
  "Rap": "دریافت و پرداخت",
  "Cnt": "قراردادها",
  "Iam": "دسترسی و نقش ها",
  "Inv": "انبار",
  "Fa": "دارایی ثابت",
  "Sls": "فروش",
  "Hr": "منابع انسانی و حقوق",
  "public": "عمومی (دیگر)"
};

const MULTI_LANG_TABLE_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Module Schemas
  "Acc": { fa: "حسابداری", en: "Accounting", ar: "المحاسبة", zh: "财务会计" },
  "Gnr": { fa: "عمومی و ساختار کسب و کار", en: "General", ar: "العامة وهيكل العمل", zh: "通用项目" },
  "Rap": { fa: "دریافت و پرداخت", en: "Receipt & Payment", ar: "القبض والصرف", zh: "收付款" },
  "Cnt": { fa: "قراردادها", en: "Contracts", ar: "العقود", zh: "合同" },
  "Iam": { fa: "دسترسی و نقش ها", en: "Access & Roles", ar: "الصلاحيات والأدوار", zh: "权限管理" },
  "Inv": { fa: "انبار", en: "Inventory", ar: "المخازن", zh: "库存" },
  "Fa": { fa: "دارایی ثابت", en: "Fixed Assets", ar: "الأصول الثابتة", zh: "固定资产" },
  "Sls": { fa: "فروش", en: "Sales", ar: "المبيعات", zh: "销售" },
  "Hr": { fa: "منابع انسانی و حقوق", en: "Human Resources", ar: "الموارد البشرية", zh: "人力资源" },
  "public": { fa: "عمومی (دیگر)", en: "Public", ar: "عام", zh: "公共" },

  // Tables
  "Acc.Accounts": { fa: "حساب کل/معین", en: "Chart of Accounts", ar: "شجرة الحسابات", zh: "会计科目" },
  "Acc.DetailedAccounts": { fa: "حساب تفصیلی", en: "Detailed Accounts", ar: "الحسابات التفصيلية", zh: "辅核算账" },
  "Acc.CostCenters": { fa: "مرکز هزینه", en: "Cost Centers", ar: "مراكز التكلفة", zh: "成本中心" },
  "Acc.DetailedTypes": { fa: "گروه حساب", en: "Account Type Groups", ar: "مجموعات الحسابات", zh: "科目类别组" },
  "Acc.DetailedType": { fa: "گروه حساب", en: "Account Type Groups", ar: "مجموعات الحسابات", zh: "科目类别组" },
  "Acc.VoucherTypes": { fa: "انواع سند", en: "Voucher Types", ar: "أنواع القيود", zh: "凭证类型" },
  "Acc.VoucherType": { fa: "انواع سند", en: "Voucher Types", ar: "أنواع القيود", zh: "凭证类型" },
  "Acc.Vouchers": { fa: "سند حسابداری", en: "Accounting Vouchers", ar: "القيود المحاسبية", zh: "记账凭证" },
  "Acc.VoucherItems": { fa: "اقلام سند", en: "Voucher Items", ar: "بنود القيود", zh: "凭证行项目" },
  "Acc.OtherDetails": { fa: "اطلاعات تکمیلی", en: "Other Details", ar: "تفاصيل أخرى", zh: "辅助属性" },
  "Rap.Cashes": { fa: "صندوق", en: "Cashes", ar: "الصناديق", zh: "现金出نا机" },
  "Rap.BankAccounts": { fa: "حساب بانکی", en: "Bank Accounts", ar: "الحسابات البنكية", zh: "银行账户" },
  "Rap.BankAccountTypes": { fa: "نوع حساب بانکی", en: "Bank Account Types", ar: "أنواع الحسابات البنكية", zh: "银行账户类型" },
  "Rap.Banks": { fa: "بانک", en: "Banks", ar: "البنوك", zh: "银行" },
  "Rap.BankBranches": { fa: "شعبه بانک", en: "Bank Branches", ar: "فروع البنوك", zh: "分行" },
  "Rap.Chequebooks": { fa: "دسته چک", en: "Chequebooks", ar: "دفاتر الشيكات", zh: "支票本" },
  "Rap.ChequebookItems": { fa: "برگ چک", en: "Cheque Leaves", ar: "أوراق الشيكات", zh: "支票页" },
  "Rap.PaymentGateways": { fa: "درگاه پرداخت", en: "Payment Gateways", ar: "بوابات الدفع الإلكتروني", zh: "支付网关" },
  "Gnr.BusinessStructure": { fa: "ساختار کسب و کار", en: "Business Structure", ar: "الهيكل التنظيمي", zh: "业务结构" },
  "Gnr.FiscalYears": { fa: "سال مالی", en: "Fiscal Years", ar: "السنوات المالية", zh: "财务年度" },
  "Gnr.Currency": { fa: "ارزها", en: "Currencies", ar: "العملات", zh: "币种" },
  "Gnr.CurrencyExchangeRates": { fa: "نرخ برابری ارز", en: "Exchange Rates", ar: "أسعار صرف العملات", zh: "外汇汇率" },
  "Gnr.Parties": { fa: "اشخاص (طرف حساب)", en: "Parties", ar: "الأطراف (العملاء والموردين)", zh: "往来单位/个人" },
  "Gnr.GeoLocations": { fa: "مناطق جغرافیایی", en: "Geographic Locations", ar: "المواقع الجغرافية", zh: "地理省市" },
  "Rap.PaymentNotifications": { fa: "اعلامیه پرداخت", en: "Payment Notifications", ar: "إشعارات الصرف", zh: "付款提单" },
  "Rap.ReceiptNotification": { fa: "اعلامیه دریافت", en: "Receipt Notifications", ar: "إشعارات القبض", zh: "收款提单" },
  "Rap.PaymentCheque": { fa: "چک پرداختی", en: "Payment Cheques", ar: "شيكات الصرف", zh: "付出支票" },
  "Rap.PaymentCash": { fa: "پرداخت نقدی", en: "Cash Payments", ar: "صرف نقدي", zh: "现金付款" },
  "Rap.PaymentWithdrawal": { fa: "برداشت پرداخت", en: "Bank Withdrawals", ar: "مسحوبات بنكية", zh: "银行出金" }
};

const getTranslatedName = (key: string, lang: string): string => {
  const normKey = key.replace(/"/g, '').replace(/\./g, '.');
  const translations = MULTI_LANG_TABLE_TRANSLATIONS[normKey] || MULTI_LANG_TABLE_TRANSLATIONS[normKey.replace('VoucherTypes', 'VoucherType')];
  if (translations) {
    return translations[lang] || translations['fa'] || key;
  }
  return key;
};

// Kept for backward compatibility
const TABLE_TRANSLATIONS = new Proxy<Record<string, string>>({}, {
  get: (_, prop: string) => {
    return getTranslatedName(prop, 'fa');
  }
});

const buildRelatedTablesTree = (
  fields: any[],
  relatedTablesWithFields: any[],
  relatedTablesList: string[],
  language: string,
  t: any
) => {
  const TREE_LABELS: Record<string, Record<string, string>> = {
    root: {
      fa: "درختواره فرم‌ها و جداول مرتبط",
      en: "Related Forms & Tables Tree",
      ar: "شجرة النماذج والجداول المرتبطة",
      zh: "相关表单与数据表树"
    },
    reference_forms: {
      fa: "فرم‌های مرجع (مورد استفاده در این جدول)",
      en: "Reference Forms (Used in this Table)",
      ar: "النماذج المرجعية (المستخدمة في هذا الجدول)",
      zh: "参考表单（此表引用的数据）"
    },
    dependent_forms: {
      fa: "فرم‌های مرتبط (استفاده‌کننده از این جدول)",
      en: "Dependent Forms (Users of this Table)",
      ar: "النماذج المرتبطة (التي تستخدم هذا الجدول)",
      zh: "关联表单（使用此表数据的表）"
    }
  };

  const currentLang = (language && TREE_LABELS.root[language]) ? language : 'fa';

  const buildFieldNodesAndChildTables = (fieldsArr: any[], normalizedParentTbl: string, idPrefix: string): any[] => {
      const nodes: any[] = [];
      let childTableIndex = 0;
      
      fieldsArr.forEach((f: any, fIdx: number) => {
          nodes.push({
               id: `${idPrefix}_field_${normalizedParentTbl}_${f.name}_${fIdx}`,
               name: t(`field_${f.name}`, f.name),
               dataType: f.type,
               isFieldNode: true,
               originalField: { ...f, tableName: normalizedParentTbl }
          });
          
          if (f.foreignTable && f.childrenFields && f.childrenFields.length > 0) {
              const rawSubTbl = `"${f.foreignSchema || 'public'}"."${f.foreignTable}"`;
              const normalizedSubTbl = rawSubTbl.replace(/"/g, '');
              const displaySubName = getTranslatedName(normalizedSubTbl, currentLang) || normalizedSubTbl;
              
              const newPrefix = `${idPrefix}_tbl_${childTableIndex++}`;
              nodes.push({
                  id: newPrefix,
                  rawTable: rawSubTbl,
                  name: displaySubName,
                  children: buildFieldNodesAndChildTables(f.childrenFields, normalizedSubTbl, newPrefix),
                  isTableNode: true
              });
          }
      });
      return nodes;
  };

  // 1. Collect parent (referenced) tables from fields of main table
  const parentNodes: any[] = [];
  let pIndex = 0;
  (fields || []).forEach((field: any) => {
    if (field.foreignTable) {
      const rawTbl = `"${field.foreignSchema || 'public'}"."${field.foreignTable}"`;
      const normalizedTbl = rawTbl.replace(/"/g, '');
      const displayName = getTranslatedName(normalizedTbl, currentLang) || normalizedTbl;

      // Check if we haven't added this parent table yet
      if (!parentNodes.some(p => p.rawTable === rawTbl)) {
        const fieldNodes = buildFieldNodesAndChildTables(field.childrenFields || [], normalizedTbl, `parent_ptbl_${pIndex}`);

        parentNodes.push({
          id: `parent_tbl_${pIndex++}`,
          rawTable: rawTbl,
          name: displayName,
          children: fieldNodes,
          isTableNode: true
        });
      }
    }
  });

  // 2. Collect child (referencing) tables
  const childNodes: any[] = [];
  let cIndex = 0;
  if (relatedTablesWithFields && Array.isArray(relatedTablesWithFields)) {
    relatedTablesWithFields.forEach((rt: any) => {
       const rawTbl = rt.tableName;
       const normalizedTbl = rawTbl.replace(/"/g, '');
       const displayName = getTranslatedName(normalizedTbl, currentLang) || normalizedTbl;

       const fieldNodes = buildFieldNodesAndChildTables(rt.fields || [], normalizedTbl, `child_ptbl_${cIndex}`);

       childNodes.push({
         id: `child_tbl_${cIndex++}`,
         rawTable: rawTbl,
         name: displayName,
         children: fieldNodes,
         isTableNode: true
       });
    });
  } else if (relatedTablesList && Array.isArray(relatedTablesList)) {
     // Fallback for simple names without pre-loaded fields
     relatedTablesList.forEach((tbl: string, i: number) => {
       const rawTbl = tbl;
       const normalizedTbl = rawTbl.replace(/"/g, '');
       const displayName = getTranslatedName(normalizedTbl, currentLang) || normalizedTbl;
       childNodes.push({
         id: `child_tbl_${i}`,
         rawTable: rawTbl,
         name: displayName,
         children: [],
         isTableNode: true
       });
     });
  }

  // 3. Assemble branches
  const treeChildren: any[] = [];

  if (parentNodes.length > 0) {
     treeChildren.push({
       id: 'parent_branch',
       name: TREE_LABELS.reference_forms[currentLang],
       children: parentNodes,
       isBranchNode: true
     });
  }

  if (childNodes.length > 0) {
     treeChildren.push({
       id: 'child_branch',
       name: TREE_LABELS.dependent_forms[currentLang],
       children: childNodes,
       isBranchNode: true
     });
  }

  if (treeChildren.length > 0) {
     return [{
       id: 'related_root',
       name: TREE_LABELS.root[currentLang],
       isRoot: true,
       children: treeChildren
     }];
  }

  return [];
};

import { useTabs } from '@/components/TabsProvider';

export function ReportBuilder({ id, onClose, initialCategory, isUserReport, isFileReport, startInDesigner, startInPreview, recordId }: { id?: number | string, onClose?: () => void, initialCategory?: string, isUserReport?: boolean, isFileReport?: boolean, startInDesigner?: boolean, startInPreview?: boolean, recordId?: string }) {
  const router = useRouter();
  const { removeTab, activeTabId } = useTabs();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const {
    activeTab, setActiveTab,
    isDesigning, setIsDesigning,
    isPreviewing, setIsPreviewing,
    selectedSystemId, setSelectedSystemId,
    selectedTableId, setSelectedTableId,
    designerDirty, setDesignerDirty,
    designerPreviewLoading, setDesignerPreviewLoading,
    showCloseConfirm, setShowCloseConfirm,
    closeTarget, setCloseTarget,
    isSaving, setIsSaving,
    systemsTreeData, setSystemsTreeData,
    systemsTablesMap, setSystemsTablesMap,
    reportTitle, setReportTitle,
    reportGroupId, setReportGroupId,
    userGroups, setUserGroups,
    reportConfig, setReportConfig,
    savedReportId, setSavedReportId,
    scriptContent, setScriptContent,
    hasStartedPreviewFetch, setHasStartedPreviewFetch,
    tableFields, setTableFields,
    selectedFields, setSelectedFields,
    relatedTables, setRelatedTables,
    isLoading, setIsLoading,
    dbError, setDbError,
    groupedFields, setGroupedFields,
    formulas, setFormulas,
    selectedAvailableGroupingNode, setSelectedAvailableGroupingNode,
    selectedGroupedNode, setSelectedGroupedNode,
    aggregates, setAggregates,
    selectedAvailableAggregateNode, setSelectedAvailableAggregateNode,
    selectedAggregateNode, setSelectedAggregateNode,
    isSigmaDropdownOpen, setIsSigmaDropdownOpen,
    selectedFormulaName, setSelectedFormulaName,
    showFormulaNameModal, setShowFormulaNameModal,
    formulaName, setFormulaName,
    formulaExpression, setFormulaExpression,
    showFormulaEditorModal, setShowFormulaEditorModal,
    structureItems, setStructureItems,
    structureSelectedAvailableNode, setStructureSelectedAvailableNode,
    structureSelectedNode, setStructureSelectedNode,
    structureBandProperties, setStructureBandProperties
  } = useReportBuilderStore();

  const { setElements } = useReportDesignerStore();

  const emptyFields = React.useMemo(() => [], []);
  const emptyValues = React.useMemo(() => ({}), []);
  const emptyElements = React.useMemo(() => [], []);

  const memoizedInitialParamValues = React.useMemo(() => recordId ? { id: recordId } : undefined, [recordId]);

  const handleDesignerClose = () => {
     setCloseTarget('designer');
     setShowCloseConfirm(true);
  };

  const handleWizardClose = () => {
     setCloseTarget('builder');
     setShowCloseConfirm(true);
  };

  const saveReportToDatabase = async (formulasToSave: any[] = formulas) => {
      const payload = {
        title: reportTitle,
        reportGroupRef: reportGroupId || null,
        direction: reportConfig.direction,
        paperSize: reportConfig.paperSize,
        paperOrientation: reportConfig.paperOrientation,
        showInstitutionName: reportConfig.showInstitutionName,
        showDate: reportConfig.showDate,
        showRowNumber: reportConfig.showRowNumber,
        showFilters: reportConfig.showFilters,
        pageNumberType: reportConfig.pageNumberType,
        showLogo: reportConfig.showLogo,
        hideDuplicates: reportConfig.hideDuplicates,
        targetForm: reportConfig.targetForm,
        isDefaultTemplate: reportConfig.isDefaultTemplate,
        isSystemReport: reportConfig.isSystemReport,
        dataSourceType: Object.keys(tableFields).length > 0 ? "tables" : "sql",
        primaryTable: selectedTableId && selectedTableId !== "script" ? selectedTableId : null,
        sqlScript: scriptContent,
        fields: selectedFields.map((f, i) => ({
            tableName: f.tableName || '',
            fieldName: f.name,
            alias: f.description || f.name,
            orderIndex: i,
            isVisible: true
        })),
        groupings: groupedFields.map((f, i) => ({
            tableName: f.tableName || '',
            fieldName: f.name,
            orderIndex: i
        })),
        aggregates: aggregates.map((a) => ({
            id: a.id,
            field: a.field,
            groupBy: a.groupBy,
            printPosition: a.printPosition,
            hasPageTotal: a.hasPageTotal,
            hasGrandTotal: a.hasGrandTotal
        })),
        formulas: formulasToSave.map((f, i) => ({
            formulaName: f.name || f.formulaName,
            expression: f.expression
        }))
      };

      const url = savedReportId ? `/api/rpt/reports/${savedReportId}` : `/api/rpt/reports`;
      const method = savedReportId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res;
  };

  const handleDesignerSave = async (designerElements: any[], paramValues: Record<string, any> = {}, formulasFromDesigner: any[] = []) => {
     console.log("handleDesignerSave invoked with:", designerElements, paramValues, formulasFromDesigner);
     setFormulas(formulasFromDesigner);
     setIsSaving(true);
     try {
       let dbId = savedReportId;
       const resDb = await saveReportToDatabase(formulasFromDesigner);
       if (!resDb.ok) {
           showToast("خطا در ذخیره سازی اطلاعات پایه گزارش در دیتابیس", "error");
       } else {
           const data = await resDb.json();
           if (data && data.reportID) {
              dbId = data.reportID;
              setSavedReportId(data.reportID);
           }
       }

       const titleToSave = reportTitle || "گزارش_جدید";
       const payload = {
           reportName: titleToSave,
           title: titleToSave,
           category: "UserReports",
           reportID: dbId || id,
           isSystemReport: reportConfig.isSystemReport,
           targetForm: reportConfig.targetForm,
           primaryTable: selectedTableId,
           input: paramValues,
           script: scriptContent,
           items: designerElements,
           formulas: formulasFromDesigner,
           aggregates: aggregates
       };

       console.log("Sending payload to /api/reports/save");
       const res = await apiFetch('/api/reports/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
       });
       console.log("Response status:", res.status, "ok:", res.ok);

       if (res.ok) {
          showToast("تغییرات با موفقیت ذخیره شد", "success");
          setDesignerDirty(false);
       } else {
          const errorData = await res.json().catch(() => ({}));
          console.error("Save errorData:", errorData);
          showToast(errorData.message || errorData.error || "خطا در ذخیره طراحی گزارش", "error");
          try { alert("خطا در ذخیره گزارش: " + (errorData.message || errorData.error)); } catch(e) {}
       }
     } catch (err) {
       console.error("Fetch error:", err);
       showToast("خطا در ارتباط با سرور", "error");
     } finally {
       setIsSaving(false);
     }
  };



  useEffect(() => {
     if (startInPreview && (selectedTableId || scriptContent)) {
         setHasStartedPreviewFetch(true);
     }
  }, [startInPreview, selectedTableId, scriptContent]);

  useEffect(() => {
    if (startInDesigner || startInPreview) {
      setIsDesigning(!!startInDesigner || !!startInPreview);
    }
  }, [startInDesigner, startInPreview, setIsDesigning]);

  useEffect(() => {
    if (startInPreview) {
      setIsPreviewing(!!startInPreview);
      setDesignerPreviewLoading(!!startInPreview);
    }
  }, [startInPreview, setIsPreviewing, setDesignerPreviewLoading]);

  useEffect(() => {
    if (id) {
      setSavedReportId(String(id));
      setIsLoading(true);
    }
  }, [id, setSavedReportId, setIsLoading]);

  useEffect(() => {
    if (initialCategory) {
      setReportGroupId(initialCategory);
    }
  }, [initialCategory, setReportGroupId]);

  const openFormulaModal = (formula?: {name: string, expression: string}) => {
     if (formula) {
        setFormulaName(formula.name);
        setFormulaExpression(formula.expression);
        setShowFormulaEditorModal(true);
     } else {
        setFormulaName("");
        setFormulaExpression("");
        setShowFormulaNameModal(true);
     }
  };

  const deleteFormula = (name: string) => {
     setFormulas(prev => prev.filter(f => f.name !== name));
     setSelectedFormulaName(null);
  };

  useEffect(() => {
    if (tableFields && tableFields.length > 0 && selectedFields && selectedFields.length > 0) {
      let changed = false;
      const newSelectedFields = selectedFields.map(sf => {
        if (!sf.childrenFields) {
           const match = tableFields.find(tf => tf.name === sf.name);
           if (match && match.childrenFields) {
               changed = true;
               return { ...sf, childrenFields: match.childrenFields, foreignTable: match.foreignTable, foreignSchema: match.foreignSchema, foreignPK: match.foreignPK };
           }
        }
        return sf;
      });
      if (changed) {
         setSelectedFields(newSelectedFields);
      }
    }
  }, [tableFields]); // Omitted selectedFields to prevent any recursive updates

  useEffect(() => {
    // Load report groups
    const loadGroups = async () => {
      try {
        const res = await apiFetch('/api/rpt/report-groups');
        if (res.ok) {
          const data = await res.json();
          setUserGroups(data);
        }
      } catch (err) {
        console.error("Error loading groups:", err);
      }
    };
    
    const loadSchemasAndTables = async () => {
      try {
        const res = await apiFetch('/api/reports/db-query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getSchemasAndTables' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.valid && data.schemaMap) {
            setSystemsTablesMap(data.schemaMap);
            
            // Build tree
            const children: any[] = [];
            
            Object.keys(data.schemaMap).forEach(schema => {
              const menuName = SCHEMA_TRANSLATIONS[schema] || schema;
              children.push({
                id: schema,
                name: menuName,
                children: [] 
              });
            });
            
            setSystemsTreeData({
              id: "root",
              name: "سیستم‌ها",
              isRoot: true,
              children
            });
          }
        }
      } catch (err) {
        console.error("Error loading schemas:", err);
      }
    };

    loadGroups();
    loadSchemasAndTables();
  }, []);

  useEffect(() => {
    if (id) {
       const loadReport = async () => {
         try {
           setIsLoading(true);
           const endpoint = isFileReport 
                ? `/api/reports/save?reportName=${id}`
                : `/api/rpt/reports/${id}`;
           const res = await apiFetch(endpoint);
           if (res.ok) {
             const data = await res.json();
             // For user/file reports fetched via /api/reports/save, the data IS the report.
             // For DB reports fetched via /api/rpt/reports, it might be inside 'report' or 'data' or the root itself.
             const reportData = isFileReport ? data : (data.report || data.data || data);
             if (reportData) {
                setReportTitle(reportData.title || reportData.Title || "");
                setReportGroupId(reportData.reportGroupRef || "");
                setReportConfig({
                  direction: reportData.direction || "rtl",
                  paperSize: reportData.paperSize || "A4",
                  paperOrientation: reportData.paperOrientation || "portrait",
                  showInstitutionName: !!reportData.showInstitutionName,
                  showDate: !!reportData.showDate,
                  showRowNumber: !!reportData.showRowNumber,
                  showFilters: !!reportData.showFilters,
                  pageNumberType: reportData.pageNumberType || "pageNumber",
                  showLogo: !!reportData.showLogo,
                  hideDuplicates: !!reportData.hideDuplicates,
                  targetForm: reportData.targetForm || "",
                  isDefaultTemplate: !!reportData.isDefaultTemplate,
                  isSystemReport: !!reportData.isSystemReport
                });
                if (reportData.script || reportData.sqlScript) setScriptContent(reportData.script || reportData.sqlScript);
                
                if (reportData.fields && Array.isArray(reportData.fields)) {
                   const uniqueFieldsMap = new Map();
                   reportData.fields.forEach((f: any) => {
                       if (!uniqueFieldsMap.has(f.fieldName)) {
                           uniqueFieldsMap.set(f.fieldName, {
                               name: f.fieldName,
                               description: f.alias || f.fieldName,
                               tableName: f.tableName || reportData.primaryTable || '',
                               type: 'varchar'
                           });
                       }
                   });
                   setSelectedFields(Array.from(uniqueFieldsMap.values()));
                }

                if (reportData.groupings && Array.isArray(reportData.groupings)) {
                   const uniqueGroupingsMap = new Map();
                   reportData.groupings.forEach((g: any) => {
                       if (!uniqueGroupingsMap.has(g.fieldName)) {
                           uniqueGroupingsMap.set(g.fieldName, {
                               name: g.fieldName,
                               tableName: g.tableName || reportData.primaryTable || ''
                           });
                       }
                   });
                   setGroupedFields(Array.from(uniqueGroupingsMap.values()));
                }

                if (reportData.aggregates && Array.isArray(reportData.aggregates)) {
                   setAggregates(reportData.aggregates);
                }

                if (reportData.formulas && Array.isArray(reportData.formulas)) {
                   setFormulas(reportData.formulas.map((f: any) => ({
                       name: f.formulaName || f.name,
                       expression: f.expression
                   })));
                }

                if (reportData.elements) {
                   setElements(reportData.elements);
                } else if (reportData.items) {
                   setElements(reportData.items);
                }

                if (reportData.primaryTable && reportData.primaryTable !== "script") {
                   setSelectedTableId(reportData.primaryTable);
                   if (reportData.primaryTable.includes('.')) {
                       setSelectedSystemId(reportData.primaryTable.split('.')[0]);
                   } else {
                       setSelectedSystemId(reportData.primaryTable); 
                   }
                   try {
                     const tbRes = await apiFetch('/api/reports/db-query', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ action: 'getTableFields', tableName: reportData.primaryTable })
                     });
                     if (tbRes.ok) {
                       const tbData = await tbRes.json();
                       if (tbData.valid && tbData.fields) {
                         setTableFields(tbData.fields);
                         const relatedTree = buildRelatedTablesTree(
                           tbData.fields,
                           tbData.relatedTablesWithFields,
                           tbData.relatedTables,
                           language,
                           t
                         );
                         setRelatedTables(relatedTree);
                       }
                     }
                   } catch(e) {}
                } else if (reportData.script || reportData.sqlScript) {
                   setSelectedSystemId('script');
                   try {
                     const sqlRes = await apiFetch('/api/reports/db-query', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ action: 'validateScript', script: reportData.script || reportData.sqlScript })
                     });
                     if (sqlRes.ok) {
                       const sqlData = await sqlRes.json();
                       if (sqlData.valid && sqlData.fields) {
                         setTableFields(sqlData.fields);
                       }
                     }
                   } catch(e) {}
                }
             } else {
                setReportTitle(data.Title || "");
             }
           }
         } catch (e) {
         } finally {
           setIsLoading(false);
         }
       };
       loadReport();
    }
  }, [id, isUserReport]);

  const handleFinish = async () => {
    if (!reportTitle.trim()) {
      showToast("لطفاً عنوان گزارش را در تب مشخصات وارد نمایید.", "error");
      setActiveTab("specs");
      setTimeout(() => {
        const input = document.getElementById("report_title_input");
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (structureItems && structureItems.length > 0) {
      // Auto-layout based on structure tab
      const newElements: any[] = [];
      const structureBandsToProcess = [
        "ReportHeader",
        "PageHeader",
        ...groupedFields.map(gf => `GroupHeader_${gf.name}`),
        "Details",
        ...[...groupedFields].reverse().map(gf => `GroupFooter_${gf.name}`),
        "ReportFooter",
        "PageFooter"
      ];

      structureBandsToProcess.forEach(bandId => {
        const itemsInBand = structureItems.filter((i: any) => i.bandId === bandId);
        let currentX = 20; // 20px padding from left (RTL is actually from right)
        const props = structureBandProperties[bandId] || {};
        
        itemsInBand.forEach(item => {
           let text = item.name;
           if (item.itemType === 'field') text = `{${item.name}}`;
           else if (item.itemType === 'formula') text = `f(${item.name})`;
           else if (item.itemType === 'aggregate') text = `Σ(${item.name})`;

           newElements.push({
             id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
             type: 'text',
             text: text,
             sectionId: bandId,
             x: currentX,
             y: 5,
             width: 100,
             height: 20,
             isAt: true,
             backgroundColor: structureBandProperties[item.id]?.backgroundColor || "transparent",
             color: structureBandProperties[item.id]?.color || "#000000",
             fontWeight: structureBandProperties[item.id]?.fontWeight || "normal"
           });
           currentX += 110;
        });
      });
      // Replace existing elements or merge? For now just append or replace
      setElements(newElements);
    }
    
    setIsLoading(true);
    try {
      const res = await saveReportToDatabase();
      if (res.ok) {
        const data = await res.json();
        if (data && data.reportID) {
           setSavedReportId(data.reportID);
        }
        showToast("گزارش با موفقیت ذخیره شد.", "success");
        setIsDesigning(true);
      } else {
        showToast("خطا در ذخیره گزارش", "error");
      }
    } catch (err: any) {
      console.error(err);
      alert(`API Fetch Error: ${err.message || String(err)}`);
      showToast("خطا در ارتباط با سرور", "error");
    } finally {
      setIsLoading(false);
    }
  };

  


  const onDragStart = (e: React.DragEvent, field: any, source: 'available' | 'selected') => {
    e.dataTransfer.setData("field", JSON.stringify(field));
    e.dataTransfer.setData("source", source);
  };

  const onDrop = (e: React.DragEvent, target: 'available' | 'selected') => {
    e.preventDefault();
    const fieldData = e.dataTransfer.getData("field");
    const source = e.dataTransfer.getData("source");
    if (!fieldData || source === target) return;
    try {
      const field = JSON.parse(fieldData);
      if (target === 'selected') {
        setSelectedFields(prev => {
          if (!prev.some(f => f.name === field.name && (f.tableName || '') === (field.tableName || ''))) {
            return [...prev, field];
          }
          return prev;
        });
      } else {
        setSelectedFields(prev => prev.filter(f => !(f.name === field.name && (f.tableName || '') === (field.tableName || ''))));
      }
    } catch(err) {}
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDoubleClickField = (field: any, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFields(prev => prev.filter(f => !(f.name === field.name && (f.tableName || '') === (field.tableName || ''))));
    } else {
      setSelectedFields(prev => {
        if (!prev.some(f => f.name === field.name && (f.tableName || '') === (field.tableName || ''))) {
          return [...prev, field];
        }
        return prev;
      });
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (activeTabId) {
      removeTab(activeTabId);
    } else {
      router.back();
    }
  };

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
  
  const handleNext = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id);
    }
  };

  const validateScript = async () => {
    if (!scriptContent.trim()) return;
    setIsLoading(true);
    setDbError(null);
    try {
      const res = await apiFetch('/api/reports/db-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validateScript', script: scriptContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Syntax error in script');
      if (data.valid) {
        setTableFields(data.fields);
        setSelectedFields([]);
        setRelatedTables([]);
        setActiveTab("fields"); // go to fields tab on success
      }
    } catch (err: any) {
      setDbError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableClick = async (tableName: string) => {
    setIsLoading(true);
    setDbError(null);
    setSelectedTableId(tableName);
    try {
      const res = await apiFetch('/api/reports/db-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getTableFields', tableName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch fields');
      if (data.valid) {
        setTableFields(data.fields);
        setSelectedFields([]);
        const relatedTree = buildRelatedTablesTree(
          data.fields,
          data.relatedTablesWithFields,
          data.relatedTables,
          language,
          t
        );
        setRelatedTables(relatedTree);
        setActiveTab("fields");
      }
    } catch(err: any) {
      setDbError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFieldsTab = () => {
    const availableFields = tableFields.filter(f => !selectedFields.some(sf => sf.name === f.name && (sf.tableName || '') === (f.tableName || '')));

    return (
      <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 overflow-hidden gap-2">
        {tableFields.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-700 shadow-sm rounded">
             <div className="text-center">
               <Database className="w-12 h-12 mx-auto mb-4 opacity-30" />
               <p className="text-sm shadow-sm p-4 bg-gray-50 dark:bg-slate-800 rounded">ابتدا یک جدول انتخاب کنید یا اسکریپت را اعتبارسنجی نمایید</p>
             </div>
          </div>
        ) : (
          <div className="flex flex-1 gap-2 overflow-hidden">
            {/* Right Pane: Available Fields */}
            <div 
              className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm"
              onDrop={(e) => onDrop(e, 'available')}
              onDragOver={onDragOver}
            >
              <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-2 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm">
                {t('selectable_fields', 'فیلدهای قابل انتخاب')}
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                 <table className="w-full text-sm border-collapse text-right select-none">
                    <thead>
                       <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600">
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-8">#</th>
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{t('field_name', 'نام فیلد')}</th>
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{t('data_type', 'نوع داده')}</th>
                       </tr>
                    </thead>
                    <tbody>
                       {availableFields.map((field, idx) => (
                          <tr 
                            key={idx} 
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            draggable
                            onDragStart={(e) => onDragStart(e, field, 'available')}
                            onDoubleClick={() => handleDoubleClickField(field, false)}
                          >
                             <td className="py-1.5 px-3 text-gray-400 dark:text-gray-500">{idx + 1}</td>
                             <td className="py-1.5 px-3 text-gray-800 dark:text-gray-200" dir="ltr"><div className="w-full text-right">{t(`field_${field.name}`, field.name)}</div></td>
                             <td className="py-1.5 px-3 text-gray-500 dark:text-gray-400 text-xs" dir="ltr"><div className="w-full text-right">{field.type || 'unknown'}</div></td>
                          </tr>
                       ))}
                       {availableFields.length === 0 && (
                         <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400 dark:text-gray-500 text-xs">{t('all_fields_selected', 'تمامی فیلدها انتخاب شده‌اند')}</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
                 
                 {relatedTables.length > 0 && (
                    <div className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-4">
                       <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded mb-2 border border-blue-100 dark:border-blue-800 shadow-sm">
                          {t('related_forms_tree', 'درختواره فرم‌های مرتبط')}
                       </h3>
                       <div className="p-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded">
                         <TreeView
                           data={relatedTables[0]}
                           onChange={() => {}}
                           readOnly={true}
                           hideContainer={true}
                           defaultExpandAll={true}
                           renderLabel={(node) => {
                             const isHeaderBranch = ['related_root', 'parent_branch', 'child_branch'].includes(node.id);
                             const isTableNode = node.isTableNode || (node.children && node.children.length > 0 && !isHeaderBranch);
                             
                             if (isHeaderBranch) {
                               return (
                                 <span className="text-[13px] font-extrabold text-blue-800 dark:text-blue-300">
                                   {node.name}
                                 </span>
                               );
                             }
                             if (isTableNode) {
                               return (
                                 <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 cursor-pointer">
                                   📁 {node.name}
                                 </span>
                               );
                             }
                             // Field node
                             return (
                               <span 
                                 className="text-[11px] font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5 ml-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 px-1 py-0.5 rounded transition duration-150 ease-in-out"
                                 draggable
                                 onDragStart={(e) => {
                                   if (node.originalField) {
                                     e.dataTransfer.setData("field", JSON.stringify(node.originalField));
                                     e.dataTransfer.setData("source", "available");
                                     e.stopPropagation();
                                   }
                                 }}
                                 onDoubleClick={() => {
                                   if (node.originalField) {
                                     handleDoubleClickField(node.originalField, false);
                                   }
                                 }}
                               >
                                 📄 {node.name} <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">({(node as any).dataType || 'unknown'})</span>
                               </span>
                             );
                           }}
                         />
                       </div>
                    </div>
                 )}
              </div>
            </div>

            {/* Left Pane: Selected Fields */}
            <div 
              className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm"
              onDrop={(e) => onDrop(e, 'selected')}
              onDragOver={onDragOver}
            >
              <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-2 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm">
                {t('selected_fields', 'فیلدهای انتخاب شده')}
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                 <table className="w-full text-sm border-collapse text-right select-none">
                    <thead>
                       <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600">
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-16 text-center">{t('actions', 'عملیات')}</th>
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 w-8">#</th>
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{t('field_name', 'نام فیلد')}</th>
                          <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">{t('data_type', 'نوع داده')}</th>
                       </tr>
                    </thead>
                    <tbody>
                       {selectedFields.map((field, idx) => (
                          <tr 
                            key={idx} 
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:hover:bg-red-900/20 transition-colors cursor-pointer group"
                            draggable
                            onDragStart={(e) => onDragStart(e, field, 'selected')}
                            onDoubleClick={() => handleDoubleClickField(field, true)}
                          >
                             <td className="py-1.5 px-3">
                               <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button title={t('add_formula', 'افزودن فرمول')} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded">
                                   <Plus className="w-3.5 h-3.5" />
                                 </button>
                                 <button title={t('edit_formula', 'ویرایش فرمول')} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-600 dark:text-amber-400 rounded">
                                   <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                               </div>
                             </td>
                             <td className="py-1.5 px-3 text-gray-400 dark:text-gray-500">{idx + 1}</td>
                             <td className="py-1.5 px-3 text-gray-800 dark:text-gray-200" dir="ltr"><div className="w-full text-right">{t(`field_${field.name}`, field.name)}</div></td>
                             <td className="py-1.5 px-3 text-gray-500 dark:text-gray-400 text-xs" dir="ltr"><div className="w-full text-right">{field.type || 'unknown'}</div></td>
                          </tr>
                       ))}
                       {selectedFields.length === 0 && formulas.length === 0 && (
                         <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-400 dark:text-gray-500 text-xs leading-relaxed">{t('no_field_selected', 'هیچ فیلدی انتخاب نشده است')}<br/>{t('dblclick_to_select', 'برای انتخاب دابل‌کلیک کنید یا درگ کنید')}</td>
                         </tr>
                       )}
                    </tbody>
                    
                    {/* Formula Fields Branch */}
                    <tbody className="border-t-4 border-gray-200 dark:border-gray-700">
                      <tr className="bg-gray-100 dark:bg-slate-800">
                        <td colSpan={4} className="py-2 px-3 font-bold text-gray-700 dark:text-gray-300">
                           Formula Fields
                        </td>
                      </tr>
                      {formulas.map((f, idx) => (
                          <tr 
                            key={`form_${idx}`} 
                            className={`border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer ${selectedFormulaName === f.name ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-blue-50 dark:hover:bg-slate-800'}`}
                            onClick={() => setSelectedFormulaName(f.name)}
                          >
                             <td className="py-1.5 px-3"></td>
                             <td className="py-1.5 px-3 text-gray-400 dark:text-gray-500 italic font-serif font-bold text-[13px]">fx</td>
                             <td className="py-1.5 px-3 text-gray-800 dark:text-gray-200" dir="ltr"><div className="w-full text-right">{f.name}</div></td>
                             <td className="py-1.5 px-3 text-gray-500 dark:text-gray-400 text-xs" dir="ltr"><div className="w-full text-right">formula</div></td>
                          </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
              
              {/* Footer with Formula Icons */}
              <div className="bg-[#f0f0f0] dark:bg-slate-800 p-1 border-t border-gray-400 dark:border-gray-700 flex items-center justify-start gap-1">
                 <button 
                   title={t('add_formula', 'افزودن فرمول')} 
                   className="p-1.5 hover:bg-gray-300 rounded transition-colors text-blue-700 flex items-center justify-center disabled:opacity-50"
                   disabled={selectedFields.length === 0 && formulas.length === 0}
                   onClick={() => openFormulaModal()}
                 >
                   <div className="flex items-center text-[12px] font-bold pr-1">
                     <span className="font-serif italic text-base">f(x)</span> <Plus className="w-3.5 h-3.5 ml-0.5" strokeWidth={3} />
                   </div>
                 </button>
                 <button 
                    title={t('edit_formula', 'ویرایش فرمول')} 
                    className="p-1.5 hover:bg-gray-300 rounded transition-colors text-indigo-700 flex items-center justify-center disabled:opacity-50"
                    disabled={!selectedFormulaName}
                    onClick={() => {
                      const formulaInfo = formulas.find(f => f.name === selectedFormulaName);
                      if (formulaInfo) openFormulaModal(formulaInfo);
                    }}
                 >
                    <div className="flex items-center text-[12px] font-bold pr-1">
                     <span className="font-serif italic text-base">f(x)</span> <Edit2 className="w-3.5 h-3.5 ml-0.5" strokeWidth={3} />
                   </div>
                 </button>
                 <button 
                    title={t('remove_formula', 'حذف فرمول')} 
                    className="p-1.5 hover:bg-gray-300 rounded transition-colors text-red-600 flex items-center justify-center disabled:opacity-50"
                    disabled={!selectedFormulaName}
                    onClick={() => {
                       if (selectedFormulaName) {
                          deleteFormula(selectedFormulaName);
                       }
                    }}
                 >
                    <Trash2 className="w-4 h-4 ml-1" />
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTablesTab = () => (
    <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 opacity-100">
      {/* Two Panes */}
      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Right Pane: Systems */}
        <div className="flex-1 bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow">
          <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-2 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm">
            سیستم‌ها و پرس و جوها
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 p-2 overflow-y-auto">
            <div 
              className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors cursor-pointer group relative mb-1 ${selectedSystemId === "script" ? "bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 text-indigo-900 dark:text-indigo-300" : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200"}`}
              onClick={() => setSelectedSystemId("script")}
            >
              <FileCode className="w-4 h-4 text-blue-500 mr-5" />
              <span className={`text-[13px] font-semibold pr-1 ${selectedSystemId === "script" ? "text-indigo-900 dark:text-indigo-300" : "text-gray-800 dark:text-gray-200"}`}>اسکریپت جدید</span>
            </div>
            {systemsTreeData ? (
              <TreeView
                data={systemsTreeData}
                onChange={() => {}}
                readOnly={true}
                hideContainer={true}
                defaultExpandAll={true}
                renderLabel={(node) => (
                  <span className={node.children && node.children.length > 0 ? "text-[14px] font-extrabold text-black dark:text-gray-100" : "text-[13px] font-semibold text-gray-800 dark:text-gray-200"}>
                    {node.name}
                  </span>
                )}
                onNodeDoubleClick={(node) => {
                  setSelectedSystemId(node.id);
                  if (node.id.includes('.')) {
                    handleTableClick(node.id);
                  }
                }}
                onSelect={(node) => {
                  setSelectedSystemId(node.id);
                  if (node.id.includes('.')) {
                    handleTableClick(node.id);
                  }
                }}
              />
            ) : (
                <div className="p-4 text-center text-gray-500 text-sm">در حال بارگزاری...</div>
            )}
          </div>
        </div>

        {/* Left Pane: Tables */}
        <div className="flex-1 bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow">
          <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-2 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm">
            جدول‌ها
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 overflow-y-auto p-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                 <span className="text-sm text-gray-600 bg-white px-4 py-2 border shadow-lg rounded-full flex items-center gap-2">
                    <span className="animate-spin text-blue-600">⌛</span> در حال پردازش...
                 </span>
              </div>
            )}
            {(() => {
              if (selectedSystemId === "script") {
                return (
                  <div className="p-3 h-full flex flex-col">
                    <div className="text-gray-700 text-xs mb-2 font-medium flex items-center justify-between">
                       <span>نوشتن پرس‌و‌جوی جدید (اسکریپت SQL / PostgreSQL)</span>
                       <button 
                         onClick={validateScript}
                         disabled={isLoading}
                         className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded shadow-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                       >
                          <Play className="w-3.5 h-3.5" />
                          سینتکس گیری
                       </button>
                    </div>
                    {dbError && (
                       <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span className="whitespace-pre-wrap font-mono" dir="ltr">{dbError}</span>
                       </div>
                    )}
                    <textarea 
                      value={scriptContent}
                      onChange={e => setScriptContent(e.target.value)}
                      placeholder="SELECT * FROM public.users;"
                      className="flex-1 w-full border border-gray-300 rounded p-3 text-sm font-mono text-left bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 custom-scrollbar resize-none dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                      dir="ltr"
                    />
                    <div className="mt-2 text-[10px] text-gray-500 leading-relaxed bg-gray-50 p-2 border border-gray-200 rounded shadow-sm">
                      <ul className="list-disc pl-5 rtl:pr-5">
                        <li>بعد از بررسی درست بودن سینتکس توسط کارگزار، به تب <strong>فیلدها</strong> هدایت خواهید شد.</li>
                      </ul>
                    </div>
                  </div>
                );
              }
              const currentTables = selectedSystemId ? systemsTablesMap[selectedSystemId] || [] : [];
              if (!selectedSystemId) {
                return <div className="p-4 text-center text-gray-400 text-xs mt-10">ابتدا یک سیستم را انتخاب کنید.</div>;
              }
              if (currentTables.length === 0) {
                return <div className="p-4 text-center text-gray-400 text-xs mt-10 text-balance leading-relaxed">جدولی در این بخش موجود نیست.<br/>لطفاً یکی از زیرمنوها را انتخاب کنید.</div>;
              }
              return (
                <div className="space-y-[1px]">
                  {currentTables.map((table, idx) => {
                    const fullId = `${selectedSystemId}.${table}`;
                    const title = getTranslatedName(fullId, language) || getTranslatedName(table, language) || t(`table_${table}`, table);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => handleTableClick(fullId)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-100 dark:hover:bg-slate-800 cursor-pointer text-sm transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                      >
                       <Table2 className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.5} />
                       <span className="text-gray-800 dark:text-gray-300 font-medium">{title}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGroupingTab = () => {
    const availableGroupings = {
      id: "available_root",
      name: "فیلدهای موجود",
      isRoot: true,
      children: [
        {
          id: "avail_report_fields",
          name: "فیلدهای گزارش",
          isRoot: true,
          children: selectedFields.filter(f => !groupedFields.some(gf => gf.name === f.name && (gf.tableName || '') === (f.tableName || ''))).map((f, i) => ({
            id: `avail_sel_${i}_${f.name}`,
            name: t(`field_${f.name}`, f.name),
            data: f,
            children: []
          }))
        },
        {
          id: "avail_formula_fields",
          name: "Formula Fields",
          isRoot: true,
          children: formulas.filter(f => !groupedFields.some(gf => gf.name === f.name)).map((f, i) => ({
            id: `avail_form_${i}_${f.name}`,
            name: f.name,
            data: f,
            children: []
          }))
        },
        {
           id: "avail_table_fields",
           name: t('origin_table', 'فیلدهای جدول'),
           isRoot: true,
           children: tableFields.filter(f => !groupedFields.some(gf => gf.name === f.name && (gf.tableName || '') === (f.tableName || '')) && !selectedFields.some(sf => sf.name === f.name && (sf.tableName || '') === (f.tableName || ''))).map((f, i) => ({
             id: `avail_tbl_${i}_${f.name}`,
             name: t(`field_${f.name}`, f.name),
             data: f,
             children: []
           }))
        }
      ].filter(c => c.children.length > 0)
    };

    const groupedTree = {
      id: "grouped_root",
      name: "بر اساس فیلدهای زیر گروه‌بندی شود",
      isRoot: true,
      children: groupedFields.map((f, i) => ({
        id: `grouped_${i}_${f.name}`,
        name: t(`field_${f.name}`, f.name),
        data: f,
        children: []
      }))
    };

    const handleAdd = () => {
       if (!selectedAvailableGroupingNode) return;
       let selectedNode: any = null;
       availableGroupings.children.forEach(group => {
           const found = group.children.find((c: any) => c.id === selectedAvailableGroupingNode);
           if (found) selectedNode = found;
       });

       if (selectedNode && selectedNode.data) {
           const field = selectedNode.data;
           setGroupedFields(prev => {
               if (!prev.some(f => f.name === field.name)) {
                   return [...prev, field];
               }
               return prev;
           });
           setSelectedAvailableGroupingNode(null);
       }
    };

    const handleRemove = () => {
       if (!selectedGroupedNode) return;
       const found = groupedTree.children.find((c: any) => c.id === selectedGroupedNode);
       if (found && found.data) {
           const field = found.data;
           setGroupedFields(prev => prev.filter(f => f.name !== field.name));
           setSelectedGroupedNode(null);
       }
    };

    return (
      <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 overflow-hidden gap-2">
         {/* Two Panes */}
         <div className="flex flex-1 gap-2 overflow-hidden">
            
            {/* Right Pane: Available Fields */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
               <div className="flex-1 overflow-y-auto p-2">
                  <TreeView
                     data={availableGroupings}
                     onChange={() => {}}
                     readOnly={true}
                     hideContainer={true}
                     defaultExpandAll={true}
                     selectedNodeId={selectedAvailableGroupingNode}
                     onSelect={(node) => {
                        setSelectedAvailableGroupingNode(node.id);
                        if (node.id.startsWith("avail_form_")) {
                           setSelectedFormulaName(node.name);
                        } else {
                           setSelectedFormulaName(null);
                        }
                     }}
                     onNodeDoubleClick={handleAdd}
                     renderLabel={(node) => (
                       <span className={node.children && node.children.length > 0 ? "text-[14px] font-extrabold text-black dark:text-gray-100" : "text-[13px] font-semibold text-gray-800 dark:text-gray-200"}>
                         {node.name}
                       </span>
                     )}
                  />
               </div>
               
               {/* Footer with Formula Icons */}
               <div className="bg-[#f0f0f0] dark:bg-slate-800 p-1 border-t border-gray-400 dark:border-gray-700 flex items-center justify-start gap-1">
                  <button 
                    title={t('add_formula', 'افزودن فرمول')} 
                    className="p-1.5 hover:bg-gray-300 rounded transition-colors text-blue-700 flex items-center justify-center disabled:opacity-50"
                    disabled={selectedFields.length === 0 && formulas.length === 0}
                    onClick={() => openFormulaModal()}
                  >
                    <div className="flex items-center text-[12px] font-bold pr-1">
                      <span className="font-serif italic text-base">f(x)</span> <Plus className="w-3.5 h-3.5 ml-0.5" strokeWidth={3} />
                    </div>
                  </button>
                  <button 
                     title={t('edit_formula', 'ویرایش فرمول')} 
                     className="p-1.5 hover:bg-gray-300 rounded transition-colors text-indigo-700 flex items-center justify-center disabled:opacity-50"
                     disabled={!selectedFormulaName}
                     onClick={() => {
                       const formulaInfo = formulas.find(f => f.name === selectedFormulaName);
                       if (formulaInfo) openFormulaModal(formulaInfo);
                     }}
                  >
                     <div className="flex items-center text-[12px] font-bold pr-1">
                      <span className="font-serif italic text-base">f(x)</span> <Edit2 className="w-3.5 h-3.5 ml-0.5" strokeWidth={3} />
                    </div>
                  </button>
                  <button 
                     title={t('remove_formula', 'حذف فرمول')} 
                     className="p-1.5 hover:bg-gray-300 rounded transition-colors text-red-600 flex items-center justify-center disabled:opacity-50"
                     disabled={!selectedFormulaName}
                     onClick={() => {
                        if (selectedFormulaName) {
                           deleteFormula(selectedFormulaName);
                        }
                     }}
                  >
                     <Trash2 className="w-4 h-4 ml-1" />
                  </button>
               </div>
            </div>

            {/* Middle: Transfer Buttons */}
            <div className="flex flex-col items-center justify-center gap-2 px-1">
               {/* Top button points RIGHT (remove in RTL) */}
               <button 
                 onClick={handleRemove}
                 disabled={!selectedGroupedNode}
                 className="w-10 h-8 flex items-center justify-center bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-600 rounded shadow-sm hover:bg-[#e0e0e0] dark:hover:bg-slate-700 disabled:opacity-50"
               >
                  <ArrowRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
               </button>
               {/* Bottom button points LEFT (add in RTL) */}
               <button 
                 onClick={handleAdd}
                 disabled={!selectedAvailableGroupingNode || !selectedAvailableGroupingNode.startsWith('avail_')}
                 className="w-10 h-8 flex items-center justify-center bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-600 rounded shadow-sm hover:bg-[#e0e0e0] dark:hover:bg-slate-700 disabled:opacity-50"
               >
                  <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
               </button>
            </div>

            {/* Left Pane: Group By Fields */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
               <div className="flex-1 overflow-y-auto p-2">
                  <TreeView
                     data={groupedTree}
                     onChange={() => {}}
                     readOnly={true}
                     hideContainer={true}
                     defaultExpandAll={true}
                     selectedNodeId={selectedGroupedNode}
                     onSelect={(node) => setSelectedGroupedNode(node.id)}
                     onNodeDoubleClick={handleRemove}
                     renderLabel={(node) => (
                       <span className={node.children && node.children.length > 0 ? "text-[14px] font-extrabold text-black dark:text-gray-100" : "text-[13px] font-semibold text-gray-800 dark:text-gray-200"}>
                         {node.name}
                       </span>
                     )}
                  />
               </div>
               
               <div className="bg-[#f0f0f0] dark:bg-slate-800 p-1 border-t border-gray-400 dark:border-gray-700 flex items-center justify-start px-2">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 p-1 rounded">
                    <span className="text-sm font-bold flex flex-col leading-[0.6] items-center justify-center mr-1">
                      <span>A</span><span>Z</span>
                    </span>
                    <ArrowDown className="w-4 h-4 ml-1" strokeWidth={2.5} />
                  </div>
               </div>
            </div>

         </div>
      </div>
    );
  };

  const renderAggregatesTab = () => {
    const availableFieldsTree = {
      id: "available_agg_root",
      name: "فیلدهای موجود",
      isRoot: true,
      children: [
        {
          id: "avail_agg_report_fields",
          name: "فیلدهای گزارش",
          isRoot: true,
          children: selectedFields.map((f, i) => ({
            id: `avail_agg_sel_${i}_${f.name}`,
            name: t(`field_${f.name}`, f.name),
            data: f,
            children: []
          }))
        },
        {
          id: "avail_agg_formula_fields",
          name: "Formula Fields",
          isRoot: true,
          children: formulas.map((f, i) => ({
            id: `avail_agg_form_${i}_${f.name}`,
            name: f.name,
            data: f,
            children: []
          }))
        },
        {
           id: "avail_agg_table_fields",
           name: t('origin_table', 'فیلدهای جدول'),
           isRoot: true,
           children: tableFields.filter(f => !selectedFields.some(sf => sf.name === f.name && (sf.tableName || '') === (f.tableName || ''))).map((f, i) => ({
             id: `avail_agg_tbl_${i}_${f.name}`,
             name: t(`field_${f.name}`, f.name),
             data: f,
             children: []
           }))
        }
      ].filter(c => c.children.length > 0)
    };

    const aggregatesTree = {
      id: "aggregates_root",
      name: "جمع‌های زیر در گزارش موجود باشند",
      isRoot: true,
      children: groupedFields.map((gf, i) => ({
        id: `agg_group_${i}_${gf.name}`,
        name: t(`field_${gf.name}`, gf.name),
        data: { type: 'group', ...gf },
        children: aggregates.filter(a => a.groupBy === gf.name).map((a) => ({
          id: a.id,
          name: `تعداد ${t(`field_${a.field.name}`, a.field.name)} در سطح ${t(`field_${gf.name}`, gf.name)} Σ`,
          data: { type: 'aggregate', ...a },
          children: []
        }))
      }))
    };

    const handleAddAggregate = () => {
       if (!selectedAvailableAggregateNode) return;
       if (!selectedAggregateNode) {
           showToast("لطفاً یک گروه را از لیست سمت چپ انتخاب کنید.", "warning");
           return;
       }

       let selectedField: any = null;
       availableFieldsTree.children.forEach(group => {
           const found = group.children.find((c: any) => c.id === selectedAvailableAggregateNode);
           if (found) selectedField = found.data;
       });

       if (!selectedField) return;

       let targetGroup: any = null;
       const selectedAggNodeId = selectedAggregateNode;
       
       const groupMatch = aggregatesTree.children.find(g => g.id === selectedAggNodeId || g.children.some(c => c.id === selectedAggNodeId));
       if (groupMatch) {
           targetGroup = groupMatch.data.name; 
       }

       if (targetGroup && selectedField) {
           const newAggId = `agg_item_${Date.now()}_${selectedField.name}`;
           setAggregates(prev => [...prev, {
               id: newAggId,
               field: selectedField,
               groupBy: targetGroup,
               printPosition: 'footer',
               hasPageTotal: false,
               hasGrandTotal: false
           }]);
           setSelectedAvailableAggregateNode(null);
       }
    };

    const handleRemoveAggregate = () => {
       if (!selectedAggregateNode) return;
       const existingAgg = aggregates.find(a => a.id === selectedAggregateNode);
       if (existingAgg) {
           setAggregates(prev => prev.filter(a => a.id !== selectedAggregateNode));
           setSelectedAggregateNode(null);
       }
    };

    const selectedAggregateItem = aggregates.find(a => a.id === selectedAggregateNode);

    return (
      <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 overflow-hidden gap-2">
         {/* Top Banner (Yellow) */}
         <div className="bg-[#ffffe1] dark:bg-yellow-900/20 border border-[#a0a0a0] dark:border-gray-600 p-2 flex justify-between items-center shadow-sm relative text-center min-h-[40px]">
           <div className="flex-1 flex justify-center w-full">
             <span className="font-bold text-[13px] text-gray-800 dark:text-gray-200 text-center w-full block pt-1">سرجمع‌ها به تفکیک گروه‌بندی‌ها محاسبه می‌شوند</span>
           </div>
           <span className="text-blue-800 font-serif text-3xl font-bold absolute left-4 opacity-100 select-none -mt-1 drop-shadow-md">Σ</span>
         </div>

         {/* Two Panes */}
         <div className="flex flex-1 gap-2 overflow-hidden">
            {/* Right Pane: Available Fields */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
               <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-1 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm flex items-center justify-center">
                  فیلدهای موجود
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                  <TreeView
                     data={availableFieldsTree}
                     onChange={() => {}}
                     readOnly={true}
                     hideContainer={true}
                     defaultExpandAll={true}
                     selectedNodeId={selectedAvailableAggregateNode}
                     onSelect={(node) => setSelectedAvailableAggregateNode(node.id)}
                     onNodeDoubleClick={handleAddAggregate}
                     renderLabel={(node) => (
                       <span className={node.children && node.children.length > 0 ? "text-[14px] font-extrabold text-black dark:text-gray-100" : "text-[13px] font-semibold text-gray-800 dark:text-gray-200"}>
                         {node.name}
                       </span>
                     )}
                  />
               </div>
            </div>

            {/* Middle: Transfer Buttons */}
            <div className="flex flex-col items-center justify-center gap-2 px-1">
               <button 
                 onClick={handleRemoveAggregate}
                 disabled={!selectedAggregateItem}
                 className="w-10 h-8 flex items-center justify-center bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-600 rounded shadow-sm hover:bg-[#e0e0e0] dark:hover:bg-slate-700 disabled:opacity-50"
               >
                  <ArrowRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
               </button>
               <button 
                 onClick={handleAddAggregate}
                 disabled={!selectedAvailableAggregateNode || (!selectedAvailableAggregateNode.startsWith('avail_agg_sel_') && !selectedAvailableAggregateNode.startsWith('avail_agg_tbl_') && !selectedAvailableAggregateNode.startsWith('avail_agg_form_'))}
                 className="w-10 h-8 flex items-center justify-center bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-600 rounded shadow-sm hover:bg-[#e0e0e0] dark:hover:bg-slate-700 disabled:opacity-50"
               >
                  <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
               </button>
            </div>

            {/* Left Pane: Aggregates Tree */}
            <div className="flex-1 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm bg-[#f0f0f0] dark:bg-slate-800">
               <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-1 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm flex items-center justify-between px-2">
                  <span></span>
                  <span>جمع‌های زیر در گزارش موجود باشند</span>
                  <div className="flex flex-col gap-0 opacity-80 cursor-pointer hover:opacity-100">
                     <ArrowDown className="w-3.5 h-3.5 rotate-180 -mb-1" strokeWidth={3} />
                     <ArrowDown className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-slate-900 border-b border-gray-400 dark:border-gray-700">
                  <TreeView
                     data={aggregatesTree}
                     onChange={() => {}}
                     readOnly={true}
                     hideContainer={true}
                     defaultExpandAll={true}
                     selectedNodeId={selectedAggregateNode}
                     onSelect={(node) => setSelectedAggregateNode(node.id)}
                     onNodeDoubleClick={handleRemoveAggregate}
                     renderLabel={(node) => (
                       <span className={`text-[13px] ${node.data?.type === 'group' ? "font-bold text-black dark:text-gray-100" : "font-normal text-white bg-blue-900 px-1 py-0.5"}`}>
                         {node.name}
                       </span>
                     )}
                  />
               </div>
               
               {/* Footer toolbar: sigma dropdown */}
               <div className="bg-[#f0f0f0] dark:bg-slate-800 p-1 flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                  <button 
                    onClick={() => {
                        if(selectedAggregateItem) setIsSigmaDropdownOpen(!isSigmaDropdownOpen);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-0.5 border border-[#808080] rounded shadow bg-[#f0f0f0] ${selectedAggregateItem ? 'hover:bg-gray-200 cursor-pointer text-blue-900' : 'opacity-60 cursor-not-allowed text-gray-500'}`}
                  >
                     <span className="font-serif font-bold text-xl leading-none select-none drop-shadow">Σ</span>
                     <ArrowDown className="w-3 h-3" strokeWidth={3} />
                  </button>

                  {/* Sigma Dropdown Menu */}
                  {isSigmaDropdownOpen && selectedAggregateItem && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSigmaDropdownOpen(false)}></div>
                        
                        <div className="absolute bottom-full mb-1 bg-[#f0f0f0] border border-gray-400 shadow-xl z-[60] text-[12px] py-1 text-gray-900 min-w-[220px]" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                           <label className="px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-200 hover:text-black">
                              <span>در تیتر گروه‌بندی چاپ شود</span>
                              <input 
                                type="radio" 
                                name="printPosition"
                                checked={selectedAggregateItem.printPosition === 'header'} 
                                onChange={() => {
                                  setAggregates(prev => prev.map(a => a.id === selectedAggregateItem.id ? {...a, printPosition: 'header'} : a));
                                }}
                              />
                           </label>
                           <label className="px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-200 hover:text-black">
                              <span>در پانوشت گروه‌بندی چاپ شود</span>
                              <input 
                                type="radio" 
                                name="printPosition"
                                checked={selectedAggregateItem.printPosition === 'footer'} 
                                onChange={() => {
                                  setAggregates(prev => prev.map(a => a.id === selectedAggregateItem.id ? {...a, printPosition: 'footer'} : a));
                                }}
                              />
                           </label>
                           <div className="h-px bg-gray-300 my-1 mx-1"></div>
                           <label className="px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-200 hover:text-black">
                              <span className="flex-1">جمع تا صفحه داشته باشد</span>
                              <input 
                                type="checkbox" 
                                checked={!!selectedAggregateItem.hasPageTotal}
                                onChange={(e) => {
                                   setAggregates(prev => prev.map(a => a.id === selectedAggregateItem.id ? {...a, hasPageTotal: e.target.checked} : a));
                                }}
                                className="w-3.5 h-3.5"
                              />
                           </label>
                           <label className="px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-200 hover:text-black">
                              <span className="flex-1">ته جمع داشته باشد</span>
                              <input 
                                type="checkbox" 
                                checked={!!selectedAggregateItem.hasGrandTotal}
                                onChange={(e) => {
                                   setAggregates(prev => prev.map(a => a.id === selectedAggregateItem.id ? {...a, hasGrandTotal: e.target.checked} : a));
                                }}
                                className="w-3.5 h-3.5"
                              />
                           </label>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
    );
  };

  const renderStructureTab = () => {
    // Generate left side structure tree based on groupedFields and fixed bands
    const structureBands = [
      { id: "ReportHeader", label: "سرتیتر گزارش" },
      { id: "PageHeader", label: "سرتیتر صفحه" },
      // Group Headers
      ...groupedFields.map(gf => ({ id: `GroupHeader_${gf.name}`, label: `سرتیتر ${gf.description || gf.name}` })),
      { id: "Details", label: "جزئیات" },
      // Group Footers (in reverse order for proper nesting mathematically, though flat visual is fine)
      ...[...groupedFields].reverse().map(gf => ({ id: `GroupFooter_${gf.name}`, label: `پانوشت ${gf.description || gf.name}` })),
      { id: "ReportFooter", label: "پانوشت گزارش" },
      { id: "PageFooter", label: "پانوشت صفحه" }
    ];

    const structureTreeData = {
      id: "root",
      name: "درختواره کل گزارش",
      isRoot: true,
      children: structureBands.map(band => ({
        id: band.id,
        name: band.label,
        type: "band",
        children: structureItems.filter(i => i.bandId === band.id).map(item => ({
          id: item.id,
          name: item.name,
          type: "item",
          data: item
        }))
      }))
    };

    const availableTreeData = {
      id: "root",
      name: "فیلدهای موجود",
      isRoot: true,
      children: [
        ...selectedFields.map(f => ({
          id: `field_${f.name}`,
          name: f.description || f.name,
          type: "available_field",
          data: { ...f, itemType: "field" }
        })),
        ...formulas.map(f => ({
          id: `formula_${f.name}`,
          name: f.name,
          type: "available_formula",
          data: { ...f, itemType: "formula" }
        })),
        ...aggregates.map(a => ({
          id: `aggregate_${a.id}`,
          name: `${a.type === 'sum' ? 'جمع' : a.type} ${a.field}`,
          type: "available_aggregate",
          data: { ...a, itemType: "aggregate" }
        }))
      ]
    };

    const handleMoveToStructure = () => {
      if (!structureSelectedAvailableNode) return;
      if (!structureSelectedNode) {
        showToast("لطفاً ابتدا یک باند یا گروه در ساختار گزارش انتخاب کنید.", "error");
        return;
      }
      
      const isBand = structureBands.some(b => b.id === structureSelectedNode);
      const targetBandId = isBand ? structureSelectedNode : structureItems.find(i => i.id === structureSelectedNode)?.bandId;
      
      if (!targetBandId) return;

      const nodeData = (() => {
        let n: any = availableTreeData.children.find((c: any) => c.id === structureSelectedAvailableNode);
        return n;
      })();
      
      if (nodeData) {
        const newItemId = `${nodeData.id}_${Date.now()}`;
        setStructureItems([...structureItems, {
          id: newItemId,
          bandId: targetBandId,
          name: nodeData.name,
          itemType: nodeData.data.itemType,
          originalData: nodeData.data,
          properties: {}
        }]);
      }
    };

    const handleRemoveFromStructure = () => {
      if (!structureSelectedNode) return;
      const isBand = structureBands.some(b => b.id === structureSelectedNode);
      if (isBand) {
        showToast("امکان حذف باند اصلی وجود ندارد.", "error");
        return;
      }
      setStructureItems(structureItems.filter(i => i.id !== structureSelectedNode));
      setStructureSelectedNode(null);
    };

    return (
      <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 overflow-hidden gap-2">
         <div className="flex flex-1 gap-2 overflow-hidden mt-2">
            
            {/* Right Pane (First in DOM): Available Fields */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
                <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-1.5 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm flex items-center justify-between px-4">
                  <span className="flex-1 text-center">فیلدهای موجود</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 min-h-0 bg-white">
                   <TreeView 
                      data={availableTreeData as any}
                      onChange={() => {}}
                      readOnly={true}
                      hideContainer={true}
                      defaultExpandAll={true}
                      selectedNodeId={structureSelectedAvailableNode}
                      onSelect={(node) => setStructureSelectedAvailableNode(node.id)}
                      onNodeDoubleClick={(node) => {
                         setStructureSelectedAvailableNode(node.id);
                         setTimeout(handleMoveToStructure, 50);
                      }}
                      renderLabel={(node) => {
                        let icon = "";
                        if((node as any).type === "available_field") icon = "T ";
                        else if((node as any).type === "available_formula") icon = "f(x) ";
                        else if((node as any).type === "available_aggregate") icon = "Σ ";
                        return (
                          <span className={`text-[13px] text-gray-800`}>
                            {icon && <span className="font-serif italic font-bold text-blue-600 ml-1">{icon}</span>}
                            {node.name}
                          </span>
                        );
                      }}
                   />
                </div>
                
                {/* Footer with Formula Icons */}
                <div className="bg-[#f0f0f0] dark:bg-slate-800 p-1 border-t border-gray-400 dark:border-gray-700 flex items-center justify-start gap-1">
                   <button 
                     title={t('add_formula', 'افزودن فرمول')} 
                     className="p-1.5 hover:bg-gray-300 rounded transition-colors text-blue-700 flex items-center justify-center disabled:opacity-50"
                     disabled={selectedFields.length === 0 && formulas.length === 0}
                     onClick={() => openFormulaModal()}
                   >
                     <div className="flex items-center text-[12px] font-bold pr-1">
                       <span className="font-serif italic text-base">f(x)</span> <Plus className="w-3.5 h-3.5 ml-0.5" strokeWidth={3} />
                     </div>
                   </button>
                   <button 
                      title={t('edit_formula', 'ویرایش فرمول')} 
                      className="p-1.5 hover:bg-gray-300 rounded transition-colors text-indigo-700 flex items-center justify-center disabled:opacity-50"
                      disabled={!structureSelectedAvailableNode || !structureSelectedAvailableNode.startsWith('formula_')}
                      onClick={() => {
                        const selName = structureSelectedAvailableNode?.replace('formula_', '');
                        const formulaInfo = formulas.find(f => f.name === selName);
                        if (formulaInfo) openFormulaModal(formulaInfo);
                      }}
                   >
                      <div className="flex items-center text-[12px] font-bold pr-1">
                       <span className="font-serif italic text-base">f(x)</span> <Edit2 className="w-3.5 h-3.5 ml-0.5" strokeWidth={3} />
                     </div>
                   </button>
                   <button 
                      title={t('remove_formula', 'حذف فرمول')} 
                      className="p-1.5 hover:bg-gray-300 rounded transition-colors text-red-600 flex items-center justify-center disabled:opacity-50"
                      disabled={!structureSelectedAvailableNode || !structureSelectedAvailableNode.startsWith('formula_')}
                      onClick={() => {
                         const selName = structureSelectedAvailableNode?.replace('formula_', '');
                         if (selName) {
                            deleteFormula(selName);
                         }
                      }}
                   >
                      <Trash2 className="w-4 h-4 ml-1" />
                   </button>
                </div>
            </div>

            {/* Center Pane: Transfer Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 w-12 pt-8">
               <button 
                  onClick={handleMoveToStructure}
                  className="w-10 h-10 flex items-center justify-center bg-gray-200 border border-gray-400 rounded hover:bg-gray-300 shadow-sm"
                  title="اضافه به ساختار گزارش"
               >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
               </button>
               <button 
                  onClick={handleRemoveFromStructure}
                  className="w-10 h-10 flex items-center justify-center bg-gray-200 border border-gray-400 rounded hover:bg-gray-300 shadow-sm"
                  title="حذف از ساختار گزارش"
               >
                  <ArrowRight className="w-5 h-5 text-gray-700" />
               </button>
            </div>

            {/* Left Pane (Last in DOM): Structure Tree & Properties */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
                  <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-1.5 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm">
                    درختواره کل گزارش
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 min-h-0 bg-white">
                     <TreeView 
                        data={structureTreeData as any}
                        onChange={() => {}}
                        readOnly={true}
                        hideContainer={true}
                        defaultExpandAll={true}
                        selectedNodeId={structureSelectedNode}
                        onSelect={(node) => setStructureSelectedNode(node.id)}
                        onNodeDoubleClick={(node) => {
                           if((node as any).type === "item") {
                             handleRemoveFromStructure();
                           }
                        }}
                        renderLabel={(node) => (
                          <span className={`text-[13px] ${(node as any).type === 'band' ? "font-bold text-gray-800" : "font-normal text-blue-800"}`}>
                            {(node as any).type === 'item' && <span className="font-mono bg-blue-100 px-1 ml-1 rounded">f</span>}
                            {node.name}
                          </span>
                        )}
                     />
                  </div>
              </div>

              {/* Properties Panel */}
              <div className="h-40 bg-white dark:bg-slate-900 border border-gray-400 dark:border-gray-700 flex flex-col overflow-hidden shadow-sm">
                  <div className="bg-[#f0f0f0] dark:bg-slate-800 text-center text-sm p-1.5 border-b border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm flex justify-between items-center px-4">
                    <span>مشخصات {structureSelectedNode ? (structureBands.some(b => b.id === structureSelectedNode) ? "باند" : "آیتم") : ""}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 text-sm flex flex-col gap-3">
                     {!structureSelectedNode ? (
                       <div className="text-gray-400 text-center mt-8">موردی انتخاب نشده است</div>
                     ) : (
                       <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">رنگ پس‌زمینه (Background)</label>
                            <input 
                               type="color" 
                               value={structureBandProperties[structureSelectedNode]?.backgroundColor || "#ffffff"}
                               onChange={(e) => setStructureBandProperties({...structureBandProperties, [structureSelectedNode]: {...(structureBandProperties[structureSelectedNode] || {}), backgroundColor: e.target.value}})}
                               className="h-8 w-full cursor-pointer"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-600">رنگ متن (Text Color)</label>
                            <input 
                               type="color" 
                               value={structureBandProperties[structureSelectedNode]?.color || "#000000"}
                               onChange={(e) => setStructureBandProperties({...structureBandProperties, [structureSelectedNode]: {...(structureBandProperties[structureSelectedNode] || {}), color: e.target.value}})}
                               className="h-8 w-full cursor-pointer"
                            />
                          </div>
                          {/* If it's a band, show height. If it's an item, show font weight. */}
                          {structureBands.some(b => b.id === structureSelectedNode) ? (
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-600">ارتفاع باند (Height)</label>
                              <input 
                                 type="number" 
                                 value={structureBandProperties[structureSelectedNode]?.height || 30}
                                 onChange={(e) => setStructureBandProperties({...structureBandProperties, [structureSelectedNode]: {...(structureBandProperties[structureSelectedNode] || {}), height: Number(e.target.value)}})}
                                 className="h-8 border border-gray-300 rounded px-2 text-left"
                                 dir="ltr"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-gray-600">ضخامت فونت (Font Weight)</label>
                              <select 
                                 value={structureBandProperties[structureSelectedNode]?.fontWeight || "normal"}
                                 onChange={(e) => setStructureBandProperties({...structureBandProperties, [structureSelectedNode]: {...(structureBandProperties[structureSelectedNode] || {}), fontWeight: e.target.value}})}
                                 className="h-8 border border-gray-300 rounded px-2"
                              >
                                <option value="normal">عادی (Normal)</option>
                                <option value="bold">ضخیم (Bold)</option>
                              </select>
                            </div>
                          )}
                       </div>
                     )}
                  </div>
              </div>
            </div>

         </div>
      </div>
    );
  };

  const renderSpecsTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 overflow-hidden gap-2">
         {/* Title Banner */}
         <div className="bg-[#ffffe1] dark:bg-yellow-900/20 border border-gray-300 dark:border-gray-600 p-2 flex justify-between items-center shadow-sm relative">
           <FileText className="w-5 h-5 text-gray-800 dark:text-gray-300 absolute right-4 opacity-70" />
           <div className="flex-1 flex justify-center w-full">
             <span className="font-bold text-sm text-gray-800 dark:text-gray-200">مشخصات عمومی گزارش</span>
           </div>
         </div>
         
         <div className="bg-[#f0f0f0] dark:bg-slate-800 border border-gray-400 dark:border-gray-700 p-2 pb-6 flex flex-col gap-4 text-sm h-full overflow-y-auto overflow-x-hidden">
            
            {/* عنوان گزارش */}
            <div className="flex items-center gap-0 px-4 mt-2">
              <label className="w-32 text-gray-800 dark:text-gray-200 font-medium text-right shrink-0 pr-2">عنوان گزارش: <span className="text-red-500">*</span></label>
              <input 
                id="report_title_input"
                type="text" 
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                className="flex-1 border border-[#a0a0a0] dark:border-gray-600 p-1 bg-white dark:bg-slate-900 focus:outline-none shadow-sm h-7 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" 
              />
            </div>

            {/* گروه گزارش */}
            <div className="flex items-center gap-0 px-4 mt-1">
              <label className="w-32 text-gray-800 dark:text-gray-200 font-medium text-right shrink-0 pr-2">گروه گزارش:</label>
              <div className="flex border border-[#a0a0a0] dark:border-gray-600 bg-white dark:bg-slate-900 h-7 shadow-sm items-center relative flex-1">
                <select 
                  value={reportGroupId} 
                  onChange={e => setReportGroupId(e.target.value)}
                  className="w-full h-[24px] bg-transparent focus:outline-none border-none appearance-none px-2 text-gray-800 dark:text-gray-200 z-10" 
                  style={{direction:'rtl'}}
                >
                  <option value=""></option>
                  {userGroups.map(g => (
                    <option key={g.reportGroupID} value={g.reportGroupID}>{g.title}</option>
                  ))}
                </select>
                <div className="absolute left-0 top-0 h-full w-[22px] bg-[#e0e0e0] dark:bg-slate-700 hover:bg-[#d0d0d0] dark:hover:bg-slate-600 flex items-center justify-center border-r border-[#a0a0a0] dark:border-gray-600 z-0 pointer-events-none">
                  <ArrowDown className="w-3 h-3 text-black dark:text-gray-300" strokeWidth={3} />
                </div>
              </div>
            </div>
            
            <hr className="border-t border-[#c0c0c0] dark:border-gray-600 w-[calc(100%-2rem)] mx-auto mt-2" />

            {/* جهت گزارش */}
            <div className="flex items-center gap-0 px-4 mt-1">
               <label className="w-32 text-gray-800 dark:text-gray-200 font-medium text-right shrink-0 pr-2">جهت گزارش:</label>
               <div className="flex items-center gap-12">
                 <label className="flex items-center gap-1.5 cursor-pointer">
                   <input type="radio" name="reportDirection" value="rtl" checked={reportConfig.direction === "rtl"} onChange={(e) => setReportConfig({...reportConfig, direction: e.target.value})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300 text-[13px]">از راست به چپ</span>
                 </label>
                 <label className="flex items-center gap-1.5 cursor-pointer">
                   <input type="radio" name="reportDirection" value="ltr" checked={reportConfig.direction === "ltr"} onChange={(e) => setReportConfig({...reportConfig, direction: e.target.value})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300 text-[13px]">از چپ به راست</span>
                 </label>
               </div>
            </div>

            <hr className="border-t border-[#c0c0c0] dark:border-gray-600 w-[calc(100%-2rem)] mx-auto mt-1" />

            {/* اندازه و جهت کاغذ */}
            <div className="flex items-center px-4 mt-1">
               <div className="flex items-center gap-0 flex-1">
                 <label className="w-32 text-gray-800 dark:text-gray-200 font-medium text-right shrink-0 pr-2">اندازه کاغذ:</label>
                 <div className="flex border border-[#a0a0a0] dark:border-gray-600 bg-white dark:bg-slate-900 h-7 shadow-sm items-center relative w-full max-w-[200px]">
                    <select value={reportConfig.paperSize} onChange={(e) => setReportConfig({...reportConfig, paperSize: e.target.value})} className="w-full h-[24px] bg-transparent focus:outline-none border-none appearance-none px-2 text-gray-800 dark:text-gray-200 text-[13px] z-10" style={{direction:'rtl'}}>
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="A5">A5</option>
                      <option value="Letter">Letter</option>
                    </select>
                    <div className="absolute left-0 top-0 h-full w-[22px] bg-[#e0e0e0] dark:bg-slate-700 hover:bg-[#d0d0d0] dark:hover:bg-slate-600 flex items-center justify-center border-r border-[#a0a0a0] dark:border-gray-600 z-0">
                      <ArrowDown className="w-3 h-3 text-black dark:text-gray-300" strokeWidth={3} />
                    </div>
                 </div>
               </div>

               <div className="flex items-center gap-8 w-1/2">
                 <label className="text-gray-800 dark:text-gray-200 font-medium text-right pr-2">جهت کاغذ:</label>
                 <div className="flex items-center gap-12">
                   <label className="flex items-center gap-1.5 cursor-pointer">
                     <input type="radio" name="paperOrientation" value="portrait" checked={reportConfig.paperOrientation === "portrait"} onChange={(e) => setReportConfig({...reportConfig, paperOrientation: e.target.value})} className="w-4 h-4 cursor-pointer" />
                     <span className="text-gray-800 dark:text-gray-300 text-[13px]">عمودی</span>
                   </label>
                   <label className="flex items-center gap-1.5 cursor-pointer">
                     <input type="radio" name="paperOrientation" value="landscape" checked={reportConfig.paperOrientation === "landscape"} onChange={(e) => setReportConfig({...reportConfig, paperOrientation: e.target.value})} className="w-4 h-4 cursor-pointer" />
                     <span className="text-gray-800 dark:text-gray-300 text-[13px]">افقی</span>
                   </label>
                 </div>
               </div>
            </div>
            
            <hr className="border-t border-[#c0c0c0] dark:border-gray-600 w-[calc(100%-2rem)] mx-auto mt-2" />
            
            {/* موارد زیر در گزارش چاپ شوند */}
            <div className="px-4 mt-2">
               <div className="text-gray-800 dark:text-gray-200 font-medium mb-4 text-right">موارد زیر در گزارش چاپ شوند:</div>
               <div className="grid grid-cols-4 gap-y-6 gap-x-2 text-[13px] pr-12 pl-4">
                 
                 {/* Row 1 */}
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-1">
                   <input type="checkbox" checked={reportConfig.showInstitutionName} onChange={(e) => setReportConfig({...reportConfig, showInstitutionName: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">نام مؤسسه</span>
                 </label>
                 
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-2">
                   <input type="checkbox" checked={reportConfig.showDate} onChange={(e) => setReportConfig({...reportConfig, showDate: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">تاریخ گزارشگیری</span>
                 </label>
                 
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-3">
                   <input type="checkbox" checked={reportConfig.showRowNumber} onChange={(e) => setReportConfig({...reportConfig, showRowNumber: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">شماره ردیف</span>
                 </label>
                 
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-4">
                   <input type="checkbox" checked={reportConfig.showFilters} onChange={(e) => setReportConfig({...reportConfig, showFilters: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">فیلترهای گزارش</span>
                 </label>

                 {/* Row 2 */}
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-1">
                   <input type="radio" name="pageNumberType" value="pageNumber" checked={reportConfig.pageNumberType === "pageNumber"} onChange={(e) => setReportConfig({...reportConfig, pageNumberType: e.target.value})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">شماره صفحه</span>
                 </label>
                 
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-2">
                   <input type="radio" name="pageNumberType" value="pageOfPage" checked={reportConfig.pageNumberType === "pageOfPage"} onChange={(e) => setReportConfig({...reportConfig, pageNumberType: e.target.value})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">صفحه از صفحه</span>
                 </label>
                 
                 <label className="flex items-center gap-1.5 cursor-pointer col-start-3">
                   <input type="checkbox" checked={reportConfig.showLogo} onChange={(e) => setReportConfig({...reportConfig, showLogo: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-gray-800 dark:text-gray-300">آرم مؤسسه</span>
                 </label>

               </div>
            </div>

            <hr className="border-t border-[#c0c0c0] dark:border-gray-600 w-[calc(100%-2rem)] mx-auto mt-4" />
            
            {/* فرم هدف و نوع چاپ */}
            <div className="flex flex-col gap-3 px-4 mt-2">
               <div className="flex items-center gap-0">
                 <label className="w-48 text-gray-800 dark:text-gray-200 font-medium text-right shrink-0 pr-2">نام فرم جهت نمایش در پرینت:</label>
                 <input 
                   type="text" 
                   value={reportConfig.targetForm}
                   onChange={e => setReportConfig({...reportConfig, targetForm: e.target.value})}
                   placeholder="مثال: Acc.Vouchers"
                   className="flex-1 border border-[#a0a0a0] dark:border-gray-600 p-1 bg-white dark:bg-slate-900 focus:outline-none shadow-sm h-7 text-left text-blue-800 dark:text-blue-400" 
                   dir="ltr"
                 />
                 <div className="text-gray-500 text-xs px-2 whitespace-nowrap">(برای نمایش در لیست چاپ فرم‌ها)</div>
               </div>
               
               <div className="flex items-center gap-8 pr-2 mt-1 -ml-4">
                 <label className="flex items-center gap-2 cursor-pointer w-48 shrink-0 pr-2 pb-1">
                   {/* space alignment */}
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 px-2 py-1 rounded">
                   <input type="checkbox" checked={reportConfig.isSystemReport} onChange={(e) => setReportConfig({...reportConfig, isSystemReport: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="font-medium text-[13px]">گزارش سیستمی (مختص توسعه دهنده)</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 px-2 py-1 rounded">
                   <input type="checkbox" checked={reportConfig.isDefaultTemplate} onChange={(e) => setReportConfig({...reportConfig, isDefaultTemplate: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                   <span className="text-green-800 dark:text-green-400 font-medium text-[13px]">قالب پیش‌فرض چاپ این فرم باشد</span>
                 </label>
               </div>
            </div>

            <hr className="border-t border-[#c0c0c0] dark:border-gray-600 w-[calc(100%-2rem)] mx-auto mt-3" />

            {/* ردیفهای تکراری */}
            <div className="flex px-4 mt-2 mb-2 justify-end mr-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-gray-800 dark:text-gray-300 font-medium text-[13px]">ردیفهای تکراری نمایش داده نشود</span>
                <input type="checkbox" checked={reportConfig.hideDuplicates} onChange={(e) => setReportConfig({...reportConfig, hideDuplicates: e.target.checked})} className="w-4 h-4 cursor-pointer" />
              </label>
            </div>

         </div>
      </div>
    );
  };

  const actionBar = (
    <div className="flex items-center justify-between w-full h-full pb-2">
      <div className="flex items-center gap-1">
         <ActionButton icon={Search} onClick={() => {}} tooltip="پیش نمایش" variant="outline">
            پیش نمایش
         </ActionButton>
      </div>
      <div className="flex items-center gap-2">
         <ActionButton icon={X} onClick={handleClose} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold">
            انصراف
         </ActionButton>
         <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>
         <ActionButton icon={ArrowRight} onClick={handlePrev} disabled={currentTabIndex === 0} variant="outline">
            قبلی
         </ActionButton>
         <ActionButton icon={ArrowLeft} onClick={handleNext} disabled={currentTabIndex === TABS.length - 1} variant="outline" className="font-bold">
            بعدی
         </ActionButton>
         <ActionButton icon={Save} onClick={handleFinish} variant="success">
            پایان
         </ActionButton>
      </div>
    </div>
  );

  if (isDesigning) {
    // We show the loader if:
    // 1. ReportBuilder is loading the definition (isLoading)
    // 2. OR we want to start in preview, but ReportDesigner hasn't finished its fetch.
    // 3. AND we make sure the flicker doesn't happen by waiting until the fetch at least started if we have a table.
    const showLoader = isLoading || (startInPreview && (designerPreviewLoading || (!!(selectedTableId || scriptContent) && !hasStartedPreviewFetch)));
    
    return (
      <div className="flex h-[calc(100vh-5rem)] justify-center p-4 font-sans text-gray-800 w-full relative">
        {showLoader && (
           <div className="absolute inset-0 z-50 flex bg-[#f0f0f0] dark:bg-gray-800 items-center justify-center">
             <LoadingOverlay visible={true} message="در حال اجرای گزارش..." />
           </div>
        )}
        <div className={`w-full h-full ${showLoader ? 'opacity-0 pointer-events-none absolute inset-0' : ''}`}>
          <SimpleForm
            title="طراحی گزارش"
            icon={<Layout className="w-4 h-4 text-white" />}
            onClose={handleDesignerClose}
            preventTabClose={true}
            fields={emptyFields}
            values={emptyValues}
            onChange={() => {}}
            className="h-full w-full max-w-7xl"
            showActions={false}
          >
           {(!isLoading && (!id || (id && reportTitle))) && (
             <ReportDesigner 
               reportTitle={reportTitle}
               selectedFields={selectedFields} 
               groupings={groupedFields} 
               initialFormulas={formulas}
               aggregates={aggregates}
               onGroupingsChange={setGroupedFields}
               onSave={handleDesignerSave}
               isSaving={isSaving}
               onDirtyChange={setDesignerDirty}
               primaryTable={selectedTableId && selectedTableId !== "script" ? selectedTableId : undefined}
               sqlScript={selectedSystemId === "script" ? scriptContent : undefined}
               startInPreview={isPreviewing}
               initialParamValues={memoizedInitialParamValues}
               onClosePreview={() => {
                   if (startInPreview) {
                       handleClose();
                   } else {
                       setIsPreviewing(false);
                   }
               }}
               onPreviewLoadingChange={setDesignerPreviewLoading}
               paperOrientation={reportConfig.paperOrientation}
             />
           )}
        </SimpleForm>
        </div>
        <ConfirmDialog 
           isOpen={showCloseConfirm}
           title="خروج از سیستم"
           message={closeTarget === 'designer' ? "آیا از صفحه طراحی گزارش خارج می‌شوید؟" : "آیا مطمئن هستید که می‌خواهید فرم گزارش‌ساز را ببندید؟ تغییرات ذخیره نشده از بین خواهند رفت."}
           onConfirm={() => {
             setShowCloseConfirm(false);
             if (closeTarget === 'designer') {
               setIsDesigning(false);
             } else {
               handleClose();
             }
           }}
           onCancel={() => setShowCloseConfirm(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full font-sans text-gray-800 bg-gray-50 dark:bg-slate-900 border-0">
      <div className="w-full h-full flex flex-col">
        <SimpleForm
          title="ساخت گزارش جدید"
          icon={<Layout className="w-4 h-4 text-white" />}
          fields={emptyFields}
          values={emptyValues}
          onChange={() => {}}
          onClose={handleWizardClose}
          preventTabClose={true}
          showActions={false}
          actionbar={actionBar}
          className="flex-1 w-full border-0 rounded-none shadow-none flex flex-col bg-transparent"
          contentClassName="p-0 gap-y-0 overflow-hidden"
        >
          {/* Tabs Bar */}
          <div className="bg-gray-100 dark:bg-slate-800 pt-2 px-2 border-b border-gray-300 dark:border-gray-700 flex overflow-x-auto select-none rounded-t-none mx-0 mt-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasData = tableFields.length > 0;
              const isDisabled = tab.id !== "tables" && !hasData;
              
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    if (!isDisabled) setActiveTab(tab.id);
                  }}
                  className={`
                    px-3 py-1.5 text-sm border border-b-0 rounded-t whitespace-nowrap transition-colors
                    ${isActive 
                      ? "bg-[#f0f0f0] dark:bg-slate-900/50 border-gray-300 dark:border-gray-600 relative z-10 text-blue-600 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] font-medium cursor-default" 
                      : isDisabled
                        ? "bg-gray-200 opacity-50 dark:bg-slate-800 border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed mt-1"
                        : "bg-gray-200 dark:bg-slate-700/50 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-slate-600 mt-1 cursor-pointer"}
                  `}
                  style={{ 
                    marginBottom: isActive ? "-1px" : "0",
                    paddingBottom: isActive ? "0.35rem" : "0.25rem",
                    marginLeft: "-1px"
                  }}
                >
                  {tab.label}
                </div>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 bg-[#f0f0f0] dark:bg-slate-900/50 overflow-hidden border-0 shadow-none rounded-none w-full">
            {activeTab === "tables" ? renderTablesTab() : 
             activeTab === "fields" ? renderFieldsTab() : 
             activeTab === "grouping" ? renderGroupingTab() :
             activeTab === "aggregates" ? renderAggregatesTab() :
             activeTab === "structure" ? renderStructureTab() :
             activeTab === "specs" ? renderSpecsTab() : (
               <div className="flex flex-col h-full bg-[#f0f0f0] dark:bg-slate-900/50 pt-0 px-2 pb-2 overflow-hidden gap-2">
                 <div className="flex flex-1 items-center justify-center text-gray-400 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-md">
                   <div className="text-center">
                     <Layout className="w-12 h-12 mx-auto mb-4 opacity-30" />
                     <p className="text-sm shadow-sm p-4 bg-gray-50 dark:bg-slate-800 rounded">محتوای تب "{TABS.find(t => t.id === activeTab)?.label}" در دست توسعه است</p>
                   </div>
                 </div>
               </div>
            )}
          </div>
        </SimpleForm>
      </div>
      
      {/* Formula Name Modal */}
      {showFormulaNameModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center font-tahoma" dir="rtl">
          <div className="bg-white rounded shadow-lg p-4 w-96 flex flex-col gap-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">تعریف فرمول جدید</h3>
            <div>
              <label className="text-sm text-gray-600 block mb-1">عنوان فرمول را وارد کنید:</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded p-2 text-sm outline-none" 
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button 
                onClick={() => setShowFormulaNameModal(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
              >
                انصراف
              </button>
              <button 
                onClick={() => {
                  if (!formulaName.trim()) return;
                  if (formulas.some(f => f.name.trim() === formulaName.trim())) {
                    showToast("یک گزارش نمی تواند عنوان فرمول تکراری داشته باشد.", "error");
                    return;
                  }
                  setShowFormulaNameModal(false);
                  setShowFormulaEditorModal(true);
                }}
                disabled={!formulaName.trim()}
                className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 text-sm"
              >
                تایید
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formula Editor Modal */}
      {showFormulaEditorModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center font-tahoma p-8" dir="rtl">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-full max-h-[80vh] flex flex-col overflow-hidden" onKeyDown={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
              <h3 className="font-bold text-sm">ویرایشگر فرمول: {formulaName}</h3>
              <button onClick={() => setShowFormulaEditorModal(false)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 flex flex-col p-2 gap-2 bg-gray-50 overflow-hidden">
              {/* Action Bar */}
              <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200 shadow-sm">
                <NewButton 
                  onClick={() => {
                    setFormulaName("");
                    setFormulaExpression("");
                    setShowFormulaEditorModal(false);
                    setShowFormulaNameModal(true);
                  }} 
                  hideLabel 
                  disabled={false}
                />
                <SaveButton 
                  onClick={() => {
                    if (formulaName.trim() && formulaExpression.trim()) {
                      setFormulas(prev => [...prev.filter(f => f.name !== formulaName), { name: formulaName, expression: formulaExpression }]);
                      showToast("فرمول با موفقیت ذخیره شد", "success");
                    }
                  }} 
                  hideLabel 
                  disabled={!formulaName.trim() || !formulaExpression.trim()}
                />
                <SaveNewButton 
                  onClick={() => {
                    if (formulaName.trim() && formulaExpression.trim()) {
                      setFormulas(prev => [...prev.filter(f => f.name !== formulaName), { name: formulaName, expression: formulaExpression }]);
                      showToast("فرمول با موفقیت ذخیره شد", "success");
                    }
                    setFormulaName("");
                    setFormulaExpression("");
                    setShowFormulaEditorModal(false);
                    setShowFormulaNameModal(true);
                  }} 
                  hideLabel 
                  disabled={!formulaName.trim() || !formulaExpression.trim()}
                />
                <SaveCloseButton 
                  onClick={() => {
                    if (formulaName.trim() && formulaExpression.trim()) {
                      setFormulas(prev => [...prev.filter(f => f.name !== formulaName), { name: formulaName, expression: formulaExpression }]);
                      showToast("فرمول با موفقیت ذخیره شد", "success");
                    }
                    setShowFormulaEditorModal(false);
                  }} 
                  hideLabel 
                  disabled={!formulaName.trim() || !formulaExpression.trim()}
                />
                
                <div className="flex items-center mr-auto gap-1 bg-white border border-gray-300 rounded px-1 text-gray-700">
                  <button onClick={() => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + "+ ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="جمع (+)">+</button>
                  <button onClick={() => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + "- ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="تفریق (-)">−</button>
                  <button onClick={() => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + "* ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="ضرب (*)">×</button>
                  <button onClick={() => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + "/ ")} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded" title="تقسیم (/)">÷</button>
                </div>
              </div>

              {/* Top Row: Functions & Fields */}
              <div className="flex h-1/2 gap-2">
                {/* Left Box: Functions */}
                <div className="flex-1 bg-white border border-gray-300 flex flex-col overflow-hidden">
                  <div className="bg-gray-100 px-2 py-1 border-b border-gray-300 text-xs font-bold text-gray-700">توابع (Functions)</div>
                  <div className="flex-1 p-2 overflow-auto text-sm text-right font-tahoma custom-scrollbar" dir="rtl">
                      <FormulaFunctionCategory 
                        title="توابع عمومی" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                          { label: "تاریخ گزارش", value: "ReportDate" },
                          { label: "نام سازمان", value: "OrgName" },
                          { label: "شماره صفحه", value: "PageNumber" },
                          { label: "صفحه از صفحه", value: "PageOfPages" }
                        ]} 
                      />
                      <FormulaFunctionCategory 
                        title="توابع تاریخ و زمان" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                            { label: "تاریخ جاری", value: "GETDATE()" },
                            { label: "تاریخ جاری میلادی", value: "GETDATE_GREGORIAN()" },
                            { label: "زمان جاری", value: "GETTIME()" },
                            { label: "(Field) تاریخ شمسی", value: "TODATESHAMSI()" },
                            { label: "(Field) تاریخ میلادی", value: "TODATEGREGORIAN()" },
                            { label: "(D) ساعت", value: "HOUR()" },
                            { label: "(D) سال", value: "YEAR()" },
                            { label: "(D) ماه", value: "MONTH()" },
                            { label: "(D) روز", value: "DAY()" },
                            { label: "(D) نام ماه تاریخ", value: "DATEMONTHNAME()" },
                            { label: "(N) نام ماه", value: "MONTHNAME()" },
                            { label: "(D) تاریخ به حروف", value: "DATETOWORDS()" }
                        ]} 
                      />
                      <FormulaFunctionCategory 
                        title="توابع ریاضی" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                            { label: "(N) قدر مطلق", value: "ABS()" },
                            { label: "(N) مقدار صحیح", value: "INT()" },
                            { label: "(N) روند", value: "ROUND()" },
                            { label: "(N, P) روند", value: "ROUND( , )" },
                            { label: "(N) عدد به حروف", value: "NUMTOWORDS()" },
                            { label: "(N...) جمع", value: "SUM()" },
                            { label: "(N1, N2) تفریق", value: "SUBTRACT()" },
                            { label: "(N1, N2) تقسیم", value: "DIVIDE()" },
                            { label: "(N...) میانگین", value: "AVG()" },
                            { label: "(N...) بیشترین", value: "MAX()" },
                            { label: "(N...) کمترین", value: "MIN()" }
                        ]} 
                      />
                      <FormulaFunctionCategory 
                        title="توابع رشته‌ای" 
                        icon={<Settings className="w-4 h-4 text-yellow-600" fill="currentColor" />}
                        onItemDoubleClick={(val) => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + val)}
                        items={[
                            { label: "(D) تاریخ به رشته", value: "DATETOSTR()" },
                            { label: "(D) عدد به رشته", value: "NUMTOSTR()" },
                            { label: "(S) رشته به عدد", value: "STRTONUM()" },
                            { label: "(S) طول", value: "LEN()" },
                            { label: "(S) تریم", value: "TRIM()" },
                            { label: "(S) تریم چپ", value: "LTRIM()" },
                            { label: "(S) تریم راست", value: "RTRIM()" },
                            { label: "(S) معکوس", value: "REVERSE()" },
                            { label: "(S, Fs, Rs) جایگزینی", value: "REPLACE()" },
                            { label: "(S, n) کاراکترهای سمت چپ", value: "LEFT()" },
                            { label: "(S, n) کاراکترهای سمت راست", value: "RIGHT()" },
                            { label: "(S) مقدار عددی", value: "VAL()" }
                        ]} 
                      />
                  </div>
                </div>
                
                {/* Right Box: Fields */}
                <div className="flex-1 bg-white border border-gray-300 flex flex-col overflow-hidden">
                  <div className="bg-gray-100 px-2 py-1 border-b border-gray-300 text-xs font-bold text-gray-700">فیلدهای گزارش (Database Fields)</div>
                  <div className="flex-1 p-2 overflow-auto text-sm custom-scrollbar">
                      {selectedFields.map((f: any) => (
                          <div 
                            key={f.name} 
                            className="flex items-center gap-1 hover:bg-blue-50 cursor-pointer py-1 text-gray-800 select-none"
                            onDoubleClick={() => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + `{${f.name}}`)}
                          >
                            <span className="font-serif italic text-blue-500 font-bold px-1 text-xs">T</span>
                            <span>{t(`field_${f.name}`, f.name)}</span>
                          </div>
                      ))}
                      {formulas.map((f, i) => (
                          <div 
                            key={`formula_${i}`} 
                            className="flex items-center gap-1 hover:bg-blue-50 cursor-pointer py-1 text-blue-700 select-none"
                            onDoubleClick={() => setFormulaExpression((prev: string) => prev + (prev && !prev.endsWith(" ") ? " " : "") + `f(${f.name})`)}
                          >
                            <span className="font-serif italic text-blue-600 font-bold px-1 text-xs">f(x)</span>
                            <span>{f.name}</span>
                          </div>
                      ))}
                  </div>
                </div>
              </div>
              
              {/* Bottom Area: Formula Editor text area */}
              <div className="flex flex-col flex-1 bg-white border border-gray-300">
                 <div className="bg-gray-100 px-2 py-1 border-b border-gray-300 text-xs font-bold text-gray-700 flex justify-between items-center">
                     <span>متن فرمول</span>
                 </div>
                 <textarea 
                   className="w-full h-full p-2 text-left font-mono text-sm resize-none outline-none custom-scrollbar"
                   dir="ltr"
                   placeholder="Write formula here... (e.g. {Table.FieldName} * 2)"
                   value={formulaExpression}
                   onChange={(e) => setFormulaExpression(e.target.value)}
                   onKeyDown={(e) => e.stopPropagation()}
                 ></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
         isOpen={showCloseConfirm}
         title="خروج از سیستم"
         message={closeTarget === 'designer' ? "آیا از صفحه طراحی گزارش خارج می‌شوید؟" : "آیا مطمئن هستید که می‌خواهید فرم گزارش‌ساز را ببندید؟ تغییرات ذخیره نشده از بین خواهند رفت."}
         onConfirm={() => {
           setShowCloseConfirm(false);
           if (closeTarget === 'designer') {
             setIsDesigning(false);
           } else {
             handleClose();
           }
         }}
         onCancel={() => setShowCloseConfirm(false)}
      />
    </div>
  );
}

