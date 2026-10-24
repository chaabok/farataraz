"use client";

import React, { useState, useEffect } from "react";
import { MainDataGrid, DataGridParams } from "../../ui/MainDataGrid";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { useLanguage } from "../../Providers";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

export function UserGroupList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const { addTab } = useTabs();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const loadData = async (currentParams: DataGridParams) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('pageIndex', currentParams.pageIndex.toString());
      queryParams.append('pageSize', currentParams.pageSize.toString());
      if (currentParams.sorting?.length) {
        queryParams.append('sorting', JSON.stringify(currentParams.sorting));
      }
      if (currentParams.columnFilters?.length) {
        queryParams.append('columnFilters', JSON.stringify(currentParams.columnFilters));
      }
      if (currentParams.advancedFilters?.length) {
        queryParams.append('advancedFilters', JSON.stringify(currentParams.advancedFilters));
      }
      if (currentParams.globalFilter) {
        queryParams.append('globalFilter', currentParams.globalFilter);
      }

      const response = await apiFetch(`/api/iam/user-groups?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.items) {
          setData(result.items);
          setTotalItems(result.total);
        } else {
          setData(result);
          setTotalItems(result.length);
        }
      }
    } catch (error) {
      console.error("Error loading user groups:", error);
      showToast(t('error_loading_data' as any) || "خطا در دریافت اطلاعات", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleParamsChange = (newParams: DataGridParams) => {
    setParams(newParams);
    loadData(newParams);
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'UserGroup') {
        if (params) loadData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `${t('edit_user_group' as any) || 'ویرایش گروه کاربری'} - ${row.title}`,
      'admin',
      undefined,
      'UserGroupForm',
      { id: row.id }
    );
  };

  const handleDelete = async (row: any) => {
    try {
      const res = await apiFetch(`/api/iam/user-groups/${row.id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'UserGroup' });
        if (params) loadData(params);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || t('delete_error' as any) || "خطا در حذف", "error");
      }
    } catch (error: any) {
      console.error("Error deleting user group:", error);
      showToast(error.message || t('connection_error' as any) || "خطا در ارتباط با سرور", "error");
    }
  };

  const handleNew = () => {
    addTab(
      t('new_user_group' as any) || 'تعریف گروه کاربری جدید',
      'admin',
      undefined,
      'UserGroupForm'
    );
  };

  return (
    <MainDataGrid
        entityName="UserGroup"
      title={t('user_group_list' as any) || "فهرست گروه‌های کاربری"}
      data={data}
      isLoading={loading}
      columns={[
        { key: "id", header: t('id' as any) || "ردیف", width: 80 },
        { key: "code", header: t('group_code' as any) || "کد گروه" },
        { key: "title", header: t('group_title' as any) || "عنوان فارسی" },
        { key: "titleEn", header: t('group_title_en' as any) || "عنوان لاتین" },
        { 
          key: "isActive", 
          header: t('status' as any) || "وضعیت", 
          cell: (info) => info.getValue() ? (t('active' as any) || 'فعال') : (t('inactive' as any) || 'غیرفعال')
        },
      ]}
      onAdd={handleNew}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={() => params && loadData(params)}
      serverSide={true}
      totalItems={totalItems}
      onParamsChange={handleParamsChange}
    />
  );
}
