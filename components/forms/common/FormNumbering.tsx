"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from 'react';
import { SimpleFormTwoRowTabbed } from '@/components/forms/SimpleFormTwoRowTabbed';
import { TabCellRow } from '@/components/forms/TabCellRow';
import { Settings, ChevronDown, List } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/Providers';
import { useTabs } from '@/components/TabsProvider';
import { MultiColumnDropdown } from '@/components/inputs/MultiColumnDropdown';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { apiFetch, safeStringify, formatDateByLocale } from '@/lib/utils';
import { useEntityNumberingColumns } from "./EntityNumberingList";
import { getHeaderNumberInputEntities, NUMBERING_ENTITY_MAP } from "@/lib/numbering-entities";

export function FormNumbering({ entityRef, activeId }: { entityRef?: string; activeId?: string | number } = {}) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();

  const handleList = () => {
    addTab(
      t("entityNumberings") || "روش های شماره گذاری",
      "general",
      <List className="w-4 h-4" />,
      "EntityNumberingList"
    );
  };

  const listColumns = React.useMemo(() => [
    {
      key: "entityNumberingId",
      label: t("entityNumberingSettingId") || "شناسه",
      width: 60,
      renderItem: (item: any) => item.entityNumberingId || item.EntityNumberingID || "",
    },
    {
      key: "entityTitle",
      label: t("entityRef") || "فرم شماره گذاری شده",
      width: 220,
      renderItem: (item: any) => {
        const val = item.entityRef || item.EntityRef || "";
        const rawVal = val.startsWith("entity.") ? val.replace("entity.", "") : val;
        if (NUMBERING_ENTITY_MAP[rawVal]) return NUMBERING_ENTITY_MAP[rawVal];
        if (NUMBERING_ENTITY_MAP[val]) return NUMBERING_ENTITY_MAP[val];
        const key = val.startsWith("entity.") ? val : `entity.${val}`;
        const translated = t(key);
        if (translated && translated !== key) return translated;
        if (item.entityTitle && item.entityTitle !== val && item.entityTitle !== rawVal) return item.entityTitle;
        return val;
      },
    },
    {
      key: "numberingMethod",
      label: t("numberingMethod") || "روش شماره گذاری",
      width: 120,
      renderItem: (item: any) => {
        const val = String(item.numberingMethod || item.NumberingMethod || "");
        if (val === "1") return t("manual") || "دستی";
        if (val === "2") return t("automatic") || "اتوماتیک";
        return val;
      },
    },
    {
      key: "numberingType",
      label: t("numberingType") || "نوع شماره گذاری",
      width: 110,
      renderItem: (item: any) => {
        const val = String(item.numberingType || item.NumberingType || "");
        if (val === "1") return t("numeric") || "عددی";
        if (val === "2") return t("string") || "رشته ای";
        return val;
      },
    },
    {
      key: "baseNumbering",
      label: t("baseNumbering") || "مبنای شماره گذاری",
      width: 200,
      renderItem: (item: any) => {
        const val = item.baseNumbering || item.BaseNumbering;
        if (!val) return "";
        let arr = val;
        if (typeof val === "string") {
          try { arr = JSON.parse(val); } catch { arr = []; }
        }
        if (Array.isArray(arr)) {
          const baseMap: Record<string, string> = {
            fiscalYear: "سال مالی",
            warehouse: "انبار",
            warehouseDocType: "نوع سند انبار",
            warehouseDocumentType: "نوع سند انبار",
            branch: "شعبه",
            salesCenter: "مرکز فروش",
            invoiceType: "نوع فاکتور",
            requester: "درخواست کننده",
          };
          return arr.map(b => baseMap[b] || t(`base_${b}`) || b).join(" - ");
        }
        return String(val);
      },
    },
  ], [t]);

  const normalizeEntityRef = (ref?: string | null): string => {
    if (!ref) return '';
    let r = String(ref).trim();
    if (r.startsWith('entity.')) {
      r = r.substring(7);
    }
    if (r === 'item') return 'product';
    if (r === 'stocktaking_tag_issuance') return 'stocktaking_tag';
    if (r === 'StocktakingTagForm' || r === 'stocktaking_tag_form') return 'stocktaking_tag_header';
    if (r === 'StocktakingForm' || r === 'stocktaking_form') return 'stocktaking_count';
    return r;
  };

  const isInitialStocktakingTag = entityRef === 'stocktaking_tag' || entityRef === 'StocktakingTagForm' || entityRef === 'stocktaking_tag_header';

  const [values, setValues] = useState<{
    entityNumberingId?: number | string;
    entityRef: string;
    numberingMethod: string;
    numberingType: string;
    baseNumbering: string[];
    items: Record<string, any[]> | any[];
  }>({
    entityNumberingId: activeId,
    entityRef: entityRef || '',
    numberingMethod: '2', // default to automatic
    numberingType: '1', // numeric
    baseNumbering: isInitialStocktakingTag ? ['fiscalYear', 'warehouse'] : ['fiscalYear'],
    items: {
      fiscalYears: [
        {
          _id: '1',
          fiscalYearTitle: '1405',
          startDate: '1405/01/01',
          fixedChar: '',
          startNumber: '1',
          endNumber: '999999',
          gapNumber: 'ignore',
        }
      ]
    }
  });

  const [existingConfigs, setExistingConfigs] = useState<any[]>([]);

  const fetchExistingConfigs = React.useCallback(async () => {
    try {
      const res = await apiFetch('/api/common/entity-numbering');
      if (res.ok) {
        const json = await res.json();
        setExistingConfigs(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch existing entity numberings', e);
    }
  }, []);

  useEffect(() => {
    fetchExistingConfigs();
  }, [fetchExistingConfigs]);

  const existingEntitiesSet = React.useMemo(() => {
    const set = new Set<string>();
    existingConfigs.forEach((c: any) => {
      const rawRef = c.entityRef || c.EntityRef;
      if (rawRef) {
        set.add(rawRef);
        set.add(normalizeEntityRef(rawRef));
      }
    });
    return set;
  }, [existingConfigs]);

  const entityOptions = React.useMemo(() => getHeaderNumberInputEntities(), []);

  const filteredEntityOptions = React.useMemo(() => {
    const currentNorm = normalizeEntityRef(values.entityRef);
    return entityOptions.filter(opt => {
      const optNorm = normalizeEntityRef(opt.value);
      // If this option is currently selected in the form, keep it so it can be displayed and selected
      if (currentNorm && (optNorm === currentNorm || opt.value === values.entityRef)) {
        return true;
      }
      // If a numbering method already exists for this entity, do NOT show it in the dropdown list
      if (existingEntitiesSet.has(optNorm) || existingEntitiesSet.has(opt.value)) {
        return false;
      }
      return true;
    });
  }, [entityOptions, existingEntitiesSet, values.entityRef]);

  const selectedEntityOption = React.useMemo(() => {
    return entityOptions.find(
      o => o.value === values.entityRef || normalizeEntityRef(o.value) === normalizeEntityRef(values.entityRef)
    );
  }, [entityOptions, values.entityRef]);

  const sanitizeItems = (itemsObj: Record<string, any[]> | any[], isNumeric: boolean) => {
    // Preserve fixedChar as-is without stripping digits/characters
    return itemsObj;
  };

  const handleChange = (name: string, value: any) => {
    setValues(prev => {
      let updated = { ...prev, [name]: value };

      if (name === 'entityRef') {
        const sel = entityOptions.find(o => o.value === value);
        if (sel?.menu === 'حسابداری' || sel?.menu === 'دریافت و پرداخت') {
          updated.baseNumbering = ['fiscalYear'];
        } else if (value === 'warehouse') {
          updated.baseNumbering = ['warehouse'];
        } else if (value === 'stocktaking_tag' || value === 'StocktakingTagForm' || value === 'stocktaking_tag_header') {
          updated.baseNumbering = ['fiscalYear', 'warehouse'];
        } else {
          const isDocEnt = value === 'warehouse_receipt' || value === 'warehouse_issue' || sel?.menu === 'انبارداری';
          if (!isDocEnt) {
            updated.baseNumbering = (updated.baseNumbering || []).filter(b => b !== 'warehouseDocType' && b !== 'warehouseDocumentType');
          }
        }
      }

      if (name === 'baseNumbering' && (!value || value.length === 0)) {
        if (updated.items && Array.isArray((updated.items as any).fiscalYears) && (updated.items as any).fiscalYears.length > 1) {
          updated.items = {
            ...updated.items,
            fiscalYears: [(updated.items as any).fiscalYears[0]]
          };
        }
      }

      const currentIsNumeric = updated.numberingType === '1';
      if (name === 'items') {
        updated.items = sanitizeItems(value, currentIsNumeric);
      } else if (name === 'numberingType' && value === '1') {
        updated.items = sanitizeItems(prev.items, true);
      }

      return updated;
    });
  };

  useEffect(() => {
    if (entityRef && entityRef !== values.entityRef) {
      handleChange('entityRef', entityRef);
    }
  }, [entityRef]);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isWarehouseAutoCoding, setIsWarehouseAutoCoding] = useState(false);

  useEffect(() => {
    if (values.entityRef === 'product' || values.entityRef === 'item') {
      apiFetch('/api/common/base-settings/tab/3')
        .then(res => res.json())
        .then(resData => {
          if (resData?.data?.itemCodingMethod === '2') {
            setIsWarehouseAutoCoding(true);
          } else {
            setIsWarehouseAutoCoding(false);
          }
        })
        .catch(() => setIsWarehouseAutoCoding(false));
    } else {
      setIsWarehouseAutoCoding(false);
    }
  }, [values.entityRef]);

  useEffect(() => {
    if (!values.entityRef) return;
    setLoading(true);
    apiFetch(`/api/common/entity-numbering/${values.entityRef}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(resData => {
        const data = resData.data;
        if (data) {
          let loadedBase = data.baseNumbering;
          if (typeof loadedBase === 'string') {
            try { loadedBase = JSON.parse(loadedBase); } catch { loadedBase = [loadedBase]; }
          }
          const isStocktaking = values.entityRef === 'stocktaking_tag' || values.entityRef === 'StocktakingTagForm' || values.entityRef === 'stocktaking_tag_header';
          if (!Array.isArray(loadedBase)) {
            loadedBase = values.entityRef === 'warehouse' ? ['warehouse'] : isStocktaking ? ['fiscalYear', 'warehouse'] : ['fiscalYear'];
          }
          if (values.entityRef === 'warehouse') {
            loadedBase = ['warehouse'];
          } else if (isStocktaking) {
            if (!Array.isArray(loadedBase) || loadedBase.length === 0) {
              loadedBase = ['fiscalYear', 'warehouse'];
            }
          }
          let loadedItems = data.items;
          if (typeof loadedItems === 'string') {
            try { loadedItems = JSON.parse(loadedItems); } catch {}
          }

          setValues(prev => ({
            ...prev,
            entityNumberingId: data.entityNumberingId || data.EntityNumberingID,
            numberingMethod: data.numberingMethod || '2',
            numberingType: data.numberingType || '1',
            baseNumbering: loadedBase,
            items: loadedItems || { fiscalYears: [] },
          }));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load entity numbering', err);
        setLoading(false);
      });
  }, [values.entityRef]);

  const handleNew = () => {
    setValues({
      entityNumberingId: undefined,
      entityRef: '',
      numberingMethod: '2',
      numberingType: '1',
      baseNumbering: ['fiscalYear'],
      items: {
        fiscalYears: [
          {
            _id: '1',
            fiscalYearTitle: '1405',
            startDate: '1405/01/01',
            fixedChar: '',
            startNumber: '1',
            endNumber: '999999',
            gapNumber: 'ignore',
          }
        ]
      }
    });
  };

  const handleDelete = async () => {
    if (!values.entityRef) {
      showToast('هیچ رکوردی برای حذف انتخاب نشده است.', 'error');
      return;
    }
    try {
      const res = await apiFetch(`/api/common/entity-numbering/${values.entityRef}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('تنظیمات شماره گذاری با موفقیت حذف شد.', 'success');
        await fetchExistingConfigs();
        handleNew();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'خطا در حذف تنظیمات', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در حذف تنظیمات', 'error');
    }
  };

  const handleSave = async () => {
    if (!values.entityRef) {
      showToast('لطفا یک فرم را انتخاب کنید.', 'error');
      return false;
    }
    setIsSubmitting(true);
    try {
      const itemsToSave = Array.isArray(values.items)
        ? { fiscalYears: values.items }
        : values.items;

      const res = await apiFetch(`/api/common/entity-numbering/${values.entityRef}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({
          numberingMethod: values.numberingMethod,
          numberingType: values.numberingType,
          baseNumbering: values.baseNumbering,
          items: itemsToSave,
        })
      });
      if (res.ok) {
        showToast('تنظیمات شماره گذاری با موفقیت ذخیره شد.', 'success');
        const resData = await res.json().catch(() => ({}));
        if (resData?.data?.entityNumberingId) {
          setValues(prev => ({
            ...prev,
            entityNumberingId: resData.data.entityNumberingId
          }));
        }
        await fetchExistingConfigs();
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'خطا در ذخیره اطلاعات', 'error');
        return false;
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در ارتباط با سرور', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNew = async () => {
    const success = await handleSave();
    if (success) {
      handleNew();
    }
  };

  const handleSaveClose = async () => {
    const success = await handleSave();
    if (success && activeTabId) {
      removeTab(activeTabId);
    }
  };

  const selectedEntity = entityOptions.find(o => o.value === values.entityRef);
  const isRestrictedMenu = selectedEntity?.menu === 'حسابداری' || selectedEntity?.menu === 'دریافت و پرداخت';
  const isWarehouseEntity = values.entityRef === 'warehouse';
  const isWarehouseDocEntity = values.entityRef === 'warehouse_receipt' || values.entityRef === 'warehouse_issue' || selectedEntity?.menu === 'انبارداری';

  const isWarehouseReceipt = values.entityRef === 'warehouse_receipt' || values.entityRef === 'temporary_item_receipt';
  const isWarehouseIssue = values.entityRef === 'warehouse_issue' || values.entityRef === 'return_temporary_item_receipt';
  const isWarehouseDoc = isWarehouseReceipt || isWarehouseIssue;
  const natureParam = isWarehouseReceipt ? '1' : isWarehouseIssue ? '2' : '';
  const natureNum = isWarehouseReceipt ? 1 : isWarehouseIssue ? 2 : 0;

  const isStocktakingTag = values.entityRef === 'stocktaking_tag' || values.entityRef === 'StocktakingTagForm' || values.entityRef === 'stocktaking_tag_header';

  const methodOptions = [
    { label: t("manual", "دستی"), value: "1" },
    { label: t("automatic", "اتوماتیک"), value: "2" },
  ];

  const typeOptions = [
    { label: t("numeric", "عددی"), value: "1" },
    { label: t("string", "رشته ای"), value: "2" },
  ];

  const baseOptions = [
    { label: t("fiscalYear", "سال مالی"), value: "fiscalYear" },
    { label: t("warehouse", "انبار"), value: "warehouse" },
    { label: t("warehouseDocType", "نوع سند انبار"), value: "warehouseDocType" },
  ];

  const gapOptions = [
    { label: t("ignore", "نادیده گرفتن"), value: "ignore" },
    { label: t("warn", "هشدار"), value: "warn" },
    { label: t("prevent", "جلوگیری"), value: "prevent" },
  ];

  const filteredBaseOptions = isWarehouseEntity
    ? baseOptions.filter(o => o.value === 'warehouse')
    : isRestrictedMenu
    ? baseOptions.filter(o => o.value === 'fiscalYear')
    : isStocktakingTag
    ? baseOptions.filter(o => o.value === 'fiscalYear' || o.value === 'warehouse')
    : baseOptions.filter(o => {
        if (o.value === 'warehouseDocType') {
          return isWarehouseDocEntity;
        }
        return true;
      });

  const baseNumList = Array.isArray(values.baseNumbering)
    ? values.baseNumbering
    : typeof values.baseNumbering === 'string'
    ? [values.baseNumbering]
    : [];
  const hasFiscalYearSelected = baseNumList.includes('fiscalYear');
  const hasWarehouseSelected = baseNumList.includes('warehouse');
  const hasWarehouseDocTypeSelected = baseNumList.includes('warehouseDocType') || baseNumList.includes('warehouseDocumentType');

  const currentDisplayTitle = selectedEntityOption?.label || (values.entityRef ? NUMBERING_ENTITY_MAP[values.entityRef] || values.entityRef : '');

  return (
    <SimpleFormTwoRowTabbed isReadonly={false}
      title={
        values.entityNumberingId
          ? `ویرایش روش شماره گذاری: ${currentDisplayTitle}`
          : values.entityRef
          ? `روش شماره گذاری: ${currentDisplayTitle}`
          : "روش شماره گذاری جدید"
      }
      icon={<Settings className="w-5 h-5" />}
      useClassicToolbar={false}
      isSubmitting={isSubmitting}
      onSave={handleSave}
      onNew={handleNew}
      onList={handleList}
      listApiUrl="/api/common/entity-numbering"
      listColumns={listColumns}
      listDisplayKey="entityTitle"
      onListSelect={(item: any) => {
        const selectedId = item.entityNumberingId || item.id || item.entityRef;
        const rawEntityRef = item.entityRef?.startsWith('entity.') ? item.entityRef.replace('entity.', '') : item.entityRef;
        const formTitle = NUMBERING_ENTITY_MAP[item.entityRef] || NUMBERING_ENTITY_MAP[rawEntityRef] || (item.entityTitle && item.entityTitle !== item.entityRef && item.entityTitle !== rawEntityRef ? item.entityTitle : '') || item.entityRef;
        if (activeId !== selectedId) {
          addTab(
            `ویرایش تنظیمات: ${formTitle}`,
            "general",
            <Settings className="w-4 h-4" />,
            "FormNumbering",
            { activeId: selectedId, entityRef: item.entityRef }
          );
        }
      }}
      onPrint={() => {}}
      onPrintPdf={() => {}}
      onDelete={values.entityNumberingId ? handleDelete : undefined}
      onDeleteCross={values.entityNumberingId ? handleDelete : undefined}
      onSaveCross={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      fields={[
        {
          name: 'entityRef',
          label: 'فرم مورد نظر',
          type: 'custom',
          customComponent: (
            <div className="space-y-2">
              <MultiColumnDropdown
                data={filteredEntityOptions.map((o) => ({ id: o.value, ...o }))}
                columns={[
                  { key: 'label', label: 'عنوان فرم', width: 200 },
                  { key: 'menu', label: 'منوی مربوطه', width: 140 },
                  { key: 'value', label: 'شناسه فرم', width: 140 }
                ]}
                displayKey="label"
                value={selectedEntityOption ? { id: selectedEntityOption.value, ...selectedEntityOption } : null}
                onChange={(item: any) => handleChange('entityRef', item?.value || '')}
                enableMultiSelection={false}
              />
              {filteredEntityOptions.length === 0 && !values.entityRef && (
                <div className="p-2 text-[11px] bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 rounded">
                  تمامی فرم‌های سیستم دارای روش شماره‌گذاری تعریف‌شده می‌باشند.
                </div>
              )}
              {isWarehouseAutoCoding && (
                <div className="p-2 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded">
                  ⚠️ توجه: در تنظیمات انبار، نحوه کدگذاری کالا و خدمت بر روی «اتوماتیک» تنظیم شده است؛ بنابراین کد کالا از این روش شماره‌گذاری تبعیت نکرده و توسط کاربر تعیین می‌شود.
                </div>
              )}
            </div>
          ),
          required: true,
          colSpan: 2,
        },
        {
          name: 'numberingMethod',
          label: 'روش شماره گذاری',
          type: 'radio',
          options: methodOptions,
        },
        {
          name: 'numberingType',
          label: 'رشته ای',
          type: 'radio',
          options: typeOptions,
        },
        {
          name: 'baseNumbering',
          label: 'مبنای شماره گذاری',
          type: 'multi-checkbox',
          options: filteredBaseOptions,
          colSpan: 2,
        },
      ]}
      values={values}
      onChange={handleChange}
      bottomTabs={[
        {
          id: 'tab-items',
          label: 'جزئیات',
          content: (
             <TabCellRow
               hideHeader
               hideAddButton={!(values.baseNumbering && values.baseNumbering.length > 0)}
               hideDeleteButton={!(values.baseNumbering && values.baseNumbering.length > 0)}
               className="border-none shadow-none h-full rounded-none"
               tabs={[
                 {
                   id: 'fiscalYears',
                   label: 'جزئیات شماره گذاری',
                   columns: [
                     ...(hasFiscalYearSelected ? [{ 
                       key: 'fiscalYearTitle', 
                       header: 'سال مالی', 
                       type: 'custom', 
                       width: '200px',
                       render: (row: any, index: number, onChange: (val: any) => void) => (
                         <SingleSelectDropDown
                           listApiUrl="/api/common/fiscalyear"
                           columns={[
                             { key: 'title', label: 'عنوان', width: 150 },
                             { key: 'startDate', label: 'تاریخ شروع', width: 120, renderItem: (item: any) => formatDateByLocale(item.startDate, 'fa') },
                             { key: 'endDate', label: 'تاریخ پایان', width: 120, renderItem: (item: any) => formatDateByLocale(item.endDate, 'fa') },
                           ]}
                           displayKey="title"
                           value={row.fiscalYearTitle ? { id: row.fiscalYearTitle, title: row.fiscalYearTitle } : null}
                           onChange={(item: any) => onChange?.(item?.title || item)}
                         />
                       )
                     }] : []),
                      ...((isWarehouseDoc && hasWarehouseDocTypeSelected) ? [{
                        key: 'warehouseDocTypeTitle',
                        header: 'سند انبار',
                        type: 'custom',
                        width: '220px',
                        render: (row: any, index: number, onChange: (val: any) => void) => (
                          <SingleSelectDropDown
                            listApiUrl={`/api/inv/warehouse-document-types?nature=${natureParam}`}
                            filterItem={(dt: any) => Number(dt.nature || dt.WarehouseDocumentNature) === natureNum}
                            columns={[
                              { key: 'code', label: 'کد', width: 70 },
                              { key: 'title', label: 'عنوان', width: 150 },
                            ]}
                            displayKey="title"
                            value={row.warehouseDocTypeTitle ? { id: row.warehouseDocTypeTitle, title: row.warehouseDocTypeTitle } : null}
                            onChange={(item: any) => {
                              if (!item) {
                                onChange?.('');
                                return;
                              }
                              const dtTitle = typeof item === 'object' ? (item.title || item.WarehouseDocumentTypeTitle || item.code || '') : String(item);
                              onChange?.(dtTitle);
                            }}
                            placeholder="انتخاب سند انبار..."
                          />
                        )
                      }] : []),
                      ...((hasWarehouseSelected && !isWarehouseEntity) ? [{
                        key: 'warehouseTitle',
                        header: 'انبار',
                        type: 'custom',
                        width: '200px',
                        render: (row: any, index: number, onChange: (val: any) => void) => (
                          <SingleSelectDropDown
                            listApiUrl="/api/inv/warehouses"
                            columns={[
                              { key: 'WarehouseCode', label: 'کد', width: 80 },
                              { key: 'WarehouseTitle', label: 'عنوان انبار', width: 160 },
                            ]}
                            displayKey="WarehouseTitle"
                            value={row.warehouseTitle ? { id: row.warehouseTitle, WarehouseTitle: row.warehouseTitle } : null}
                            onChange={(item: any) => {
                              if (!item) {
                                onChange?.('');
                                return;
                              }
                              const wTitle = typeof item === 'object' ? (item.WarehouseTitle || item.Title || item.title || item.code || '') : String(item);
                              onChange?.(wTitle);
                            }}
                            placeholder="انتخاب انبار..."
                          />
                        )
                      }] : []),
                     { key: 'fixedChar', header: 'مقدار ثابت (پیشوند)', type: 'text', width: '150px' },
                     { key: 'startNumber', header: 'شماره آغازین', type: 'number', width: '120px' },
                     { key: 'endNumber', header: 'شماره پایانی', type: 'number', width: '120px' },
                     { key: 'gapNumber', header: 'گپ بین شماره ها', type: 'select', options: gapOptions, width: '180px' },
                   ]
                 }
               ]}
               value={values.items}
               onChange={(newItems) => handleChange('items', newItems)}
             />
          )
        }
      ]}
    />
  );
}
