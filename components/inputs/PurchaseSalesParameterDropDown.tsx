"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { SingleSelectDropDown, SingleSelectColumn, SingleSelectDropDownRef, AddFormOption } from "@/components/inputs/SingleSelectDropDown";
import { apiFetch } from "@/lib/utils";

export const PARAMETER_TYPE_MAP: Record<number, string> = {
  1: "افزاینده",
  2: "کاهنده",
  3: "خنثی",
};

export const OPERATION_TYPE_MAP: Record<number, string> = {
  1: "مبلغی",
  2: "مقداری",
  3: "درصدی",
  4: "مبلغ واحد",
  5: "روند",
};

export const RELATION_TYPE_MAP: Record<number, string> = {
  1: "مستقل",
  2: "کالا خدمت",
  3: "پک محصول",
  4: "مشتری",
  5: "کالا خدمت و مشتری",
  6: "پک محصول و مشتری",
  7: "تامین کننده",
  8: "کالا خدمت و تامین کننده",
  9: "محل تحویل",
  10: "نحوه پرداخت",
};

export const CATEGORY_OTHER_MAP: Record<number, string> = {
  1: "مالیات ارزش افزوده",
  2: "عوارض ارزش افزوده",
  3: "تخفیف",
  4: "ضمانت حسن انجام کار",
  5: "پیش پرداخت",
  6: "پیش دریافت",
  7: "سپرده بیمه",
  8: "سایر",
};

export interface PurchaseSalesParameterDropDownProps {
  value: any;
  onChange: (item: any, selectedVal?: any) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom' | 'auto';
  id?: string;
  label?: string;
  labelWidth?: string;
  required?: boolean;
  placeholder?: string;
  noWrapper?: boolean;
  className?: string;
  addFormOptions?: AddFormOption | AddFormOption[];
}

const DEFAULT_ADD_OPTIONS: AddFormOption[] = [
  { title: 'تعریف پارامترهای خرید و فروش جدید', componentName: 'PurchaseSalesParametersForm', groupId: 'inv' }
];

export function PurchaseSalesParameterDropDown({
  value,
  onChange,
  disabled,
  dropdownPlacement,
  id,
  label,
  labelWidth,
  required,
  placeholder = "انتخاب عنوان عامل...",
  noWrapper,
  className,
  addFormOptions = DEFAULT_ADD_OPTIONS
}: PurchaseSalesParameterDropDownProps) {
  const dropdownRef = useRef<SingleSelectDropDownRef>(null);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    apiFetch("/api/inv/purchase-sales-parameters")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (!isMounted) return;
        const list = Array.isArray(resData)
          ? resData
          : (Array.isArray(resData?.data) ? resData.data : []);

        // Filter: parameters with IsProcurement == true OR IsWarehouse == true, and active
        const filtered = list.filter((p: any) => {
          const isProcurement = Boolean(p.IsProcurement);
          const isWarehouse = Boolean(p.IsWarehouse);
          const isActive = p.IsActive !== false;
          return (isProcurement || isWarehouse) && isActive;
        });

        // Map enum titles for display/search
        const mapped = filtered.map((item: any) => ({
          ...item,
          ParameterTypeLabel: PARAMETER_TYPE_MAP[item.ParameterType] || "-",
          OperationTypeLabel: OPERATION_TYPE_MAP[item.OperationType] || "-",
          RelationTypeLabel: RELATION_TYPE_MAP[item.RelationType] || "-",
          CategoryOtherLabel: CATEGORY_OTHER_MAP[item.CategoryOther] || "-",
        }));

        setData(mapped);
      })
      .catch((err) => {
        console.error("Error fetching purchase sales parameters:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const columns: SingleSelectColumn[] = useMemo(() => [
    { key: "Title", label: "عنوان پارامتر", width: 160, sortable: true },
    { key: "ParameterTypeLabel", label: "نوع پارامتر", width: 100, sortable: true },
    { key: "OperationTypeLabel", label: "عملکرد", width: 100, sortable: true },
    { key: "RelationTypeLabel", label: "نحوه ارتباط", width: 140, sortable: true },
    { key: "CategoryOtherLabel", label: "سایر", width: 140, sortable: true },
  ], []);

  return (
    <SingleSelectDropDown
      ref={dropdownRef}
      id={id}
      data={data}
      columns={columns}
      value={value}
      valueKey="Title"
      displayKey="Title"
      onChange={onChange}
      label={label}
      labelWidth={labelWidth}
      required={required}
      placeholder={placeholder}
      disabled={disabled}
      dropdownPlacement={dropdownPlacement}
      noWrapper={noWrapper}
      className={className}
      addFormOptions={addFormOptions}
    />
  );
}
