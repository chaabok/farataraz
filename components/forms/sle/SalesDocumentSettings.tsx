"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SimpleFormTwoRow, FieldConfig } from '../SimpleFormTwoRow';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { MultiColumnDropDown } from '@/components/inputs/MultiColumnDropdown';
import { useToast } from '../../ToastProvider';
import { apiFetch } from '@/lib/utils';
import { FileText } from 'lucide-react';

/** Fallback mirror of backend enum SalesDocumentType (id + Persian label) */
const SALES_DOCUMENT_TYPES_FALLBACK = [
  { id: 1, title: 'سفارش فروش' },
  { id: 2, title: 'پیش فاکتور فروش' },
  { id: 3, title: 'قرارداد فروش' },
  { id: 4, title: 'مجوز فروش' },
  { id: 5, title: 'فاکتور فروش' },
  { id: 6, title: 'مجوز برگشت از فروش' },
  { id: 7, title: 'فاکتور برگشت از فروش' },
];

/**
 * Fallback mirror of backend «سند مبنا» list (BASE_DOCUMENT_TYPE_LABELS):
 * بدون مبنا (۰) + انواع سند فروش (۱ تا ۷) + رسید انبار (۸) + حواله انبار (۹)
 */
const BASE_DOCUMENT_TYPES_FALLBACK = [
  { id: 0, title: 'بدون مبنا' },
  ...SALES_DOCUMENT_TYPES_FALLBACK,
  { id: 8, title: 'رسید انبار' },
  { id: 9, title: 'حواله انبار' },
];

const salesDocumentTypeLabel = (value: any): string => {
  const v = Number(value);
  return SALES_DOCUMENT_TYPES_FALLBACK.find((x) => x.id === v)?.title || 'نامشخص';
};

const DEFAULT_FORM_VALUES = {
  salesDocumentType: null as number | null,
  hasBaseDocument: false,
  baseDocumentTypes: [] as number[],
  showWarehouse: false,
  defaultWarehouseRef: null as number | null,
  showSalesCenter: false,
  defaultSalesCenterRef: null as number | null,
  showSalesType: false,
  defaultSalesTypeRef: null as number | null,
  showDeliveryLocations: false,
  defaultDeliveryLocationRef: null as number | null,
  hasAccountingDocument: false,
  showPurchaseSalesParameters: false,
  isActive: true,
};

