import { useState, useEffect, useCallback } from 'react';
import { apiFetch, getPersianEntityName } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function useFormUsageCheck(tableName: string, id: string | number | null | undefined) {
  const [isUsed, setIsUsed] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);
  // Task 138: امکان بازبینی فوری وضعیت استفاده (مثلاً پس از حذف/صدور خروج انبار)
  const [usageCheckNonce, setUsageCheckNonce] = useState(0);
  const recheck = useCallback(() => setUsageCheckNonce((n) => n + 1), []);

  useEffect(() => {
    // We only check if there is an ID (it's an existing record, not a new one)
    if (!id || id === 'new') {
      setIsUsed(false);
      return;
    }

    let isMounted = true;
    setLoadingUsage(true);

    apiFetch(`/api/core/usage-check?tableName=${tableName}&id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setIsUsed(data.isUsed === true);
          if (data.isUsed === true) {
            const destEntity = data.usedInEntity || data.usedInTable;
            const destNamePersian = destEntity ? getPersianEntityName(destEntity) : 'سایر بخش‌ها';
            toast(`از اطلاعات این فرم در فرم [${destNamePersian}] استفاده شده است. امکان ویرایش یا حذف وجود ندارد.`, {
              icon: '🔒',
              duration: 5000,
            });
          }
        }
      })
      .catch(err => {
        console.error('Error checking usage', err);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingUsage(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [tableName, id, usageCheckNonce]);

  return { isUsed, loadingUsage, recheck };
}
