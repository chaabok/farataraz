"use client";

import React, { useMemo, useState, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "@/components/ui/MainDataGrid";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { Package } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { ItemType } from "@/backend/src/softwares/inv/domain/enums/item.enums";

export function ItemPackageList() {
  const { addTab } = useTabs();
  const { showToast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/inv/item-packages");
      if (res.ok) {
        const json = await res.json();
        const responseData = Array.isArray(json) ? json : (json.data || []);
        setData(responseData);
        setTotalItems(responseData.length);
      } else {
        showToast("خطا در دریافت اطلاعات پک کالا خدمت", "error");
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
      if (payload?.entity === "ItemPackage") {
        if (params) fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    const pkgId = row.ItemPackageID || row.id;
    addTab(
      `ویرایش پک ${row.PackageTitle || row.PackageCode || ''}`,
      "inv",
      <Package className="w-4 h-4" />,
      "ItemPackageForm",
      { id: pkgId }
    );
  };

  const handleNew = () => {
    addTab(
      "پک کالا خدمت جدید",
      "inv",
      <Package className="w-4 h-4" />,
      "ItemPackageForm"
    );
  };

  const handleDelete = async (item: any) => {
    const pkgId = item.ItemPackageID || item.id;
    try {
      const res = await apiFetch(`/api/inv/item-packages/${pkgId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "خطا در حذف پک کالا خدمت", "error");
        return;
      }
      showToast("پک کالا خدمت با موفقیت حذف شد", "success");
      if (params) fetchData(params);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("خطا در اجرای عملیات حذف", "error");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "ItemType",
        header: "نوع",
        size: 90,
        cell: (info: any) => {
          const val = Number(info.getValue());
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                val === ItemType.SERVICE
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              }`}
            >
              {val === ItemType.SERVICE ? "خدمت" : "کالا"}
            </span>
          );
        },
      },
      {
        accessorKey: "PackageCode",
        header: "کد پک",
        size: 110,
        cell: (info: any) => info.getValue() || "-",
      },
      {
        accessorKey: "PackageTitle",
        header: "عنوان پک",
        size: 220,
        cell: (info: any) => info.getValue() || "-",
      },
      {
        accessorKey: "PackageTitle2",
        header: "عنوان پک (۲)",
        size: 180,
        cell: (info: any) => info.getValue() || "-",
      },
      {
        accessorKey: "MeasurementUnit.MeasurementUnitName",
        header: "واحد سنجش",
        size: 120,
        cell: (info: any) => info.getValue() || info.row.original?.MeasurementUnit?.title || "-",
      },
      {
        accessorKey: "Quantity",
        header: "مقدار",
        size: 90,
        cell: (info: any) => info.getValue() !== undefined ? Number(info.getValue()) : 1,
      },
      {
        accessorKey: "IsActive",
        header: "وضعیت",
        size: 90,
        cell: (info: any) => (
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              info.getValue()
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
            }`}
          >
            {info.getValue() ? "فعال" : "غیرفعال"}
          </span>
        ),
      },
      {
        accessorKey: "Description",
        header: "توضیحات",
        size: 200,
        cell: (info: any) => info.getValue() || "-",
      },
    ],
    []
  );

  return (
    <MainDataGrid
      columns={columns}
      data={data}
      totalItems={totalItems}
      title="فهرست پک کالا خدمت"
      onNew={handleNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onParamsChange={handleParamsChange}
      isLoading={isLoading}
    />
  );
}
