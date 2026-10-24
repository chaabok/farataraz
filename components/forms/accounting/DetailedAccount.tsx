"use client";

import React, { useState, useEffect } from "react";
import { useTabs } from "@/components/TabsProvider";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify, apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextInput } from "@/components/inputs/TextInput";

// Buttons
import { NewButton } from "@/components/buttons/NewButton";
import { SaveButton } from "@/components/buttons/SaveButton";
import { SaveNewButton } from "@/components/buttons/SaveNewButton";
import { SaveCloseButton } from "@/components/buttons/SaveCloseButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";

import { FolderTree, Search, Info, Tag, Paperclip } from "lucide-react";

export function DetailedAccountForm({ 
  onSaved, 
  initialData,
  id,
  detailedTypeId: propDetailedTypeId
}: { 
  onSaved?: () => void,
  initialData?: any,
  id?: number,
  detailedTypeId?: number
}) {
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { t } = useLanguage();
  const [refreshNumbering, setRefreshNumbering] = useState(0);
  const [detailedTypeId, setDetailedTypeId] = useState<number | undefined>(propDetailedTypeId);
  
  const [values, setValues] = useState<Record<string, any>>({
    code: '',
    title: '',
    title_en: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('info');
  const [internalInitialData, setInternalInitialData] = useState<any>(initialData);

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id || internalInitialData?.detailedAccountId);

  useEffect(() => {
    if (!activeId && detailedTypeId) {
      apiFetch(`/api/common/detailed-accounts-numbering/next-code/${detailedTypeId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setValues(prev => ({ ...prev, code: data.data }));
          }
        })
        .catch(console.error);
    }
  }, [activeId, detailedTypeId, refreshNumbering]);

  useEffect(() => {
    if (activeId) {
      const fetchDetails = async () => {
        try {
          const res = await apiFetch(`/api/accounting/detailed-accounts/${activeId}`);
          if (res.ok) {
            const data = await res.json();
            setInternalInitialData(data);
            if (data.detailedTypeRef) {
              setDetailedTypeId(data.detailedTypeRef);
            }
          } else {
            showToast('خطا در دریافت اطلاعات حساب تفصیلی', 'error');
          }
        } catch (err) {
          showToast('خطا در ارتباط با سرور', 'error');
        }
      };
      fetchDetails();
    } else {
      setInternalInitialData(initialData);
    }
  }, [activeId, initialData?.detailedAccountId]);

  useEffect(() => {
    if (internalInitialData) {
      setValues({
        code: internalInitialData.code || '',
        title: internalInitialData.title || '',
        title_en: internalInitialData.title_en || '',
      });
    }
  }, [internalInitialData]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = async (name: string, value: string) => {
    if (!value) return;
    const excludeId = internalInitialData?.detailedAccountId;
    
    try {
      const url = `/api/accounting/detailed-accounts/check-duplicate?field=${name}&value=${encodeURIComponent(value)}${excludeId ? `&excludeId=${excludeId}` : ''}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({
            ...prev,
            [name]: name === 'code' ? 'کد حساب تکراری است' : 'حسابی با این عنوان از قبل وجود دارد'
          }));
        }
      }
    } catch(e) {}
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = (t as any)('common.required_field') || 'کد اجباری است';
    if (!values.title) newErrors.title = (t as any)('common.required_field') || 'عنوان اجباری است';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    if (!validate()) {
      showToast('لطفاً خطاهای فرم را برطرف کنید', 'error');
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/accounting/detailed-accounts');
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(values)
      });

      const result = await res.json();
      
      if (res.ok) {
        handleResponse(result, 'detailedAccountId');
        showToast(result.message || 'اطلاعات با موفقیت ذخیره گردید.', 'success');
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
        if (onSaved) onSaved();
        if (isClose) {
          if (activeTabId) removeTab(activeTabId);
        } else if (isNew) {
          handleNew();
        } else if (!internalInitialData) {
           addTab(
             `ویرایش حساب تفصیلی - ${values.title}`,
             'financial',
             undefined,
             'DetailedAccountForm',
             { id: result.data.detailedAccountId }
           );
           if (activeTabId) removeTab(activeTabId);
        }
      } else {
        showToast(result.message || 'خطا در ذخیره اطلاعات', 'error');
      }
    } catch (error) {
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => saveToApi(false, false);
  const handleSaveNew = () => saveToApi(true, false);
  const handleSaveClose = () => saveToApi(false, true);
  
  const handleNew = () => {
    setValues({
      code: '',
      title: '',
      title_en: '',
    });
    setErrors({});
    setActiveId(null);
    setInternalInitialData(null);
    setRefreshNumbering(prev => prev + 1);
  };

  const handleDelete = async () => {
    if (!activeId) return;
    
    setIsSubmitting(true);
    try {
       const res = await apiFetch(`/api/accounting/detailed-accounts/${activeId}`, { method: 'DELETE' });
       if (!res.ok) throw new Error((t as any)('delete_error') || 'خطا در حذف');
       showToast((t as any)('delete_success') || 'با موفقیت حذف شد', 'success');
       eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });
       eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
       if (activeTabId) removeTab(activeTabId);
       if (onSaved) onSaved();
    } catch (err: any) {
       showToast(err.message || 'خطا در حذف', 'error');
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full gap-4 p-4 rtl bg-slate-50 dark:bg-slate-950/50">
      {/* Right side: Coding Structure Box */}
      <div className="w-1/4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden min-w-[250px]">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 font-bold text-xs bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-indigo-500" />
          <span>ساختار کدینگ</span>
        </div>
        <div className="p-2">
           <div className="relative">
             <Search className="w-3 h-3 absolute right-2 top-2 text-slate-400" />
             <input 
               type="text" 
               placeholder="جستجو در ساختار..." 
               className="w-full pr-7 py-1 text-[10px] bg-slate-50 dark:bg-slate-800 border-none rounded focus:ring-1 focus:ring-indigo-500 outline-none"
             />
           </div>
        </div>
        <div className="flex-1 overflow-auto p-3">
           <div className="space-y-2">
             {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded cursor-pointer transition-colors">
                 <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                 <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded" />
               </div>
             ))}
           </div>
           <div className="mt-4 text-[10px] text-slate-400 text-center italic">تکمیل ساختار در آپدیت‌های بعدی...</div>
        </div>
      </div>

      {/* Left side */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Top Section: Action Bar and Form Fields */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          {/* Action Bar */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <NewButton onClick={handleNew} disabled={isSubmitting} />
            <SaveButton onClick={handleSave} disabled={isSubmitting} />
            <SaveNewButton onClick={handleSaveNew} disabled={isSubmitting} />
            <SaveCloseButton onClick={handleSaveClose} disabled={isSubmitting} />
            {activeId && <DeleteButton onClick={handleDelete} disabled={isSubmitting} />}
          </div>

          {/* Main Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NumberInput 
              label="کد" 
              value={values.code} 
              onChange={(v) => handleChange('code', v)} 
              onBlur={() => handleBlur('code', values.code)}
              error={errors.code}
              required 
              labelWidth="40px"
            />
            <TextInput 
              label="عنوان" 
              value={values.title} 
              onChange={(v) => handleChange('title', v)} 
              onBlur={() => handleBlur('title', values.title)}
              error={errors.title}
              required
              labelWidth="40px"
            />
            <TextInput 
              label="عنوان لاتین" 
              value={values.title_en} 
              onChange={(v) => handleChange('title_en', v)} 
              onBlur={() => handleBlur('title_en', values.title_en)}
              labelWidth="40px"
            />
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col overflow-hidden">
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-4 overflow-x-auto custom-scrollbar">
             {[
               { id: 'info', label: 'اطلاعات تکمیلی', icon: Info },
               { id: 'attributes', label: 'ویژگی‌ها', icon: Tag },
               { id: 'attachments', label: 'پیوست‌ها', icon: Paperclip },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveSubTab(tab.id)}
                 className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                   activeSubTab === tab.id 
                   ? 'border-indigo-500 text-indigo-600' 
                   : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                 }`}
               >
                 <tab.icon className="w-3.5 h-3.5" />
                 {tab.label}
               </button>
             ))}
          </div>
          
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-slate-950/30">
            <div className="text-center p-8">
               <p className="text-xs text-slate-400">این بخش فعلاً فاقد فیلد می‌باشد.</p>
               <p className="text-[10px] text-slate-300 mt-1">زیرسیستم: {activeSubTab === 'info' ? 'اطلاعات تکمیلی' : activeSubTab === 'attributes' ? 'ویژگی ساختاری' : 'مدیریت فایل' }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
