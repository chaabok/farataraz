import { useState, useEffect } from 'react';

/**
 * Hook to intelligently manage Upsert (Update or Insert) state for forms.
 * It tracks the active ID, switching automatically from POST to PUT
 * after the first successful creation.
 */
export function useFormUpsert<T = any>(initialId?: T | null) {
  const [activeId, setActiveId] = useState<T | null | undefined>(initialId);

  // Sync with prop changes (if edited from a list etc)
  useEffect(() => {
    setActiveId(initialId);
  }, [initialId]);

  // If we have an activeId, it's an Update (PUT), else it's an Insert (POST)
  const isUpdate = !!activeId;
  const method = isUpdate ? 'PUT' : 'POST';

  /**
   * Generates the correct REST URL. 
   * Example: getUrl('/api/currencies') -> '/api/currencies/5' (if Update) or '/api/currencies' (if Insert)
   */
  const getUrl = (baseUrl: string) => {
    return isUpdate ? `${baseUrl}/${activeId}` : baseUrl;
  };

  /**
   * Automatically extracts the ID from the response and upgrades the form to "Update" mode.
   * Call this after a successful POST request.
   */
  const handleResponse = (data: any, idField: string) => {
    if (!activeId && data) {
      if (data[idField]) {
        setActiveId(data[idField]);
      } else if (data.data && data.data[idField]) {
        setActiveId(data.data[idField]);
      }
    }
  };

  return { 
    activeId, 
    isUpdate, 
    method, 
    getUrl, 
    handleResponse, 
    setActiveId 
  };
}
