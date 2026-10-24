"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { TabCellRow, TabCellConfig } from "../TabCellRow";
import { SingleSelectDropDown } from "@/components/inputs/SingleSelectDropDown";
import { TextInput } from "@/components/inputs/TextInput";
import { TextArea } from "@/components/inputs/TextArea";
import { SlAccountDropDown } from "@/components/ui/SlAccountDropDown";
import { 
  FileText, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  X,
  HelpCircle,
  Plus,
  Save,
  List,
  Trash2,
  Printer,
  LayoutGrid,
  CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/components/Providers";
import { useToast } from "@/components/ToastProvider";
import { VoucherActionButtons } from "../../buttons/VoucherActionButtons";
import { apiFetch } from "@/lib/utils";
import { ActionButton } from "../../buttons/ActionButton";
import { PrintDropdownButton } from "../../buttons/PrintDropdownButton";

const HelpActionBarItem = ({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) => (
  <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h4>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed pr-2">
      {desc}
    </p>
  </div>
);

// Account hierarchy definition matching Voucher structure
const accountHierarchies: Record<string, { group: string; kol: string; moin: string }> = {
  '10101': {
    group: 'دارایی‌های جاری',
    kol: 'حساب‌های دریافتنی',
    moin: 'حساب‌های دریافتنی تجاری - شعبه مرکز'
  },
  '10202': {
    group: 'دارایی‌های جاری',
    kol: 'موجودی نقد و بانک',
    moin: 'صندوق و موجودی نقد ریالی شرکت'
  },
  '10303': {
    group: 'بدهی‌های غیرجاری',
    kol: 'حساب‌ها و اسناد پرداختنی',
    moin: 'اسناد پرداختنی تجاری بلند مدت'
  },
  '10404': {
    group: 'دارایی‌های غیرجاری',
    kol: 'دارایی‌های نامشهود',
    moin: 'پیش‌پرداخت سرمایه‌ای خرید تجهیزات'
  }
};

// Mapping codes to detailed descriptive Persian titles for footer presentation
const moinTitles: Record<string, string> = {
  '10101': 'حساب‌های دریافتنی تجاری - شعبه مرکز (گروه: دارایی‌های جاری، کل: حساب‌های دریافتنی)',
  '10202': 'صندوق و موجودی نقد ریالی شرکت (گروه: دارایی‌های جاری، کل: موجودی نقد و بانک)',
  '10303': 'اسناد پرداختنی تجاری بلند مدت (گروه: بدهی‌های غیرجاری، کل: حساب‌ها و اسناد پرداختنی)',
  '10404': 'پیش‌پرداخت سرمایه‌ای خرید تجهیزات (گروه: دارایی‌های غیرجاری، کل: دارایی‌های نامشهود)'
};

const tafsilTitles: Record<string, string> = {
  '201': 'شرکت مهندسی پارسا سیستم آریا (سهامی خاص)',
  '202': 'امید احمدی (کارشناس ارشد واحد مالی)',
  '203': 'بانک ملی ایران - شعبه مرکزی تهران',
  '204': 'خریداران جزء و متفرقه خدمات فنی'
};

const level5Titles: Record<string, string> = {
  '501': 'پروژه احداث و تجهیز مرکز خرید نگین تهران',
  '502': 'پروژه هوشمندسازی و طراحی مجتمع اداری آریا'
};

const level6Titles: Record<string, string> = {
  '601': 'فعالیت‌های آماده‌سازی بستر، نصب و راه‌اندازی تجهیزات شبکه',
  '602': 'هزینه‌های عمومی پشتیبانی فنی، ایاب و ذهاب و اقامت پرسنل'
};

// Dataset dictionary mapped by active fiscal year keys
const fiscalYearData: Record<string, any[]> = {
  '1405': [
    {
      moinCode: '10101',
      tafsilCode: '201',
      level5: '501',
      level6: '601',
      accountNature: 'بدهکار پایان دوره',
      balance: 150000000,
      balanceNature: 'بستانکار',
      counterpartyAccount: ''
    },
    {
      moinCode: '10202',
      tafsilCode: '202',
      level5: '502',
      level6: '602',
      accountNature: 'بدهکار پایان دوره',
      balance: 75000000,
      balanceNature: 'بستانکار',
      counterpartyAccount: ''
    },
    {
      moinCode: '10303',
      tafsilCode: '203',
      level5: '501',
      level6: '602',
      accountNature: 'بستانکار پایان دوره',
      balance: 220000000,
      balanceNature: 'بدهکار',
      counterpartyAccount: ''
    }
  ],
  '1404': [
    {
      moinCode: '10101',
      tafsilCode: '201',
      level5: '501',
      level6: '601',
      accountNature: 'بدهکار پایان دوره',
      balance: 90000000,
      balanceNature: 'بستانکار',
      counterpartyAccount: ''
    },
    {
      moinCode: '10404',
      tafsilCode: '204',
      level5: '502',
      level6: '602',
      accountNature: 'بدهکار پایان دوره',
      balance: 30000000,
      balanceNature: 'بستانکار',
      counterpartyAccount: ''
    }
  ],
  '1403': [
    {
      moinCode: '10303',
      tafsilCode: '203',
      level5: '501',
      level6: '602',
      accountNature: 'بستانکار پایان دوره',
      balance: 110000000,
      balanceNature: 'بدهکار',
      counterpartyAccount: ''
    }
  ]
};

export default function NatureAdjustmentVoucher() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [activeFiscalYearId, setActiveFiscalYearId] = useState<string>('');
  const [activeYearTitle, setActiveYearTitle] = useState<string>('۱۴۰۵');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [detailedLevelsCount, setDetailedLevelsCount] = useState<number>(3);

  const [values, setValues] = useState<Record<string, any>>({
    voucherType: { id: '1', code: '01', title: 'سند تعدیل ماهیت پایان دوره' },
    voucherNumber: '',
    referenceNumber: 'REF-889',
    voucherDate: '',
    voucherStatus: 'ثبت اولیه',
    description: ''
  });

  const [gridData, setGridData] = useState<Record<string, any[]>>({
    'adjustment-lines': []
  });

  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(0);
  const [activeRowData, setActiveRowData] = useState<any>(null);

  // Load fiscal years from API and listen to footer year changes
  useEffect(() => {
    apiFetch('/api/common/fiscalyear')
      .then(res => {
        if (res.ok) return res.json();
        return [];
      })
      .then(data => {
        if (Array.isArray(data)) {
          setFiscalYears(data);
        }
      })
      .catch(() => {});
      
    apiFetch('/api/common/base-settings/tab/2')
      .then(res => {
        if (res.ok) return res.json();
        return {};
      })
      .then(resData => {
        if (resData.success && resData.data && resData.data.detailedLevelsCount !== undefined) {
          setDetailedLevelsCount(parseInt(resData.data.detailedLevelsCount, 10));
        }
      })
      .catch(() => {});
    const saved = localStorage.getItem('app-fiscal-year') || '';
    setActiveFiscalYearId(saved);

    const handleStorageChange = () => {
      const active = localStorage.getItem('app-fiscal-year') || '';
      setActiveFiscalYearId(active);
    };
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(() => {
      const active = localStorage.getItem('app-fiscal-year') || '';
      if (active !== activeFiscalYearId) {
        setActiveFiscalYearId(active);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeFiscalYearId]);

  // Determine active year title and auto-reload contrary balances
  useEffect(() => {
    const activeYearObj = fiscalYears.find(fy => String(fy.fiscalYearID || fy.id) === String(activeFiscalYearId));
    const title = activeYearObj ? activeYearObj.title : '۱۴۰۵';
    setActiveYearTitle(title);

    setIsAnalyzing(true);
    if (!activeFiscalYearId) {
      setIsAnalyzing(false);
      return;
    }
    
    apiFetch(`/api/accounting/nature-adjustment/contrary-balances?fiscalYearId=${activeFiscalYearId}`)
      .then(res => res.json())
      .then(resData => {
        if (resData.success && resData.data) {
          const loadedLines = resData.data;
          setGridData({
            'adjustment-lines': loadedLines
          });
          if (loadedLines.length > 0) {
            setActiveRowIndex(0);
            setActiveRowData(loadedLines[0]);
          } else {
            setActiveRowIndex(null);
            setActiveRowData(null);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        setIsAnalyzing(false);
      });
  }, [activeFiscalYearId, fiscalYears]);

  const handleFieldChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleGridChange = (newData: any) => {
    setGridData(newData);
    const rows = newData['adjustment-lines'] || [];
    if (activeRowIndex !== null && activeRowIndex < rows.length) {
      setActiveRowData(rows[activeRowIndex]);
    }
  };

  const handleActiveRowChange = (tabId: string, rowIndex: number | null, rowData: any) => {
    setActiveRowIndex(rowIndex);
    setActiveRowData(rowData);
  };

  const handleSave = async () => {
    const lines = gridData['adjustment-lines'] || [];
    if (lines.length === 0) {
      showToast("رکوردی جهت ذخیره وجود ندارد", "error");
      return;
    }
    
    // Check if any line has an empty counterpartyAccount
    const missing = lines.find((l: any) => !l.counterpartyAccount || l.counterpartyAccount.trim() === '');
    if (missing) {
      showToast("لطفا حساب مقابل را برای تمامی ردیف‌ها مشخص کنید", "error");
      return;
    }

    try {
      const res = await apiFetch('/api/accounting/nature-adjustment/save', {
        method: 'POST',
        body: JSON.stringify({
          fiscalYearId: activeFiscalYearId,
          voucherDate: values.voucherDate,
          lines: lines
        })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "سند تعدیل ماهیت با موفقیت ذخیره شد.", "success");
        setGridData({ 'adjustment-lines': [] });
        const currentActive = activeFiscalYearId;
        setActiveFiscalYearId('');
        setTimeout(() => setActiveFiscalYearId(currentActive), 100);
      } else {
        showToast(resData.message || "خطا در ذخیره اطلاعات", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("خطای شبکه", "error");
    }
  };

  const fields: FieldConfig[] = [
    {
      name: "voucherType",
      label: "نوع سند",
      type: "custom" as const,
      customComponent: (
        <SingleSelectDropDown
          columns={[
            { key: 'code', label: 'کد نوع سند' },
            { key: 'title', label: 'عنوان سند' },
          ]}
          data={[
            { id: '1', code: '01', title: 'سند تعدیل ماهیت پایان دوره' },
            { id: '2', code: '02', title: 'سند بستن حساب‌ها (کلان)' }
          ]}
          displayKey="title"
          value={values.voucherType}
          onChange={(item: any) => handleFieldChange('voucherType', item)}
          placeholder="انتخاب نوع سند..."
          disabled={true}
        />
      ),
      required: true,
      colSpan: 1
    },
    {
      name: "voucherNumberAndDateGroup",
      type: "custom" as const,
      colSpan: 1,
      customComponent: (
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <TextInput
              label="شماره سند :"
              value={values.voucherNumber}
              disabled={true}
              labelWidth="70px"
              alignVertical={false}
            />
          </div>
          <div className="flex-1">
            <TextInput
              label="تاریخ سند :"
              value={values.voucherDate}
              disabled={true}
              labelWidth="70px"
              alignVertical={false}
            />
          </div>
        </div>
      )
    },
    {
      name: "description",
      label: "",
      type: "custom" as const,
      colSpan: 2,
      customComponent: (
        <TextArea
          label="شرح سند :"
          value={values.description || ''}
          onChange={(val: string) => handleFieldChange('description', val)}
          placeholder="شرح یا توضیحات سند تعدیل ماهیت را وارد کنید..."
          rows={2}
          labelWidth="70px"
          alignVertical={false}
        />
      )
    }
  ];

  // Helper renderer for read-only cells to completely prevent editing
  const renderReadOnly = (getter: (row: any) => any, alignRight?: boolean) => {
    const ReadOnlyCell = (row: any) => (
      <div className={`px-2 py-[5px] text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 h-full flex items-center ${alignRight ? 'justify-end font-mono' : ''} select-text`}>
        {getter(row)}
      </div>
    );
    ReadOnlyCell.displayName = "ReadOnlyCell";
    return ReadOnlyCell;
  };

  const gridTabs: TabCellConfig[] = [
    {
      id: 'adjustment-lines',
      label: 'اقلام سند تعدیل ماهیت',
      columns: [
        {
          key: 'moinCode',
          header: 'کد معین',
          width: '80px',
          render: renderReadOnly(row => row.moinCode)
        },
        ...Array.from({ length: detailedLevelsCount }).map((_, i) => {
          const k = i === 0 ? 'tafsilCode' : `level${i + 4}`;
          return {
            key: k,
            header: `تفصیل ${i + 1}`,
            width: '80px',
            render: renderReadOnly((row: any) => row[k])
          };
        }),
        {
          key: 'accountNature',
          header: 'ماهیت تعریف شده معین',
          width: '180px',
          render: (row) => (
            <div className="px-2 py-[5px] text-[11px] h-full flex items-center bg-slate-50/50 dark:bg-slate-900/40 select-none">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                {row.accountNature}
              </span>
            </div>
          )
        },
        {
          key: 'currencyTitle',
          header: 'ارز',
          width: '100px',
          render: (row) => (
            <div className="px-2 py-[5px] text-[11px] h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 select-text font-medium">
              {row.currencyTitle || 'ریال'}
            </div>
          )
        },
        {
          key: 'balance',
          header: 'مانده پایان دوره',
          width: '160px',
          render: (row) => {
            const val = row.balance;
            const formatted = typeof val === 'number' ? val.toLocaleString('en-US') : val;
            return (
              <div className="px-2 py-[5px] text-[11px] font-mono text-left bg-slate-50/50 dark:bg-slate-900/40 h-full flex items-center justify-end select-all text-slate-600 dark:text-slate-300">
                {formatted}
              </div>
            );
          }
        },
        {
          key: 'balanceNature',
          header: 'ماهیت مانده واقعی',
          width: '180px',
          render: (row) => (
            <div className="px-2 py-[5px] text-[11px] h-full flex items-center bg-slate-50/50 dark:bg-slate-900/40 select-none">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 animate-pulse">
                {row.balanceNature} (خلاف ماهیت)
              </span>
            </div>
          )
        },
        {
          key: 'counterpartyAccount',
          header: 'حساب مقابل (اصلاحی) *',
          width: '240px',
          required: true,
          render: (row, rowIndex, onChange) => {
            const allowed = row.allowedCounterparties || [];
            const currentObj = row.counterpartyAccountObj || allowed.find((a: any) => a.code === row.counterpartyAccount) || (row.counterpartyAccount ? { code: row.counterpartyAccount, title: '' } : null);
            return (
              <div className="p-0.5 h-full flex items-center bg-transparent w-full">
                <SlAccountDropDown
                  value={currentObj}
                  onChange={(item: any) => {
                    onChange(item ? item.code : '');
                    row.counterpartyAccountObj = item;
                  }}
                  data={allowed.length > 0 ? allowed : undefined}
                  dropdownPlacement="auto"
                />
              </div>
            );
          }
        }
      ]
    }
  ];

  // Resolve descriptions from codes for the active row matching the requested structure
  const activeMoin = activeRowData?.moinCode || '';
  const hierarchy = accountHierarchies[activeMoin] || { group: '', kol: '', moin: '' };
  
  const groupValue = activeRowData?.groupTitle || hierarchy.group;
  const kolValue = activeRowData?.kolTitle || hierarchy.kol;
  const moinValue = activeRowData?.moinTitle || hierarchy.moin || (activeMoin ? `معین کد ${activeMoin}` : '');

  const tafsil1Value = activeRowData?.tafsilTitle || (activeRowData?.tafsilCode ? (tafsilTitles[activeRowData.tafsilCode] || `تفصیل کد ${activeRowData.tafsilCode}`) : '');
  const tafsil2Value = activeRowData?.level5Title || (activeRowData?.level5 ? (level5Titles[activeRowData.level5] || `سطح پنجم کد ${activeRowData.level5}`) : '');
  const tafsil3Value = activeRowData?.level6Title || (activeRowData?.level6 ? (level6Titles[activeRowData.level6] || `سطح ششم کد ${activeRowData.level6}`) : '');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#12131a] overflow-hidden">
      <SimpleFormTwoRow
        title="سند تعدیل ماهیت"
        icon={<FileText className="w-5 h-5 text-indigo-500" />}
        fields={fields}
        values={values}
        onChange={handleFieldChange}
        labelWidth="110px"
        showActions={true}
        useClassicToolbar={false}
        onSave={handleSave}
        onHelp={() => setIsHelpOpen(true)}
        showListButton={false}
        showLoadingOverlay={isAnalyzing}
        actionbar={
          <div className="flex items-center gap-1.5 border-r border-gray-200 dark:border-gray-700 pr-4 mr-2">
            <VoucherActionButtons 
              action="insert" 
              onClick={handleSave} 
            />
            <VoucherActionButtons 
              action="view" 
              onClick={() => showToast("نمایش سند حسابداری صادر شده...", "info")} 
            />
            <VoucherActionButtons 
              action="delete" 
              onClick={() => showToast("سند حسابداری مربوطه حذف گردید.", "success")} 
            />
            <PrintDropdownButton
              targetForm="NatureAdjustmentVoucher"
              onPrint={(reportId) => {
                if (reportId) {
                  showToast(`در حال آماده‌سازی و ارسال قالب چاپ انتخابی به چاپگر...`, "info");
                } else {
                  showToast("در حال آماده‌سازی و ارسال سند حسابداری به چاپگر...", "info");
                }
              }}
            />
          </div>
        }
      >
        {/* Main Grid Wrapper */}
        <div 
          className="mx-[2px] border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden flex flex-col relative z-10 bg-white dark:bg-[#1a1c23] shadow-sm"
          style={{ height: 'calc(100vh - 365px)', minHeight: '300px' }}
        >
          <TabCellRow
            tabs={gridTabs}
            value={gridData}
            onChange={handleGridChange}
            onActiveRowChange={handleActiveRowChange}
            hideHeader={true}
            hideAddButton={true}
            hideDeleteButton={true}
            condensed={true}
          />
        </div>

        {/* Dynamic Descriptive Footer Panel - Styled exactly like Voucher.tsx footer */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mt-4 mx-[2px] p-4 rounded-lg shadow-sm">
          <div className="w-full">
            <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-2 items-center">
              
              {/* Row 1 */}
              <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">گروه حساب:</label>
              <TextInput disabled value={groupValue} onChange={() => {}} />
              
              <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">عنوان تفصیلی ۱:</label>
              <TextInput disabled value={tafsil1Value} onChange={() => {}} />

              {/* Row 2 */}
              <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">حساب کل:</label>
              <TextInput disabled value={kolValue} onChange={() => {}} />
              
              <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">عنوان تفصیلی ۲:</label>
              <TextInput disabled value={tafsil2Value} onChange={() => {}} />

              {/* Row 3 */}
              <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">حساب معین:</label>
              <TextInput disabled value={moinValue} onChange={() => {}} />
              
              <label className="text-[11px] text-gray-700 dark:text-gray-300 whitespace-nowrap justify-self-end">عنوان تفصیلی ۳:</label>
              <TextInput disabled value={tafsil3Value} onChange={() => {}} />

            </div>
          </div>
        </div>
      </SimpleFormTwoRow>

      {/* Styled Help Guide Dialog */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsHelpOpen(false)}>
          <div 
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200/50 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex bg-white dark:bg-gray-900 items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                  <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    راهنمای سند تعدیل ماهیت
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    قوانین و راهنمای کاربری اصلاح ماهیت حساب‌های معین
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 rtl text-right">
              <div className="space-y-8">
                
                {/* Universal Action Bar Guide Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <LayoutGrid className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      امکانات نوار ابزار (عمومی)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <HelpActionBarItem 
                      icon={Plus} 
                      title="جدید (+)" 
                      desc="پاک کردن فرم و آماده‌سازی برای ثبت اطلاعات و یک رکورد جدید."
                      color="text-emerald-600 dark:text-emerald-400 bg-emerald-500" 
                    />
                    <HelpActionBarItem 
                      icon={List} 
                      title="لیست اطلاعات" 
                      desc="باز کردن فهرستی از رکوردهای قبلی ثبت شده مرتبط با این فرم جهت جستجو."
                      color="text-blue-600 dark:text-blue-400 bg-blue-500" 
                    />
                    <HelpActionBarItem 
                      icon={Save} 
                      title="ذخیره" 
                      desc="اطلاعات وارد شده را ثبت کرده و شما را در همین صفحه نگه می‌دارد."
                      color="text-indigo-600 dark:text-indigo-400 bg-indigo-500" 
                    />
                    <HelpActionBarItem 
                      icon={CheckCircle2} 
                      title="ذخیره و جدید" 
                      desc="بلافاصله پس از ذخیره موفق، فرم را برای ثبت رکورد بعدی خالی می‌کند."
                      color="text-teal-600 dark:text-teal-400 bg-teal-500" 
                    />
                    <HelpActionBarItem 
                      icon={Trash2} 
                      title="حذف (زباله‌دان)" 
                      desc="در صورت عدم استفاده از این رکورد در سایر بخش‌ها، آن را حذف می‌کند."
                      color="text-red-600 dark:text-red-400 bg-red-500" 
                    />
                    <HelpActionBarItem 
                      icon={Printer} 
                      title="چاپ / پرینت" 
                      desc="پس از ذخیره امکان چاپ فرم فعلی در قالب‌های مختلف را فراهم می‌کند."
                      color="text-purple-600 dark:text-purple-400 bg-purple-500" 
                    />
                  </div>
                </section>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Form-specific Guide Section */}
                <section>
                  <div className="flex items-center gap-2 mb-5">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      راهنمای اختصاصی فرم
                    </h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800/80 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-4">
                    
                    {/* The Orange Banner rendered EXACTLY with original styles inside the guide */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-3 shadow-sm text-right">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-amber-700 dark:text-amber-400 mt-0.5 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-xs text-amber-900 dark:text-amber-200 leading-6">
                        <div className="font-bold text-sm mb-1 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                          <span>قانون کنترل و بررسی ماهیت حساب‌های معین در پایان دوره مالی</span>
                          {isAnalyzing && <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
                        </div>
                        <p>
                          سیستم به صورت خودکار کدینگ حساب‌های معین را پایش کرده و معین‌هایی که دارای ماهیت <strong className="text-amber-700 dark:text-amber-400 font-bold">«بدهکار پایان دوره»</strong> یا <strong className="text-amber-700 dark:text-amber-400 font-bold">«بستانکار پایان دوره»</strong> هستند را اعتبارسنجی می‌کند. 
                          در صورتی که مانده واقعی این حساب‌ها در پایان سال مالی فعال (<span className="font-bold underline text-amber-700 dark:text-amber-400">{activeYearTitle}</span>)، خلاف ماهیت تعیین‌شده باشد، ردیف‌های مغایرت معین و تفصیلی به صورت خودکار جهت تعدیل و تصفیه به این فرم فرستاده می‌شوند.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-amber-100/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-md font-medium">
                             دوره مالی فعال: {activeYearTitle}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-red-100/70 dark:bg-red-950/60 text-red-800 dark:text-red-300 px-2.5 py-1 rounded-md font-medium">
                             تعداد موارد مغایر یافت شده: {gridData['adjustment-lines']?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional helpful explanation on how to use the form */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 leading-loose pt-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-[15px]">💡 نحوه استفاده و ثبت سند تعدیل ماهیت:</p>
                      <ol className="list-decimal list-inside space-y-2 pr-1">
                        <li>بر اساس مغایرت‌های پایش شده، ردیف‌های خلاف ماهیت در جدول به شما نمایش داده می‌شوند.</li>
                        <li>کاربر باید در ستون <strong className="text-indigo-600 dark:text-indigo-400 font-bold">«حساب مقابل (اصلاحی)»</strong>، حساب معین مورد نظر جهت صدور سند تعدیل را مشخص و تایپ نماید.</li>
                        <li>پس از تکمیل حساب مقابل برای ردیف‌ها، با کلیک بر روی دکمه <strong className="text-indigo-600 dark:text-indigo-400 font-bold">ذخیره</strong> در نوار ابزار بالا، سیستم اقدام به ثبت اطلاعات و تایید مغایرت‌ها می‌کند.</li>
                      </ol>
                    </div>

                  </div>
                </section>

              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end bg-white dark:bg-gray-900 rounded-b-2xl">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-medium text-sm"
              >
                تایید و بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
