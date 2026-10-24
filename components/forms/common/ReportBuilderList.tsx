"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  RefreshCcw,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Folder,
  FolderPlus,
  Eye,
  PenTool,
} from "lucide-react";
import { useLanguage } from "../../Providers";
import { useToast } from "@/components/ToastProvider";
import { useTabs } from "../../TabsProvider";
import { useConfirm } from "../../ConfirmProvider";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

import { ReportBuilder } from "./ReportBuilder";
import { SimpleForm } from "../SimpleForm";

const CATEGORIES = [
  { id: "sales", label: "مشتریان و فروش" },
  { id: "inventory", label: "تامین کنندگان و انبار" },
  { id: "rap", label: "دریافت و پرداخت" },
  { id: "accounting", label: "حسابداری" },
  { id: "payroll", label: "حقوق و دستمزد" },
  { id: "company", label: "شرکت" },
  { id: "retail", label: "خرده فروشی" },
  { id: "contracting", label: "پیمانکاری" },
  { id: "workorder", label: "سفارش کار" },
  { id: "assets", label: "دارایی ثابت" },
  { id: "crm", label: "ارتباطات" },
  { id: "distribution", label: "سفارش گیری و پخش" },
  { id: "foreign_trade", label: "سفارشات و خرید خارجی" },
  { id: "management", label: "گزارشات مدیریتی" },
];

