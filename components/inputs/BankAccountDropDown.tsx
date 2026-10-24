"use client";

import React, { useState, useRef, useEffect } from "react";
import { SingleSelectDropDown, SingleSelectDropDownRef, AddFormOption } from "@/components/inputs/SingleSelectDropDown";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn, apiFetch } from "@/lib/utils";

interface BankAccountDropDownProps {
  value: any;
  onChange: (item: any) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom' | 'auto';
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  apiParams?: Record<string, string | boolean | number | undefined | null>;
  label?: string;
  labelWidth?: string;
  required?: boolean;
  placeholder?: string;
  filterItem?: (item: any) => boolean;
  onAdd?: () => void;
  addFormOptions?: AddFormOption | AddFormOption[];
}

const DEFAULT_BANK_ACCOUNT_ADD_OPTIONS: AddFormOption[] = [
  { title: 'تعریف حساب بانکی جدید', componentName: 'BankAccountForm', groupId: 'rap' }
];

export function BankAccountDropDown({
  value,
  onChange,
  disabled,
  dropdownPlacement,
  id,
  onKeyDown,
  apiParams,
  label,
  labelWidth,
  required,
  placeholder,
  filterItem,
  onAdd,
  addFormOptions = DEFAULT_BANK_ACCOUNT_ADD_OPTIONS
}: BankAccountDropDownProps) {
  const dropdownRef = useRef<SingleSelectDropDownRef>(null);

  const qsDropdown = new URLSearchParams();
  if (apiParams) {
     Object.entries(apiParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
           qsDropdown.set(k, String(v));
        }
     });
  }

  return (
    <SingleSelectDropDown
      ref={dropdownRef}
      dropdownPlacement={dropdownPlacement}
      displayKey="title"
      value={value}
      onChange={onChange}
      listApiUrl={`/api/rap/bank-accounts?${qsDropdown.toString()}`}
      filterItem={filterItem}
      label={label}
      labelWidth={labelWidth}
      required={required}
      placeholder={placeholder}
      id={id}
      onKeyDown={onKeyDown as any}
      columns={[
        { key: "detailedCode", label: "کد تفصیل", width: 100 },
        { 
          key: "title", 
          label: "عنوان", 
          width: 300,
          renderItem: (item) => item.title || item.accountNumber || ''
        },
        { 
          key: "balance", 
          label: "مانده حساب", 
          width: 150,
        },
        { 
          key: "currencyTitle", 
          label: "نوع ارز", 
          width: 100,
          renderItem: (item: any) => item.currency?.title || item.currencyTitle || '-'
        },
      ]}
      disabled={disabled}
      onAdd={onAdd}
      addFormOptions={addFormOptions}
    />
  );
}
