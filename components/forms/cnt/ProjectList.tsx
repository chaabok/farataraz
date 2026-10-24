"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MainDataGrid, DataGridParams } from "../../ui/MainDataGrid";
import { useLanguage } from "../../Providers";
import { FolderKanban } from "lucide-react";
import { useTabs } from "../../TabsProvider";
import { apiFetch } from "@/lib/utils";
import { useToast } from "../../ToastProvider";
import { eventBus, EVENTS } from "@/lib/events";

export function ProjectList() {
  const { t } = useLanguage();
  const { addTab } = useTabs();
  const { showToast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const columns = useMemo(() => [
    { key: "code", header: t('code' as any) || "کد", width: 120, filterable: true, sortable: true },
    { key: "title", header: t('title' as any) || "عنوان", width: 300, filterable: true, sortable: true },
    { key: "titleEn", header: t('title_en' as any) || "عنوان انگلیسی (Title)", width: 250, filterable: true, sortable: true },
    { key: "detailedAccountCode", header: t('detailed_account_code' as any) || "کد تفصیلی", width: 180, filterable: true, sortable: true },
    { key: "isActive", header: t('active' as any) || "فعال", width: 100, type: 'boolean' as const, filterable: true, sortable: true },
  ], [t]);

  const fetchData = async (currentParams: DataGridParams) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('pageIndex', currentParams.pageIndex.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      
      if (currentParams.sorting?.length) {
        queryParams.append('sorting', JSON.stringify(currentParams.sorting));
      }
      if (currentParams.columnFilters?.length) {
        queryParams.append('columnFilters', JSON.stringify(currentParams.columnFilters));
      }
      if (currentParams.globalFilter) {
        queryParams.append('globalFilter', currentParams.globalFilter);
      }

      const res = await apiFetch(`/api/cnt/projects?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.items) {
          setData(json.items);
          setTotalItems(json.total || 0);
        } else if (Array.isArray(json)) {
          setData(json);
          setTotalItems(json.length);
        }
      } else {
        showToast(t('fetch_error' as any) || "خطا در دریافت اطلاعات", "error");
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast(t('fetch_error' as any) || "خطا در دریافت اطلاعات", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData({
      pageIndex: 0,
      pageSize: 50,
      sorting: [],
      columnFilters: [],
      globalFilter: ""
    });
  }, []);

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
    fetchData(newParams);
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if ((payload?.entity === 'Project' || payload?.entity === 'DetailedAccount') && params) {
        fetchData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (item: any) => {
    addTab(
      `${t('edit_project' as any) || "ویرایش پروژه"} - ${item.title}`,
      'financial',
      <FolderKanban className="w-4 h-4 text-emerald-500" />,
      'ProjectForm',
      { id: item.projectId }
    );
  };

  const handleCreate = () => {
    addTab(
      t('new_project' as any) || "پروژه جدید",
      'financial',
      <FolderKanban className="w-4 h-4 text-emerald-500" />,
      'ProjectForm'
    );
  };

  const handleDelete = async (item: any) => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/api/cnt/projects/${item.projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast(t('project_delete_success' as any) || "پروژه با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });
        if (params) fetchData(params);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.message || (t('delete_error' as any) || "خطا در حذف پروژه"), "error");
      }
    } catch (err: any) {
      showToast(err.message || (t('delete_error' as any) || "خطا در حذف پروژه"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainDataGrid
        entityName="Project"
      title={t('projects_list' as any) || "فهرست پروژه‌ها"}
      icon={<FolderKanban className="w-5 h-5 text-emerald-500" />}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => params && fetchData(params)}
      onEdit={handleEdit}
      onAdd={handleCreate}
      onDelete={handleDelete}
      serverSide={true}
      totalItems={totalItems}
      onParamsChange={handleParamsChange}
      className="h-full"
    />
  );
}

export default ProjectList;
