"use client";
import { useLanguage } from "@/components/Providers";

import React, { useEffect, useState } from 'react';
import { MainDataGrid } from '@/components/ui/MainDataGrid';
import { useTabs } from '@/components/TabsProvider';
import { useToast } from '@/components/ToastProvider';
import { apiFetch } from '@/lib/utils';
import { Hash } from 'lucide-react';
import { NUMBERING_ENTITY_MAP } from "@/lib/numbering-entities";

export const useEntityNumberingColumns = () => {
  const { t } = useLanguage();
  return [
    { key: "entityNumberingId", label: t("entityNumberingSettingId") || "شناسه" },
    { 
      key: "entityRef", 
      label: t("entityRef") || "موجودیت",
      cell: (info: any) => {
        const val = info.getValue() || "";
        const key = val.startsWith('entity.') ? val : `entity.${val}`;
        const rawVal = val.startsWith('entity.') ? val.replace('entity.', '') : val;
        
        const translated = t(key);
        if (translated && translated !== key) {
          return translated;
        }
        return NUMBERING_ENTITY_MAP[rawVal] || val;
      }
    },
    { 
      key: "numberingMethod", 
      label: t("numberingMethod") || "روش شماره گذاری",
      cell: (info: any) => {
        const val = info.getValue();
        if (val === '1') return t("manual") || "دستی";
        if (val === '2') return t("automatic") || "اتوماتیک";
        return val;
      }
    },
    { 
      key: "numberingType", 
      label: t("numberingType") || "نوع شماره گذاری",
      cell: (info: any) => {
        const val = info.getValue();
        if (val === '1') return t("numeric") || "عددی";
        if (val === '2') return t("string") || "رشته ای";
        return val;
      }
    },
    {
      key: "baseNumbering",
      label: t("baseNumbering") || "مبنای شماره گذاری",
      cell: (info: any) => {
        const val = info.getValue();
        if (!val) return "";
        let arr = val;
        if (typeof val === 'string') {
          try { arr = JSON.parse(val); } catch(e) { arr = []; }
        }
        if (Array.isArray(arr)) {
          const baseMap: Record<string, string> = {
            fiscalYear: 'سال مالی',
            warehouse: 'انبار',
            warehouseDocType: 'نوع سند انبار',
            warehouseDocumentType: 'نوع سند انبار',
            branch: 'شعبه',
            salesCenter: 'مرکز فروش',
            salesType: 'نوع فروش',
            deliveryLocations: 'مکان های تحویل',
            settlementMethod: 'روش تسویه',
            invoiceType: 'نوع فاکتور',
            requester: 'درخواست کننده',
          };
          return arr.map(item => t(item, t(`base_${item}`, baseMap[item] || item))).join(" - ");
        }
        return val;
      }
    }
  ];
};

export function EntityNumberingList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch('/api/common/entity-numbering');
      if (!res.ok) {
        throw new Error('خطا در دریافت اطلاعات');
      }
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error(error);
      showToast('خطا در دریافت اطلاعات روش های شماره گذاری', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const columns = useEntityNumberingColumns();

  const { t } = useLanguage();
  return (
    <div className="h-full p-2">
      <MainDataGrid
        entityName="EntityNumbering"
        title={t("entityNumberings") || "روش های شماره گذاری"}
        icon={<Hash className="w-5 h-5 text-white" />}
        data={data}
        isLoading={isLoading}
        columns={columns}
        onRefresh={fetchConfigurations}
        onAdd={() => {
          addTab('روش شماره گذاری جدید', 'general', null, 'FormNumbering');
        }}
        onEdit={(item: any) => {
          addTab('روش شماره گذاری جدید', 'general', null, 'FormNumbering', { entityRef: item.entityRef });
        }}
        onDelete={async (item: any) => {
          try {
            const res = await apiFetch(`/api/common/entity-numbering/${item.entityRef}`, { method: 'DELETE' });
            if (!res.ok) {
              throw new Error('خطا در حذف تنظیمات شماره گذاری');
            }
            showToast('تنظیمات شماره گذاری با موفقیت حذف شد', 'success');
            fetchConfigurations();
          } catch (error: any) {
            console.error(error);
            showToast(error.message || 'خطا در حذف تنظیمات', 'error');
          }
        }}
      />
    </div>
  );
}
