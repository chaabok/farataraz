"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { apiFetch } from '@/lib/utils';
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { CheckBoxRightLabel } from "@/components/inputs/CheckBoxRightLabel";
import { TextInput } from "@/components/inputs/TextInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { Select } from "@/components/inputs/Select";
import { SingleSelectDropDown } from "@/components/inputs/SingleSelectDropDown";
import { TextArea } from "@/components/inputs/TextArea";
import { FormFieldWrapper } from "@/components/inputs/FormFieldWrapper";
import { Store, Building2 } from "lucide-react";
import { useTabs } from "@/components/TabsProvider";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useLanguage } from "@/components/Providers";
import { safeStringify } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useCompanyStore } from "@/lib/stores/companyStore";

export function SalesCenterComponent({ 
  id,
  onSaved, 
  initialData 
}: { 
  id?: string | number,
  onSaved?: () => void,
  initialData?: any
}) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { t } = useLanguage();
  const { currentCompany } = useCompanyStore();
  
  const [data, setData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!!id && !initialData);

  useEffect(() => {
    if (id && !initialData) {
      apiFetch(`/api/sle/sales-centers/${id}`)
        .then(res => res.json())
        .then(resData => {
          const item = resData?.data || resData;
          setData(item);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
          showToast('دریافت اطلاعات با خطا مواجه شد', 'error');
        });
    } else {
      setData(initialData);
    }
  }, [id, initialData]);

  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(data?.SalesCenterID);
  const { isUsed } = useFormUsageCheck("SalesCenters", activeId);

  const [values, setValues] = useState<Record<string, any>>({
    Code: '',
    Type: 4, // default: Other
    ReferenceRef: null,
    Title: '',
    Title2: '',
    IsActive: true,
    Description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown lists for reference items
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [businessStructures, setBusinessStructures] = useState<any[]>([]);

  useEffect(() => {
    // Fetch cost centers
    apiFetch('/api/accounting/cost-center')
      .then(res => res.json())
      .then(resData => {
        const list = resData?.items || resData?.data || resData;
        if (Array.isArray(list)) setCostCenters(list);
      })
      .catch(console.error);

    // Fetch business structures
    apiFetch('/api/business-structure')
      .then(res => res.json())
      .then(resData => {
        const list = resData?.items || resData?.data || resData;
        if (Array.isArray(list)) setBusinessStructures(list);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (data) {
      setValues({
        Code: data.Code || '',
        Type: data.Type !== undefined ? data.Type : 4,
        ReferenceRef: data.ReferenceRef || null,
        Title: data.Title || '',
        Title2: data.Title2 || '',
        IsActive: data.IsActive !== undefined ? data.IsActive : true,
        Description: data.Description || '',
      });
    }
  }, [data]);

  useEffect(() => {
    if (!data?.SalesCenterID && !activeId) {
      apiFetch(`/api/sle/sales-centers/next-number`)
        .then(res => res.json())
        .then(resData => {
          const info = resData?.data || resData;
          if (info.documentNumber) {
            setValues(prev => ({ ...prev, Code: info.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [data?.SalesCenterID, activeId]);

  const handleChange = (name: string, value: any) => {
    setValues(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'Type') {
        // Reset reference and title when type changes
        next.ReferenceRef = null;
        if (value !== 4) {
          next.Title = '';
          next.Title2 = '';
        }
      }
      if (name === 'Title' && (!prev.Title2 || prev.Title2.trim() === '' || prev.Title2 === prev.Title)) {
        next.Title2 = value;
      }
      return next;
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleReferenceSelect = (selectedItem: any) => {
    if (!selectedItem) {
      setValues(prev => ({
        ...prev,
        ReferenceRef: null,
        Title: '',
        Title2: ''
      }));
      return;
    }
    const title = selectedItem.title || selectedItem.Title || selectedItem.WarehouseTitle || '';
    const refId = selectedItem.costCenterId || selectedItem.CostCenterID || selectedItem.businessStructureId || selectedItem.BusinessStructureID || selectedItem.ID || selectedItem.id;
    
    setValues(prev => ({
      ...prev,
      ReferenceRef: refId,
      Title: title,
      Title2: title
    }));
  };

  const handleNew = () => {
    setData(undefined);
    setActiveId(null);
    setValues({
      Code: '',
      Type: 4,
      ReferenceRef: null,
      Title: '',
      Title2: '',
      IsActive: true,
      Description: '',
    });
    setErrors({});

    apiFetch(`/api/sle/sales-centers/next-number`)
      .then(res => res.json())
      .then(resData => {
        const info = resData?.data || resData;
        if (info.documentNumber) {
          setValues(prev => ({ ...prev, Code: info.documentNumber }));
        }
      })
      .catch(console.error);
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    let codeVal = values.Code;
    if (!codeVal || Number(codeVal) <= 0) {
      setErrors(prev => ({ ...prev, Code: 'فیلد کد اجباری است.' }));
      showToast('فیلد کد اجباری است.', 'error');
      return;
    }

    const titleVal = String(values.Title ?? '').trim();
    if (!titleVal) {
      setErrors(prev => ({ ...prev, Title: 'فیلد عنوان اجباری است.' }));
      showToast('فیلد عنوان اجباری است.', 'error');
      return;
    }

    const title2Val = String(values.Title2 ?? '').trim() || titleVal;

    setErrors({});
    setIsSubmitting(true);

    try {
      const url = getUrl('/api/sle/sales-centers');
      
      const payload = {
        Code: Number(codeVal),
        Type: Number(values.Type),
        ReferenceRef: values.ReferenceRef ? Number(values.ReferenceRef) : null,
        Title: titleVal,
        title: titleVal,
        Title2: title2Val,
        title2: title2Val,
        IsActive: values.IsActive !== undefined ? values.IsActive : true,
        Description: values.Description || '',
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const result = await res.json();
      
      if (res.ok) {
        const savedItem = result?.data || result;
        if (savedItem && savedItem.SalesCenterID) {
          setData(savedItem);
          handleResponse(savedItem, 'SalesCenterID');
        }
        showToast(result.message || 'اطلاعات با موفقیت ذخیره گردید.', 'success');
        if (onSaved) onSaved();

        if (isClose) {
          if (activeTabId) removeTab(activeTabId);
        } else if (isNew) {
          handleNew();
        }
      } else {
        showToast(result.message || 'خطا در ذخیره اطلاعات', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => saveToApi(false, false);
  const handleSaveNew = () => saveToApi(true, false);
  const handleSaveClose = () => saveToApi(false, true);

  const typeOptions = [
    { value: 1, label: 'مرکز هزینه' },
    { value: 2, label: 'نمایندگی' },
    { value: 3, label: 'شعبه' },
    { value: 4, label: 'سایر' },
  ];

  const isSystemType = values.Type !== 4;

  const getReferenceDropdown = () => {
    const typeNum = Number(values.Type);
    let label = "انتخاب مرجع :";
    let placeholder = "ابتدا نوع را انتخاب کنید...";
    let dataList: any[] = [];
    let valueKey = "id";
    let isDisabled = isUsed || typeNum === 4;

    if (typeNum === 1) {
      label = "انتخاب مرکز هزینه :";
      placeholder = "مرکز هزینه را انتخاب کنید...";
      dataList = costCenters;
      valueKey = "costCenterId";
    } else if (typeNum === 2) {
      label = "انتخاب نمایندگی :";
      placeholder = "نمایندگی را انتخاب کنید...";
      const allAgencies = businessStructures.filter(bs => {
        const t = Number(bs.businessStructure || bs.BusinessStructure);
        return t === 4 || bs.businessStructureName === 'نمایندگی';
      });

      if (currentCompany?.businessStructureId) {
        const currentId = Number(currentCompany.businessStructureId);
        const filtered = allAgencies.filter(bs => {
          const parentId = Number(bs.parentRef || bs.ParentRef || 0);
          const compId = Number(bs.companyRef || bs.CompanyRef || 0);
          const bsRef = Number(bs.businessStructureRef || bs.BusinessStructureRef || 0);
          return parentId === currentId || compId === currentId || bsRef === currentId || bs.businessStructureId === currentId;
        });
        dataList = filtered.length > 0 ? filtered : allAgencies;
      } else {
        dataList = allAgencies;
      }
      valueKey = "businessStructureId";
    } else if (typeNum === 3) {
      label = "انتخاب شعبه :";
      placeholder = "شعبه را انتخاب کنید...";
      dataList = businessStructures.filter(bs => {
        const t = Number(bs.businessStructure || bs.BusinessStructure);
        return t === 3 || bs.businessStructureName === 'شعبه';
      });
      valueKey = "businessStructureId";
    }

    return (
      <SingleSelectDropDown
        data={dataList}
        value={values.ReferenceRef}
        onChange={(item, val) => handleReferenceSelect(item)}
        columns={[
          { key: "code", label: "کد", width: 80 },
          { key: "title", label: "عنوان", width: 200 }
        ]}
        valueKey={valueKey}
        displayKey="code"
        placeholder={placeholder}
        disabled={isDisabled}
        label={label}
        labelWidth="110px"
      />
    );
  };

  const fields: FieldConfig[] = [
    {
      name: "CodeAndType",
      label: "",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-3 w-full">
          <div className="w-[130px] shrink-0">
            <NumberInput
              label="کد :"
              value={values.Code}
              onChange={(val) => handleChange('Code', val)}
              required={true}
              error={errors.Code}
              disabled={isUsed}
              labelWidth="75px"
            />
          </div>
          <div className="flex-1">
            <FormFieldWrapper label="نوع :" required={true} labelWidth="35px">
              <Select
                options={typeOptions}
                value={values.Type}
                onChange={(val) => handleChange('Type', Number(val))}
                disabled={isUsed}
              />
            </FormFieldWrapper>
          </div>
        </div>
      )
    },
    {
      name: "ReferenceRef",
      label: "",
      type: "custom",
      required: false,
      colSpan: 1,
      customComponent: getReferenceDropdown()
    },
    { name: "Title", label: "عنوان", type: "text", required: true, colSpan: 1, labelWidth: "75px", disabled: isUsed || isSystemType },
    { name: "Title2", label: "عنوان (2)", type: "text", required: true, colSpan: 1, labelWidth: "75px", disabled: isUsed || isSystemType },
    { name: "Description", label: "توضیحات", type: "textarea", required: false, colSpan: 2, labelWidth: "75px", rows: 3 },
    { 
      name: "IsActive", 
      label: " ", 
      type: "custom", 
      containerClassName: "mb-6",
      customComponent: (
        <CheckBoxRightLabel 
          label="فعال" 
          checked={values.IsActive} 
          onChange={(checked) => handleChange('IsActive', checked)} 
          disabled={isUsed} 
        />
      ), 
      required: false,
      colSpan: 2
    },
  ];

  return (
    <SimpleFormTwoRow 
      isReadonly={isUsed || false}
      title={data ? "ویرایش مرکز فروش" : "مرکز فروش جدید"}
      icon={<Store className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      listApiUrl="/api/sle/sales-centers"
      listDisplayKey="Title"
      listColumns={[
        { key: "Code", header: "کد" },
        { 
          key: "Type", 
          header: "نوع",
          renderItem: (item: any) => {
            const t = Number(item.Type);
            if (t === 1) return "مرکز هزینه";
            if (t === 2) return "نمایندگی";
            if (t === 3) return "شعبه";
            return "سایر";
          }
        },
        { key: "Title", header: "عنوان" },
        { key: "Title2", header: "عنوان (2)" },
        { 
          key: "IsActive", 
          header: "وضعیت",
          renderItem: (item: any) => item.IsActive !== false ? "فعال" : "غیرفعال"
        },
        { key: "Description", header: "توضیحات" }
      ]}
      onListSelect={(item) => {
        if (data?.SalesCenterID !== item.SalesCenterID) {
          addTab(
            `ویرایش مرکز فروش - ${item.Title}`,
            'financial_group',
            undefined,
            'SalesCenterForm',
            { id: item.SalesCenterID }
          );
        }
      }}
      onDelete={data?.SalesCenterID && !isUsed ? async () => {
         const isConfirmed = await confirm({ message: 'آیا از حذف این مرکز فروش اطمینان دارید؟' });
         if (!isConfirmed) return;
         setIsSubmitting(true);
         try {
            const res = await apiFetch(`/api/sle/sales-centers/${data.SalesCenterID}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('خطا در حذف');
            showToast('با موفقیت حذف شد', 'success');
            if (activeTabId) removeTab(activeTabId);
         } catch (err: any) {
            showToast(err.message || 'خطا در حذف', 'error');
         } finally {
            setIsSubmitting(false);
         }
      } : undefined}
      isSubmitting={isSubmitting || isLoading}
      labelWidth="120px"
    />
  );
}

export function SalesCenter(props: any) {
  return <SalesCenterComponent {...props} />;
}

export function SalesCenterForm(props: any) {
  return <SalesCenterComponent {...props} />;
}

export default SalesCenterForm;
