"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { FolderPlus } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";

interface ProjectFormProps {
  id?: number;
}

export function ProjectForm({ id: initialId }: ProjectFormProps) {
  const { t } = useLanguage();
  const { addTab, activeTabId, removeTab } = useTabs();
  const { showToast } = useToast();

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(initialId);
  const { isUsed } = useFormUsageCheck("Project", activeId);


  const [values, setValues] = useState<Record<string, any>>({
    code: "",
    title: "",
    titleEn: "",
    detailedAccountCode: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [refreshNumbering, setRefreshNumbering] = useState(0);

  const fetchProject = async () => {
    try {
      const res = await apiFetch(`/api/cnt/projects/${activeId}`);
      if (res.ok) {
        const data = await res.json();
        setValues(data);
      } else {
        showToast(t('error_fetching_project' as any) || "خطا در دریافت اطلاعات پروژه", "error");
      }
    } catch (error) {
      showToast(t('error_fetching_project' as any) || "خطا در دریافت اطلاعات پروژه", "error");
    }
  };

  useEffect(() => {
    if (activeId) {
      fetchProject();
    } else {
      // Fetch Next Detailed Code (Detailed Type '8' is Project)
      apiFetch('/api/accounting/detailed-types')
        .then(res => res.json())
        .then(data => {
            const items = data.items || data.data || data;
            const typeProject = items?.find((t: any) => String(t.code) === '8');
            if (typeProject) {
                const typeId = typeProject.detailedTypesId || typeProject.detailedTypeID;
                return apiFetch(`/api/common/detailed-accounts-numbering/next-code/${typeId}`);
            }
            return null;
        })
        .then(res => res ? res.json() : null)
        .then(data => {
            if (data && data.data) {
                setValues(prev => ({ ...prev, detailedAccountCode: data.data }));
            }
        })
        .catch(console.error);
    }
  }, [activeId, refreshNumbering]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.code) newErrors.code = t('project_code_required' as any) || "کد پروژه الزامی است";
    if (!values.title) newErrors.title = t('project_title_required' as any) || "عنوان پروژه الزامی است";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (stayInForm: boolean = true, stayWithNew: boolean = false) => {
    if (!validate()) {
      throw new Error("VALIDATION_FAILED");
    }

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/cnt/projects');
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(values),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || t('save_error' as any) || "خطا در ذخیره سازی");
      }

      const result = await res.json();
      showToast(t('project_save_success' as any) || "پروژه با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });

      handleResponse(result, 'projectId');

      if (stayWithNew) {
        handleNew();
      } else if (!stayInForm) {
        removeTab(activeTabId!);
      }
    } catch (error: any) {
      const errorMsg = error.message ? error.message : (t('save_error' as any) || "خطا در ذخیره سازی");
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setActiveId(undefined);
    setValues({
      code: "",
      title: "",
      titleEn: "",
      detailedAccountCode: "",
      isActive: true,
    });
    setErrors({});
    setRefreshNumbering(prev => prev + 1);
  };

  const handleDelete = async () => {
    if (!activeId) return;
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/cnt/projects/${activeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(t('delete_error' as any) || "خطا در حذف پروژه");
      
      showToast(t('project_delete_success' as any) || "پروژه با موفقیت حذف شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Project' });
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });
      removeTab(activeTabId!);
    } catch (error: any) {
      const errorMsg = error.message ? error.message : (t('delete_error' as any) || "خطا در حذف پروژه");
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    { 
      name: "code", 
      label: t('code' as any) || "کد", 
      type: "number", 
      required: true 
    },
    { 
      name: "title", 
      label: t('title' as any) || "عنوان", 
      type: "text", 
      required: true 
    },
    { 
      name: "titleEn", 
      label: t('title_en' as any) || "عنوان انگلیسی (Title)", 
      type: "text" 
    },
    { 
      name: "detailedAccountCode", 
      label: t('detailed_account_code' as any) || "کد تفصیلی", 
      type: "text",
      required: true,
      disabled: false,
    },
    { 
      name: "isActive", 
      label: t('active' as any) || "فعال", 
      type: "checkbox" 
    },
  ];

  const listColumns = [
    { key: "code", label: t('code' as any) || "کد", width: 100 },
    { key: "title", label: t('title' as any) || "عنوان", width: 250 },
    { key: "detailedAccountCode", label: t('detailed_account_code' as any) || "کد تفصیلی", width: 150 },
    { key: "isActive", label: t('active' as any) || "فعال", width: 80, type: 'boolean' },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? (t('edit_project' as any) || "ویرایش پروژه") : (t('new_project' as any) || "پروژه جدید")}
      icon={<FolderPlus className="w-4 h-4" />}
      headerGradient="from-emerald-600 to-emerald-500"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      isSubmitting={isSubmitting}
      onSave={() => handleSave(true, false)}
      onSaveNew={() => handleSave(true, true)}
      onSaveClose={() => handleSave(false, false)}
      onNew={handleNew}
      onDelete={activeId ? handleDelete : undefined}
      listApiUrl="/api/cnt/projects"
      listColumns={listColumns}
      listDisplayKey="title"
      onListSelect={(item) => setActiveId(item.projectId)}
      showListButton={true}
    />
  );
}

export default ProjectForm;
