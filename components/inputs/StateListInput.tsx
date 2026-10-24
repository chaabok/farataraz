import React, { useMemo } from 'react';
import { Select } from './Select';

export enum DocumentState {
  Note = 1,
  InitialRegistration = 2,
  UnderReview = 3,
  Reviewed = 4,
  Approved = 5,
  Cancelled = 6,
  Restored = 7,
  AccountingVoucher = 8,
  Finalized = 9,
}

export const DocumentStateLabels: Record<DocumentState, string> = {
  [DocumentState.Note]: 'یادداشت',
  [DocumentState.InitialRegistration]: 'ثبت اولیه',
  [DocumentState.UnderReview]: 'در دست بررسی',
  [DocumentState.Reviewed]: 'بررسی شده',
  [DocumentState.Approved]: 'تایید شده',
  [DocumentState.Cancelled]: 'ابطال شده',
  [DocumentState.Restored]: 'برگشت از ابطال',
  [DocumentState.AccountingVoucher]: 'سند حسابداری',
  [DocumentState.Finalized]: 'دائم',
};

export function isStatusApprovedOrReviewed(status: any): boolean {
  if (status === null || status === undefined || status === "") return false;
  if (typeof status === "number") {
    return status === DocumentState.Reviewed || status === DocumentState.Approved;
  }
  const str = String(status).trim();
  return (
    str === "4" ||
    str === "5" ||
    str === "بررسی شده" ||
    str === "تایید شده" ||
    str.includes("بررسی شده") ||
    str.includes("تایید شده")
  );
}

export interface StateListInputProps {
  label?: string;
  value?: number | string | null;
  onChange: (val: number | null) => void;
  allowedStates?: DocumentState[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  labelWidth?: string;
  alignVertical?: boolean;
}

export function StateListInput({
  label,
  value,
  onChange,
  allowedStates,
  required,
  error,
  disabled,
  placeholder,
  labelWidth,
  alignVertical,
}: StateListInputProps) {
  const options = useMemo(() => {
    let statesToMap =
      allowedStates && allowedStates.length > 0
        ? allowedStates
        : (Object.values(DocumentState).filter(
            (v) => typeof v === 'number'
          ) as DocumentState[]);

    const hiddenStates = [
      DocumentState.Note,
      DocumentState.UnderReview,
      DocumentState.Reviewed,
      DocumentState.Cancelled,
      DocumentState.Restored,
      DocumentState.AccountingVoucher,
    ];

    if (!allowedStates || allowedStates.length === 0) {
      statesToMap = statesToMap.filter((state) => {
        if (value && Number(value) === state) {
          return true;
        }
        return !hiddenStates.includes(state);
      });
    }

    return statesToMap.map((state) => ({
      label: DocumentStateLabels[state],
      value: state.toString(),
      hidden: (!allowedStates || allowedStates.length === 0) ? hiddenStates.includes(state) : false
    }));
  }, [allowedStates, value]);

  const handleChange = (val: string) => {
    if (!val) {
      onChange(null);
    } else {
      onChange(Number(val));
    }
  };

  return (
    <Select
      label={label}
      value={value?.toString() || DocumentState.InitialRegistration.toString()}
      onChange={handleChange}
      options={options}
      required={required}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      labelWidth={labelWidth}
      alignVertical={alignVertical}
    />
  );
}
