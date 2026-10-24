'use client';

import React, { useEffect, useState } from 'react';
import { SingleSelectDropDown, SingleSelectColumn, AddFormOption } from '@/components/inputs/SingleSelectDropDown';
import { useLookupStore } from '@/lib/stores/lookupStore';
import { useLanguage } from '@/components/Providers';

export const RAP_REASON_NATURE_ENUM = {
  SOURCE: 1,
  USE: 2,
  NEUTRAL: 3,
};

export interface ReasonItem {
  RapReasonID: number;
  Code?: string;
  Title: string;
  ParentRef?: number;
  AccountRef?: number;
  Nature?: number;
  IsActive?: boolean;
  children?: ReasonItem[];
  // Transformed properties
  id: string;
  ParentCode?: string;
  ParentTitle?: string;
  NatureLabel?: string;
}

interface ReasonSingleDropDownProps {
  value?: any;
  onChange: (item: any) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  id?: string;
  filter?: (item: ReasonItem) => boolean;
  displayKey?: string;
  trigger?: (toggle: () => void, isOpen: boolean, searchQuery: string, setSearchQuery: (q: string) => void) => React.ReactNode;
  noWrapper?: boolean;
  className?: string;
  disabled?: boolean;
  onAdd?: () => void;
  addFormOptions?: AddFormOption | AddFormOption[];
}

const DEFAULT_REASON_ADD_OPTIONS: AddFormOption[] = [
  { title: 'تعریف علت جدید', componentName: 'RapReason', groupId: 'rap' }
];

export function ReasonSingleDropDown({
  value,
  onChange,
  label: _label,
  placeholder = 'انتخاب بابت...',
  required,
  error,
  id,
  filter,
  displayKey,
  trigger,
  noWrapper,
  className,
  disabled,
  onAdd,
  addFormOptions = DEFAULT_REASON_ADD_OPTIONS
}: Readonly<ReasonSingleDropDownProps>) {
  const label = _label !== undefined ? _label : (trigger ? '' : 'بابت');
  const [data, setData] = useState<ReasonItem[]>([]);
  const { direction } = useLanguage();
  const { fetchLookup } = useLookupStore();

  useEffect(() => {
    // Fetch tree and flatten it, mapping parent info
    const fetchData = async () => {
      try {
        const tree = await fetchLookup('rap-reasons-tree', '/api/rap/reasons/tree');
        if (tree && Array.isArray(tree)) {
          const flatList: ReasonItem[] = [];

          const flatten = (nodes: ReasonItem[], parentNode?: ReasonItem) => {
            for (const node of nodes) {
              const mappedNature = node.Nature === RAP_REASON_NATURE_ENUM.SOURCE ? 'منابع' : node.Nature === RAP_REASON_NATURE_ENUM.USE ? 'مصارف' : node.Nature === RAP_REASON_NATURE_ENUM.NEUTRAL ? 'خنثی' : '';
              
              const item = {
                ...node,
                id: node.RapReasonID.toString(),
                ParentCode: parentNode?.Code || '',
                ParentTitle: parentNode?.Title || '',
                NatureLabel: mappedNature || '',
              };
              flatList.push(item);
              if (node.children && node.children.length > 0) {
                flatten(node.children, node);
              }
            }
          };

          flatten(tree);
          if (filter) {
            setData(flatList.filter(filter));
          } else {
            setData(flatList);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reasons:', err);
      }
    };
    fetchData();
  }, [fetchLookup, filter]);

  const columns: SingleSelectColumn[] = [
    { key: 'Code', label: 'کد', width: 80 },
    { key: 'Title', label: 'عنوان', width: 150 },
    { key: 'ParentCode', label: 'کد سرشاخه', width: 80 },
    { key: 'ParentTitle', label: 'عنوان سرشاخه', width: 150 },
    { key: 'NatureLabel', label: 'ماهیت', width: 80 },
  ];

  return (
    <SingleSelectDropDown
      id={id}
      data={data}
      columns={columns}
      value={value}
      onChange={onChange}
      label={label}
      placeholder={placeholder}
      required={required}
      error={error}
      displayKey={displayKey || "Title"}
      trigger={trigger}
      noWrapper={noWrapper}
      className={className}
      disabled={disabled}
      onAdd={onAdd}
      addFormOptions={addFormOptions}
    />
  );
}
