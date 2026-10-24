"use client";
import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { TreeView, Select, FileUpload } from "@/components/inputs";
import { UploadCloud, FileType, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

const IMPORT_TREE_DATA: TreeNode[] = [
  {
    id: "general",
    name: "اطلاعات پایه و عمومی",
    children: [
      { id: "accounts", name: "کدینگ حساب‌ها" },
      { id: "parties", name: "اشخاص و طرف حساب‌ها" },
      { id: "banks", name: "بانک‌ها و حساب‌های بانکی" },
    ],
  },
  {
    id: "inventory",
    name: "انبار و کالا",
    children: [
      { id: "products", name: "کالاها و خدمات" },
      { id: "warehouses", name: "انبارها" },
    ],
  },
];

const IMPORT_FORMAT_OPTIONS = [
  { value: "sepidar_sql", label: "فایل پشتیبان (SQL Bak) یا اسکریپت سپیدار سیستم" },
  { value: "excel", label: "فایل اکسل (Excel/CSV) ساختار استاندارد" },
  { value: "holoo", label: "فایل خروجی نرم افزار هلو" },
];

export default function DataImportPage() {
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [format, setFormat] = useState("sepidar_sql");

  const handleSelect = (node: TreeNode) => {
    if (node.children && node.children.length > 0) return; // Only allow selecting leaves
    setSelectedNode(node);
    setImportStatus("idle");
    setLogs([]);
    setFileUrl("");
  };

  const handleImport = async () => {
    if (!fileUrl) return;
    setIsImporting(true);
    setImportStatus("idle");
    setLogs((prev) => [...prev, `شروع انتقال اطلاعات برای ${selectedNode?.name}...`]);

    // Simulate import process
    setTimeout(() => {
      setLogs((prev) => [...prev, `در حال خواندن فایل و پردازش رکوردهای ${selectedNode?.name}...`]);
    }, 1000);

    setTimeout(() => {
      setLogs((prev) => [...prev, `تبدیل ساختار داده های مبدا به جداول سیستم...`]);
    }, 2500);

    setTimeout(() => {
      setLogs((prev) => [...prev, `عملیات با موفقیت انجام شد. ۱۲۳۴ رکورد منتقل گردید.`]);
      setIsImporting(false);
      setImportStatus("success");
    }, 4500);
  };

  return (
    <PageContainer title="دریافت اطلاعات (کانورت)">
      <div className="flex h-[calc(100vh-140px)] gap-4">
        {/* Right Sidebar - Tree View */}
        <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-800 text-sm">نرم افزارها و فرم ها</h2>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <TreeView
              data={IMPORT_TREE_DATA}
              onChange={() => {}}
              onSelect={handleSelect}
              readOnly={true}
              defaultExpandAll={true}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col overflow-hidden">
          {!selectedNode ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <UploadCloud className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">فرم مورد نظر را از لیست سمت راست انتخاب کنید</h3>
              <p className="text-sm">برای شروع انتقال اطلاعات، ابتدا فرم مقصد را مشخص نمایید.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">دریافت اطلاعات: {selectedNode.name}</h2>
                <p className="text-sm text-gray-500">فایل پشتیبان یا اسکریپت خروجی سیستم مبدا را برای انتقال به فرم "{selectedNode.name}" بارگذاری کنید.</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">فرمت سیستم مبدا</label>
                  <Select
                    value={format}
                    onChange={(val) => setFormat(val)}
                    options={IMPORT_FORMAT_OPTIONS}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">فایل اطلاعات</label>
                <div className="max-w-xl">
                  <FileUpload
                    onUploadComplete={(url) => setFileUrl(url)}
                    accept={format === "sepidar_sql" ? ".bak,.sql" : ".xlsx,.xls,.csv"}
                  />
                </div>
              </div>

              <div className="mb-8">
                <Button 
                  onClick={handleImport} 
                  disabled={!fileUrl || isImporting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-40"
                >
                  {isImporting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      در حال پردازش...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileType className="w-4 h-4" />
                      شروع انتقال اطلاعات
                    </span>
                  )}
                </Button>
              </div>

              {/* Logs Area */}
              <div className="flex-1 flex flex-col bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <div className="p-2 border-b border-slate-200 bg-slate-100/50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">گزارش عملیات انتقال</span>
                  {importStatus === "success" && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> با موفقیت پایان یافت
                    </span>
                  )}
                  {importStatus === "error" && (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> خطا در انتقال
                    </span>
                  )}
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed">
                  {logs.length === 0 ? (
                    <span className="text-slate-400">آماده برای شروع فرآیند...</span>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-slate-700 mb-1">
                        <span className="text-slate-400 mr-2">[{new Date().toLocaleTimeString('fa-IR')}]</span>
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
