"use client";

import React, { useState, useEffect } from "react";
import { List, Calculator, Plus, Eye, FileText, Search, RefreshCw, CheckCircle, Clock } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { apiFetch } from "@/lib/utils";

export function WarehousePricingList() {
  const { addTab } = useTabs();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

  const fetchRecords = () => {
    setIsLoading(true);
    apiFetch("/api/inv/warehouse-pricing")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setRecords(list);
        } else {
          loadMockRecords();
        }
      })
      .catch(() => {
        loadMockRecords();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadMockRecords = () => {
    setRecords([
      {
        id: 1,
        pricingCode: "PRC-1001",
        pricingTitle: "قیمت‌گذاری و ریالی‌سازی اسناد انبار مرکزی",
        warehouseName: "انبار مرکزی مواد اولیه",
        valuationMethodTitle: "میانگین موزون",
        startDate: "1403/05/01",
        endDate: "1403/05/31",
        totalDocs: 48,
        totalValue: 425000000,
        hasVoucher: true,
        voucherNo: "800101",
        statusTitle: "تکمیل شده",
      },
      {
        id: 2,
        pricingCode: "PRC-1002",
        pricingTitle: "قیمت‌گذاری اسناد انبار قطعات یدکی",
        warehouseName: "انبار قطعات و ملزومات",
        valuationMethodTitle: "اولین وارده اولین صادره (FIFO)",
        startDate: "1403/05/01",
        endDate: "1403/05/31",
        totalDocs: 22,
        totalValue: 180000000,
        hasVoucher: false,
        voucherNo: "-",
        statusTitle: "در انتظار صدور سند",
      },
      {
        id: 3,
        pricingCode: "PRC-1003",
        pricingTitle: "ریالی‌سازی محصولات نیمه‌ساخته",
        warehouseName: "انبار محصول و نیمه‌ساخته",
        valuationMethodTitle: "نرخ استاندارد",
        startDate: "1403/04/01",
        endDate: "1403/04/31",
        totalDocs: 35,
        totalValue: 690000000,
        hasVoucher: true,
        voucherNo: "800095",
        statusTitle: "تکمیل شده",
      },
    ]);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(
    (item) =>
      item.pricingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pricingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewPricing = () => {
    addTab("قیمت گذاری اسناد انبار", "warehouse_pricing", null, "WarehousePricingForm");
  };

  const handleOpenNewVoucher = (record?: any) => {
    addTab("صدور سند حسابداری انبار", "warehouse_voucher", null, "WarehouseVoucherForm", {
      warehouseRef: record?.warehouseRef,
      startDate: record?.startDate,
      endDate: record?.endDate,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 p-3 space-y-3 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <List className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              فهرست اسناد قیمت‌گذاری شده انبار
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              سوابق عملیات ارزیابی ریالی انبار و اسناد حسابداری صادر شده
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={fetchRecords}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="به‌روزرسانی"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenNewPricing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center space-x-1.5 space-x-reverse transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>عملیات قیمت‌گذاری جدید</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در کد، عنوان یا نام انبار..."
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          تعداد رکوردموجودی: {filteredRecords.length}
        </span>
      </div>

      {/* Table Content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="p-2.5 font-semibold">#</th>
              <th className="p-2.5 font-semibold">کد عملیات</th>
              <th className="p-2.5 font-semibold">عنوان ارزیابی</th>
              <th className="p-2.5 font-semibold">انبار</th>
              <th className="p-2.5 font-semibold">روش قیمت‌گذاری</th>
              <th className="p-2.5 font-semibold">بازه زمانی</th>
              <th className="p-2.5 font-semibold">تعداد اسناد</th>
              <th className="p-2.5 font-semibold">ارزش کل (ریال)</th>
              <th className="p-2.5 font-semibold text-center">سند حسابداری</th>
              <th className="p-2.5 font-semibold text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredRecords.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 text-slate-700 dark:text-slate-200">
                <td className="p-2.5 text-slate-400">{idx + 1}</td>
                <td className="p-2.5 font-mono dir-ltr text-right font-medium text-indigo-600 dark:text-indigo-400">{item.pricingCode}</td>
                <td className="p-2.5 font-medium">{item.pricingTitle}</td>
                <td className="p-2.5">{item.warehouseName}</td>
                <td className="p-2.5">{item.valuationMethodTitle}</td>
                <td className="p-2.5 text-slate-500">{item.startDate} تا {item.endDate}</td>
                <td className="p-2.5 font-medium">{item.totalDocs}</td>
                <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{Number(item.totalValue).toLocaleString()}</td>
                <td className="p-2.5 text-center">
                  {item.hasVoucher ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      شماره {item.voucherNo}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      <Clock className="w-3 h-3 ml-1" />
                      صادر نشده
                    </span>
                  )}
                </td>
                <td className="p-2.5 text-center">
                  <div className="flex items-center justify-center space-x-1 space-x-reverse">
                    <button
                      type="button"
                      onClick={() => handleOpenNewVoucher(item)}
                      className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded"
                      title="صدور سند حسابداری"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WarehousePricingList;
