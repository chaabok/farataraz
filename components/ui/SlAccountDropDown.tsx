"use client";

import React, { useState, useRef, useEffect } from "react";
import { MultiColumnDropdown, MultiColumnDropdownRef } from "@/components/inputs/MultiColumnDropdown";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { cn, apiFetch } from "@/lib/utils";

interface SlAccountDropDownProps {
  value: any;
  onChange: (item: any) => void;
  disabled?: boolean;
  dropdownPlacement?: 'top' | 'bottom' | 'auto';
  displayOnlyCode?: boolean;
  id?: string;
  onKeyDown?: (e: React.KeyboardEvent<any>) => void;
  excludeCode?: string;
  customFilter?: (item: any) => boolean;
  apiParams?: Record<string, string | boolean | number | undefined | null>;
  error?: string;
  data?: any[];
  enableMultiSelection?: boolean;
  onAdd?: () => void;
  addFormOptions?: any;
}

export function SlAccountDropDown({
  value,
  onChange,
  disabled,
  dropdownPlacement,
  displayOnlyCode,
  id,
  onKeyDown,
  excludeCode,
  customFilter,
  apiParams,
  error,
  data,
  enableMultiSelection,
  onAdd,
  addFormOptions
}: SlAccountDropDownProps) {
  const dropdownRef = useRef<MultiColumnDropdownRef>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedAccount, setFetchedAccount] = useState<any>(null);

  const getAccountCode = (val: any): string => {
    if (!val) return "";
    let target = val;
    if (Array.isArray(target)) {
      if (target.length === 0) return "";
      target = target[0];
    }
    if (typeof target === "object" && target !== null) {
      const c = target.code ?? target.Code ?? target.accountCode ?? target.AccountCode ?? target.moinCode ?? target.MoinCode ?? target.slCode ?? target.SlCode ?? target.ItemAccountCategoryCode ?? "";
      return String(c === null || c === undefined ? "" : c).trim();
    }
    if (typeof target === "string" && target.includes("-")) {
      return target.split("-")[0].trim();
    }
    return "";
  };

  const getAccountTitle = (val: any): string => {
    if (!val) return "";
    let target = val;
    if (Array.isArray(target)) {
      if (target.length === 0) return "";
      target = target[0];
    }
    if (typeof target === "object" && target !== null) {
      const t = target.title ?? target.Title ?? target.accountTitle ?? target.AccountTitle ?? target.moinTitle ?? target.MoinTitle ?? target.slTitle ?? target.SlTitle ?? target.name ?? target.Name ?? target.label ?? "";
      return String(t === null || t === undefined ? "" : t).trim();
    }
    if (typeof target === "string" && target.includes("-")) {
      const parts = target.split("-");
      return parts.slice(1).join("-").trim();
    }
    return "";
  };

  const getAccountId = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    let target = val;
    if (Array.isArray(target)) {
      if (target.length === 0) return null;
      target = target[0];
    }
    if (typeof target === "object" && target !== null) {
      const raw = target.id ?? target.AccountID ?? target.accountId ?? target.accountRef ?? target.InventorySlAccountRef;
      if (raw !== null && raw !== undefined && raw !== "") {
        const num = Number(raw);
        return isNaN(num) ? null : num;
      }
      return null;
    }
    if (typeof target === "number") {
      return target;
    }
    if (typeof target === "string" && target.trim() !== "") {
      const num = Number(target.trim());
      return isNaN(num) ? null : num;
    }
    return null;
  };

  const formatAccountDisplay = (code: string, title: string): string => {
    const cleanCode = code ? code.trim() : "";
    const cleanTitle = title ? title.trim() : "";
    if (cleanCode && cleanTitle) {
      return `${cleanCode} - ${cleanTitle}`;
    }
    return cleanCode || cleanTitle || "";
  };

  // Sync input value with selected value
  useEffect(() => {
    let isMounted = true;

    if (!value) {
      setInputValue("");
      setFetchedAccount(null);
      return;
    }

    if (fetchedAccount && getAccountId(fetchedAccount) !== getAccountId(value)) {
      setFetchedAccount(null);
    }

    const currentFetched = (fetchedAccount && getAccountId(fetchedAccount) === getAccountId(value)) ? fetchedAccount : null;
    const code = getAccountCode(value) || getAccountCode(currentFetched);
    const title = getAccountTitle(value) || getAccountTitle(currentFetched);

    if (code || title) {
      if (displayOnlyCode) {
        setInputValue(code);
      } else {
        setInputValue(formatAccountDisplay(code, title));
      }
    } else {
      const accId = getAccountId(value);
      if (accId) {
        if (data && Array.isArray(data)) {
          const found = data.find((x: any) => getAccountId(x) === accId || String(getAccountCode(x)) === String(value));
          if (found) {
            setFetchedAccount(found);
            const fCode = getAccountCode(found);
            const fTitle = getAccountTitle(found);
            if (displayOnlyCode) {
              setInputValue(fCode);
            } else {
              setInputValue(formatAccountDisplay(fCode, fTitle));
            }
            return;
          }
        }

        apiFetch(`/api/accounting/accounts/${accId}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((resData) => {
            if (!isMounted) return;
            const acc = resData?.data || resData;
            if (acc && (getAccountCode(acc) || getAccountTitle(acc))) {
              setFetchedAccount(acc);
              const fCode = getAccountCode(acc);
              const fTitle = getAccountTitle(acc);
              if (displayOnlyCode) {
                setInputValue(fCode);
              } else {
                setInputValue(formatAccountDisplay(fCode, fTitle));
              }
            } else {
              setInputValue(String(value));
            }
          })
          .catch(() => {
            if (isMounted) setInputValue(String(value));
          });
      } else {
        setInputValue("");
      }
    }

    return () => {
      isMounted = false;
    };
  }, [value, displayOnlyCode, data]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isEnter = e.key === "Enter";
    
    if (isEnter) {
      const query = inputValue.trim();
      const currentCode = getAccountCode(value) || getAccountCode(fetchedAccount);
      const currentTitle = getAccountTitle(value) || getAccountTitle(fetchedAccount);
      const expectedInputValue = displayOnlyCode
        ? currentCode
        : (currentCode && currentTitle ? `${currentCode} - ${currentTitle}` : (currentCode || currentTitle));
      const isMatched = Boolean(value && inputValue === expectedInputValue);
      
      if (isMatched && query !== "") {
        // They didn't change anything, just pressed Enter to navigate
        if (onKeyDown) onKeyDown(e);
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (query !== "") {
        if (data) {
          let items = data.filter((x: any) => 
            String(getAccountCode(x)).includes(query) || 
            String(getAccountTitle(x)).includes(query)
          );
          if (excludeCode) {
            items = items.filter((x: any) => getAccountCode(x) !== excludeCode);
          }
          if (customFilter) {
            items = items.filter((x: any) => customFilter(x));
          }
          if (items.length === 1) {
            onChange(items[0]);
          } else {
            dropdownRef.current?.openAndSearch(query);
          }
          return;
        }

        setIsLoading(true);
        try {
          const qs = new URLSearchParams();
          qs.set('level', '3');
          qs.set('isActive', 'true');
          qs.set('search', query);
          if (apiParams) {
             Object.entries(apiParams).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                   qs.set(k, String(v));
                }
             });
          }
          const res = await apiFetch(`/api/accounting/accounts?${qs.toString()}`);
          if (res.ok) {
            const json = await res.json();
            let items = Array.isArray(json) ? json : (json.items || json.data || []);
            
            if (excludeCode) {
              items = items.filter((x: any) => getAccountCode(x) !== excludeCode);
            }
            
            if (customFilter) {
              items = items.filter((x: any) => customFilter(x));
            }

            if (items.length === 1) {
              // Exact match (or only one match), auto select
              onChange(items[0]);
            } else {
              // Multiple or 0 matches, open dropdown with search
              dropdownRef.current?.openAndSearch(query);
            }
          } else {
            dropdownRef.current?.openAndSearch(query);
          }
        } catch (err) {
          dropdownRef.current?.openAndSearch(query);
        } finally {
          setIsLoading(false);
        }
      } else {
        dropdownRef.current?.openAndSearch("");
      }
    } else if (e.key === "ArrowDown" && e.altKey) {
      dropdownRef.current?.openAndSearch("");
      if (onKeyDown) onKeyDown(e);
    } else {
      if (onKeyDown) {
        onKeyDown(e);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (value && e.target.value === "") {
      onChange(null);
    }
  };

  const renderTrigger = (toggle: () => void, isOpen: boolean) => (
    <div className="flex w-full h-[25px]">
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={value ? "" : "انتخاب کنید..."}
        className={cn(
          "flex-1 px-2 h-[25px] w-full text-[11px] bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium disabled:opacity-80 disabled:cursor-not-allowed",
          "rounded-s",
          error ? "border-rose-500 ring-rose-500/20 ring-1" : (isOpen && "border-indigo-500 ring-1 ring-indigo-50/50 dark:ring-indigo-900/40")
        )}
        autoComplete="off"
      />
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            if (isOpen) {
               dropdownRef.current?.close();
            } else {
               dropdownRef.current?.openAndSearch("");
            }
          }
        }}
        className={cn(
          "w-[26px] h-[25px] flex items-center justify-center transition-colors flex-shrink-0 rounded-e border text-white",
          disabled ? "bg-slate-600 border-slate-700 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 border-blue-600 cursor-pointer"
        )}
        title="بازکردن جستجو"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin drop-shadow-sm" />
        ) : (
          <Plus strokeWidth={3} className="w-2.5 h-2.5 drop-shadow-sm" />
        )}
      </div>
    </div>
  );

  const qsDropdown = new URLSearchParams();
  qsDropdown.set('level', '3');
  qsDropdown.set('isActive', 'true');
  if (apiParams) {
     Object.entries(apiParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
           qsDropdown.set(k, String(v));
        }
     });
  }

  const handleDropdownChange = (selected: any) => {
    let item = selected;
    if (Array.isArray(item)) {
      item = item.length > 0 ? item[0] : null;
    }
    onChange(item);
  };

  return (
    <MultiColumnDropdown
      ref={dropdownRef}
      trigger={renderTrigger}
      dropdownPlacement={dropdownPlacement}
      displayKey="title"
      renderSelection={() => ""} // not used anymore since we use a custom trigger
      value={value}
      onChange={handleDropdownChange}
      data={data}
      enableMultiSelection={enableMultiSelection ?? false}
      onAdd={onAdd}
      addFormOptions={addFormOptions}
      listApiUrl={data ? undefined : `/api/accounting/accounts?${qsDropdown.toString()}`}
      filterItem={(item: any) => {
        if (excludeCode && item.code === excludeCode) return false;
        if (customFilter && !customFilter(item)) return false;
        return true;
      }}
      columns={[
        { 
          key: "code", 
          label: "کد معین",
          renderItem: (item: any) => item.code || '',
          exportValue: (item: any) => item.code || ''
        },
        { key: "title", label: "عنوان معین" },
        { key: "parent.code", label: "کد کل" },
        { key: "parent.title", label: "عنوان حساب کل" },
      ]}
      disabled={disabled}
      defaultShowGlobalSearch={false}
      defaultShowColumnFilters={true}
    />
  );
}

