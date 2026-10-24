"use client";

import React, { useRef, useEffect, useState } from 'react';
import { SingleSelectDropDown, SingleSelectDropDownRef, SingleSelectColumn, AddFormOption } from './SingleSelectDropDown';
import { useOptionalTabs } from '@/components/TabsProvider';
import { apiFetch } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface CurrencyType {
  currencyID: number;
  code: number;
  title: string;
  titleEn: string;
  exchangeUnit: number;
  precisionCount: number;
  isActive: boolean;
  [key: string]: any;
}

interface CurrencyDropdownProps {
  value?: CurrencyType | null;
  onChange?: (currency: CurrencyType | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  alignVertical?: boolean;
  labelWidth?: string;
  disabled?: boolean;
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  dropdownPlacement?: 'top' | 'bottom' | 'auto';
  displayOnlyCode?: boolean;
  listApiUrl?: string;
  trigger?: (toggle: () => void, isOpen: boolean) => React.ReactNode;
  onAdd?: () => void;
  addFormOptions?: AddFormOption | AddFormOption[];
}

const DEFAULT_CURRENCY_ADD_OPTIONS: AddFormOption[] = [
  { title: 'ارز جدید', componentName: 'Currency', groupId: 'general', icon: <Coins className="h-[14px] w-[14px]" /> }
];

const columns: SingleSelectColumn[] = [
  { key: 'code', label: 'کد', width: 80, sortable: true },
  { key: 'title', label: 'عنوان', width: 140, sortable: true },
  { key: 'titleEn', label: 'عنوان لاتین', width: 140, sortable: true },
  { key: 'exchangeUnit', label: 'واحد مبادله', width: 120, sortable: true }
];

export function CurrencyDropdown({
  value,
  onChange,
  placeholder,
  label,
  required,
  error,
  alignVertical,
  labelWidth,
  disabled = false,
  id,
  onKeyDown,
  dropdownPlacement = 'auto',
  displayOnlyCode,
  listApiUrl,
  trigger,
  onAdd,
  addFormOptions = DEFAULT_CURRENCY_ADD_OPTIONS
}: CurrencyDropdownProps) {
  const dropdownRef = useRef<SingleSelectDropDownRef>(null);

  const tabsCtx = useOptionalTabs();
  const addTab = tabsCtx?.addTab;

  const [defaultValueSet, setDefaultValueSet] = useState(false);

  useEffect(() => {
    if (!value && !defaultValueSet) {
      const loadDefaultCurrency = async () => {
        try {
          const res = await apiFetch('/api/common/base-settings/tab/2');
          if (res.ok) {
            const json = await res.json();
            const settings = json.data || {};
            const baseCurrencyTitle = settings.defaultCurrency || 'ریال';

            // Query existing currencies to find the match
            const url = listApiUrl || '/api/common/currencies?pageIndex=0&pageSize=100';
            const currenciesRes = await apiFetch(url);
            if (currenciesRes.ok) {
              const currenciesJson = await currenciesRes.json();
              const items = Array.isArray(currenciesJson) ? currenciesJson : (currenciesJson.items || currenciesJson.data || []);
              if (Array.isArray(items)) {
                const matched = items.find((c: any) => 
                  String(c.title).trim().toLowerCase() === String(baseCurrencyTitle).trim().toLowerCase()
                );
                if (matched) {
                  if (onChange) {
                    onChange(matched);
                  }
                  setDefaultValueSet(true);
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to load default base currency settings", e);
        }
      };

      loadDefaultCurrency();
    }
  }, [value, displayOnlyCode, listApiUrl, defaultValueSet, onChange]);

  const handleAdd = () => {
    if (addTab) {
      addTab(
        'ارز جدید',
        'general',
        <Coins className="h-[14px] w-[14px]" />,
        'Currency'
      );
    }
  };

  const handleChange = (item: any) => {
    if (onChange) {
      onChange(item);
    }
  };

  return (
    <SingleSelectDropDown
      ref={dropdownRef}
      id={id}
      label={label}
      columns={columns}
      listApiUrl={listApiUrl || "/api/common/currencies"}
      value={value}
      onChange={handleChange}
      displayKey={displayOnlyCode ? "code" : "title"}
      placeholder={placeholder || 'انتخاب ارز...'}
      required={required}
      error={error}
      alignVertical={alignVertical}
      labelWidth={labelWidth}
      disabled={disabled}
      onAdd={onAdd || handleAdd}
      addFormOptions={addFormOptions}
      dropdownPlacement={dropdownPlacement}
      onKeyDown={onKeyDown}
      trigger={trigger}
    />
  );
}

// Export with both title cases for maximum compliance
export { CurrencyDropdown as CurrencyDropDown };
