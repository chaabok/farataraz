"use client";

import React, { useState, useEffect } from "react";
import { MainDataGrid } from "../../ui/MainDataGrid";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { FileText } from "lucide-react";
import { apiFetch } from "@/lib/utils";

export default function ChequePrintTemplateList() {
  const { t } = useLanguage();
  const { addTab } = useTabs();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = () => {
    setIsLoading(true);
    apiFetch("/api/rap/cheque-print-templates")
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

  const handleDelete = async (item: any) => {
    if (!item.chequePrintTemplateId) return;
    try {
      const res = await apiFetch(`/api/rap/cheque-print-templates/${item.chequePrintTemplateId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchList();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (item: any) => {
    addTab(
      `ویرایش قالب چک`,
      "rap",
      <FileText className="w-4 h-4" />,
      "ChequeTemplateSettings",
      { id: item.chequePrintTemplateId }
    );
  };

  const columns = [
    { key: "chequePrintTemplateId", label: "کد" },
    { key: "title", label: "عنوان قالب", searchable: true },
    { key: "bankRef", label: "شناسه بانک" }
  ];

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      <MainDataGrid
        entityName="ChequePrintTemplate" 
        title="قالب های چاپ چک"
        columns={columns}
        data={data}
        isLoading={isLoading}
        onAdd={() => {
          addTab(
            "تنظیمات قالب چک",
            "rap",
            <FileText className="w-4 h-4" />,
            "ChequeTemplateSettings"
          );
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchList}
        onRowDoubleClick={handleEdit}
      />
    </div>
  );
}
