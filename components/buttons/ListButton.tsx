"use client";

import React, { useState } from "react";
import { List, Loader2 } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";
import { SingleSelectDropDown, SingleSelectColumn } from "../inputs/SingleSelectDropDown";
import { apiFetch } from "@/lib/utils";

export function ListButton<T extends Record<string, any>>({ 
  onClick, 
  disabled, 
  hideLabel,
  data,
  columns,
  displayKey,
  listApiUrl,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onEditRows,
  onDeleteRows,
  enableMultiSelection = false,
  enableEdit = false,
  enableDelete = false
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  data?: T[];
  columns?: SingleSelectColumn[];
  displayKey?: keyof T;
  listApiUrl?: string;
  onSelect?: (item: T) => void;
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onEditRows?: (items: T[]) => void;
  onDeleteRows?: (items: T[]) => void;
  enableMultiSelection?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
}) {
  const { t } = useLanguage();
  const [internalData, setInternalData] = useState<T[]>(data || []);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (data) setInternalData(data);
  }, [data]);

  const handleToggle = async (toggle?: () => void) => {
    if (toggle) toggle();
    else if (onClick) onClick();
  };

  const buttonElement = (toggle?: () => void, isOpenState?: boolean) => (
    <ActionButton 
      onClick={() => handleToggle(toggle)} 
      disabled={disabled || loading} 
      icon={loading ? Loader2 : List} 
      variant="secondary" 
      tooltip={t('list' as any) || 'فهرست'} 
      hideLabel={hideLabel}
      className={loading ? "animate-pulse" : ""}
      onKeyDown={(e) => {
        if (e.altKey && e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          if (toggle && !isOpenState) toggle();
        }
      }}
    >
      {t('list' as any) || 'فهرست'}
    </ActionButton>
  );

  const normalizedColumns = React.useMemo(() => {
    if (!columns) return [];
    return columns.map((col: any) => ({
      ...col,
      label: col.label || col.title || col.header || col.key
    }));
  }, [columns]);

  const effectiveDisplayKey = displayKey || (normalizedColumns.length > 0 ? normalizedColumns[0].key : undefined);

  if ((data || listApiUrl) && normalizedColumns.length > 0 && effectiveDisplayKey) {
    return (
      <SingleSelectDropDown
        data={internalData as any[]}
        listApiUrl={listApiUrl}
        columns={normalizedColumns as SingleSelectColumn[]}
        displayKey={effectiveDisplayKey as string}
        onChange={onSelect as any || (() => {})}
        onAdd={onAdd}
        onEdit={onEdit as any}
        onDelete={onDelete as any}
        onEditRows={onEditRows as any}
        onDeleteRows={onDeleteRows as any}
        enableEdit={enableEdit}
        enableDelete={enableDelete}
        onViewAll={onClick}
        trigger={(toggle, isOpenState) => buttonElement(toggle, isOpenState)}
        prefetch={true}
      />
    );
  }

  return buttonElement();
}
