'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActionButton } from '@/components/buttons/ActionButton';
import { SimpleFormTwoRow, FieldConfig } from '@/components/forms/SimpleFormTwoRow';
import { TabCellRow, TabCellConfig } from '@/components/forms/TabCellRow';
import { Save, Filter, FileUp, List, FileText } from "lucide-react";
import { BankAccountDropDown } from '@/components/inputs';
import { TextArea } from '@/components/inputs/TextArea';
import { TextInput } from '@/components/inputs/TextInput';
import { DateInput } from '@/components/inputs/DateInput';
import { NumberInput } from '@/components/inputs/NumberInput';
import { AmountInput } from '@/components/inputs/AmountInput';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { useFormUpsert } from '@/hooks/useFormUpsert';
import { useFormUsageCheck } from '@/hooks/useFormUsageCheck';
import { apiFetch, toEnglishDigits, jalaliToGregorianISO, gregorianToJalaliDisplay } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import momentJalaali from 'moment-jalaali';
import momentHijri from 'moment-hijri';
import moment from 'moment';
import { useLanguage } from '@/components/Providers';
import { useBankStatementColumns } from "./BankStatementList";

interface BankStatementFormProps {
  id?: string;
  initialData?: any;
}

export default function BankStatementForm({ id, initialData }: BankStatementFormProps) {
  const rawListColumns = useBankStatementColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { language } = useLanguage();
  const { addTab, removeTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, isUpdate, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("ReconcileBankStatement", activeId);
  const [isLoading, setIsLoading] = useState(false);

  const [values, setValues] = useState<Record<string, any>>({
    Date: new Date().toISOString(),
    ...initialData
  });
  const [gridData, setGridData] = useState<Record<string, any[]>>({
    items: initialData?.items || []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchNextNumber = async (date: any) => {
    try {
      let dateParam = '';
      if (date && typeof date === 'string' && date.length >= 10) {
        const clean = toEnglishDigits(date).trim();
        const parts = clean.includes('-') ? clean.split('-') : clean.split('/');
        if (parts.length >= 3) {
          const year = parseInt(parts[0], 10);
          if (year > 1900 && year < 2200) {
            const m = moment(`${parts[0]}-${parts[1]}-${parts[2]}`, 'YYYY-MM-DD');
            if (m.isValid()) dateParam = momentJalaali(m).format('jYYYY/jMM/jDD');
          } else if (year >= 1300 && year <= 1500) {
            try {
              const m = momentJalaali(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD', true);
              if (m.isValid()) dateParam = `${parts[0]}/${parts[1]}/${parts[2]}`;
            } catch (err) {
              console.error("Invalid Jalaali date format:", err);
            }
          }
        }
      }
      if (!dateParam) return;
      const res = await apiFetch(`/api/rap/reconcile-bank-statements/next-numbers?date=${dateParam}`);
      if (res.ok) {
        const data = await res.json();
        setValues(prev => ({
          ...prev,
          Number: data.documentNumber,
        }));
      }
    } catch (e) {
      console.error("fetchNextNumber error:", e);
    }
  };

  const fetchSuggestedDates = async (bankAccountRef: number) => {
    try {
      const res = await apiFetch(`/api/rap/reconcile-bank-statements/suggested-dates?bankAccountRef=${bankAccountRef}`);
      if (res.ok) {
        const data = await res.json();
        setValues(prev => ({
          ...prev,
          fromDate: data.fromDate,
          previousBalance: data.previousBalance,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!activeId) {
      fetchNextNumber(values.Date);
    }
  }, []);

  useEffect(() => {
    if (activeId && !initialData) {
      setIsLoading(true);
      apiFetch(`/api/rap/reconcile-bank-statements/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setValues(item);
          if (item.items) {
            setGridData({ items: item.items });
          }
        })
        .catch(err => {
          console.error(err);
          showToast('خطا در دریافت اطلاعات', 'error');
        })
        .finally(() => setIsLoading(false));
    }
  }, [activeId, initialData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      // Dynamic import: xlsx is large; load it only when a file is actually parsed.
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const findInRow = (row: any, keys: string[]) => {
        for (const k of keys) {
          if (row[k] !== undefined) return row[k];
        }
        return undefined;
      };

      const parseNum = (val: any) => {
        if (val === undefined || val === null || val === '') return 0;
        if (typeof val === 'number') return val;
        let str = String(val)
          .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
          .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
        str = str.replace(/,/g, '');
        const parsed = parseFloat(str);
        return isNaN(parsed) ? 0 : parsed;
      };

      const ensureGregorian = (rawDate: string) => {
        if (!rawDate) return '';
        const digits = toEnglishDigits(rawDate);
        if (digits.includes('/')) {
          try { return jalaliToGregorianISO(digits); } catch { return digits; }
        }
        return digits;
      };

      const newItems = jsonData.map((row: any) => {
        const rawDate = String(findInRow(row, ['VoucherDate', 'تاریخ سند', 'DocumentDate']) || '');
        return {
          documentNumber: String(findInRow(row, ['VoucherNumber', 'شماره سند', 'DocumentNumber']) || ''),
          documentDate: ensureGregorian(rawDate),
          debit: parseNum(findInRow(row, ['Debit', 'بدهکار'])),
          credit: parseNum(findInRow(row, ['Credit', 'بستانکار'])),
          description: String(findInRow(row, ['Description', 'شرح']) || ''),
        };
      });

      setGridData(prev => ({
        ...prev,
        items: [...(prev.items || []), ...newItems]
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFieldChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const fields: FieldConfig[] = [
    {
      name: 'bankAccount',
      label: 'حساب بانکی',
      type: 'custom',
      required: true,
      colSpan: 1,
      customComponent: (
        <div style={{ minWidth: 200, width: "100%", height: "25px" }}>
          <BankAccountDropDown
            value={values.bankAccount || null}
            disabled={isUsed}
            onChange={(selected: any) => {
              const accountId = selected ? (selected.bankAccountId || selected.id) : null;
              handleFieldChange('BankAccountRef', accountId);
              handleFieldChange('bankAccount', selected);
              if (accountId) {
                fetchSuggestedDates(accountId);
              }
            }}
            placeholder="انتخاب..."
          />
        </div>
      ),
    },
    {
      name: 'number_and_date',
      label: 'شماره', 
      type: 'custom',
      colSpan: 1,
      required: true,
      customComponent: (
        <div className="flex w-full gap-2 lg:gap-4 items-start">
          <div className="flex-1">
             <NumberInput 
                value={values.Number || ''} 
                onChange={(val) => handleFieldChange('Number', val)} 
                required 
                disabled={isUsed}
             />
          </div>
          <div className="flex-1">
             <DateInput 
                label="تاریخ" 
                labelWidth="40px" 
                value={values.Date || ''} 
                onChange={(val) => {
                  handleFieldChange('Date', val);
                  if (!activeId) fetchNextNumber(val);
                }} 
                required 
                disabled={isUsed}
             />
          </div>
        </div>
      )
    },
    {
      name: 'balance_and_date',
      label: 'مانده قبلی', 
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex w-full gap-2 lg:gap-4 items-start">
          <div className="flex-1">
             <AmountInput 
                value={values.previousBalance || 0} 
                onChange={() => {}}
                disabled={true}
             />
          </div>
          <div className="flex-1">
             <DateInput 
                label="از تاریخ" 
                labelWidth="50px" 
                value={values.fromDate || ''} 
                onChange={() => {}}
                disabled={true}
             />
          </div>
        </div>
      )
    },
    {
      name: 'currency',
      label: 'نوع ارز',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <TextInput
          value={values.bankAccount?.currency?.title || values.bankAccount?.currency?.currencyTitle || values.currency || ''}
          onChange={() => {}}
          disabled={true}
        />
      )
    }
  ];

  const gridTabs: TabCellConfig[] = [
    {
      id: 'items',
      label: 'اقلام',
      columns: [
        { key: 'documentNumber', header: 'شماره سند', type: 'text', width: '150px' },
        { 
          key: 'documentDate', 
          header: 'تاریخ سند *', 
          type: 'custom', 
          width: '150px',
          render: (row, rowIndex, onChange) => (
            <DateInput 
              value={row.documentDate || ''} 
              onChange={(val) => {
                onChange(val);
              }} 
              className="h-full w-full border-none pl-7 pr-1 text-[11px] hover:border-none focus:border-none focus:ring-0 focus:outline-none bg-transparent m-0 shadow-none ring-0 focus:bg-white/50 dark:focus:bg-black/20"
            />
          )
        },
        { key: 'debit', header: 'بدهکار *', type: 'amount', width: '200px', precision: 0 },
        { key: 'credit', header: 'بستانکار *', type: 'amount', width: '200px', precision: 0 },
        { key: 'description', header: 'شرح', type: 'text', width: 'auto' },
      ],
    }
  ];

  const handleGridChange = (value: any) => {
    const items = Array.isArray(value) ? value : (value?.items || []);
    const newItems = items.map((item: any, idx: number) => {
      const prevItem = gridData.items?.[idx];
      if (!prevItem) return item;

      let debit = item.debit;
      let credit = item.credit;

      const currentDebit = parseFloat(String(item.debit).replace(/,/g, '')) || 0;
      const currentCredit = parseFloat(String(item.credit).replace(/,/g, '')) || 0;
      const oldDebit = parseFloat(String(prevItem.debit).replace(/,/g, '')) || 0;
      const oldCredit = parseFloat(String(prevItem.credit).replace(/,/g, '')) || 0;

      if (currentDebit !== oldDebit && currentDebit > 0) {
        credit = 0;
      } else if (currentCredit !== oldCredit && currentCredit > 0) {
        debit = 0;
      }

      return { ...item, debit, credit };
    });

    setGridData({ items: newItems });
  };

  const tDebit = (gridData.items || []).reduce((sum, item) => sum + (parseFloat(String(item.debit).replace(/,/g, '')) || 0), 0);
  const tCredit = (gridData.items || []).reduce((sum, item) => sum + (parseFloat(String(item.credit).replace(/,/g, '')) || 0), 0);
  const prevBal = parseFloat(String(values.previousBalance).replace(/,/g, '')) || 0;
  const currentBalance = prevBal + tCredit - tDebit;

  const footerActions = (
    <div className="flex flex-1 items-center justify-end gap-8 px-4 text-[13px] font-bold text-gray-700 dark:text-gray-300">
      <span className="flex gap-2 text-emerald-700 dark:text-emerald-400">
        <span>مانده:</span>
        <span className="font-mono">{currentBalance.toLocaleString('en-US')}</span>
      </span>
    </div>
  );

  const handleSave = async (closeAfter: boolean = false, newAfter: boolean = false) => {
    if (!values.BankAccountRef || !values.Number || !values.Date) {
      showToast("لطفا حساب بانکی، شماره و تاریخ را پر کنید", "error");
      return;
    }

    const items = gridData.items || [];
    const headerDateStr = values.Date ? (jalaliToGregorianISO(values.Date) || values.Date)?.split('T')[0] : '';

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      if (!item.documentDate || !String(item.documentDate).trim()) {
        showToast(`ورود تاریخ سند در ردیف ${rowNum} اجباری است`, "error");
        return;
      }

      const itemDateStr = item.documentDate ? (jalaliToGregorianISO(item.documentDate) || item.documentDate)?.split('T')[0] : '';
      if (headerDateStr && itemDateStr && itemDateStr > headerDateStr) {
        showToast(`تاریخ سند در ردیف ${rowNum} نباید از تاریخ صورتحساب (هدر فرم) بزرگتر باشد`, "error");
        return;
      }

      const debitVal = parseFloat(String(item.debit || 0).replace(/,/g, '')) || 0;
      const creditVal = parseFloat(String(item.credit || 0).replace(/,/g, '')) || 0;

      if (debitVal <= 0 && creditVal <= 0) {
        showToast(`ورود یکی از مقادیر بدهکار یا بستانکار در ردیف ${rowNum} اجباری است`, "error");
        return;
      }
    }

    try {
      const tDebit = (gridData.items || []).reduce((sum, item) => sum + (parseFloat(String(item.debit).replace(/,/g, '')) || 0), 0);
      const tCredit = (gridData.items || []).reduce((sum, item) => sum + (parseFloat(String(item.credit).replace(/,/g, '')) || 0), 0);
      const prevBal = parseFloat(String(values.previousBalance).replace(/,/g, '')) || 0;
      const currentBalance = prevBal + tCredit - tDebit;

      const payload = {
        ...values,
        Date: jalaliToGregorianISO(values.Date) || values.Date,
        fromDate: jalaliToGregorianISO(values.fromDate) || values.fromDate,
        BankAccountRef: values.BankAccountRef ? Number(values.BankAccountRef) : null,
        fiscalYearRef: values.fiscalYearRef ? Number(values.fiscalYearRef) : (values.fiscalYearId ? Number(values.fiscalYearId) : null),
        previousBalance: prevBal,
        balance: currentBalance,
        items: (gridData.items || []).map((item: any) => ({
          ...item,
          documentDate: jalaliToGregorianISO(item.documentDate) || item.documentDate,
          debit: parseFloat(String(item.debit).replace(/,/g, '')) || 0,
          credit: parseFloat(String(item.credit).replace(/,/g, '')) || 0,
          ReconcileBankStatementItemID: item.ReconcileBankStatementItemID ? Number(item.ReconcileBankStatementItemID) : undefined,
          ReconcileBankStatementRef: item.ReconcileBankStatementRef ? Number(item.ReconcileBankStatementRef) : undefined,
        }))
      };

      const res = await apiFetch(getUrl('/api/rap/reconcile-bank-statements'), {
        method,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const savedItem = data.data || data;
        handleResponse(data, 'ReconcileBankStatementID');
        
        // Update state with saved data to get IDs
        setValues(prev => ({ ...prev, ...savedItem }));
        if (savedItem.items) {
          setGridData({ items: savedItem.items });
        }

        showToast("با موفقیت ذخیره شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'ReconcileBankStatement' });
        
        if (closeAfter) {
          removeTab(`BankStatementForm-${activeId || 'new'}`);
        } else if (newAfter) {
          setActiveId(undefined);
          setValues({ Date: new Date().toISOString() });
          setGridData({ items: [] });
          window.history.pushState({}, '', '/forms/rap/bank-statement-new');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "خطا در ذخیره اطلاعات", "error");
      }
    } catch (err: any) {
      showToast("خطای ارتباط با سرور", "error");
    }
  };

  const handleDelete = async (actionType: string = 'delete') => {
    if (!activeId) return;
    try {
      const res = await apiFetch(`/api/rap/reconcile-bank-statements/${activeId}`, { method: 'DELETE' });
      if (res.ok) {
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'ReconcileBankStatement' });
        // The SimpleFormTwoRow parent will handle the post-delete action (closing or calling onNew)
        // based on the actionType if we don't handle it here. 
        // But BankStatement might want to handle it explicitly if it doesn't trust the parent.
        // Actually, simpleFormTwoRow calls showToast and then onNew/removeTab.
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "خطا در حذف", "error");
        throw new Error(err.message || "DELETE_FAILED"); // Re-throw to prevent parent from closing
      }
    } catch (e: any) {
      if (e.message !== "DELETE_FAILED") showToast("خطای ارتباط با سرور", "error");
      throw e;
    }
  };

  const handleList = () => {
    addTab(
      'فهرست صورت حساب‌های بانکی',
      'rap',
      <List className="w-4 h-4" />,
      'BankStatementList',
      {}
    );
  };

  const actionbar = (
    <>
      <ActionButton
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        tooltip="دریافت صورتحساب از اکسل"
        hideLabel
        variant="indigo"
        className="-mr-1"
        icon={(props: React.ComponentProps<"svg">) => <FileUp {...props} className={props.className} style={{ width: '1.8rem', height: '1.8rem' }} strokeWidth={1.5} />}
        style={{ padding: '3.5px' }}
      />
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />
    </>
  );

  return (
    <SimpleFormTwoRow
      title="مشخصات صورت حساب"
      fields={fields}
      values={values}
      onChange={handleFieldChange}
      actionbar={actionbar}
      labelWidth="120px"
      showActions={true}
      useClassicToolbar={false}
      isUsed={isUsed}
      onSave={() => handleSave(false, false)}
      onSaveNew={() => handleSave(false, true)}
      onSaveClose={() => handleSave(true, false)}
      onNew={() => {
        setActiveId(undefined);
        setValues({ Date: new Date().toISOString() });
        setGridData({ items: [] });
      }}
      onDelete={handleDelete}
      listApiUrl="/api/rap/reconcile-bank-statements"
      listColumns={listColumns}
      listDisplayKey="Number"
      onListSelect={(item: any) => {
        const itemId = item.ReconcileBankStatementID || item.reconcileBankStatementId || item.id;
        if (activeId !== itemId) {
          addTab(
            `صورتحساب ${item.Number || itemId}`,
            "rap",
            <FileText className="w-4 h-4" />,
            "BankStatementForm",
            { id: itemId }
          );
        }
      }}
      isSubmitting={isLoading}
    >
      <div 
        className="mt-2 mx-[2px] border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden flex flex-col relative z-10 bg-white dark:bg-[#1a1c23]"
        style={{ height: 'calc(100vh - 350px)', marginBottom: '-24px' }}
      >
        <TabCellRow
          tabs={gridTabs}
          value={gridData}
          onChange={handleGridChange}
          hideHeader={true}
          footerActions={footerActions}
        />
      </div>
    </SimpleFormTwoRow>
  );
}