export default function SalesDocumentSettingsForm({ tabId, recordId }: { tabId?: string; recordId?: number | string }) {
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({ ...DEFAULT_FORM_VALUES });
  const [currentId, setCurrentId] = useState<number | null>(recordId ? Number(recordId) : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // dropdown data sources
  const [docTypes, setDocTypes] = useState<any[]>(SALES_DOCUMENT_TYPES_FALLBACK);
  const [baseDocTypes, setBaseDocTypes] = useState<any[]>(BASE_DOCUMENT_TYPES_FALLBACK);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [salesCenters, setSalesCenters] = useState<any[]>([]);
  const [salesTypes, setSalesTypes] = useState<any[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<any[]>([]);

  const parseList = (json: any): any[] => {
    const arr = json?.data ?? json;
    return Array.isArray(arr) ? arr : [];
  };

  // Load enum list from backend (single source of truth) + dropdown sources
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/sle/sales-document-settings/document-types');
        const json = await res.json();
        const list = parseList(json);
        if (list.length > 0) setDocTypes(list);
      } catch (err) {
        console.error('Failed to load sales document types:', err);
      }

      try {
        const res = await apiFetch('/api/sle/sales-document-settings/base-document-types');
        const json = await res.json();
        const list = parseList(json);
        if (list.length > 0) setBaseDocTypes(list);
      } catch (err) {
        console.error('Failed to load base document types:', err);
      }

      const load = async (url: string, setter: (v: any[]) => void) => {
        try {
          const res = await apiFetch(url);
          const json = await res.json();
          setter(parseList(json));
        } catch (err) {
          console.error(`Failed to load ${url}:`, err);
        }
      };
      await Promise.all([
        load('/api/inv/warehouses', setWarehouses),
        load('/api/sle/sales-centers', setSalesCenters),
        load('/api/sle/sales-types', setSalesTypes),
        load('/api/sle/delivery-locations', setDeliveryLocations),
      ]);
    })();
  }, []);

  const mapEntityToForm = (data: any): Record<string, any> => ({
    salesDocumentType: Number(data.SalesDocumentType),
    hasBaseDocument: !!data.HasBaseDocument,
    baseDocumentTypes: data.BaseDocumentTypes ? String(data.BaseDocumentTypes).split(',').map((x: string) => Number(x)) : [],
    showWarehouse: !!data.ShowWarehouse,
    defaultWarehouseRef: data.DefaultWarehouseRef != null ? Number(data.DefaultWarehouseRef) : null,
    showSalesCenter: !!data.ShowSalesCenter,
    defaultSalesCenterRef: data.DefaultSalesCenterRef != null ? Number(data.DefaultSalesCenterRef) : null,
    showSalesType: !!data.ShowSalesType,
    defaultSalesTypeRef: data.DefaultSalesTypeRef != null ? Number(data.DefaultSalesTypeRef) : null,
    showDeliveryLocations: !!data.ShowDeliveryLocations,
    defaultDeliveryLocationRef: data.DefaultDeliveryLocationRef != null ? Number(data.DefaultDeliveryLocationRef) : null,
    hasAccountingDocument: !!data.HasAccountingDocument,
    showPurchaseSalesParameters: !!data.ShowPurchaseSalesParameters,
    isActive: data.IsActive !== false,
  });

  /** On selecting a sales document type: load its existing settings (if any) */
  const handleTypeChange = async (item: any) => {
    const type = item ? Number(item.id) : null;
    if (!type) {
      setCurrentId(null);
      setFormValues({ ...DEFAULT_FORM_VALUES });
      return;
    }
    setLoading(true);
    setFormValues({ ...DEFAULT_FORM_VALUES, salesDocumentType: type });
    setCurrentId(null);
    try {
      const res = await apiFetch(`/api/sle/sales-document-settings/by-type/${type}`);
      const json = await res.json();
      if (json?.success && json.data) {
        setFormValues(mapEntityToForm(json.data));
        setCurrentId(json.data.SalesDocumentSettingsID ?? null);
      }
    } catch (err) {
      console.error('Failed to load sales document settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (name: string, value: any) => {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value };
      // Turning a display flag off clears its conditional default
      if (name === 'hasBaseDocument' && !value) next.baseDocumentTypes = [];
      if (name === 'showWarehouse' && !value) next.defaultWarehouseRef = null;
      if (name === 'showSalesCenter' && !value) next.defaultSalesCenterRef = null;
      if (name === 'showSalesType' && !value) next.defaultSalesTypeRef = null;
      if (name === 'showDeliveryLocations' && !value) next.defaultDeliveryLocationRef = null;
      return next;
    });
  };

  const validate = (): boolean => {
    if (!formValues.salesDocumentType) {
      showToast('انتخاب نوع سند فروش الزامی است و نمی‌تواند خالی باشد.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!validate()) return false;
    setIsSubmitting(true);
    try {
      const payload = {
        SalesDocumentSettingsID: currentId ?? undefined,
        SalesDocumentType: Number(formValues.salesDocumentType),
        HasBaseDocument: Boolean(formValues.hasBaseDocument),
        BaseDocumentTypes:
          formValues.hasBaseDocument && formValues.baseDocumentTypes.length > 0
            ? formValues.baseDocumentTypes.join(',')
            : null,
        ShowWarehouse: Boolean(formValues.showWarehouse),
        DefaultWarehouseRef: formValues.showWarehouse ? formValues.defaultWarehouseRef : null,
        ShowSalesCenter: Boolean(formValues.showSalesCenter),
        DefaultSalesCenterRef: formValues.showSalesCenter ? formValues.defaultSalesCenterRef : null,
        ShowSalesType: Boolean(formValues.showSalesType),
        DefaultSalesTypeRef: formValues.showSalesType ? formValues.defaultSalesTypeRef : null,
        ShowDeliveryLocations: Boolean(formValues.showDeliveryLocations),
        DefaultDeliveryLocationRef: formValues.showDeliveryLocations ? formValues.defaultDeliveryLocationRef : null,
        HasAccountingDocument: Boolean(formValues.hasAccountingDocument),
        ShowPurchaseSalesParameters: Boolean(formValues.showPurchaseSalesParameters),
        IsActive: Boolean(formValues.isActive),
      };

      const res = await apiFetch('/api/sle/sales-document-settings/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('تنظیمات سند فروش با موفقیت ذخیره شد.', 'success');
        if (json.data && json.data.SalesDocumentSettingsID) {
          setCurrentId(json.data.SalesDocumentSettingsID);
        }
        return true;
      }
      throw new Error(json.message || 'خطا در ذخیره‌سازی اطلاعات');
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره‌سازی اطلاعات', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setCurrentId(null);
    setFormValues({ ...DEFAULT_FORM_VALUES });
  };

  const handleDelete = async () => {
    if (!currentId) return;
    try {
      setIsSubmitting(true);
      const res = await apiFetch(`/api/sle/sales-document-settings/${currentId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تنظیمات سند فروش با موفقیت حذف شد.', 'success');
        handleNew();
      } else {
        const json = await res.json();
        throw new Error(json.message || 'خطا در حذف رکورد');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در حذف رکورد', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeOption = useMemo(
    () => docTypes.find((d) => Number(d.id) === Number(formValues.salesDocumentType)) || null,
    [docTypes, formValues.salesDocumentType]
  );
  const selectedBaseDocOptions = useMemo(
    () => baseDocTypes.filter((d) => (formValues.baseDocumentTypes || []).map(Number).includes(Number(d.id))),
    [baseDocTypes, formValues.baseDocumentTypes]
  );

  const fields: FieldConfig[] = [
    {
      name: 'salesDocumentType',
      label: 'نوع سند فروش',
      type: 'custom',
      required: true,
      colSpan: 1,
      customComponent: (
        <SingleSelectDropDown
          data={docTypes}
          columns={[
            { key: 'id', label: 'کد', width: 60 },
            { key: 'title', label: 'عنوان', width: 170 },
          ]}
          valueKey="id"
          displayKey="title"
          value={selectedTypeOption}
          onChange={handleTypeChange}
          placeholder="انتخاب نوع سند فروش..."
        />
      ),
    },
    {
      // «دارای سند مبنا» + «سند مبنا» کنار هم — همیشه در ردیف اول؛ دراپ‌دان تا تیک شدن غیرفعال است
      name: 'hasBaseDocument',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-2 w-full min-w-0">
          <CheckBoxRightLabel
            label="دارای سند مبنا"
            checked={!!formValues.hasBaseDocument}
            onChange={(checked) => handleFormChange('hasBaseDocument', checked)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <MultiColumnDropDown
              data={baseDocTypes}
              columns={[
                { key: 'id', label: 'کد', width: 60 },
                { key: 'title', label: 'عنوان', width: 160 },
              ]}
              displayKey="title"
              value={selectedBaseDocOptions}
              onChange={(selected: any) => {
                const arr = Array.isArray(selected) ? selected : selected ? [selected] : [];
                handleFormChange('baseDocumentTypes', arr.map((d: any) => Number(d.id)));
              }}
              enableMultiSelection
              disabled={!formValues.hasBaseDocument}
              placeholder="انتخاب اسناد مبنا..."
            />
          </div>
        </div>
      ),
    },
    {
      // «نمایش انبار» + «انبار پیش فرض» کنار هم — دراپ‌دان تا تیک شدن غیرفعال است
      name: 'showWarehouse',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-2 w-full min-w-0">
          <CheckBoxRightLabel
            label="نمایش انبار"
            checked={!!formValues.showWarehouse}
            onChange={(checked) => handleFormChange('showWarehouse', checked)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <SingleSelectDropDown
              data={warehouses}
              columns={[
                { key: 'WarehouseCode', label: 'کد', width: 70 },
                { key: 'WarehouseTitle', label: 'عنوان انبار', width: 170 },
              ]}
              valueKey="WarehouseID"
              displayKey="WarehouseTitle"
              value={
                warehouses.find((w) => Number(w.WarehouseID) === Number(formValues.defaultWarehouseRef)) || null
              }
              onChange={(item: any) =>
                handleFormChange('defaultWarehouseRef', item ? Number(item.WarehouseID) : null)
              }
              disabled={!formValues.showWarehouse}
              placeholder="انتخاب انبار پیش فرض..."
            />
          </div>
        </div>
      ),
    },
    {
      // «نمایش مرکز فروش» + «مرکز فروش پیش فرض» کنار هم
      name: 'showSalesCenter',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-2 w-full min-w-0">
          <CheckBoxRightLabel
            label="نمایش مرکز فروش"
            checked={!!formValues.showSalesCenter}
            onChange={(checked) => handleFormChange('showSalesCenter', checked)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <SingleSelectDropDown
              data={salesCenters}
              columns={[
                { key: 'Code', label: 'کد', width: 70 },
                { key: 'Title', label: 'عنوان مرکز فروش', width: 170 },
              ]}
              valueKey="SalesCenterID"
              displayKey="Title"
              value={
                salesCenters.find((c) => Number(c.SalesCenterID) === Number(formValues.defaultSalesCenterRef)) ||
                null
              }
              onChange={(item: any) =>
                handleFormChange('defaultSalesCenterRef', item ? Number(item.SalesCenterID) : null)
              }
              disabled={!formValues.showSalesCenter}
              placeholder="انتخاب مرکز فروش پیش فرض..."
            />
          </div>
        </div>
      ),
    },
    {
      // «نمایش نوع فروش» + «نوع فروش پیش فرض» کنار هم
      name: 'showSalesType',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-2 w-full min-w-0">
          <CheckBoxRightLabel
            label="نمایش نوع فروش"
            checked={!!formValues.showSalesType}
            onChange={(checked) => handleFormChange('showSalesType', checked)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <SingleSelectDropDown
              data={salesTypes}
              columns={[
                { key: 'Code', label: 'کد', width: 70 },
                { key: 'Title', label: 'عنوان نوع فروش', width: 170 },
              ]}
              valueKey="SalesTypeID"
              displayKey="Title"
              value={
                salesTypes.find((t) => Number(t.SalesTypeID) === Number(formValues.defaultSalesTypeRef)) || null
              }
              onChange={(item: any) =>
                handleFormChange('defaultSalesTypeRef', item ? Number(item.SalesTypeID) : null)
              }
              disabled={!formValues.showSalesType}
              placeholder="انتخاب نوع فروش پیش فرض..."
            />
          </div>
        </div>
      ),
    },
    {
      // «نمایش مکان های تحویل» + «مکان تحویل پیش فرض» کنار هم
      name: 'showDeliveryLocations',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-2 w-full min-w-0">
          <CheckBoxRightLabel
            label="نمایش مکان های تحویل"
            checked={!!formValues.showDeliveryLocations}
            onChange={(checked) => handleFormChange('showDeliveryLocations', checked)}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <SingleSelectDropDown
              data={deliveryLocations}
              columns={[
                { key: 'Code', label: 'کد', width: 70 },
                { key: 'Title', label: 'عنوان مکان تحویل', width: 170 },
              ]}
              valueKey="DeliveryLocationID"
              displayKey="Title"
              value={
                deliveryLocations.find(
                  (d) => Number(d.DeliveryLocationID) === Number(formValues.defaultDeliveryLocationRef)
                ) || null
              }
              onChange={(item: any) =>
                handleFormChange('defaultDeliveryLocationRef', item ? Number(item.DeliveryLocationID) : null)
              }
              disabled={!formValues.showDeliveryLocations}
              placeholder="انتخاب مکان تحویل پیش فرض..."
            />
          </div>
        </div>
      ),
    },
    {
      name: 'hasAccountingDocument',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          label="دارای سند حسابداری"
          checked={!!formValues.hasAccountingDocument}
          onChange={(checked) => handleFormChange('hasAccountingDocument', checked)}
        />
      ),
    },
    {
      name: 'showPurchaseSalesParameters',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          label="نمایش پارامترهای خرید و فروش"
          checked={!!formValues.showPurchaseSalesParameters}
          onChange={(checked) => handleFormChange('showPurchaseSalesParameters', checked)}
        />
      ),
    },
    {
      name: 'isActive',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          label="فعال"
          checked={formValues.isActive !== false}
          onChange={(checked) => handleFormChange('isActive', checked)}
        />
      ),
    },
  ];

  const listColumns = [
    { key: 'SalesDocumentTypeName', label: 'نوع سند فروش', width: 150 },
    { key: 'HasBaseDocument', label: 'دارای سند مبنا', width: 100, render: (item: any) => (item.HasBaseDocument ? 'بله' : 'خیر') },
    { key: 'ShowWarehouse', label: 'نمایش انبار', width: 90, render: (item: any) => (item.ShowWarehouse ? 'بله' : 'خیر') },
    { key: 'HasAccountingDocument', label: 'دارای سند حسابداری', width: 120, render: (item: any) => (item.HasAccountingDocument ? 'بله' : 'خیر') },
    { key: 'IsActive', label: 'فعال', width: 70, render: (item: any) => (item.IsActive ? 'بله' : 'خیر') },
  ];

  return (
    <SimpleFormTwoRow
      title="تنظیمات اسناد فروش"
      icon={<FileText className="w-4 h-4 text-white" />}
      fields={fields}
      values={formValues}
      onChange={handleFormChange}
      onSave={handleSave}
      onSaveNew={async () => {
        const res = await handleSave();
        if (res) handleNew();
        return res;
      }}
      onSaveClose={async () => {
        const res = await handleSave();
        return res;
      }}
      onNew={handleNew}
      onDelete={currentId ? handleDelete : undefined}
      listApiUrl="/api/sle/sales-document-settings"
      listColumns={listColumns}
      listDisplayKey="SalesDocumentTypeName"
      onListSelect={(item) => {
        if (item && item.SalesDocumentType) {
          const type = Number(item.SalesDocumentType);
          setFormValues({ ...DEFAULT_FORM_VALUES, salesDocumentType: type });
          setLoading(true);
          apiFetch(`/api/sle/sales-document-settings/by-type/${type}`)
            .then((res) => res.json())
            .then((json) => {
              if (json?.success && json.data) {
                setFormValues(mapEntityToForm(json.data));
                setCurrentId(json.data.SalesDocumentSettingsID ?? null);
              } else {
                setCurrentId(null);
              }
            })
            .catch((err) => console.error('Failed to load settings:', err))
            .finally(() => setLoading(false));
        }
      }}
      isSubmitting={isSubmitting || loading}
      currentRecordId={currentId}
      formName="SalesDocumentSettings"
    />
  );
}
