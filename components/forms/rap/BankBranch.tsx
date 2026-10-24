"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow } from "../SimpleFormTwoRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { Building2 } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { MultiColumnDropdown } from "../../inputs/MultiColumnDropdown";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { useFormUpsert } from "@/hooks/useFormUpsert";

interface BankBranchFormProps {
  id?: number;
}

export function BankBranchForm({ id }: BankBranchFormProps) {
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("BankBranch", activeId);


  const [banks, setBanks] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    bankId: null,
    branchCode: "",
    title: "",
    latinTitle: "",
    cityRef: null,
    phone: "",
    address: "",
    contactName: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch banks
    apiFetch("/api/rap/banks")
      .then((res) => res.json())
      .then((json) => {
        const data = Array.isArray(json) ? json : json.data;
        if (data && Array.isArray(data)) {
          // Map bankType to string for display
          const mappedBanks = data.map((b: any) => ({
            ...b,
            bankTypeTitle: b.bankType === 1 ? "دولتی" : "خصوصی"
          }));
          setBanks(mappedBanks);
        }
      })
      .catch(console.error);

    // Fetch geo locations (to build City dropdown)
    apiFetch("/api/geo-locations")
      .then((res) => res.json())
      .then((json) => {
        const allLocs = json.data || json;
        if (Array.isArray(allLocs)) {
          const mappedCities = allLocs
            .filter((l: any) => l.geographicType === 3) // 3 might be City
            .map((city: any) => {
              const province = allLocs.find((p: any) => Number(p.geolocationId) === Number(city.parentRef));
              const country = province ? allLocs.find((c: any) => Number(c.geolocationId) === Number(province.parentRef)) : null;
              return {
                ...city,
                provinceTitle: province?.title || '',
                countryTitle: country?.title || ''
              };
            });
          setCities(mappedCities);
        }
      })
      .catch(console.error);

    // Fetch form data if editing
    if (activeId) {
      apiFetch(`/api/rap/bank-branchs/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          const item = data.data || data;
          setValues({
            bankId: item.bankId || null,
            branchCode: item.branchCode ? String(item.branchCode) : "",
            title: item.title || "",
            latinTitle: item.latinTitle || "",
            cityRef: item.cityRef || null,
            phone: item.phone || "",
            address: item.address || "",
            contactName: item.contactName || "",
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
    if (!values.bankId) newErrors.bankId = "انتخاب بانک الزامی است";
    if (!values.title) newErrors.title = "عنوان شعبه الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicates = async () => {
    const fieldsToCheck = [
      { field: 'title', value: values.title, msg: 'عنوان شعبه تکراری است' },
    ];
    
    const newErrors: Record<string, string> = {};
    for (const { field, value, msg } of fieldsToCheck) {
      if (value) {
        try {
          let url = `/api/rap/bank-branchs/advanced/check-duplicate?field=${field}&value=${encodeURIComponent(value)}`;
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
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  };

  const submitData = async () => {
    if (!validate()) return null;
    
    setIsSubmitting(true);
    
    const isUnique = await checkDuplicates();
    if (!isUnique) {
      setIsSubmitting(false);
      return null;
    }

    try {
      const url = getUrl("/api/rap/bank-branchs");

      const payload = { 
        ...values,
        bankId: Number(values.bankId),
        branchCode: values.branchCode ? Number(values.branchCode) : null,
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || 'خطا در ذخیره شعبه');
      }

      const result = await res.json();
      showToast("شعبه با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BankBranch' });
      handleResponse(result, 'bankBranchId');
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره", "error");
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
        bankId: null,
        branchCode: "",
        title: "",
        latinTitle: "",
        cityRef: null,
        phone: "",
        address: "",
        contactName: "",
      });
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`BankBranchForm-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    addTab(
      "تعریف شعبه جدید",
      "rap",
      <Building2 className="w-4 h-4" />,
      "BankBranchForm"
    );
  };

  const handleBlurTitle = async (name: string, value: any) => {
    if (value) {
      let url = `/api/rap/bank-branchs/advanced/check-duplicate?field=title&value=${encodeURIComponent(value)}`;
      if (activeId) url += `&excludeId=${activeId}`;
      try {
        const res = await apiFetch(url);
        const data = await res.json();
        if (data.isDuplicate) {
          setErrors((prev) => ({ ...prev, title: 'عنوان شعبه تکراری است' }));
        } else {
          setErrors((prev) => {
            const next = { ...prev };
            delete next.title;
            return next;
          });
        }
      } catch (e) {}
    }
  };

  const bankColumns = [
    { key: "code", label: "کد", width: 80 },
    { key: "title", label: "عنوان", width: 150 },
    { key: "latinTitle", label: "عنوان ۲", width: 150 },
    { 
      key: "bankType", 
      label: "نوع بانک", 
      width: 100,
      renderItem: (item: any) => (item.bankType === 1 || item.bankType === "1" ? "دولتی" : "خصوصی")
    },
  ];

  const cityColumns = [
    { key: "title", label: "شهر", width: 150 },
    { key: "provinceTitle", label: "استان", width: 150 },
    { key: "countryTitle", label: "کشور", width: 150 },
  ];

  const fields: FieldConfig[] = [
    { 
      name: "bankId", 
      label: "نام بانک", 
      type: "custom", 
      required: true,
      disabled: isUsed || false,
      customComponent: (
        <div className="flex-1 w-full">
          <SingleSelectDropDown
            disabled={isUsed || false}
            listApiUrl="/api/rap/banks"
            data={banks}
            value={banks.find(b => Number(b.bankId) === Number(values.bankId)) || values.bankId || null}
            valueKey="bankId"
            onChange={(item: any, selectedVal: any) => handleChange("bankId", selectedVal || item?.bankId || null)}
            columns={bankColumns}
            displayKey="title"
            placeholder="انتخاب بانک..."
            onAdd={() => {
              addTab(
                "بانک جدید",
                "rap",
                <Building2 className="w-4 h-4" />,
                "BankForm"
              );
            }}
          />
        </div>
      )
    },
    { name: "branchCode", label: "کد شعبه", type: "number" },
    { name: "title", label: "عنوان شعبه", type: "text", required: true, onBlur: handleBlurTitle },
    { name: "latinTitle", label: "عنوان شعبه (لاتین)", type: "text" },
    { 
      name: "cityRef", 
      label: "شهر", 
      type: "custom", 
      customComponent: (
        <div className="flex-1 w-full">
          <MultiColumnDropdown
            value={cities.find(c => Number(c.geolocationId) === Number(values.cityRef)) || null}
            onChange={(val: any) => handleChange("cityRef", val?.geolocationId || null)}
            data={cities}
            columns={cityColumns}
            displayKey="title"
            placeholder="انتخاب شهر..."
          />
        </div>
      )
    },
    { name: "phone", label: "تلفن", type: "text" },
    { name: "contactName", label: "نام رابط", type: "text" },
    { name: "address", label: "آدرس", type: "textarea", colSpan: 2 },
  ];

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش شعبه" : "شعبه بانکی جدید"}
      icon={<Building2 className="w-4 h-4" />}
      headerGradient="from-blue-600 to-indigo-600"
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      listApiUrl="/api/rap/bank-branchs"
      listColumns={[
        { key: "branchCode", label: "کد", width: 80 },
        { key: "title", label: "عنوان", width: 250 },
        { key: "bank.title", label: "نام بانک", width: 200 },
        { key: "phone", label: "تلفن", width: 120 },
      ]}
      listDisplayKey="title"
      onListSelect={(item: any) => {
        if (activeId !== item.bankBranchId) {
          addTab(
            `ویرایش شعبه ${item.title || ''}`,
            'rap',
            <Building2 className="w-4 h-4" />,
            "BankBranchForm",
            { id: item.bankBranchId }
          );
        }
      }}
      isSubmitting={isSubmitting}
      showListButton={true} 
    />
  );
}

export default BankBranchForm;
