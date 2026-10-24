"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { apiFetch, safeStringify } from '@/lib/utils';
import { useToast } from '@/components/ToastProvider';
import { useTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { SaveButton } from '@/components/buttons/SaveButton';
import { Checkbox } from '@/components/inputs/Checkbox';
import { NumberInput } from '@/components/inputs/NumberInput';
import { ActionButton } from '@/components/buttons/ActionButton';
import { ListOrdered, RefreshCw } from 'lucide-react';
import { MainDataGrid, DataGridColumn, DataGridParams } from '@/components/ui/MainDataGrid';
import { cn } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';

export function DetailedAccountsNumbering() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { removeTab, activeTabId } = useTabs();
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCompanyCol, setShowCompanyCol] = useState(false);
  
  const [items, setItems] = useState<any[]>([]);

  const fetchSettingsAndData = async () => {
    setLoading(true);
    try {
      // Fetch Base Settings for Tab 1 to see if company is active
      const bsRes = await apiFetch('/api/common/base-settings/tab/1');
      if (bsRes.ok) {
        const bsData = await bsRes.json();
        const activeStructures = (bsData.data?.activeBusinessStructures || '').split(',');
        setShowCompanyCol(activeStructures.includes('2')); // 2 implies company
      }

      // Fetch numbering data
      const res = await apiFetch('/api/common/detailed-accounts-numbering');
      if (res.ok) {
        const result = await res.json();
        setItems(result.data || []);
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در دریافت اطلاعات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndData();
  }, []);

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, (payload) => {
      if (payload?.entity === 'DetailedAccountNumbering') {
        fetchSettingsAndData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    if (activeTabId) removeTab(activeTabId);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/common/detailed-accounts-numbering', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify({ dataList: items }),
      });
      if (res.ok) {
        showToast('مدیریت شماره گذاری با موفقیت ذخیره شد.', 'success');
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccountNumbering' });
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (errorData && errorData.message) {
          const msg = Array.isArray(errorData.message) ? errorData.message.join(' | ') : errorData.message;
          showToast(msg, 'error');
        } else {
          showToast('خطا در ذخیره اطلاعات', 'error');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (index: number, field: string, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const columns: DataGridColumn[] = useMemo(() => {
    const cols = [
      { key: 'detailedTypeCode', header: 'کد', width: 100 },
      { key: 'detailedTypeTitle', header: 'عنوان تفصیلی', width: 250 },
      {
        key: 'isHeadquarterSelected',
        header: 'خودکار',
        width: 100,
        cell: (info: any) => (
          <div className="flex justify-center flex-col items-center">
            <Checkbox 
              checked={info.getValue()} 
              onChange={(val) => handleChange(info.row.index, 'isHeadquarterSelected', val)} 
            />
          </div>
        )
      }
    ];

    if (showCompanyCol) {
      cols.push({
        key: 'isCompanySelected',
        header: 'شرکت',
        width: 100,
        cell: (info: any) => (
          <div className="flex justify-center flex-col items-center">
            <Checkbox 
              checked={info.getValue()} 
              onChange={(val) => handleChange(info.row.index, 'isCompanySelected', val)} 
            />
          </div>
        )
      });
    }

    cols.push({
      key: 'startNumber',
      header: 'شماره شروع',
      width: 150,
      cell: (info: any) => (
        <div className="h-6 w-full -my-1">
          <NumberInput 
            value={info.getValue()} 
            onChange={(val) => handleChange(info.row.index, 'startNumber', parseInt(val || '1'))} 
            integerOnly
          />
        </div>
      )
    }, {
      key: 'endNumber',
      header: 'شماره پایانی',
      width: 150,
      cell: (info: any) => (
        <div className="h-6 w-full -my-1">
          <NumberInput 
            value={info.getValue()} 
            onChange={(val) => handleChange(info.row.index, 'endNumber', parseInt(val || '1000'))} 
            integerOnly
          />
        </div>
      )
    });
    
    return cols;
  }, [showCompanyCol, items]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 rounded-lg">
      <MainDataGrid
        entityName="DetailedAccountsNumbering" 
        columns={columns}
        data={items}
        title={t('DetailedAccountsNumbering') || 'شماره گذاری تفصیلی'}
        icon={<ListOrdered className="h-4 w-4" />}
        isLoading={loading}
        onRefresh={fetchSettingsAndData}
        serverSide={false}
        enableMultiSelection={false}
        customTopActionbar={
          <div className="flex flex-nowrap items-center gap-1.5 px-2 overflow-x-auto no-scrollbar">
            <SaveButton onClick={handleSave} disabled={saving || loading} hideLabel />
          </div>
        }
      />
    </div>
  );
}
