"use client";

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/components/Providers';
import { useTabs } from '@/components/TabsProvider';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { MainDataGrid } from '@/components/ui/MainDataGrid';
import { apiFetch } from '@/lib/utils';
import { ListButton } from '@/components/buttons/ListButton';
import { useToast } from '@/components/ToastProvider';
import { useConfirm } from '@/components/ConfirmProvider';
import { Tooltip } from '@/components/ui/Tooltip';

export function OtherDetailsList() {
  const { t } = useLanguage();
  const { addTab } = useTabs();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/api/accounting/other-details`);
      const resData = await res.json();
      setData(resData.data || resData || []);
    } catch (error) {
      console.error("Error fetching other details:", error);
      showToast("خطا در دریافت اطلاعات", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = (item: any) => {
    addTab(
      `ویرایش: ${item.title}`,
      'accounting_forms',
      <Edit className="w-4 h-4" />,
      'OtherDetails',
      { id: item.otherDetailsId || item.id }
    );
  };

  const handleDelete = async (item: any) => {
    const isConfirmed = await confirm({ message: "آیا از حذف این مورد اطمینان دارید؟" });
    if (isConfirmed) {
      try {
        await apiFetch(`/api/accounting/other-details/${item.otherDetailsId || item.id}`, {
          method: 'DELETE',
        });
        showToast("مورد با موفقیت حذف شد", "success");
        fetchItems();
      } catch (error: any) {
        showToast(error.message || "خطا در حذف اطلاعات", "error");
      }
    }
  };

  const columns = useMemo(() => [
    { key: 'title', header: 'عنوان', width: 250 },
    { key: 'title_en', header: 'عنوان لاتین', width: 250 },
    { key: 'detailedCode', header: 'کد تفصیلی', width: 120, type: 'number' },
    { key: 'description', header: 'توضیحات', width: 300 },
    { key: 'isActive', header: 'وضعیت', width: 80, type: 'boolean' },
    {
      key: 'actions',
      header: 'عملیات',
      width: 100,
      enableSorting: false,
      enableColumnFilter: false,
      cell: (info: any) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip content="ویرایش" position="top">
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(info.row.original); }}
              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip content="حذف" position="top">
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(info.row.original); }}
              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    }
  ], [t]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f2c] rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#1a1f2c] rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">فهرست تفصیلی سایر</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">مدیریت تفصیلی‌های سایر</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            addTab(
              "تفصیلی سایر جدید",
              "accounting_forms",
              <Plus className="w-4 h-4" />,
              "OtherDetails"
            );
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>تفصیلی سایر جدید</span>
        </button>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <MainDataGrid
        entityName="OtherDetails"
          title="فهرست تفصیلی سایر"
          data={data}
          columns={columns}
          isLoading={isLoading}
          onRefresh={fetchItems}
        />
      </div>
    </div>
  );
}

export default OtherDetailsList;
