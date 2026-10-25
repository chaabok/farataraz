"use client";

import React, { forwardRef } from "react";
import { SingleSelectDropDown, SingleSelectDropDownRef, SingleSelectColumn, AddFormOption } from "@/components/inputs/SingleSelectDropDown";

export interface GeoLocationItem {
  id: number;
  code: string;
  title: string;
  latinTitle?: string;
  province?: string;
  country?: string;
  [key: string]: any;
}

export interface GeoLocationDropDownProps {
  value?: GeoLocationItem | any;
  onChange?: (item: GeoLocationItem | null) => void;
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
  listApiUrl?: string;
  displayKey?: keyof GeoLocationItem | string;
  filterItem?: (item: GeoLocationItem) => boolean;
  noWrapper?: boolean;
  className?: string;
  trigger?: (toggle: () => void, isOpen: boolean, searchQuery: string, setSearchQuery: (q: string) => void) => React.ReactNode;
  notFoundMessage?: string;
  onAdd?: () => void;
  addFormOptions?: AddFormOption | AddFormOption[];
  /** Task 70: بروزرسانی دستی/خودکار فهرست توسط والد (به SingleSelectDropDown پاس داده می‌شود) */
  onRefresh?: () => void | Promise<void>;
}

const DEFAULT_GEO_ADD_OPTIONS: AddFormOption[] = [
  { title: 'تعریف موقعیت مکانی جدید', componentName: 'GeoLocation', groupId: 'common' }
];

const columns: SingleSelectColumn[] = [
  { key: 'code', label: 'کد شهر', width: 100, sortable: true },
  { key: 'title', label: 'عنوان شهر', width: 150, sortable: true },
  { key: 'province', label: 'نام استان', width: 150, sortable: true },
  { key: 'country', label: 'نام کشور', width: 150, sortable: true }
];

export const GeoLocationDropDown = forwardRef<SingleSelectDropDownRef, GeoLocationDropDownProps>(
  function GeoLocationDropDown(
    {
      value,
      onChange,
      placeholder = "انتخاب شهر...",
      label = "شهر / موقعیت مکانی",
      required,
      error,
      alignVertical,
      labelWidth,
      disabled = false,
      id,
      onKeyDown,
      dropdownPlacement = 'auto',
      listApiUrl = '/api/common/geo-locations/cities',
      displayKey = 'title',
      filterItem,
      noWrapper,
      className,
      trigger,
      notFoundMessage = "اطلاعاتی یافت نشد",
      onAdd,
      addFormOptions = DEFAULT_GEO_ADD_OPTIONS,
      onRefresh
    },
    ref
  ) {
    return (
      <SingleSelectDropDown
        ref={ref}
        value={value}
        onChange={onChange as any}
        placeholder={placeholder}
        label={label}
        required={required}
        error={error}
        alignVertical={alignVertical}
        labelWidth={labelWidth}
        disabled={disabled}
        id={id}
        onKeyDown={onKeyDown as any}
        dropdownPlacement={dropdownPlacement}
        listApiUrl={listApiUrl}
        displayKey={displayKey as any}
        filterItem={filterItem as any}
        noWrapper={noWrapper}
        className={className}
        trigger={trigger as any}
        columns={columns}
        notFoundMessage={notFoundMessage}
        onAdd={onAdd}
        addFormOptions={addFormOptions}
        onRefresh={onRefresh}
      />
    );
  }
);

// Alias for exact spelling in user prompt
export const GeoLocatioDropDown = GeoLocationDropDown;

export default GeoLocationDropDown;
