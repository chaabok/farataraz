"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow } from "../SimpleFormTwoRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { Landmark } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { MultiColumnDropdown } from "../../inputs/MultiColumnDropdown";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useBankColumns } from "./BankList";

interface BankFormProps {
  id?: number;
}

export function BankForm({ id }: BankFormProps) {
  const rawListColumns = useBankColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("Bank", activeId);


  const [countries, setCountries] = useState<any[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    code: "",
    title: "",
    latinTitle: "",
    bankType: 1, // Default to Government (1)
    swiftCode: "",
    nationalityRef: null,
    phone: "",
    website: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch countries
    apiFetch("/api/geo-locations")
      .then((res) => res.json())
      .then((json) => {
        const allLocs = json.data || json;
        const c = allLocs.filter((l: any) => l.geographicType === 1);
        setCountries(c.length > 0 ? c : allLocs);
      })
      .catch(console.error);

    // Fetch bank if editing
    if (activeId) {
      apiFetch(`/api/rap/banks/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setValues({
            code: String(item.code || ""),
            title: item.title || "",
            latinTitle: item.latinTitle || "",
            bankType: Number(item.bankType || 1),
            swiftCode: item.swiftCode || "",
            nationalityRef: item.nationalityRef || null,
            phone: item.phone || "",
            website: item.website || "",
            description: item.description || "",
          });
        })
        .catch(console.error);
    }
  }, [activeId]);

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
    if (!values.code) newErrors.code = "کد بانک الزامی است";
    if (!values.title) newErrors.title = "عنوان بانک الزامی است";
    if (!values.bankType) newErrors.bankType = "نوع بانک الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicates = async () => {
    const fieldsToCheck = [
      { field: 'code', value: values.code, msg: 'کد بانک تکراری است' },
      { field: 'title', value: values.title, msg: 'عنوان بانک تکراری است' },
    ];
    
    // Add latinTitle if it has value
    if (values.latinTitle && values.latinTitle.trim() !== '') {
      fieldsToCheck.push({ field: 'latinTitle', value: values.latinTitle, msg: 'عنوان لاتین بانک تکراری است' });
    }

    const newErrors: Record<string, string> = {};
    for (const { field, value, msg } of fieldsToCheck) {
      if (value) {
        try {
          let url = `/api/rap/banks/advanced/check-duplicate?field=${field}&value=${encodeURIComponent(value)}`;
          if (activeId) url += `&excludeId=${activeId}`;
          
          const res = await apiFetch(url);
          const data = await res.json();
          if (data.isDuplicate) {
            newErrors[field] = msg;
          }
        } catch (e) {
          console.error("Duplicate check failed", e);
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  };

  const submitData = async () => {
    if (!validate()) return null;
    
    setIsSubmitting(true);
    
    // Server-side / ajax check
    const isUnique = await checkDuplicates();
    if (!isUnique) {
      setIsSubmitting(false);
      return null;
    }

    try {
      const url = getUrl("/api/rap/banks");

      const payload = { 
        ...values,
        code: Number(values.code),
        bankType: Number(values.bankType),
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || 'خطا در ذخیره بانک');
      }

      const result = await res.json();
      showToast("بانک با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Bank' });
      handleResponse(result, 'bankId');
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره سیستم", "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    return await submitData();
  };

  const handleSaveNew = async () => {
    const res = await submitData();
    if (res) {
      setValues({
        code: "",
        title: "",
        latinTitle: "",
        bankType: 1,
        swiftCode: "",
        nationalityRef: null,
        phone: "",
        website: "",
        description: "",
      });
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`BankForm-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    addTab(
      "تعریف بانک جدید",
      "rap",
      <Landmark className="w-4 h-4" />,
      "BankForm"
    );
  };

  const handleBlurCode = async (name: string, value: any) => {
    if (value) {
      let url = `/api/rap/banks/advanced/check-duplicate?field=code&value=${value}`;
      if (activeId) url += `&excludeId=${activeId}`;
      try {
        const res = await apiFetch(url);
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({ ...prev, code: 'کد بانک تکراری است' }));
        } else {
          setErrors(prev => {
            const next = {...prev};
            delete next.code;
            return next;
          });
        }
      } catch (e) {}
    }
  };

  const handleBlurTitle = async (name: string, value: any) => {
    if (value) {
      let url = `/api/rap/banks/advanced/check-duplicate?field=title&value=${encodeURIComponent(value)}`;
      if (activeId) url += `&excludeId=${activeId}`;
      try {
        const res = await apiFetch(url);
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({ ...prev, title: 'عنوان بانک تکراری است' }));
        } else {
          setErrors(prev => {
            const next = {...prev};
            delete next.title;
            return next;
          });
        }
      } catch (e) {}
    }
  };
  
  const handleBlurLatinTitle = async (name: string, value: any) => {
    if (value) {
      let url = `/api/rap/banks/advanced/check-duplicate?field=latinTitle&value=${encodeURIComponent(value)}`;
      if (activeId) url += `&excludeId=${activeId}`;
      try {
        const res = await apiFetch(url);
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors(prev => ({ ...prev, latinTitle: 'عنوان لاتین بانک تکراری است' }));
        } else {
          setErrors(prev => {
            const next = {...prev};
            delete next.latinTitle;
            return next;
          });
        }
      } catch (e) {}
    }
  };

  const countryColumns = [
    { key: "code", label: "کد", width: 80 },
    { key: "title", label: "عنوان", width: 150 },
    { key: "titleEn", label: "عنوان لاتین", width: 120 }
  ];

  const fields: FieldConfig[] = [
    { name: "code", label: "کد", type: "number", required: true, onBlur: handleBlurCode },
    { name: "title", label: "عنوان", type: "text", required: true, onBlur: handleBlurTitle },
    { name: "latinTitle", label: "عنوان لاتین", type: "text", onBlur: handleBlurLatinTitle },
    { 
      name: "bankType", 
      label: "نوع بانک", 
      type: "select", 
      options: [
        { value: "1", label: "دولتی" },
        { value: "2", label: "خصوصی" }
      ],
      required: true 
    },
    { 
      name: "nationalityRef", 
      label: "ملیت", 
      type: "custom", 
      customComponent: (
        <div className="flex-1 w-full">
          <MultiColumnDropdown
            value={countries.find(c => Number(c.geolocationId) === Number(values.nationalityRef)) || null}
            onChange={(val: any) => handleChange("nationalityRef", val?.geolocationId || null)}
            data={countries}
            columns={countryColumns}
            displayKey="title"
            placeholder="انتخاب محل جغرافیایی..."
          />
        </div>
      )
    },
    { name: "swiftCode", label: "کد سوئیفت", type: "text" },
    { name: "phone", label: "تلفن", type: "number" },
    { name: "website", label: "وبسایت", type: "website" },
    { name: "description", label: "شرح", type: "textarea", colSpan: 2 },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش بانک" : "تعریف بانک جدید"}
      icon={<Landmark className="w-4 h-4" />}
      headerGradient="from-blue-600 to-blue-500"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      listApiUrl="/api/rap/banks"
      listColumns={listColumns}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        if (activeId !== item.bankId) {
          addTab(
            `ویرایش بانک ${item.title || ''}`,
            'rap',
            <Landmark className="w-4 h-4" />,
            "BankForm",
            { id: item.bankId }
          );
        }
      }}
      isSubmitting={isSubmitting}
      showListButton={true} 
    />
  );
}

export default BankForm;
