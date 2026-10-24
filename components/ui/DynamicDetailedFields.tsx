import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/utils';

interface DynamicDetailedFieldsProps {
  reasonId?: number | null;
  accountingSettingId?: number | null;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function DynamicDetailedFields({
  reasonId,
  accountingSettingId,
  value,
  onChange,
  disabled
}: DynamicDetailedFieldsProps) {
  const [detailedTypes, setDetailedTypes] = useState<any[]>([]);
  const [detailedAccounts, setDetailedAccounts] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!reasonId && !accountingSettingId) {
      setDetailedTypes([]);
      return;
    }

    const fetchDetailedTypes = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (reasonId) query.append('reasonId', reasonId.toString());
        if (accountingSettingId) query.append('accountingSettingId', accountingSettingId.toString());

        const res = await apiFetch(`/api/rap/dynamic-detailed-types?${query.toString()}`);
        const data = await res.json();
        
        if (data.success) {
          const types = data.detailedTypes || [];
          setDetailedTypes(types);
          
          // Fetch detailed accounts for each type
          const accountsMap: Record<number, any[]> = {};
          for (const t of types) {
             if (t.detailedTypeId) {
                const accRes = await apiFetch(`/api/accounting/detailed-accounts?detailedTypesId=${t.detailedTypeId}&limit=100`);
                const accData = await accRes.json();
                let arr: any[] = [];
                if (Array.isArray(accData)) arr = accData;
                else if (accData && Array.isArray(accData.data)) arr = accData.data;
                else if (accData && accData.data && Array.isArray(accData.data.data)) arr = accData.data.data;
                else if (accData && Array.isArray(accData.items)) arr = accData.items;
                accountsMap[t.detailedTypeId] = arr;
             }
          }
          setDetailedAccounts(accountsMap);
        }
      } catch (err) {
        console.error('Failed to fetch dynamic detailed types', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedTypes();
  }, [reasonId, accountingSettingId]);

  const handleChange = (typeId: number, detailedAccountId: number) => {
    const newVal = { ...value, [typeId]: detailedAccountId };
    onChange(newVal);
  };

  if (detailedTypes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
      <span className="text-[10px] text-slate-400">انواع تفصیلی مورد نیاز:</span>
      {detailedTypes.map(type => (
        <div key={type.detailedTypeId} className="min-w-[150px] flex-1">
          <select
            disabled={disabled || loading}
            value={value?.[type.detailedTypeId] || ''}
            onChange={(e) => handleChange(type.detailedTypeId, Number(e.target.value))}
            className="w-full text-xs h-7 rounded border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-2"
          >
            <option value="">انتخاب {type.title}</option>
            {(detailedAccounts[type.detailedTypeId] || []).map(acc => (
              <option key={acc.detailedAccountId || acc.id || acc.DetailedAccountID} value={acc.detailedAccountId || acc.id || acc.DetailedAccountID}>
                {acc.title || acc.Title}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
