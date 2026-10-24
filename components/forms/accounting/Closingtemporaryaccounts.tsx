"use client";

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/utils';
import { SimpleFormTwoRow, FieldConfig } from '@/components/forms/SimpleFormTwoRow';
import { TabCellRow, TabCellConfig } from '@/components/forms/TabCellRow';
import { TreeView, TreeNode } from '@/components/inputs/TreeView';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/components/Providers';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { NumberInput } from '@/components/inputs/NumberInput';
import { DateInput } from '@/components/inputs/DateInput';
import { TextArea } from '@/components/inputs/TextArea';
import { SlAccountDropDown } from '@/components/ui/SlAccountDropDown';

import { useToast } from '@/components/ToastProvider';
import { VoucherActionButtons } from '@/components/buttons/VoucherActionButtons';
import { PrintDropdownButton } from '@/components/buttons/PrintDropdownButton';

export default function Closingtemporaryaccounts() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [values, setValues] = useState<Record<string, any>>({
    voucherType: { id: '3', code: '03', title: 'سود و زیانی' },
    voucherNumber: '',
    voucherDate: '',
    description: ''
  });

  const handleFieldChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
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
            { id: '3', code: '03', title: 'سود و زیانی' }
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
            <NumberInput
              label="شماره سند :"
              value={values.voucherNumber}
              disabled={true}
              labelWidth="70px"
              alignVertical={false}
              onChange={() => {}}
            />
          </div>
          <div className="flex-1">
            <DateInput
              label="تاریخ سند :"
              value={values.voucherDate}
              disabled={true}
              labelWidth="70px"
              alignVertical={false}
              onChange={() => {}}
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
          placeholder="شرح یا توضیحات بستن حسابهای موقت را وارد کنید..."
          rows={2}
          labelWidth="70px"
          alignVertical={false}
        />
      )
    }
  ];

  const [detailedLevelsCount, setDetailedLevelsCount] = useState<number>(3);
  const [accountTitlesMap, setAccountTitlesMap] = useState<Record<string, string>>({});
  const [detailedAccountTitlesMap, setDetailedAccountTitlesMap] = useState<Record<string, string>>({});

  useEffect(() => {
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

    apiFetch('/api/accounting/accounts?level=3&isActive=true')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        const map: Record<string, string> = {};
        items.forEach((item: any) => {
          if (item.code) {
            map[item.code] = item.title || '';
          }
        });
        setAccountTitlesMap(map);
      })
      .catch(() => {});

    apiFetch('/api/accounting/detailed-accounts')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const items = Array.isArray(data) ? data : (data.items || data.data || []);
        const map: Record<string, string> = {};
        items.forEach((item: any) => {
          if (item.code) {
            map[item.code] = item.title || '';
          }
        });
        setDetailedAccountTitlesMap(map);
      })
      .catch(() => {});
  }, []);

  const [topGridData, setTopGridData] = useState<any[]>([]);
  const [middleGridData, setMiddleGridData] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<TreeNode[]>([]);
  const [selectedNodeInList, setSelectedNodeInList] = useState<string | null>(null);
  const [currentSelectedInTree, setCurrentSelectedInTree] = useState<TreeNode | null>(null);
  const [isBox2Saved, setIsBox2Saved] = useState<boolean>(false);

  // Step completion checks
  const isBox1Complete = topGridData.length > 0 && topGridData.some(row => 
    (row.description && String(row.description).trim() !== '') || 
    (row.toDate && String(row.toDate).trim() !== '') || 
    row.type
  );

  const isBox2Complete = isBox1Complete && middleGridData.length > 0 && middleGridData.some(row =>
    (row.intermediaryCode && String(row.intermediaryCode).trim() !== '') ||
    (row.detail && String(row.detail).trim() !== '') ||
    row.percentage
  );

  useEffect(() => {
    if (!isBox2Complete) {
      setIsBox2Saved(false);
    }
  }, [isBox2Complete]);

  const isBox2Active = isBox1Complete;
  const isBox3Active = isBox1Complete && isBox2Complete && isBox2Saved;

  // Check if "سود و زیانی" or "سودو زیانی" is selected in Box 1
  const isPnlSelectedInBox1 = topGridData && topGridData.some(row => 
    row.type === 'سودو زیانی' || row.type === 'سود و زیانی'
  );

  const firstRowToDate = topGridData && topGridData[0] ? topGridData[0].toDate : '';

  const [treeData, setTreeData] = useState<TreeNode>({
    id: 'root',
    name: 'حساب‌ها',
    isRoot: true,
    children: []
  });

  // Fetch real tree data for Box 3 from backend
  useEffect(() => {
    if (isBox3Active) {
      const url = firstRowToDate
        ? `/api/accounting/closing-temporary-accounts/temporary-accounts-tree?toDate=${encodeURIComponent(firstRowToDate)}`
        : `/api/accounting/closing-temporary-accounts/temporary-accounts-tree`;

      apiFetch(url)
        .then(res => res.ok ? res.json() : null)
        .then(resData => {
          if (resData && resData.success && resData.data) {
            setTreeData(resData.data);
          }
        })
        .catch(() => {});
    }
  }, [isBox3Active, firstRowToDate]);

  const topTabs: TabCellConfig[] = [
    {
      id: 'steps',
      label: 'مراحل',
      columns: [
        { key: 'description', header: 'شرح مراحل', type: 'text', width: 'auto' },
        { 
          key: 'toDate', 
          header: 'تا تاریخ', 
          width: '150px',
          render: (row, rowIndex, onChange) => (
            <DateInput
              value={row.toDate || ''}
              onChange={(val: string) => onChange(val)}
              noWrapper
            />
          )
        },
        { 
          key: 'type', 
          header: 'نوع', 
          type: 'select', 
          width: '150px',
          options: [
            { label: 'سودو زیانی', value: 'سودو زیانی' },
            { label: 'ترازنامه ای', value: 'ترازنامه ای' },
            { label: 'سایر', value: 'سایر' },
          ]
        },
        { key: 'status', header: 'وضعیت سند', type: 'text', width: '150px' },
      ]
    }
  ];

  const middleTabs: TabCellConfig[] = [
    {
      id: 'details',
      label: 'جزئیات',
      columns: [
        {
          key: 'intermediaryCode',
          header: 'کد و عنوان معین واسط',
          width: '320px',
          render: (row, rowIndex, onChange) => {
            const rawCode = typeof row.intermediaryCode === 'object' ? row.intermediaryCode?.code : row.intermediaryCode;
            const title = row.intermediaryTitle || row.intermediaryCodeObj?.title || (rawCode ? accountTitlesMap[rawCode] : '') || '';
            const currentObj = row.intermediaryCodeObj || (
              rawCode
                ? { code: rawCode, title }
                : null
            );
            return (
              <div className="p-0.5 h-full flex items-center bg-transparent w-full">
                <SlAccountDropDown
                  value={currentObj}
                  apiParams={isPnlSelectedInBox1 ? { accountType: 1 } : undefined}
                  onChange={(item: any) => {
                    const codeVal = item ? item.code : '';
                    onChange(codeVal);
                    row.intermediaryCodeObj = item;
                    row.intermediaryTitle = item ? item.title : '';
                    if (item?.code && item?.title) {
                      setAccountTitlesMap(prev => ({ ...prev, [item.code]: item.title }));
                    }
                  }}
                  dropdownPlacement="auto"
                />
              </div>
            );
          }
        },
        ...Array.from({ length: detailedLevelsCount }).map((_, i) => {
          const fieldKey = i === 0 ? 'detail' : `level${i + 4}`;
          const objKey = `${fieldKey}Obj`;
          const titleKey = `${fieldKey}Title`;

          return {
            key: fieldKey,
            header: `تفصیل ${i + 1}`,
            width: '240px',
            render: (row: any, rowIndex: number, onChange: (val: any) => void) => {
              const rawVal = row[fieldKey];
              const rawCode = typeof rawVal === 'object' ? rawVal?.code : rawVal;
              const title = row[titleKey] || row[objKey]?.title || (rawCode ? detailedAccountTitlesMap[rawCode] : '') || '';
              const currentObj = row[objKey] || (
                rawCode
                  ? { code: rawCode, title }
                  : (typeof rawVal === 'object' ? rawVal : null)
              );

              return (
                <div className="p-0.5 h-full flex items-center bg-transparent w-full min-w-[200px]">
                  <SingleSelectDropDown
                    listApiUrl="/api/accounting/detailed-accounts"
                    columns={[
                      { key: 'code', label: 'کد تفصیل', width: 90 },
                      { key: 'title', label: 'عنوان تفصیل', width: 200 }
                    ]}
                    value={currentObj}
                    onChange={(item: any) => {
                      const codeVal = item ? (item.code || item.title) : '';
                      onChange(codeVal);
                      row[objKey] = item;
                      row[titleKey] = item ? item.title : '';
                      if (item?.code && item?.title) {
                        setDetailedAccountTitlesMap(prev => ({ ...prev, [item.code]: item.title }));
                      }
                    }}
                    displayKey="title"
                    placeholder={`-- انتخاب تفصیل ${i + 1} --`}
                    renderSelection={(item: any) => item ? (item.code ? `${item.code} - ${item.title}` : item.title) : ''}
                    noWrapper
                    dropdownPlacement="auto"
                  />
                </div>
              );
            }
          };
        }),
        { key: 'percentage', header: '% درصد', type: 'number', width: '100px' },
      ]
    }
  ];

  const handleSaveAll = async () => {
    if (!isBox1Complete) {
      showToast("لطفاً ابتدا اطلاعات مراحل در باکس اول را وارد نمایید.", "warning");
      return;
    }
    if (!isBox2Complete) {
      showToast("لطفاً اطلاعات جزئیات در باکس دوم را کامل کنید.", "warning");
      return;
    }

    try {
      const firstRow = topGridData[0] || {};
      const payload = {
        description: values.description || firstRow.description || 'بستن حسابهای موقت',
        toDate: firstRow.toDate || '',
        type: firstRow.type || 'سودو زیانی',
        status: firstRow.status || 'صادر نشده',
        items: middleGridData.map(row => ({
          intermediaryAccountRef: row.intermediaryCodeObj?.id || row.intermediaryAccountRef || null,
          intermediaryCode: typeof row.intermediaryCode === 'object' ? row.intermediaryCode?.code : row.intermediaryCode,
          percentage: row.percentage ? parseFloat(row.percentage) : 100,
          detailedAccountRef1: row.detailObj?.id || row.detail || null,
        })),
        selectedAccounts: selectedNodes.map(node => ({
          accountCode: node.code || node.id,
          accountTitle: node.title || node.name,
        }))
      };

      const res = await apiFetch('/api/accounting/closing-temporary-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("اطلاعات بستن حسابهای موقت و سند مربوطه با موفقیت در سیستم ثبت گردید.", "success");
      } else {
        showToast(resData.message || "خطا در ثبت بستن حسابهای موقت", "error");
      }
    } catch (err) {
      showToast("خطایی در ارتباط با سرور رخ داد.", "error");
    }
  };

  const handleMoveToLeft = () => {
    if (currentSelectedInTree && currentSelectedInTree.id !== 'root' && !selectedNodes.find(n => n.id === currentSelectedInTree.id)) {
      setSelectedNodes([...selectedNodes, currentSelectedInTree]);
    }
  };

  const handleMoveToRight = () => {
    if (selectedNodeInList) {
      setSelectedNodes(selectedNodes.filter(n => n.id !== selectedNodeInList));
      setSelectedNodeInList(null);
    } else if (selectedNodes.length > 0) {
      setSelectedNodes(selectedNodes.slice(0, -1));
    }
  };

  const handleNew = () => {
    setValues({
      voucherType: 'سودو زیانی',
      voucherNumber: '',
      voucherDate: '',
      description: '',
    });
    setTopGridData([{ description: '', toDate: '', type: 'سودو زیانی', status: 'صادر نشده' }]);
    setMiddleGridData([{ intermediaryCode: '', percentage: '100', detail: '' }]);
    setSelectedNodes([]);
    showToast("فرم آماده ثبت جدید می‌باشد.", "info");
  };

  const handleDelete = async () => {
    handleNew();
    showToast("اطلاعات بستن حسابهای موقت پاک‌سازی گردید.", "success");
  };

  return (
    <SimpleFormTwoRow
      fields={fields}
      values={values}
      onChange={handleFieldChange}
      title="بستن حسابهای موقت"
      hideHeader={false}
      showListButton={false}
      onSave={handleSaveAll}
      onSaveClose={handleSaveAll}
      onSaveNew={async () => {
        await handleSaveAll();
        handleNew();
      }}
      onNew={handleNew}
      onDelete={handleDelete}
      actionbar={
        <div className="flex items-center gap-1.5 border-r border-gray-200 dark:border-gray-700 pr-4 mr-2">
          <VoucherActionButtons 
            action="insert" 
            onClick={handleSaveAll} 
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
            targetForm="Closingtemporaryaccounts"
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
      <div className="flex flex-col gap-4 w-full h-full p-2 bg-slate-50 dark:bg-slate-900/50">
        
        {/* Top Grid (Box 1) */}
        <div className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span>باکس اول: مراحل</span>
            <span className={`text-[11px] px-2 py-0.5 rounded font-normal ${isBox1Complete ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
              {isBox1Complete ? 'تکمیل شده ✓' : 'لطفاً اطلاعات این بخش را تکمیل کنید'}
            </span>
          </div>
          <div className="h-[135px]">
            <TabCellRow
              tabs={topTabs}
              value={topGridData}
              onChange={setTopGridData}
              hideHeader={true}
              hideAddButton={false}
            />
          </div>
        </div>

        {/* Middle Grid (Box 2) */}
        <div className={`border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md overflow-hidden transition-all ${!isBox2Active ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span>باکس دوم: جزئیات</span>
            {!isBox2Active ? (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-normal">
                غیرفعال (ابتدا اطلاعات باکس اول را تکمیل کنید)
              </span>
            ) : (
              <span className={`text-[11px] px-2 py-0.5 rounded font-normal ${isBox2Saved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                {isBox2Saved ? 'ذخیره شده ✓' : 'نیازمند تکمیل و ذخیره'}
              </span>
            )}
          </div>
          <div className="h-[135px]">
            <TabCellRow
              tabs={middleTabs}
              value={middleGridData}
              onChange={(val) => {
                setMiddleGridData(val);
                setIsBox2Saved(false);
              }}
              hideHeader={true}
              hideAddButton={!isBox2Active}
              isReadonly={!isBox2Active}
              footerLeftActions={
                isBox2Active ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (isBox2Complete) {
                        setIsBox2Saved(true);
                        showToast("اطلاعات باکس دوم با موفقیت ذخیره شد. باکس سوم فعال گردید.", "success");
                      } else {
                        showToast("لطفاً ابتدا اطلاعات باکس دوم را تکمیل نمایید.", "warning");
                      }
                    }}
                    disabled={!isBox2Complete}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded text-xs transition-colors shadow-sm font-medium"
                  >
                    {isBox2Saved ? 'مجدداً ذخیره گردید ✓' : 'ذخیره جزئیات و فعال‌سازی باکس سوم'}
                  </button>
                ) : null
              }
            />
          </div>
        </div>

        {/* Bottom Section (Box 3) */}
        <div className={`border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md p-2 transition-all ${!isBox3Active ? 'opacity-50 pointer-events-none select-none' : ''}`}>
          <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-1 -m-2 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <span>باکس سوم: حساب‌ها و انتخاب تفصیلی</span>
            {!isBox3Active ? (
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-normal">
                غیرفعال (نیازمند تکمیل و ذخیره اطلاعات باکس دوم)
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-normal">
                فعال ✓
              </span>
            )}
          </div>
          <div className="flex flex-row gap-4 h-[200px] pb-2">
            {/* Right Side: Tree View (First child in RTL renders on Right) */}
            <div className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto p-2 rounded" dir="rtl">
               <TreeView 
                 data={treeData}
                 onChange={setTreeData}
                 onSelect={(node) => setCurrentSelectedInTree(node)}
                 readOnly={!isBox3Active}
               />
            </div>

            {/* Middle Buttons */}
            <div className="flex flex-col justify-center gap-4 px-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
              <button 
                type="button"
                title="افزودن به لیست منتخب (انتقال به چپ)"
                onClick={handleMoveToLeft}
                disabled={!isBox3Active}
                className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <button 
                type="button"
                title="حذف از لیست (انتقال به راست)"
                onClick={handleMoveToRight}
                disabled={!isBox3Active}
                className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            </div>

            {/* Left Side: Selected Nodes List (Last child in RTL renders on Left) */}
            <div className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-y-auto p-2 rounded">
              {selectedNodes.length === 0 ? (
                <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">
                  هیچ حسابی انتخاب نشده است. از درخت سمت راست حساب مورد نظر را انتخاب کرده و دکمه فلش چپ را کلیک نمایید.
                </div>
              ) : (
                selectedNodes.map((node) => (
                  <div 
                    key={node.id} 
                    onClick={() => setSelectedNodeInList(node.id)}
                    className={`p-1.5 mb-1 border-b border-slate-100 dark:border-slate-800 text-sm cursor-pointer rounded transition-colors ${selectedNodeInList === node.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    {node.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SimpleFormTwoRow>
  );
}
