"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "@/components/ui/MainDataGrid";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { Package } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { ItemType, PricingMethod } from "@/backend/src/softwares/inv/domain/enums/item.enums";

export function ProductServiceList() {
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

      const res = await apiFetch(`/api/inv/items?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const responseData = json.data || json;
        setData(responseData.items || (Array.isArray(responseData) ? responseData : []));
        setTotalItems(responseData.total || (Array.isArray(responseData) ? responseData.length : 0));
      } else {
        showToast("خطا در دریافت اطلاعات کالا و خدمات", "error");
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
      if (payload?.entity === "Item") {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    const itemId = row.ItemID || row.id;
    addTab(
      `ویرایش کالا خدمت ${row.ItemName || row.ItemCode || ''}`,
      "inv",
      <Package className="w-4 h-4" />,
      "ProductServiceForm",
      { id: itemId }
    );
  };

  const handleNew = () => {
    addTab(
      "کالا خدمت جدید",
      "inv",
      <Package className="w-4 h-4" />,
      "ProductServiceForm"
    );
  };

  const handleDelete = async (item: any) => {
    const itemId = item.ItemID || item.id;
    try {
      const usageRes = await apiFetch(`/api/core/usage-check?tableName=Item&id=${itemId}`);
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData?.isUsed) {
          showToast(`امکان حذف این کالا به دلیل استفاده در بخش‌های دیگر وجود ندارد.`, "error");
          return;
        }
      }

      const res = await apiFetch(`/api/inv/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: "Item" });
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
      {
        key: "ItemType",
        header: "نوع",
        width: 100,
        cell: (info: any) => {
          const val = info.row.original.ItemType;
          if (val === ItemType.GOODS) return "کالا";
          if (val === ItemType.SERVICE) return "خدمت";
          return "نامشخص";
        },
      },
      { key: "ItemCode", header: "کد", width: 100 },
      { key: "ItemName", header: "عنوان", width: 220 },
      { key: "ItemName2", header: "عنوان (2)", width: 220 },
      { key: "IranCode", header: "ایران کد", width: 130 },
      {
        key: "PricingMethod",
        header: "روش قیمت‌گذاری",
        width: 180,
        cell: (info: any) => {
          const val = info.row.original.PricingMethod ?? info.row.original.CategoryPricingMethod;
          if (val === 1) return "میانگین موزون";
          if (val === 2) return "FIFO (نخستین ورودی، نخستین خروجی)";
          if (val === 3) return "LIFO (آخرین ورودی، نخستین خروجی)";
          if (val === 4) return "نرخ استاندارد";
          return info.row.original.ValuationMethod || info.row.original.PricingMethodName || "نامشخص";
        },
      },
      { key: "IsSalable", header: "قابل فروش", width: 100, type: "boolean" },
      { key: "IsActive", header: "وضعیت", width: 90, type: "boolean" },
    ],
    []
  );

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="Item"
        data={data}
        columns={columns as any}
        title={`فهرست کالا و خدمات (${totalItems})`}
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

export default ProductServiceList;
