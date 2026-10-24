"use client";

import { apiFetch } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { MainDataGrid } from "@/components/ui/MainDataGrid";
import { useLanguage } from "@/components/Providers";
import { useTabs } from "@/components/TabsProvider";
import { FileText } from "lucide-react";

export const useChequebookColumns = () => {
  const { t } = useLanguage();
  return [
    { key: "chequebookId", label: "کد" },
    { key: "bankAccount.accountNumber", label: "شماره حساب" },
    { key: "series", label: "سری" },
    { key: "leafCount", label: "تعداد برگ" },
    { key: "startSerial", label: "سریال شروع" },
    { 
      key: "isActive", 
      label: "وضعیت",
      cell: ({ row }: any) => {
        const val = row.original.isActive;
        return (
           <span className={val ? "bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200" : "bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-200"}>
             {val ? "فعال" : "غیرفعال"}
           </span>
        )
      }
    },
  ];
};

export default function ChequebookList() {
  const { t } = useLanguage();
  const { addTab } = useTabs();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = () => {
    setIsLoading(true);
    apiFetch("/api/rap/chequebooks")
      .then(res => res.json())
      .then(json => {
        setData(json.items || json || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const columns = useChequebookColumns();

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="Chequebook" 
        title="دسته چک ها"
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={() => {
          addTab(
            "دسته چک جدید",
            "rap",
            <FileText className="w-4 h-4" />,
            "ChequebookForm"
          );
        }}
        onRefresh={fetchList}
        onRowDoubleClick={(item) => {
          addTab(
            `ویرایش دسته چک`,
            "rap",
            <FileText className="w-4 h-4" />,
            "ChequebookForm",
            { id: item.chequebookId }
          );
        }}
      />
    </div>
  );
}
