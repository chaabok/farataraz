"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { MainDataGrid, DataGridParams } from "../../ui/MainDataGrid";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { UserForm } from "./UserForm";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

export function UserList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [params, setParams] = useState<DataGridParams | null>(null);

  const { addTab } = useTabs();
  const { showToast } = useToast();

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

      const response = await apiFetch(`/api/iam/users?${queryParams.toString()}`, {
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
      console.error("Error loading users:", error);
      showToast("خطا در دریافت اطلاعات کاربران", "error");
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
      if (payload?.entity === 'User') {
        if (params) loadData(params);
      }
    });
    return () => unsubscribe();
  }, [params]);

  const handleEdit = (row: any) => {
    addTab(
      `ویرایش کاربر - ${row.username}`,
      'admin',
      undefined,
      'UserForm',
      { id: row.id }
    );
  };

  const handleDelete = async (row: any) => {
    if (row.username?.toLowerCase() === 'admin') {
      showToast("کاربر Admin قابل حذف نیست", "error");
      return;
    }
    try {
      const res = await apiFetch(`/api/iam/users/${row.id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        showToast("کاربر با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'User' });
        if (params) loadData(params);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "خطا در حذف کاربر", "error");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      showToast(error.message || "خطا در ارتباط با سرور", "error");
    }
  };

  const handleNew = () => {
    addTab(
      'تعریف کاربر جدید',
      'admin',
      undefined,
      'UserForm'
    );
  };

  return (
    <MainDataGrid
        entityName="User"
      title="فهرست کاربران"
      data={data}
      isLoading={loading}
      columns={[
        { key: "id", header: "ردیف", width: 80 },
        { key: "username", header: "نام کاربری" },
        { key: "firstName", header: "نام" },
        { key: "lastName", header: "نام خانوادگی" },
        { 
          key: "isOnline", 
          header: "کاربران آنلاین", 
          cell: (info) => {
            const lastSeen = info.row.original.lastSeen;
            let isOnline = false;
            
            if (lastSeen) {
              const lastSeenDate = new Date(lastSeen);
              const now = new Date();
              const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
              // Consider online if active in last 3 minutes
              isOnline = diffMinutes < 3;
            }
            
            return (
              <div className="flex items-center justify-center h-full">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            );
          }
        },
        { 
          key: "isTwoFactorEnabled", 
          header: "ورود دو مرحله‌ای", 
          cell: (info) => {
            const isEnabled = info.row.original.isTwoFactorEnabled;
            return (
              <div className="flex items-center justify-center h-full">
                <Check className={`w-5 h-5 ${isEnabled ? 'text-green-500' : 'text-gray-300'}`} />
              </div>
            );
          }
        },
        { 
          key: "isActive", 
          header: "وضعیت", 
          cell: (info) => info.getValue() ? 'فعال' : 'غیرفعال'
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