"use client";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch, toEnglishDigits, gregorianToJalaliDisplay } from '@/lib/utils';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { SimpleForm, FieldConfig } from '../SimpleForm';
import { useToast } from '@/components/ToastProvider';
import { useTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { safeStringify } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import { useFormUpsert } from '@/hooks/useFormUpsert';

import momentJalaali from 'moment-jalaali';
import momentHijri from 'moment-hijri';
import moment from 'moment';

export function FiscalYear({ id, initialData }: { id?: number, initialData?: any } = {}) {
  const [values, setValues] = useState<Record<string, any>>({ isActive: true, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { language } = useLanguage();

  const [systemDateType, setSystemDateType] = useState('Jalali');
  const [isInitializing, setIsInitializing] = useState(true);

  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id || initialData?.fiscalYearId || initialData?.fiscalYearID);
  const { isUsed } = useFormUsageCheck("FiscalYear", activeId);


  useEffect(() => {
    apiFetch(`/api/common/base-settings/tab/1`)
      .then(res => res.json())
      .then(result => {
        if (result && result.data && result.data.systemDate) {
          setSystemDateType(result.data.systemDate);
        }
      })
      .catch(err => console.error("Error fetching system date type", err))
      .finally(() => setIsInitializing(false));
  }, []);

  const toEnglishDigits = (str: string): string => {
    if (typeof str !== 'string') return str;
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    for (let i = 0; i < 10; i++) {
      str = str.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
    }
    return str;
  };

  const parseDateToISO = (dateStr: string, sysDate: string) => {
    if (!dateStr) return null;
    try {
      const cleanStr = toEnglishDigits(String(dateStr)).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
        return cleanStr;
      }
      if (/^\d{4}-\d{2}-\d{2}T/.test(cleanStr)) {
        return cleanStr.split('T')[0];
      }

      const slashedStr = cleanStr.replace(/-/g, '/');
      const parts = slashedStr.split('/');
      const year = parseInt(parts[0], 10);

      const isJalali = sysDate === 'Jalali' || sysDate === '1' || (!sysDate && year >= 1300 && year <= 1499) || (year >= 1300 && year <= 1499);

      if (isJalali) {
        const parsed = momentJalaali.utc(slashedStr, ['jYYYY/jMM/jDD', 'jYYYY/jM/jD', 'jYYYY-jMM-jDD'], false);
        if (parsed.isValid()) {
          return toEnglishDigits(parsed.format('YYYY-MM-DD'));
        }
      } else if (sysDate === 'Hijri') {
        const parsed = momentHijri.utc(slashedStr, ['iYYYY/iMM/iDD', 'iYYYY/iM/iD'], false);
        if (parsed.isValid()) {
          return toEnglishDigits(parsed.format('YYYY-MM-DD'));
        }
      } else {
        const parsed = moment.utc(slashedStr, ['YYYY/MM/DD', 'YYYY/M/D'], false);
        if (parsed.isValid()) {
          return toEnglishDigits(parsed.format('YYYY-MM-DD'));
        }
      }

      const fallback = moment.utc(cleanStr);
      if (fallback.isValid()) {
        return toEnglishDigits(fallback.format('YYYY-MM-DD'));
      }

      return null;
    } catch {
      return null;
    }
  };

  const formatISOToDateStr = (isoStr: string, sysDate: string) => {
    if (!isoStr) return '';
    try {
      const strVal = typeof isoStr === 'object' && (isoStr as any) instanceof Date
        ? (isoStr as any).toISOString()
        : String(isoStr);
      const cleanIso = toEnglishDigits(strVal.includes('T') ? strVal.split('T')[0] : strVal);

      if (/^\d{4}\/\d{2}\/\d{2}$/.test(cleanIso)) {
        return cleanIso;
      }

      const isJalali = sysDate === 'Jalali' || sysDate === '1' || !sysDate;
      const isHijri = sysDate === 'Hijri' || sysDate === '2';

      if (isJalali) {
        return gregorianToJalaliDisplay(cleanIso);
      } else if (isHijri) {
        return momentHijri.utc(cleanIso, 'YYYY-MM-DD').format('iYYYY/iMM/iDD');
      } else {
        return moment.utc(cleanIso, 'YYYY-MM-DD').format('YYYY/MM/DD');
      }
    } catch {
      return String(isoStr).split('T')[0].replace(/-/g, '/');
    }
  };

  useEffect(() => {
    if (isInitializing) return;

    if (initialData) {
      setValues(prev => ({
        ...prev,
        ...initialData,
        startDate: formatISOToDateStr(initialData.startDate, systemDateType),
        endDate: formatISOToDateStr(initialData.endDate, systemDateType),
      }));
    } else if (activeId) {
      const numericId = parseInt(activeId.toString());
      if (isNaN(numericId)) {
        console.error("Invalid ID provided:", activeId);
        return;
      }
      apiFetch(`/api/common/fiscalyear/${numericId}`)
        .then(async res => {
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return res.json();
        })
        .then(data => {
          setValues(prev => ({
            ...prev,
            ...data,
            startDate: formatISOToDateStr(data.startDate, systemDateType),
            endDate: formatISOToDateStr(data.endDate, systemDateType),
          }));
        })
        .catch(err => console.error("Error fetching data", err));
    }
  }, [activeId, initialData, isInitializing, systemDateType]);

  const checkDuplicateTitle = async (titleVal: string): Promise<boolean> => {
    if (!titleVal || String(titleVal).trim().length === 0) return false;
    try {
      const currentNumericId = activeId ? parseInt(activeId.toString(), 10) : undefined;
      const url = `/api/common/fiscalyear/check-title?title=${encodeURIComponent(titleVal)}${currentNumericId ? `&id=${currentNumericId}` : ''}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({ ...prev, title: 'سال مالی با این عنوان از قبل وجود دارد' }));
          return true;
        } else {
          setErrors(prev => {
            const newErr = { ...prev };
            if (newErr.title === 'سال مالی با این عنوان از قبل وجود دارد') {
              delete newErr.title;
            }
            return newErr;
          });
          return false;
        }
      }
    } catch (err) {
      console.error('Error checking duplicate title', err);
    }
    return false;
  };

  const handleChange = (name: string, value: any) => {
    let newValue = value;
    
    if (name === 'title') {
      const strVal = String(value || '');
      if (strVal.length > 4) {
        newValue = strVal.slice(0, 4);
      }
    }

    setValues(prev => {
      const nextValues = { ...prev, [name]: newValue };
      
      const titleStr = String(nextValues.title || '');
      
      if (titleStr.length === 4) {
        if (name === 'title') {
          let startVal = `${titleStr}/01/01`;
          let endVal = `${titleStr}/12/29`; // default
           
          if (systemDateType === 'Jalali') {
            let isLeapYear = false;
            try {
              const yNum = parseInt(titleStr, 10);
              if (yNum >= 1300 && yNum <= 1500) {
                isLeapYear = momentJalaali.jIsLeapYear(yNum);
              }
            } catch {
              isLeapYear = false;
            }
            endVal = `${titleStr}/12/${isLeapYear ? '30' : '29'}`;
          } else if (systemDateType === 'Hijri') {
            endVal = `${titleStr}/12/29`; 
          } else {
            endVal = `${titleStr}/12/31`;
          }
          nextValues.startDate = startVal;
          nextValues.endDate = endVal;

          checkDuplicateTitle(titleStr);
        } else if (name === 'startDate') {
          let startVal = String(newValue || '');
          let parts = startVal.split('/');
          parts[0] = titleStr;
          nextValues.startDate = parts.join('/');
        } else if (name === 'endDate') {
          nextValues.endDate = String(newValue || '');
        }
      }

      return nextValues;
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = async (name: string, value: any) => {
    if (!value || name !== 'title') return;
    await checkDuplicateTitle(String(value));
  };

  const fields: FieldConfig[] = [
    { name: 'title', label: 'سال مالی', type: 'number', required: true, className: "w-full md:w-1/2", onBlur: handleBlur },
    { name: 'startDate', label: 'تاریخ شروع', type: 'date', required: true, className: "w-full md:w-1/2", isHeader: false },
    { name: 'endDate', label: 'تاریخ پایان', type: 'date', required: true, className: "w-full md:w-1/2", isHeader: false },
    { name: 'isActive', label: 'فعال', type: 'checkbox', required: true },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (action: 'save' | 'saveNew' | 'saveClose') => {
    const newErrors = { ...errors };
    let hasError = false;

    if (!values.title || String(values.title).length !== 4) {
      newErrors.title = 'سال مالی باید دقیقا 4 کاراکتر باشد';
      hasError = true;
    }

    if (!values.startDate) {
      newErrors.startDate = 'وارد کردن تاریخ شروع الزامی است';
      hasError = true;
    }

    if (!values.endDate) {
      newErrors.endDate = 'وارد کردن تاریخ پایان الزامی است';
      hasError = true;
    }

    const isoStart = parseDateToISO(values.startDate, systemDateType);
    if (!isoStart && values.startDate) {
      newErrors.startDate = 'تاریخ شمسی / میلادی / قمری نامعتبر است (ماه خبیثه کنترل شد)';
      hasError = true;
    }

    const isoEnd = parseDateToISO(values.endDate, systemDateType);
    if (!isoEnd && values.endDate) {
      newErrors.endDate = 'تاریخ شمسی / میلادی / قمری نامعتبر است (ماه خبیثه کنترل شد)';
      hasError = true;
    }

    if (isoStart && isoEnd) {
      const start = moment.utc(isoStart);
      const end = moment.utc(isoEnd);
      if (end.isBefore(start)) {
        newErrors.endDate = 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد';
        hasError = true;
      } else {
        const diffDays = end.diff(start, 'days');
        if (diffDays > 366) {
          showToast('بازه تعیین شده برای سال مالی نامعتبر است.', 'error');
          newErrors.endDate = 'بازه تعیین شده برای سال مالی نامعتبر است.';
          hasError = true;
        }
      }
    }

    if (values.title && String(values.title).length === 4) {
      const isDuplicate = await checkDuplicateTitle(String(values.title));
      if (isDuplicate) {
        newErrors.title = 'سال مالی با این عنوان از قبل وجود دارد';
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: String(values.title),
        startDate: isoStart,
        endDate: isoEnd,
        isActive: values.isActive ?? true,
      };

      const url = getUrl('/api/common/fiscalyear');

      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'خطا در ذخیره سازی اطلاعات';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json().catch(() => ({}));
      const createdId = result?.fiscalYearID || result?.fiscalYearId || result?.id || activeId;

      handleResponse(result, 'fiscalYearId');
      showToast('اطلاعات با موفقیت ذخیره شد', 'success');
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'FiscalYear', id: createdId });
      window.dispatchEvent(new CustomEvent('fiscalYearUpdated', { detail: { newFiscalYearId: createdId } }));

      if (action === 'saveNew') {
        setValues({ isActive: true });
        setErrors({});
      } else if (action === 'saveClose') {
        if (activeTabId) removeTab(activeTabId);
      }
    } catch (error: any) {
      const msg = Array.isArray(error.message) ? error.message[0] : error.message;
      if (msg && (msg.includes('از قبل وجود دارد') || msg.includes('تکراری') || msg.includes('duplicate'))) {
        setErrors(prev => ({ ...prev, title: 'سال مالی با این عنوان از قبل وجود دارد' }));
      }
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    addTab('سال مالی جدید', 'general', <Plus className="h-[14px] w-[14px]" />, 'NewFiscalYear');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <SimpleForm isReadonly={isUsed || false} 
          hasDateInput={false}
          fields={fields} 
          values={values} 
          onChange={handleChange} 
          errors={errors}
          labelWidth="60px"
          title="سال مالی جدید"
          icon={<Plus className="h-4 w-4" />}
          onSave={() => handleSave('save')}
          onSaveNew={() => handleSave('saveNew')}
          onSaveClose={() => handleSave('saveClose')}
          onNew={handleNew}
          listApiUrl="/api/common/fiscalyear"
          listDisplayKey="title"
          listColumns={[
            { key: "code", header: "کد" },
            { key: "title", header: "عنوان" },
            { key: "startDate", header: "تاریخ شروع" },
            { key: "endDate", header: "تاریخ پایان" },
          ]}
          onListSelect={(item) => {
            if (id !== item.fiscalYearId) {
              addTab(
                `ویرایش سال مالی - ${item.title}`,
                'admin',
                undefined,
                'FiscalYear',
                { id: item.fiscalYearId }
              );
            }
          }}
          onDelete={activeId ? async () => {
             setIsSubmitting(true);
             try {
                const res = await apiFetch(`/api/common/fiscalyear/${activeId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error('خطا در حذف');
                showToast('با موفقیت حذف شد', 'success');
                eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'FiscalYear' });
                if (activeTabId) removeTab(activeTabId);
             } catch (err: any) {
                showToast(err.message || 'خطا در حذف', 'error');
             } finally {
                setIsSubmitting(false);
             }
          } : undefined}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