export function ReportBuilderList() {
  const { t, direction: dir } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { addTab } = useTabs();

  const [reports, setReports] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const [selectedNode, setSelectedNode] = useState<{
    type: "category" | "user_group" | "report";
    id: string;
  } | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    id?: string;
    category?: string;
    isUserReport?: boolean;
    startInDesigner?: boolean;
  }>({ isOpen: false });
  const [groupModalState, setGroupModalState] = useState<{
    isOpen: boolean;
    id?: string;
    title: string;
  }>({ isOpen: false, title: "" });
  const [contextMenu, setContextMenu] = useState<{
    right: number;
    left: number;
    y: number;
    id: string;
    type: "report" | "group";
    isUserReport?: boolean;
  } | null>(null);

  const [duplicateModalState, setDuplicateModalState] = useState<{
    isOpen: boolean;
    originalId: string;
    originalTitle: string;
    isUserReport: boolean;
    newTitle: string;
    newGroupId: string;
  }>({
    isOpen: false,
    originalId: "",
    originalTitle: "",
    isUserReport: false,
    newTitle: "",
    newGroupId: "",
  });

  const handleDesignReport = (reportId?: string) => {
    const idToUse =
      reportId || (selectedNode?.type === "report" ? selectedNode.id : null);
    if (idToUse) {
      const row = reports.find((r) => r.id.toString() === idToUse.toString());
      if (row) {
        setModalState({
          isOpen: true,
          id: row.id.toString(),
          isUserReport: row.isUserReport,
          startInDesigner: true,
        });
      }
    } else {
      showToast("ابتدا یک گزارش جهت طراحی انتخاب کنید", "warning");
    }
  };

  const handlePreviewReport = (reportId?: string) => {
    const idToUse =
      reportId || (selectedNode?.type === "report" ? selectedNode.id : null);
    if (idToUse) {
      const row = reports.find((r) => r.id.toString() === idToUse.toString());
      if (row) {
        if (row.isUserReport) {
          addTab(
            `اجرای گزارش: ${row.Title}`,
            'general',
            null,
            'ReportBuilder',
            { id: parseInt(idToUse), isUserReport: true, startInPreview: true }
          );
        } else {
          addTab(
            `اجرای گزارش: ${row.Title}`,
            'general',
            null,
            'ReportBuilder',
            { id: parseInt(idToUse), isUserReport: false, startInPreview: true }
          );
        }
      }
    } else {
      showToast("ابتدا یک گزارش انتخاب کنید", "warning");
    }
  };

  const handleDuplicate = (reportIdToCopy?: string) => {
    const targetId = reportIdToCopy || (selectedNode?.type === "report" ? selectedNode.id : null);
    if (!targetId) {
      showToast("ابتدا یک گزارش جهت تکثیر انتخاب کنید", "warning");
      return;
    }
    const row = reports.find((r) => r.id.toString() === targetId.toString());
    if (!row) return;

    let baseName = row.Title || "گزارش";
    let newName = baseName;
    let counter = 1;
    while (reports.some((r) => r.isUserReport && r.Title === newName)) {
      newName = `${baseName} (${counter})`;
      counter++;
    }

    setDuplicateModalState({
      isOpen: true,
      originalId: row.id.toString(),
      originalTitle: row.Title,
      isUserReport: row.isUserReport,
      newTitle: newName,
      newGroupId: userGroups.length > 0 ? userGroups[0].reportGroupID.toString() : "",
    });
  };

  const submitDuplicate = async () => {
    if (!duplicateModalState.newTitle.trim()) {
      showToast("نام گزارش نمی‌تواند خالی باشد", "warning");
      return;
    }
    if (!duplicateModalState.newGroupId) {
      showToast("لطفا یک گروه انتخاب کنید", "warning");
      return;
    }

    try {
      setLoading(true);
      const url = duplicateModalState.isUserReport
        ? `/api/rpt/reports/${duplicateModalState.originalId}`
        : `/api/common/report-templates/${duplicateModalState.originalId}`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات گزارش اصلی");
      const data = await res.json();

      const cleanProps = (obj: any, keysToRemove: string[]) => {
        if (!obj) return obj;
        const newObj = { ...obj };
        keysToRemove.forEach((k) => delete newObj[k]);
        return newObj;
      };

      const baseKeysToRemove = [
        "reportID",
        "reportTemplateID",
        "createdDate",
        "modifiedDate",
        "createdBy",
        "modifiedBy",
        "reportGroupRef",
      ];
      const fieldKeysToRemove = ["reportFieldID", "reportTemplateFieldID", "reportRef", "reportTemplateRef"];
      const filterKeysToRemove = ["reportFilterID", "reportTemplateFilterID", "reportRef", "reportTemplateRef"];
      const groupingKeysToRemove = ["reportGroupingID", "reportTemplateGroupingID", "reportRef", "reportTemplateRef"];
      const sortingKeysToRemove = ["reportSortingID", "reportTemplateSortingID", "reportRef", "reportTemplateRef"];

      const payload = cleanProps(data, baseKeysToRemove);
      payload.title = duplicateModalState.newTitle;
      // Convert mapping names if needed (from Title to title)
      if (payload.Title && !payload.title) {
        payload.title = payload.Title;
        delete payload.Title;
      }
      payload.reportGroupRef = duplicateModalState.newGroupId;

      if (Array.isArray(payload.fields)) {
        payload.fields = payload.fields.map((f: any) => cleanProps(f, fieldKeysToRemove));
      }
      if (Array.isArray(payload.filters)) {
        payload.filters = payload.filters.map((f: any) => cleanProps(f, filterKeysToRemove));
      }
      if (Array.isArray(payload.groupings)) {
        payload.groupings = payload.groupings.map((f: any) => cleanProps(f, groupingKeysToRemove));
      }
      if (Array.isArray(payload.sortings)) {
        payload.sortings = payload.sortings.map((f: any) => cleanProps(f, sortingKeysToRemove));
      }

      const postRes = await apiFetch(`/api/rpt/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (postRes.ok) {
        showToast("گزارش با موفقیت تکثیر شد", "success");
        setDuplicateModalState((prev) => ({ ...prev, isOpen: false }));
        loadData();
      } else {
        const err = await postRes.json().catch(() => ({}));
        showToast(err.message || "خطا در تکثیر گزارش", "error");
      }
    } catch (e: any) {
      showToast(e.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, groupsRes, userReportsRes] = await Promise.all([
        apiFetch(`/api/common/report-templates?pageSize=1000`),
        apiFetch(`/api/rpt/report-groups`),
        apiFetch(`/api/rpt/reports`),
      ]);

      let allReports = [];
      if (reportsRes.ok) {
        const result = await reportsRes.json();
        const templates = result.items || result;
        allReports = templates.map((r: any) => ({
          id: r.reportTemplateID || r.id,
          Title: r.title || r.Title,
          Category: r.category || r.Category,
          isUserReport: false,
          original: r,
        }));
      }

      if (userReportsRes.ok) {
        const userReports = await userReportsRes.json();
        const mappedUserReports = userReports.map((r: any) => {
          let category = r.reportGroupRef;
          let isUser = true;

          // Map system reports to their respective categories
          if (r.isSystemReport) {
             isUser = false;
             if (r.targetForm?.startsWith('Rap.')) {
                category = 'rap';
             } else if (r.targetForm?.startsWith('Acc.')) {
                category = 'accounting';
             } else if (r.targetForm?.startsWith('Sls.')) {
                category = 'sales';
             } else if (r.targetForm?.startsWith('Inv.')) {
                category = 'inventory';
             } else {
                category = 'rap'; // default for this specific report if no match
             }
          }

          return {
            id: r.reportID,
            Title: r.title,
            Category: category,
            isUserReport: isUser,
          };
        });
        allReports = [...allReports, ...mappedUserReports];
      }

      let uGroups = [];
      if (groupsRes.ok) {
        uGroups = await groupsRes.json();
      }

      setReports(allReports);
      setUserGroups(uGroups);
    } catch (error) {
      console.error("Error loading reports:", error);
      showToast("خطا در دریافت اطلاعات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleNodeClick = (
    type: "category" | "user_group" | "report",
    id: string,
  ) => {
    setSelectedNode({ type, id });
  };

  const handleEdit = () => {
    if (selectedNode?.type === "report") {
      const row = reports.find(
        (r) => r.id.toString() === selectedNode.id.toString(),
      );
      if (row) {
        setModalState({
          isOpen: true,
          id: row.id.toString(),
          isUserReport: row.isUserReport,
        });
      }
    } else if (selectedNode?.type === "user_group") {
      const group = userGroups.find((g) => g.reportGroupID === selectedNode.id);
      if (group) {
        setGroupModalState({
          isOpen: true,
          id: group.reportGroupID,
          title: group.title,
        });
      }
    } else {
      showToast(
        "ابتدا یک گزارش یا گروه کاربری برای ویرایش انتخاب کنید",
        "warning",
      );
    }
  };

  const getReportsByCategory = (categoryId: string) => {
    return reports.filter((r) => String(r.Category).toLowerCase() === String(categoryId).toLowerCase());
  };

  const canDelete = () => {
    if (!selectedNode) return false;
    if (selectedNode.type === "report") {
      const report = reports.find(
        (r) => r.id.toString() === selectedNode.id.toString(),
      );
      if (!report?.isUserReport) return false;
      return true;
    }
    if (selectedNode.type === "user_group") {
      const categoryReports = getReportsByCategory(selectedNode.id);
      if (categoryReports.length > 0) return false;
      return true;
    }
    return false;
  };

  const handleDelete = async () => {
    if (selectedNode?.type === "report") {
      const report = reports.find(
        (r) => r.id.toString() === selectedNode.id.toString(),
      );
      if (!report?.isUserReport) {
        showToast("شما مجاز به حذف گزارشات سیستمی نمی باشید", "error");
        return;
      }
      const isConfirmed = await confirm({
        message: `از حذف گزارش ${report.Title} اطمینان دارید؟`,
      });
      if (!isConfirmed) return;
      try {
        const res = await apiFetch(`/api/rpt/reports/${selectedNode.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("با موفقیت حذف شد", "success");
          setSelectedNode(null);
          loadData();
        } else {
          const errorData = await res.json().catch(() => ({}));
          showToast(errorData.message || "خطا در حذف", "error");
        }
      } catch (error: any) {
        showToast("خطا در ارتباط با سرور", "error");
      }
    } else if (selectedNode?.type === "user_group") {
      const group = userGroups.find((g) => g.reportGroupID === selectedNode.id);
      if (!group) return;

      const categoryReports = getReportsByCategory(selectedNode.id);
      if (categoryReports.length > 0) {
        showToast("گروهی که دارای گزارش است قابل حذف نمی‌باشد.", "error");
        return;
      }

      const isConfirmed = await confirm({
        message: `از حذف گروه ${group.title} اطمینان دارید؟`,
      });
      if (!isConfirmed) return;
      try {
        const res = await apiFetch(
          `/api/rpt/report-groups/${selectedNode.id}`,
          {
            method: "DELETE",
          },
        );
        if (res.ok) {
          showToast("گروه با موفقیت حذف شد", "success");
          setSelectedNode(null);
          loadData();
        } else {
          const errorData = await res.json().catch(() => ({}));
          showToast(errorData.message || "خطا در حذف گروه", "error");
        }
      } catch (error: any) {
        showToast("خطا در ارتباط با سرور", "error");
      }
    } else {
      showToast("آیتمی جهت حذف انتخاب نشده است", "warning");
    }
  };

  const handleNew = () => {
    if (
      selectedNode?.type === "category" ||
      selectedNode?.type === "user_group"
    ) {
      setModalState({ isOpen: true, category: selectedNode.id });
    } else {
      showToast("ابتدا یک شاخه برای ایجاد گزارش انتخاب کنید", "warning");
    }
  };

  const handleNewGroup = () => {
    setGroupModalState({ isOpen: true, title: "" });
  };

  const saveGroup = async () => {
    if (!groupModalState.title.trim()) {
      showToast("نام گروه نمی‌تواند خالی باشد", "warning");
      return;
    }
    try {
      const url = groupModalState.id
        ? `/api/rpt/report-groups/${groupModalState.id}`
        : `/api/rpt/report-groups`;
      const method = groupModalState.id ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: groupModalState.title }),
      });
      if (res.ok) {
        showToast(
          groupModalState.id
            ? "گروه با موفقیت ویرایش شد"
            : "گروه جدید ایجاد شد",
          "success",
        );
        setGroupModalState({ isOpen: false, title: "" });
        loadData();
      } else {
        showToast("خطا در ذخیره گروه", "error");
      }
    } catch (e) {
      showToast("خطا در ارتباط با تراکنش گروه", "error");
    }
  };

  const renderReports = (categoryId: string) => {
    const categoryReports = getReportsByCategory(categoryId);
    return categoryReports.map((report) => {
      const isReportSelected =
        selectedNode?.type === "report" &&
        selectedNode.id === report.id.toString();
      return (
        <div
          key={report.id}
          onClick={() => handleNodeClick("report", report.id.toString())}
          onContextMenu={(e) => {
            e.preventDefault();
            handleNodeClick("report", report.id.toString());
            e.stopPropagation();
            
            const rect = e.currentTarget.getBoundingClientRect();
            let y = rect.bottom;
            if (y + 160 > window.innerHeight) {
              y = rect.top - 160;
            }
            
            setContextMenu({
              right: window.innerWidth - rect.right,
              left: rect.left,
              y,
              id: report.id.toString(),
              type: "report",
              isUserReport: report.isUserReport,
            });
          }}
          onDoubleClick={handleEdit}
          className={`flex items-center gap-1.5 py-1 px-1 cursor-pointer rounded-sm ${isReportSelected ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-700" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 border border-transparent"}`}
        >
          <FileText
            className={`w-3.5 h-3.5 ${report.IsLocked ? "text-red-400" : "text-blue-500 dark:text-blue-400"}`}
          />
          <span className="truncate group-hover:text-gray-900 dark:group-hover:text-gray-100">{report.Title}</span>
        </div>
      );
    });
  };

  const toolbar = (
    <div className="flex items-center justify-start px-0 gap-1.5 shrink-0" style={{ direction: dir }}>
      <button
        onClick={handleNew}
        className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
        title="گزارش جدید"
      >
        <Plus className="w-4 h-4 text-green-600" />
      </button>
      <button
        onClick={handleNewGroup}
        className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
        title="گروه جدید"
      >
        <FolderPlus className="w-4 h-4 text-purple-600" />
      </button>
      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5"></div>
      <button
        onClick={handleEdit}
        className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
        title="ویرایش"
      >
        <Edit className="w-4 h-4 text-blue-600" />
      </button>
      <button
        onClick={() => handleDesignReport()}
        disabled={!selectedNode || selectedNode.type !== "report"}
        className={`p-1.5 rounded transition-colors ${selectedNode && selectedNode.type === "report" ? "text-gray-700 hover:bg-gray-200" : "text-gray-400 cursor-not-allowed opacity-50"}`}
        title="طراحی گزارش"
      >
        <PenTool className="w-4 h-4 text-indigo-600" />
      </button>
      <button
        onClick={() => {
          if (canDelete()) handleDelete();
        }}
        disabled={!canDelete()}
        className={`p-1.5 rounded transition-colors ${canDelete() ? "text-gray-700 hover:bg-gray-200" : "text-gray-400 cursor-not-allowed opacity-50"}`}
        title="حذف"
      >
        <Trash2
          className={`w-4 h-4 ${canDelete() ? "text-red-600" : "text-gray-400"}`}
        />
      </button>
      <button
        onClick={() => handleDuplicate()}
        className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
        title="تکثیر گزارش"
      >
        <Copy className="w-4 h-4 text-orange-500" />
      </button>
      <div className="w-px h-5 bg-gray-300 mx-0.5 dark:bg-gray-600"></div>
      <button
        onClick={loadData}
        className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
        title="بروزرسانی"
      >
        <RefreshCcw className="w-4 h-4" />
      </button>
      <button
        className="p-1.5 text-gray-700 hover:bg-gray-200 rounded"
        title="تنظیمات"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="flex justify-center p-2 h-full w-full">
      <div className="w-full h-full max-w-7xl">
        <SimpleForm
          title="گزارش ساز"
          icon={<FileText className="w-4 h-4 text-white" />}
          showActions={false}
          actionbar={toolbar}
          fields={[]}
          values={{}}
          onChange={() => {}}
          className="h-full"
        >
          <div
            className="flex w-full h-full min-h-[500px] border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md shadow-sm overflow-hidden"
            style={{ direction: dir }}
          >
            {/* Sidebar - Tree View */}
            <div className="w-[300px] bg-white dark:bg-gray-900 border-x border-gray-300 dark:border-gray-700 flex flex-col shrink-0 overflow-hidden">
              {/* Tree Container */}
              <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-2 text-sm select-none">
          {/* Root Node */}
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => toggleCategory("root")}
          >
            <span className="w-4 h-4 flex items-center justify-center">
              {expandedCategories["root"] ? (
                <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              ) : dir === "rtl" ? (
                <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              )}
            </span>
            <FolderOpen className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-gray-800 dark:text-gray-100">گزارشات</span>
          </div>

          {expandedCategories["root"] && (
            <div
              className={`mt-1 border-dotted border-gray-300 flex flex-col gap-0.5 ${dir === "rtl" ? "pr-4 border-r mr-2" : "pl-4 border-l ml-2"}`}
            >
              {/* System Reports */}
              <div className="flex flex-col">
                <div
                  className={`flex items-center gap-1 py-1 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 ${dir === "rtl" ? "pr-1" : "pl-1"}`}
                  onClick={() => toggleCategory("system_reports")}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {expandedCategories["system_reports"] ? (
                      <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    ) : dir === "rtl" ? (
                      <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    )}
                  </span>
                  {expandedCategories["system_reports"] ? (
                    <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    گزارشات سیستم
                  </span>
                </div>

                {expandedCategories["system_reports"] && (
                  <div
                    className={`mt-0.5 border-dotted border-gray-300 flex flex-col gap-0.5 ${dir === "rtl" ? "pr-4 border-r mr-2" : "pl-4 border-l ml-2"}`}
                  >
                    {CATEGORIES.map((category) => {
                      const categoryReports = getReportsByCategory(category.id);
                      const isCatExpanded = expandedCategories[category.id];
                      const isCatSelected =
                        selectedNode?.type === "category" &&
                        selectedNode.id === category.id;

                      return (
                        <div key={category.id} className="flex flex-col">
                          <div
                            className={`flex items-center gap-1 py-1 cursor-pointer transition-colors ${isCatSelected ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"} ${dir === "rtl" ? "pr-1" : "pl-1"}`}
                            onClick={() =>
                              handleNodeClick("category", category.id)
                            }
                          >
                            <span
                              className="w-4 h-4 flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(category.id);
                              }}
                            >
                              {categoryReports.length > 0 ? (
                                isCatExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                ) : dir === "rtl" ? (
                                  <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                )
                              ) : (
                                <span className="w-3 h-3"></span>
                              )}
                            </span>
                            {isCatExpanded ? (
                              <FolderOpen className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Folder className="w-4 h-4 text-yellow-500" />
                            )}
                            <span>{category.label}</span>
                            {categoryReports.length > 0 && (
                              <span
                                className={`text-[10px] text-gray-400 ${dir === "rtl" ? "mr-auto pl-2" : "ml-auto pr-2"}`}
                              >
                                ({categoryReports.length})
                              </span>
                            )}
                          </div>

                          {isCatExpanded && categoryReports.length > 0 && (
                            <div
                              className={`border-dotted border-gray-300 flex flex-col pt-0.5 pb-1 ${dir === "rtl" ? "pr-4 border-r mr-2" : "pl-4 border-l ml-2"}`}
                            >
                              {renderReports(category.id)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* User Reports */}
              <div className="flex flex-col mt-1">
                <div
                  className={`flex items-center gap-1 py-1 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 ${dir === "rtl" ? "pr-1" : "pl-1"}`}
                  onClick={() => toggleCategory("user_reports")}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {expandedCategories["user_reports"] ? (
                      <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    ) : dir === "rtl" ? (
                      <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    )}
                  </span>
                  {expandedCategories["user_reports"] ? (
                    <FolderOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  ) : (
                    <Folder className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  )}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    گزارشات کاربر
                  </span>
                </div>

                {expandedCategories["user_reports"] && (
                  <div
                    className={`mt-0.5 border-dotted border-gray-300 flex flex-col gap-0.5 ${dir === "rtl" ? "pr-4 border-r mr-2" : "pl-4 border-l ml-2"}`}
                  >
                    {userGroups.length === 0 && (
                      <span className="text-xs text-gray-400 py-1 px-2">
                        بدون گروه
                      </span>
                    )}
                    {userGroups.map((group) => {
                      const groupId = group.reportGroupID;
                      const categoryReports = getReportsByCategory(groupId);
                      const isCatExpanded = expandedCategories[groupId];
                      const isCatSelected =
                        selectedNode?.type === "user_group" &&
                        selectedNode.id === groupId;

                      return (
                        <div key={groupId} className="flex flex-col">
                          <div
                            className={`flex items-center gap-1 py-1 cursor-pointer transition-colors ${isCatSelected ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"} ${dir === "rtl" ? "pr-1" : "pl-1"}`}
                            onClick={() =>
                              handleNodeClick("user_group", groupId)
                            }
                            onDoubleClick={() => {
                              handleNodeClick("user_group", groupId);
                              handleEdit();
                            }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNodeClick("user_group", groupId);
                              
                              const rect = e.currentTarget.getBoundingClientRect();
                              let y = rect.bottom;
                              if (y + 160 > window.innerHeight) {
                                y = rect.top - 100;
                              }
                              
                              setContextMenu({
                                right: window.innerWidth - rect.right,
                                left: rect.left,
                                y,
                                id: groupId,
                                type: "group",
                              });
                            }}
                          >
                            <span
                              className="w-4 h-4 flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(groupId);
                              }}
                            >
                              {categoryReports.length > 0 ? (
                                isCatExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                ) : dir === "rtl" ? (
                                  <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                )
                              ) : (
                                <span className="w-3 h-3"></span>
                              )}
                            </span>
                            {isCatExpanded ? (
                              <FolderOpen className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Folder className="w-4 h-4 text-yellow-400" />
                            )}
                            <span className="truncate">{group.title}</span>
                            {categoryReports.length > 0 && (
                              <span
                                className={`text-[10px] text-gray-400 ${dir === "rtl" ? "mr-auto pl-2" : "ml-auto pr-2"}`}
                              >
                                ({categoryReports.length})
                              </span>
                            )}
                          </div>

                          {isCatExpanded && categoryReports.length > 0 && (
                            <div
                              className={`border-dotted border-gray-300 flex flex-col pt-0.5 pb-1 ${dir === "rtl" ? "pr-4 border-r mr-2" : "pl-4 border-l ml-2"}`}
                            >
                              {renderReports(groupId)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none flex-col">
          <div className="relative">
            <div className="w-48 h-48 border-4 border-gray-400 dark:border-gray-500 rotate-45 transform origin-center flex items-center justify-center rounded-xl bg-gray-50/50 dark:bg-gray-800/50 shadow-2xl backdrop-blur-sm">
              <FileText className="w-16 h-16 text-gray-500 dark:text-gray-400 -rotate-45" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-5xl font-black text-gray-300 dark:text-gray-600 whitespace-nowrap opacity-50 z-[-1] blur-[2px]">
              REPORT BUILDER
            </div>
          </div>
        </div>

        {/* Top Header of Main Canvas */}
        <div className="w-full h-14 bg-gradient-to-r from-gray-200/80 to-gray-300/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-md border-b border-gray-300 dark:border-gray-600 flex items-center justify-start px-6 shadow-sm z-10 shrink-0">
          <p className="text-gray-700 dark:text-gray-200 font-medium text-sm flex gap-2 items-center">
            <span className="text-gray-600 dark:text-gray-300">
              در این صفحه می توانید گزارشات موجود را تغییر دهید.
            </span>
          </p>
        </div>
      </div>

      {modalState.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          dir={dir}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[95vw] md:max-w-7xl h-[95vh] md:h-[90vh] flex flex-col overflow-hidden">
            <ReportBuilder
              id={modalState.id ? parseInt(modalState.id) : undefined}
              initialCategory={modalState.category}
              isUserReport={modalState.isUserReport}
              startInDesigner={modalState.startInDesigner}
              onClose={() => {
                setModalState({ isOpen: false });
                loadData();
              }}
            />
          </div>
        </div>
      )}

      {/* Group Modal (Create / Rename) */}
      {groupModalState.isOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          dir={dir}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-5 flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {groupModalState.id ? "ویرایش نام گروه" : "ایجاد گروه جدید"}
            </h3>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                نام گروه
              </label>
              <input
                type="text"
                value={groupModalState.title}
                onChange={(e) =>
                  setGroupModalState((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نام گروه را وارد کنید..."
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setGroupModalState({ isOpen: false, title: "" })}
                className="px-4 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={saveGroup}
                className="px-4 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicateModalState.isOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          dir={dir}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-5 flex flex-col gap-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Copy className="w-5 h-5 text-orange-500" />
              تکثیر گزارش
            </h3>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                نام گزارش جدید
              </label>
              <input
                type="text"
                value={duplicateModalState.newTitle}
                onChange={(e) =>
                  setDuplicateModalState((prev) => ({
                    ...prev,
                    newTitle: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="نام گزارش جدید..."
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                گروه ذخیره‌سازی (فقط گزارشات کاربر)
              </label>
              <select
                value={duplicateModalState.newGroupId}
                onChange={(e) =>
                  setDuplicateModalState((prev) => ({
                    ...prev,
                    newGroupId: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- انتخاب گروه --</option>
                {userGroups.map((g) => (
                  <option key={g.reportGroupID} value={g.reportGroupID}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDuplicateModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                انصراف
              </button>
              <button
                onClick={submitDuplicate}
                disabled={loading}
                className="px-6 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                تکثیر
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && contextMenu.type === "report" && (
        <div
          className="fixed z-[999] bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[200px]"
          style={{ top: contextMenu.y, ...(dir === 'rtl' ? { right: contextMenu.right } : { left: contextMenu.left }) }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
            onClick={() => {
              handleDuplicate(contextMenu.id);
              setContextMenu(null);
            }}
          >
            <Copy className="w-4 h-4 ml-2 text-orange-600" />
            تکثیر گزارش
          </button>
          <button
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
            onClick={() => {
              handleDesignReport(contextMenu.id);
              setContextMenu(null);
            }}
          >
            <PenTool className="w-4 h-4 ml-2 text-indigo-600" />
            طراحی گزارش
          </button>
          <button
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
            onClick={() => {
              handlePreviewReport(contextMenu.id);
              setContextMenu(null);
            }}
          >
            <Eye className="w-4 h-4 ml-2 text-green-600" />
            اجرای گزارش
          </button>
          <div className="border-t border-gray-100 my-1 w-full"></div>
          <button
            className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            onClick={() => {
              handleNodeClick("report", contextMenu.id);
              setTimeout(() => {
                if (canDelete()) handleDelete();
              }, 10);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4 ml-2 text-red-600" />
            حذف
          </button>
        </div>
      )}

      {contextMenu && contextMenu.type === "group" && (
        <div
          className="fixed z-[999] bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[200px]"
          style={{ top: contextMenu.y, ...(dir === 'rtl' ? { right: contextMenu.right } : { left: contextMenu.left }) }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
            onClick={() => {
              handleNodeClick("user_group", contextMenu.id);
              setTimeout(() => {
                handleNew();
              }, 10);
              setContextMenu(null);
            }}
          >
            <Plus className="w-4 h-4 ml-2 text-green-600" />
            گزارش جدید
          </button>
          <button
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
            onClick={() => {
              handleNodeClick("user_group", contextMenu.id);
              setTimeout(() => {
                handleNewGroup();
              }, 10);
              setContextMenu(null);
            }}
          >
            <FolderPlus className="w-4 h-4 ml-2 text-purple-600" />
            گروه جدید
          </button>
          <div className="border-t border-gray-100 my-1 w-full"></div>
          <button
            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center"
            onClick={() => {
              handleNodeClick("user_group", contextMenu.id);
              setTimeout(() => {
                handleEdit();
              }, 10);
              setContextMenu(null);
            }}
          >
            <Edit className="w-4 h-4 ml-2 text-blue-600" />
            ویرایش گروه
          </button>
          <div className="border-t border-gray-100 my-1 w-full"></div>
          <button
            className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            onClick={() => {
              handleNodeClick("user_group", contextMenu.id);
              setTimeout(() => {
                if (canDelete()) handleDelete();
              }, 10);
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4 ml-2 text-red-600" />
            حذف
          </button>
        </div>
      )}
          </div>
        </SimpleForm>
      </div>
    </div>
  );
}
