"use client";

import React, { useRef } from "react";
import { SingleSelectDropDown, SingleSelectDropDownRef, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";

interface VoucherTypesDropDownProps {
  value: any;
  onChange: (item: any) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom' | 'auto';
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  excludeSystemTypes?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function VoucherTypesDropDown({
  value,
  onChange,
  disabled,
  dropdownPlacement,
  id,
  onKeyDown,
  excludeSystemTypes = false,
  placeholder = "انتخاب کنید...",
  label,
  required,
  error,
  className
}: VoucherTypesDropDownProps) {
  const dropdownRef = useRef<SingleSelectDropDownRef>(null);

  const systemTypes = [
    'سند افتتاحیه',
    'سند اختتامیه',
    'سود و زیانی',
    'تعدیل ماهیت اول دوره',
    'تعدیل ماهیت پایان دوره',
    'افتتاحیه',
    'اختتامیه'
  ];

  const filterItem = (item: any) => {
    if (!excludeSystemTypes) return true;
    const title = item.title || item.Title || "";
    return !systemTypes.some(sysType => title.includes(sysType));
  };

  const columns: SingleSelectColumn[] = [
    { key: "code", label: "کد", width: 80 },
    { key: "title", label: "عنوان", width: 160 },
    { key: "title_en", label: "عنوان لاتین", width: 140 },
  ];

  return (
    <SingleSelectDropDown
      ref={dropdownRef}
      id={id}
      listApiUrl="/api/accounting/voucher-types"
      columns={columns}
      value={value}
      valueKey="voucherTypeId"
      displayKey="title"
      onChange={(item) => onChange(item)}
      disabled={disabled}
      filterItem={filterItem}
      dropdownPlacement={dropdownPlacement}
      placeholder={placeholder}
      label={label}
      required={required}
      error={error}
      noWrapper={!label}
      className={className}
      onKeyDown={onKeyDown as any}
    />
  );
}

