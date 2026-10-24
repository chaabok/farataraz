"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState } from "react";
import { SimpleForm, FieldConfig } from "../SimpleForm";
import { useToast } from "../../ToastProvider";
import { useLanguage } from "../../Providers";
import { PermissionTree } from "./PermissionTree";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from '@/lib/events';
import { SaveButton } from "../../buttons/SaveButton";
import { SaveNewButton } from "../../buttons/SaveNewButton";
import { SaveCloseButton } from "../../buttons/SaveCloseButton";
import { DeleteButton } from "../../buttons/DeleteButton";
import { ListButton } from "../../buttons/ListButton";
import { NewButton } from "../../buttons/NewButton";
import { FullscreenButton } from "../../buttons/FullscreenButton";
import { HelpButton } from "../../buttons/HelpButton";
import { CloseButton } from "../../buttons/CloseButton";
import { useTabs } from "../../TabsProvider";
import { useConfirm } from "../../ConfirmProvider";
import { LoadingOverlay } from "../../ui/LoadingOverlay";
import { safeStringify } from "@/lib/utils";

export function UserGroupForm({ id }: { id?: number }) {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { confirm } = useConfirm();
  const { addTab, removeTab, activeTabId } = useTabs();
  const [values, setValues] = useState<Record<string, any>>({
    isActive: true,
    code: '',
    title: '',
    titleEn: '',
    permissions: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("UserGroupForm", activeId);


  React.useEffect(() => {
    if (activeId) {
      const fetchGroup = async () => {
        setIsLoading(true);
        try {
          const response = await apiFetch(`/api/iam/user-groups/${activeId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setValues({
                code: data.code || '',
                title: data.title || '',
                titleEn: data.titleEn || '',
                isActive: data.isActive !== undefined ? data.isActive : true,
                permissions: data.permissions || []
              });
            } else {
              showToast(t('error_not_found' as any) || "گروه کاربری یافت نشد", "error");
            }
          } else {
            showToast(t('error_loading_data' as any) || "خطا در دریافت اطلاعات", "error");
          }
        } catch (error) {
          console.error("Error fetching group:", error);
          showToast(t('connection_error' as any) || "خطا در ارتباط با سرور", "error");
        } finally {
          setIsLoading(false);
        }
      };
      fetchGroup();
    }
  }, [id, showToast]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = t('error_required' as any) || "الزامی است";
    if (!values.title) newErrors.title = t('error_required' as any) || "الزامی است";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (closeAfterSave = false, emptyAfterSave = false) => {
    if (!validate()) {
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/iam/user-groups');
      
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: safeStringify(values)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t('save_error' as any) || 'خطا در ذخیره اطلاعات');
      }

      const resData = await res.json();
      handleResponse(resData, 'id');

      showToast(t('save_success' as any) || "اطلاعات با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'UserGroup' });
      
      if (emptyAfterSave) {
        setValues({
          isActive: true,
          code: '',
          title: '',
          titleEn: '',
          permissions: []
        });
        setActiveId(null);
      }

      if (closeAfterSave) {
        removeTab(activeTabId!);
      }
      
    } catch (e: any) {
      showToast(e.message || "خطا در ارتباط با سرور", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activeId) return;
    const isConfirmed = await confirm({
      message: t('confirm_delete_message_single') || "آیا از حذف این مورد اطمینان دارید؟"
    });
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/api/iam/user-groups/${activeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showToast(t('delete_success' as any) || "با موفقیت حذف شد", "success");
        eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'UserGroup' });
        removeTab(activeTabId!);
      } else {
        const error = await response.json();
        showToast(error.message || t('delete_error' as any) || "خطا در حذف", "error");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      showToast(t('connection_error' as any) || "خطا در ارتباط با سرور", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setValues({
      isActive: true,
      code: '',
      title: '',
      titleEn: '',
      permissions: []
    });
    setActiveId(null);
  };

  const handleList = () => {
    removeTab(activeTabId!);
  };

  const fields: FieldConfig[] = [
    { name: 'code', label: t('group_code' as any) || 'کد گروه', type: 'text', required: true, className: "w-full" },
    { name: 'title', label: t('group_title' as any) || 'عنوان گروه', type: 'text', required: true, className: "w-full" },
    { name: 'titleEn', label: t('group_title_en' as any) || 'عنوان لاتین', type: 'text', className: "w-full" },
    { name: 'isActive', label: t('isActive' as any) || 'وضعیت فعالیت', type: 'checkbox', className: "w-full" },
  ];

  return (
    <div ref={containerRef} className="flex flex-col xl:flex-row gap-6 h-full overflow-hidden p-4 bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800 relative">
      <LoadingOverlay visible={isSubmitting || isLoading} message={isLoading ? (t('loading' as any) || 'در حال دریافت اطلاعات...') : (t('saving' as any) || 'در حال ذخیره سازی...')} />
      <div className="flex-1 min-w-0 min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-0 shadow-sm overflow-hidden flex flex-col">
        <div className="flex flex-col flex-shrink-0 w-full m-0 border-b border-gray-200 dark:border-gray-800">
            <div className="w-full bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-medium">
                        {activeId ? (t('edit_user_group' as any) || 'ویرایش گروه کاربری') : (t('new_user_group' as any) || 'تعریف گروه کاربری جدید')}
                    </h2>
                </div>
                <div className="flex items-center gap-1">
                    <HelpButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                    <FullscreenButton targetRef={containerRef} hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                    <CloseButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                </div>
            </div>
            <div className="w-full bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 flex flex-nowrap items-center justify-start gap-1.5 overflow-x-auto no-scrollbar">
                <NewButton onClick={handleNew} hideLabel />
                <ListButton 
                  onClick={handleList} 
                  hideLabel 
                  listApiUrl="/api/iam/user-groups"
                  displayKey="title"
                  columns={[
                    { key: "code", label: t('group_code' as any) || "کد گروه" },
                    { key: "title", label: t('group_title' as any) || "عنوان فارسی" },
                    { key: "titleEn", label: t('group_title_en' as any) || "عنوان لاتین" },
                  ]}
                  onSelect={(item: any) => {
                    if (id !== item.id) {
                      addTab(
                        `${t('edit_user_group' as any) || 'ویرایش گروه کاربری'} - ${item.title}`,
                        'admin',
                        undefined,
                        'UserGroupForm',
                        { id: item.id }
                      );
                    }
                  }}
                />
                <SaveButton onClick={() => handleSave()} disabled={isSubmitting} hideLabel />
                <SaveNewButton onClick={() => handleSave(false, true)} disabled={isSubmitting} hideLabel />
                <SaveCloseButton onClick={() => handleSave(true)} disabled={isSubmitting} hideLabel />
                <DeleteButton onClick={handleDelete} disabled={isSubmitting || !activeId} hideLabel />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
            <SimpleForm isReadonly={isUsed || false}
              title=""
              fields={fields}
              values={values}
              onChange={handleChange}
              errors={errors}
              onSave={() => handleSave()}
              onSaveNew={() => handleSave(false, true)}
              isSubmitting={isSubmitting}
              hideHeader={true}
              showLoadingOverlay={false}
            />
        </div>
      </div>
      
      <div className="w-full xl:w-[450px] flex flex-col gap-4 min-h-0">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px] xl:h-auto xl:flex-1 min-h-0">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-1">
                <h3 className="text-base font-black text-slate-700 dark:text-slate-200">
                    {t('permissions' as any) || 'دسترسی‌های گروه'}
                </h3>
                <p className="text-xs text-slate-500 font-medium opacity-80">
                    {t('permissions_subtitle' as any) || 'تعیین سطح دسترسی پیش‌فرض برای اعضای این گروه'}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/30 dark:bg-slate-800/20">
                <PermissionTree 
                    selectedIds={values.permissions || []}
                    onChange={(ids) => handleChange('permissions', ids)}
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
