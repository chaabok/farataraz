"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "@/components/ui/MainDataGrid";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { Layers } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

export function ItemAccountCategoryList() {
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

      const res = await apiFetch(`/api/inv/item-account-categories?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات طبقات حساب کالا", "error");
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
      if (payload?.entity === "ItemAccountCategory") {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    const catId = row.ItemAccountCategoryID || row.id;
    addTab(
      `ویرایش طبقه حساب ${row.ItemAccountCategoryName || row.ItemAccountCategoryCode || ''}`,
      "inv",
      <Layers className="w-4 h-4" />,
      "ItemAccountCategoryForm",
      { id: catId }
    );
  };

  const handleNew = () => {
    addTab(
      "طبقه حساب کالا جدید",
      "inv",
      <Layers className="w-4 h-4" />,
      "ItemAccountCategoryForm"
    );
  };

  const handleDelete = async (item: any) => {
    const catId = item.ItemAccountCategoryID || item.id;
    try {
      const res = await apiFetch(`/api/inv/item-account-categories/${catId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: "ItemAccountCategory" });
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
      { key: "ItemAccountCategoryCode", header: "کد", width: 100 },
      { key: "ItemAccountCategoryName", header: "عنوان", width: 220 },
      { key: "ItemAccountCategoryName2", header: "عنوان (2)", width: 220 },
      {
        key: "PricingMethod",
        header: "روش قیمت‌گذاری",
        width: 180,
        cell: (info: any) => {
          const val = info.row.original.PricingMethod;
          if (val === 1) return "میانگین موزون";
          if (val === 2) return "FIFO (نخستین ورودی، نخستین خروجی)";
          if (val === 3) return "LIFO (آخرین ورودی، نخستین خروجی)";
          if (val === 4) return "نرخ استاندارد";
          return "نامشخص";
        },
      },
      {
        key: "StandardRate",
        header: "نرخ استاندارد",
        width: 120,
        cell: (info: any) => (info.row.original.StandardRate === 1 ? "دارد" : "ندارد"),
      },
      { key: "IsActive", header: "وضعیت", width: 90, type: "boolean" },
    ],
    []
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="ItemAccountCategory"
        data={data}
        columns={columns as any}
        title={`فهرست طبقات حساب کالا (${totalItems})`}
        icon={<Layers className="w-5 h-5 text-gray-500" />}
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

export default ItemAccountCategoryList;
