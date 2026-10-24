"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "@/components/ui/MainDataGrid";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { Package } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

const TRACKING_FACTOR_TYPE_LABELS: Record<number, string> = {
  1: 'عدد ساده',
  2: 'عدد اعشاری',
  3: 'بولیین',
  4: 'تاریخ',
  5: 'ساعت',
  6: 'حرفی',
  7: 'رنگ',
  8: 'بازه اعداد',
};

export function TrackingFactorList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("pageIndex", currentParams.pageIndex.toString());
      queryParams.append("pageSize", currentParams.pageSize.toString());

      if (currentParams.sorting?.length) {
        queryParams.append("sorting", JSON.stringify(currentParams.sorting));
      }
      if (currentParams.columnFilters?.length) {
        queryParams.append("columnFilters", JSON.stringify(currentParams.columnFilters));
      }
      if (currentParams.advancedFilters?.length) {
        queryParams.append("advancedFilters", JSON.stringify(currentParams.advancedFilters));
      }
      if (currentParams.globalFilter) {
        queryParams.append("globalFilter", currentParams.globalFilter);
      }

      const res = await apiFetch(`/api/inv/tracking-factors?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        const itemsList = Array.isArray(responseData) ? responseData : (responseData.data || []);
        setData(itemsList);
        setTotalItems(responseData.total || itemsList.length);
      } else {
        showToast("خطا در دریافت اطلاعات عوامل ردیابی", "error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("عدم ارتباط با سرور", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
    fetchData(newParams);
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === "TrackingFactor") {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    const tfId = row.TrackingFactorID || row.id;
    addTab(
      `ویرایش عامل ردیابی ${row.TrackingFactorName || row.TrackingFactorCode || ''}`,
      "inv",
      <Package className="w-4 h-4" />,
      "TrackingFactorForm",
      { id: tfId }
    );
  };

  const handleNew = () => {
    addTab(
      "تعریف عامل ردیابی",
      "inv",
      <Package className="w-4 h-4" />,
      "TrackingFactorForm"
    );
  };

  const handleDelete = async (item: any) => {
    const tfId = item.TrackingFactorID || item.id;
    try {
      const res = await apiFetch(`/api/inv/tracking-factors/${tfId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: "TrackingFactor" });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || "خطا در حذف", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در حذف", "error");
    }
  };

  const columns = useMemo(
    () => [
      { key: "TrackingFactorCode", header: "کد", width: 100 },
      { key: "TrackingFactorName", header: "عنوان عامل ردیابی", width: 220 },
      { key: "TrackingFactorName2", header: "عنوان عامل ردیابی (2)", width: 220 },
      {
        key: "TrackingFactorType",
        header: "نوع",
        width: 140,
        cell: (info: any) => {
          const typeVal = info.row.original.TrackingFactorType;
          return TRACKING_FACTOR_TYPE_LABELS[typeVal] || "نامشخص";
        },
      },
      {
        key: "IsConstantValue",
        header: "مقادیر ثابت عامل",
        width: 130,
        type: "boolean",
      },
      { key: "DisplayPriority", header: "اولویت نمایش", width: 120 },
      { key: "IsActive", header: "وضعیت", width: 90, type: "boolean" },
    ],
    []
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="TrackingFactor"
        data={data}
        columns={columns as any}
        title={`فهرست عوامل ردیابی (${totalItems})`}
        icon={<Package className="w-5 h-5 text-gray-500" />}
        isLoading={isLoading}
        onRefresh={() => params && fetchData(params)}
        onEdit={handleEdit}
        onAdd={handleNew}
        onDelete={handleDelete}
        serverSide={true}
        totalItems={totalItems}
        onParamsChange={handleParamsChange}
        enableAdvancedSearch={true}
        enableColumnGrouping={true}
        enableExport={true}
      />
    </div>
  );
}

export default TrackingFactorList;
