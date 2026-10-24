"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch, formatDateByLocale } from '@/lib/utils';
import { DateInput, getTodayFormattedDate } from '@/components/inputs/DateInput';
import { NumberInput } from '@/components/inputs/NumberInput';
import { TextInput } from '@/components/inputs/TextInput';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { TextareaInput } from '@/components/inputs/TextArea';
import { SimpleFormTwoRow, FieldConfig } from '@/components/forms/SimpleFormTwoRow';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Printer, 
  Search, 
  Warehouse as WarehouseIcon,
  Boxes,
} from 'lucide-react';
import { ActionButton } from '@/components/buttons/ActionButton';
import { useToast } from '@/components/ToastProvider';
import { useTabs } from '@/components/TabsProvider';
import { useLanguage } from '@/components/Providers';
import { MainDataGrid, DataGridColumn } from '@/components/ui/MainDataGrid';

interface StocktakingTagFormProps {
  id?: string | number;
  tabId?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

interface WarehouseSummaryItem {
  WarehouseID: number;
  Code: string;
  Title: string;
  Type: string;
  issuedTagCount: number;
}

interface ItemRow {
  ItemID: number;
  Code: string;
  Title: string;
  MeasurementUnitName: string;
  TagNumber: string | number;
  IsIssued?: boolean;
  selected?: boolean;
  WarehouseID?: number;
}

const normalizeJalaliDate = (dStr: any): string => {
  if (!dStr) return '';
  const cleaned = String(dStr).trim().slice(0, 10).replace(/-/g, '/');
  const parts = cleaned.split('/');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
  return cleaned;
};

export function StocktakingTagForm({ id, tabId, onClose, onSaved }: StocktakingTagFormProps) {
  const { showToast } = useToast();
  const { addTab, removeTab } = useTabs();
  const { direction } = useLanguage();
  const isRtl = direction === 'rtl';
  const [loading, setLoading] = useState(false);

  // Form values - Initialized empty in insert mode except date and number
  const [values, setValues] = useState<Record<string, any>>({
    StocktakingTagHeaderID: id ? Number(id) : null,
    StocktakingPeriod: '',
    stocktakingPeriod: '',
    methodRef: null,
    stocktakingDate: getTodayFormattedDate('fa'),
    stocktakingNumber: '1',
    officerPartyRef: null,
    Description: '',
    description: '',
    FiscalYearRef: typeof window !== 'undefined' ? (localStorage.getItem('app-fiscal-year') ? Number(localStorage.getItem('app-fiscal-year')) : null) : null,
  });

  const headerId = values.StocktakingTagHeaderID;

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Latest stocktaking date in active fiscal year for validation
  const [latestStocktakingDate, setLatestStocktakingDate] = useState<string | null>(null);

  // Warehouses & Items state
  const [warehouses, setWarehouses] = useState<WarehouseSummaryItem[]>([]);
  const [activeWarehouseId, setActiveWarehouseId] = useState<number | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [itemSearchQuery, setColumnSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Master map for tags per warehouse: Record<warehouseId, Record<itemId, tagNumber>>
  const [allWarehouseTags, setAllWarehouseTags] = useState<Record<number, Record<number, string>>>({});

  // Helper to update allWarehouseTags for a warehouse
  const updateLocalTagsForWarehouse = (whId: number, updatedItems: ItemRow[]) => {
    setAllWarehouseTags((prev) => {
      const nextMap = { ...prev };
      updatedItems.forEach((it) => {
        const itemWhId = (it.WarehouseID && Number(it.WarehouseID) > 0)
          ? Number(it.WarehouseID)
          : (whId && whId > 0 ? whId : (warehouses.find((w) => w.WarehouseID > 0)?.WarehouseID || 1));

        if (!nextMap[itemWhId]) nextMap[itemWhId] = {};

        if (it.TagNumber !== undefined && it.TagNumber !== null && String(it.TagNumber).trim() !== '') {
          nextMap[itemWhId][it.ItemID] = String(it.TagNumber).trim();
        } else {
          delete nextMap[itemWhId][it.ItemID];
        }
      });
      return nextMap;
    });
  };

  // Stocktaking tag entity numbering settings
  const [numberingSetting, setNumberingSetting] = useState<{
    fixedChar: string;
    startNumber: number;
    numberingMethod: string;
  }>({ fixedChar: '', startNumber: 1, numberingMethod: '2' });

  const activeWarehouseObj = useMemo(() => {
    if (activeWarehouseId === 0) {
      return { Title: 'همه انبارها', issuedTagCount: 0 };
    }
    return warehouses.find((w) => w.WarehouseID === activeWarehouseId);
  }, [activeWarehouseId, warehouses]);

  // Load stocktaking_tag entity numbering setting
  useEffect(() => {
    async function loadNumberingSetting() {
      try {
        const res = await apiFetch('/api/common/entity-numbering/stocktaking_tag');
        if (res.ok) {
          const json = await res.json();
          const data = json?.data;
          if (data) {
            let itemsList: any[] = [];
            if (Array.isArray(data.items)) {
              itemsList = data.items;
            } else if (data.items && typeof data.items === 'object') {
              if (Array.isArray(data.items.fiscalYears)) {
                itemsList = data.items.fiscalYears;
              } else {
                Object.values(data.items).forEach((val) => {
                  if (Array.isArray(val)) itemsList.push(...val);
                });
              }
            }

            // Find matching item for active warehouse
            let matched = itemsList.find((it: any) => {
              if (!it) return false;
              if (activeWarehouseObj?.Title && it.warehouseTitle) {
                return String(it.warehouseTitle).trim().toLowerCase() === String(activeWarehouseObj.Title).trim().toLowerCase();
              }
              return false;
            });

            if (!matched) {
              matched = itemsList.find((it: any) => it && (it.fixedChar !== undefined || it.startNumber !== undefined));
            }

            if (!matched && itemsList.length > 0) {
              matched = itemsList[0];
            }

            if (matched) {
              const prefix = matched.fixedChar ? String(matched.fixedChar).trim() : '';
              const startNum = matched.startNumber ? parseInt(String(matched.startNumber), 10) : 1;
              setNumberingSetting({
                fixedChar: prefix,
                startNumber: !isNaN(startNum) && startNum > 0 ? startNum : 1,
                numberingMethod: data.numberingMethod || '2',
              });
            } else {
              setNumberingSetting({ fixedChar: '', startNumber: 1, numberingMethod: data.numberingMethod || '2' });
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch stocktaking_tag numbering setting:', e);
      }
    }

    loadNumberingSetting();
  }, [activeWarehouseId, activeWarehouseObj?.Title]);

  // Load latest stocktaking date and next document number for header in active fiscal year
  const activeFiscalYearId = values.FiscalYearRef || values.fiscalYearRef;
  useEffect(() => {
    let isMounted = true;
    const fy = activeFiscalYearId || (typeof window !== 'undefined' ? localStorage.getItem('app-fiscal-year') : null);

    const fetchLatestDate = async () => {
      try {
        const exId = headerId || id || '';
        const params = new URLSearchParams();
        if (fy && !isNaN(Number(fy))) {
          params.set('fiscalYearId', String(fy));
        }
        if (exId) {
          params.set('excludeHeaderId', String(exId));
        }
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await apiFetch(`/api/inv/stocktaking-tags/latest-date${qs}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const lDate = data?.latestDate || null;
            setLatestStocktakingDate(lDate);

            // If in insert mode and current date is before latest date, immediately flag error
            const isInsert = (!headerId || Number(headerId) <= 0) && !id;
            if (isInsert && lDate && values.stocktakingDate) {
              const normCurrent = normalizeJalaliDate(values.stocktakingDate);
              const normLatest = normalizeJalaliDate(lDate);
              if (normCurrent && normLatest && normCurrent < normLatest) {
                setErrors((prev) => ({
                  ...prev,
                  stocktakingDate: `امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${lDate}) در سال مالی جاری وجود ندارد`,
                }));
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch latest stocktaking date:', err);
      }
    };

    fetchLatestDate();

    if (!id && !headerId) {
      const fyParam = fy ? `?fiscalYearId=${fy}` : '';
      apiFetch(`/api/inv/stocktaking-tags/next-number${fyParam}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data && data.nextNumber) {
            setValues(prev => ({ ...prev, stocktakingNumber: String(data.nextNumber) }));
          }
        })
        .catch(err => console.error('Failed to get next stocktaking number:', err));
    }

    const handleStorageChange = () => {
      const storedFy = localStorage.getItem('app-fiscal-year');
      if (storedFy) {
        if (!headerId && !id) {
          setValues((prev) => ({ ...prev, FiscalYearRef: Number(storedFy) }));
        }
        fetchLatestDate();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fiscalYearUpdated', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fiscalYearUpdated', handleStorageChange);
    };
  }, [activeFiscalYearId, id, headerId]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    if (name === 'stocktakingDate') {
      const isInsert = (!headerId || Number(headerId) <= 0) && !id;
      if (isInsert && latestStocktakingDate) {
        const normVal = normalizeJalaliDate(value);
        const normLatest = normalizeJalaliDate(latestStocktakingDate);
        if (normVal && normLatest && normVal < normLatest) {
          setErrors((prev) => ({
            ...prev,
            stocktakingDate: `امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${latestStocktakingDate}) در سال مالی جاری وجود ندارد`,
          }));
          return;
        }
      }
    }

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Load existing header data if id or headerId is provided
  const targetId = headerId || id;
  useEffect(() => {
    if (!targetId) return;
    async function loadHeader() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/inv/stocktaking-tags/${targetId}`);
        if (res.ok) {
          const data = await res.json();
          const settingRef = data.StocktakingSettingRef || data.stocktakingSettingRef || data.methodRef || data.stocktakingSetting?.StocktakingSettingID || null;
          setValues((prev) => ({
            ...prev,
            StocktakingTagHeaderID: data.StocktakingTagHeaderID,
            StocktakingPeriod: data.StocktakingPeriod || data.stocktakingPeriod || '',
            stocktakingPeriod: data.StocktakingPeriod || data.stocktakingPeriod || '',
            methodRef: settingRef,
            stocktakingDate: data.StocktakingDate || getTodayFormattedDate('fa'),
            stocktakingNumber: String(data.StocktakingNumber || 1),
            officerPartyRef: data.OfficerPartyRef || null,
            Description: data.Description || data.description || '',
            description: data.Description || data.description || '',
            FiscalYearRef: data.FiscalYearRef || data.fiscalYearRef,
          }));

          // Pre-fill allWarehouseTags map from existing details
          if (Array.isArray(data.details)) {
            const masterMap: Record<number, Record<number, string>> = {};
            data.details.forEach((d: any) => {
              const whRef = Number(d.WarehouseRef);
              const itemRef = Number(d.ItemRef);
              if (whRef && itemRef && d.TagNumber) {
                if (!masterMap[whRef]) masterMap[whRef] = {};
                masterMap[whRef][itemRef] = String(d.TagNumber);
              }
            });
            setAllWarehouseTags(masterMap);
          }
        }
      } catch (err) {
        showToast('خطا در دریافت اطلاعات انبارگردانی', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadHeader();
  }, [targetId]);

  // Load warehouses whenever selected method or header changes
  useEffect(() => {
    async function loadWarehouses() {
      try {
        const settingId = values.methodRef || 0;
        let url = `/api/inv/stocktaking-tags/warehouses-summary?settingId=${settingId}`;
        if (headerId) url += `&headerId=${headerId}`;

        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          setWarehouses(data || []);
          if (data && data.length > 0) {
            if (activeWarehouseId !== 0 && (activeWarehouseId === null || !data.some((w: any) => w.WarehouseID === activeWarehouseId))) {
              setActiveWarehouseId(data[0].WarehouseID);
            }
          } else {
            setActiveWarehouseId(null);
            setItems([]);
          }
        }
      } catch (e) {
        console.error('Failed to fetch warehouses summary:', e);
      }
    }

    loadWarehouses();
  }, [values.methodRef, headerId]);

  // Load items when activeWarehouseId changes
  useEffect(() => {
    if (activeWarehouseId === null || activeWarehouseId === undefined) {
      setItems([]);
      return;
    }

    async function loadItems() {
      setLoading(true);
      try {
        const settingId = values.methodRef || 0;
        let url = `/api/inv/stocktaking-tags/warehouse-items?warehouseId=${activeWarehouseId}&settingId=${settingId}`;
        if (headerId) url += `&headerId=${headerId}`;

        const res = await apiFetch(url);
        if (res.ok) {
          const data = await res.json();
          const localWhTags = allWarehouseTags[activeWarehouseId] || {};

          const itemsData: ItemRow[] = (data || []).map((item: any) => {
            const itemWh = Number(item.WarehouseID) || activeWarehouseId || 0;
            const whMap = allWarehouseTags[itemWh] || localWhTags;
            const serverTag = item.TagNumber ? String(item.TagNumber) : '';
            // Local map overrides server tag if set, unless local map explicitly deleted it
            const tagNum = whMap[item.ItemID] !== undefined ? whMap[item.ItemID] : serverTag;

            return {
              ItemID: item.ItemID,
              Code: item.Code,
              Title: item.Title,
              MeasurementUnitName: item.MeasurementUnitName || 'عدد',
              TagNumber: tagNum,
              IsIssued: Boolean(tagNum),
              selected: false,
              WarehouseID: item.WarehouseID || (activeWarehouseId && activeWarehouseId > 0 ? activeWarehouseId : undefined),
            };
          });

          setItems(itemsData);
          setSelectAll(false);
        }
      } catch (e) {
        console.error('Failed to fetch warehouse items:', e);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [activeWarehouseId, headerId, values.methodRef, allWarehouseTags]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return items;
    const q = itemSearchQuery.trim().toLowerCase();
    return items.filter(
      (item) =>
        String(item.Code || '').toLowerCase().includes(q) ||
        String(item.Title || '').toLowerCase().includes(q)
    );
  }, [items, itemSearchQuery]);

  // Change Tag Number for an item
  const handleTagNumberChange = (itemId: number, val: string) => {
    const num = val.trim() === '' ? '' : (parseInt(val, 10) || val);
    const updated = items.map((item) => (item.ItemID === itemId ? { ...item, TagNumber: num, IsIssued: Boolean(num) } : item));
    setItems(updated);
    const targetWhId = (activeWarehouseId && activeWarehouseId > 0)
      ? activeWarehouseId
      : (warehouses.find((w) => w.WarehouseID > 0)?.WarehouseID || 1);
    updateLocalTagsForWarehouse(targetWhId, updated);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const periodVal = values.stocktakingPeriod || values.StocktakingPeriod;
    if (!periodVal || !String(periodVal).trim()) {
      newErrors.stocktakingPeriod = 'ورود دوره انبارگردانی الزامی است';
    }
    if (!values.methodRef) newErrors.methodRef = 'انتخاب روش انبارگردانی الزامی است';
    const isInsert = (!headerId || Number(headerId) <= 0) && !id;
    if (!values.stocktakingDate) {
      newErrors.stocktakingDate = 'تاریخ انبارگردانی الزامی است';
    } else if (isInsert && latestStocktakingDate) {
      const normCurrent = normalizeJalaliDate(values.stocktakingDate);
      const normLatest = normalizeJalaliDate(latestStocktakingDate);
      if (normCurrent && normLatest && normCurrent < normLatest) {
        newErrors.stocktakingDate = `امکان صدور تگ انبارگردانی به تاریخ قبل از آخرین انبارگردانی ثبت‌شده (${latestStocktakingDate}) در سال مالی جاری وجود ندارد`;
      }
    }
    if (!values.stocktakingNumber) newErrors.stocktakingNumber = 'شماره انبارگردانی الزامی است';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstErrMsg = newErrors.stocktakingDate || Object.values(newErrors)[0];
      showToast(firstErrMsg, 'error');
      return false;
    }
    return true;
  };

  // Generate Tag Numbers for selected items (or all items if none selected) and immediately save
  const handleGenerateTags = async () => {
    if (!validateForm()) {
      return;
    }

    if (activeWarehouseId === null || activeWarehouseId === undefined) {
      showToast('لطفا یک انبار انتخاب کنید', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('کالایی در این انبار جهت صدور تگ وجود ندارد', 'error');
      return;
    }

    let selectedItems = items.filter((i) => i.selected);

    // If user hasn't explicitly checked specific checkboxes, issue tags for ALL items in active warehouse
    if (selectedItems.length === 0) {
      selectedItems = [...items];
    }

    const rawPrefix = numberingSetting.fixedChar ? String(numberingSetting.fixedChar).trim() : '';
    const parsedStartNum = parseInt(String(numberingSetting.startNumber || 1), 10);
    const startSeq = !isNaN(parsedStartNum) && parsedStartNum > 0 ? parsedStartNum : 1;

    // Calculate maximum existing tag sequence in current list
    let maxSeq = 0;
    items.forEach((item) => {
      if (item.TagNumber !== null && item.TagNumber !== undefined && String(item.TagNumber).trim() !== '') {
        const tagStr = String(item.TagNumber).trim();
        let numPart = 0;
        if (rawPrefix && tagStr.startsWith(rawPrefix)) {
          numPart = parseInt(tagStr.slice(rawPrefix.length), 10);
        } else {
          const match = tagStr.match(/\d+$/);
          if (match) numPart = parseInt(match[0], 10);
        }
        if (!isNaN(numPart) && numPart > maxSeq) {
          maxSeq = numPart;
        }
      }
    });

    let nextSeq = maxSeq >= startSeq ? maxSeq + 1 : startSeq;
    const selectedItemIds = new Set(selectedItems.map((i) => i.ItemID));

    // Assign Tag Number to selected items (or all items) if empty
    const updatedItems = items.map((item) => {
      if (selectedItemIds.has(item.ItemID)) {
        let assignedTag = item.TagNumber;
        if (assignedTag === null || assignedTag === undefined || String(assignedTag).trim() === '') {
          assignedTag = rawPrefix ? `${rawPrefix}${nextSeq++}` : String(nextSeq++);
        }
        return {
          ...item,
          TagNumber: assignedTag,
          IsIssued: true,
          selected: true,
        };
      }
      return item;
    });

    setItems(updatedItems);
    const targetWhId = (activeWarehouseId && activeWarehouseId > 0)
      ? activeWarehouseId
      : (warehouses.find((w) => w.WarehouseID > 0)?.WarehouseID || 1);
    updateLocalTagsForWarehouse(targetWhId, updatedItems);

    // Immediately trigger save to persist tags in database
    await handleSave('save', updatedItems);
  };

  // Save Form Header and Tag Details to Database (Save button action)
  const handleSave = async (
    mode: 'save' | 'save_new' | 'save_close' = 'save',
    itemsOverride?: ItemRow[]
  ) => {
    if (!validateForm()) {
      showToast('لطفا فیلدهای اجباری را تکمیل فرمایید', 'error');
      return false;
    }

    const currentItems = itemsOverride || items;
    const defaultWhId = (activeWarehouseId && activeWarehouseId > 0) 
      ? activeWarehouseId 
      : (warehouses[0]?.WarehouseID || 1);

    // Synchronize current items into master allWarehouseTags map
    const mergedMasterTags: Record<number, Record<number, string>> = { ...allWarehouseTags };

    currentItems.forEach((it) => {
      const itemWhId = (it.WarehouseID && Number(it.WarehouseID) > 0)
        ? Number(it.WarehouseID)
        : defaultWhId;

      if (!mergedMasterTags[itemWhId]) {
        mergedMasterTags[itemWhId] = {};
      }

      if (it.TagNumber !== undefined && it.TagNumber !== null && String(it.TagNumber).trim() !== '') {
        mergedMasterTags[itemWhId][it.ItemID] = String(it.TagNumber).trim();
      } else {
        delete mergedMasterTags[itemWhId][it.ItemID];
      }
    });

    // Build detailsDto from all non-empty tags across all warehouses
    const detailsDto: { WarehouseRef: number; ItemRef: number; TagNumber: string }[] = [];
    Object.entries(mergedMasterTags).forEach(([whIdStr, itemMap]) => {
      const whIdNum = parseInt(whIdStr, 10);
      if (isNaN(whIdNum) || whIdNum <= 0) return;
      Object.entries(itemMap).forEach(([itemIdStr, tagNumStr]) => {
        const itemIdNum = parseInt(itemIdStr, 10);
        if (!isNaN(itemIdNum) && itemIdNum > 0 && tagNumStr && tagNumStr.trim() !== '') {
          detailsDto.push({
            WarehouseRef: whIdNum,
            ItemRef: itemIdNum,
            TagNumber: tagNumStr.trim(),
          });
        }
      });
    });

    // Validation: At least one item MUST have an issued tag number (all items cannot be empty)
    if (detailsDto.length === 0) {
      showToast('امکان ذخیره اطلاعات وجود ندارد؛ حداقل باید برای یک کالا شماره تگ صادر شده باشد.', 'error');
      return false;
    }

    setLoading(true);
    try {
      const settingRefNum = parseInt(String(values.methodRef ?? values.StocktakingSettingRef ?? ''), 10);
      const stockNum = parseInt(String(values.stocktakingNumber || '1'), 10);
      const officerRefNum = values.officerPartyRef ? parseInt(String(values.officerPartyRef), 10) : undefined;
      const fiscalYearRefNum = values.FiscalYearRef || values.fiscalYearRef 
        ? parseInt(String(values.FiscalYearRef || values.fiscalYearRef), 10) 
        : (typeof window !== 'undefined' && localStorage.getItem('app-fiscal-year') ? parseInt(localStorage.getItem('app-fiscal-year')!, 10) : undefined);

      const periodStr = String(values.stocktakingPeriod || values.StocktakingPeriod || '').trim();
      const descStr = String(values.Description ?? values.description ?? '').trim();

      const payload = {
        StocktakingPeriod: periodStr,
        StocktakingSettingRef: !isNaN(settingRefNum) && settingRefNum > 0 ? settingRefNum : (values.methodRef ? Number(values.methodRef) : undefined),
        StocktakingDate: values.stocktakingDate || values.StocktakingDate || getTodayFormattedDate('fa'),
        StocktakingNumber: !isNaN(stockNum) ? stockNum : 1,
        OfficerPartyRef: officerRefNum && !isNaN(officerRefNum) ? officerRefNum : undefined,
        Description: descStr || null,
        FiscalYearRef: fiscalYearRefNum && !isNaN(fiscalYearRefNum) ? fiscalYearRefNum : undefined,
        details: detailsDto,
      };

      let res;
      if (headerId) {
        res = await apiFetch(`/api/inv/stocktaking-tags/${headerId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/inv/stocktaking-tags', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const savedHeader = await res.json();
        const savedSettingId = savedHeader.StocktakingSettingRef 
          ? Number(savedHeader.StocktakingSettingRef) 
          : (values.methodRef ? Number(values.methodRef) : undefined);

        setValues((prev) => ({ 
          ...prev, 
          StocktakingTagHeaderID: savedHeader.StocktakingTagHeaderID,
          StocktakingPeriod: savedHeader.StocktakingPeriod || periodStr,
          stocktakingPeriod: savedHeader.StocktakingPeriod || periodStr,
          methodRef: savedSettingId,
          Description: savedHeader.Description ?? descStr,
          description: savedHeader.Description ?? descStr,
        }));

        if (Array.isArray(savedHeader.details)) {
          const masterMap: Record<number, Record<number, string>> = {};
          savedHeader.details.forEach((d: any) => {
            const whRef = Number(d.WarehouseRef);
            const itemRef = Number(d.ItemRef);
            if (whRef && itemRef && d.TagNumber) {
              if (!masterMap[whRef]) masterMap[whRef] = {};
              masterMap[whRef][itemRef] = String(d.TagNumber);
            }
          });
          setAllWarehouseTags(masterMap);
        }

        showToast('اطلاعات با موفقیت ذخیره شد', 'success');

        if (onSaved) onSaved();

        // Refresh warehouse summary & items from server
        const [summaryRes, itemsRes] = await Promise.all([
          apiFetch(
            `/api/inv/stocktaking-tags/warehouses-summary?settingId=${savedSettingId || ''}&headerId=${savedHeader.StocktakingTagHeaderID}`
          ),
          apiFetch(
            `/api/inv/stocktaking-tags/warehouse-items?warehouseId=${defaultWhId}&settingId=${savedSettingId || ''}&headerId=${savedHeader.StocktakingTagHeaderID}`
          ),
        ]);

        if (summaryRes.ok) {
          setWarehouses(await summaryRes.json());
        }

        if (itemsRes.ok) {
          const freshData = await itemsRes.json();
          setItems(
            (freshData || []).map((item: any) => ({
              ItemID: item.ItemID,
              Code: item.Code,
              Title: item.Title,
              MeasurementUnitName: item.MeasurementUnitName || 'عدد',
              TagNumber: item.TagNumber ? item.TagNumber : '',
              IsIssued: Boolean(item.IsIssued),
              selected: false,
              WarehouseID: item.WarehouseID || defaultWhId,
            }))
          );
          setSelectAll(false);
        }

        if (mode === 'save_new') {
          handleNew();
        } else if (mode === 'save_close') {
          if (onClose) onClose();
          else if (tabId) removeTab(tabId);
        }
        return true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || 'خطا در ذخیره‌سازی تگ‌های انبارگردانی', 'error');
        return false;
      }
    } catch (err) {
      showToast('خطا در ارتباط با سرور', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete entire Stocktaking Tag Document (Header and all details)
  const handleDeleteDocument = async () => {
    if (!headerId) {
      showToast('سندی برای حذف وجود ندارد', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/api/inv/stocktaking-tags/${headerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('سند انبارگردانی و تمامی تگ‌های آن با موفقیت حذف گردید', 'success');
        handleNew();
        if (onSaved) onSaved();
      } else {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || 'خطا در حذف سند انبارگردانی', 'error');
      }
    } catch (err) {
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete Tags for selected items in active warehouse (Bottom Delete Tag button action)
  const handleDeleteTags = async () => {
    const currentWhId = activeWarehouseId || warehouses[0]?.WarehouseID;
    if (!currentWhId) {
      showToast('لطفاً ابتدا یک انبار انتخاب نمایید', 'error');
      return;
    }

    const selectedItems = items.filter((i) => i.selected);

    if (selectedItems.length === 0) {
      showToast('لطفاً حداقل یک کالا را برای حذف تگ انتخاب کنید', 'error');
      return;
    }

    const selectedIds = new Set(selectedItems.map((i) => i.ItemID));

    // 1. Immediately update UI local state (clear TagNumber ONLY for selected items)
    const updatedItems = items.map((item) => {
      if (selectedIds.has(item.ItemID)) {
        return {
          ...item,
          TagNumber: '',
          IsIssued: false,
          selected: false,
        };
      }
        return item;
    });

    setItems(updatedItems);
    updateLocalTagsForWarehouse(currentWhId, updatedItems);
    setSelectAll(false);

    // 2. If already saved in DB (headerId exists), call backend API to delete from database
    if (headerId) {
      setLoading(true);
      try {
        const itemIdsParam = Array.from(selectedIds);
        const res = await apiFetch(
          `/api/inv/stocktaking-tags/delete-warehouse-tags?headerId=${headerId}&warehouseId=${currentWhId}&itemIds=${itemIdsParam.join(',')}`,
          {
            method: 'POST',
            body: JSON.stringify({ itemIds: itemIdsParam }),
          }
        );

        if (res.ok) {
          showToast('تگ‌های انتخاب شده با موفقیت حذف گردیدند', 'success');

          // Reload items & summary from server
          const [itemsRes, summaryRes] = await Promise.all([
            apiFetch(
              `/api/inv/stocktaking-tags/warehouse-items?warehouseId=${currentWhId}&settingId=${values.methodRef || ''}&headerId=${headerId}`
            ),
            apiFetch(
              `/api/inv/stocktaking-tags/warehouses-summary?settingId=${values.methodRef}&headerId=${headerId}`
            ),
          ]);

          if (itemsRes.ok) {
            const data = await itemsRes.json();
            setItems(
              (data || []).map((item: any) => ({
                ItemID: item.ItemID,
                Code: item.Code,
                Title: item.Title,
                MeasurementUnitName: item.MeasurementUnitName || 'عدد',
                TagNumber: item.TagNumber ? item.TagNumber : '',
                IsIssued: Boolean(item.IsIssued),
                selected: false,
                WarehouseID: item.WarehouseID || currentWhId,
              }))
            );
          }

          if (summaryRes.ok) {
            setWarehouses(await summaryRes.json());
          }
        } else {
          showToast('خطا در حذف تگ‌ها از دیتابیس', 'error');
        }
      } catch (err) {
        showToast('خطا در ارتباط با سرور', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('شماره تگ‌های انتخاب شده پاک گردیدند. جهت ثبت نهایی روی دکمه ذخیره کلیک کنید', 'info');
    }
  };

  // New Form Reset
  const handleNew = () => {
    const activeFy = typeof window !== 'undefined' ? (localStorage.getItem('app-fiscal-year') ? Number(localStorage.getItem('app-fiscal-year')) : null) : null;
    setValues({
      StocktakingTagHeaderID: null,
      StocktakingPeriod: '',
      stocktakingPeriod: '',
      methodRef: null,
      stocktakingDate: getTodayFormattedDate('fa'),
      stocktakingNumber: '1',
      officerPartyRef: null,
      Description: '',
      description: '',
      FiscalYearRef: activeFy,
    });
    setWarehouses([]);
    setActiveWarehouseId(null);
    setItems([]);
    setAllWarehouseTags({});
    setErrors({});

    const fyParam = activeFy ? `?fiscalYearId=${activeFy}` : '';
    apiFetch(`/api/inv/stocktaking-tags/next-number${fyParam}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.nextNumber) {
          setValues(prev => ({ ...prev, stocktakingNumber: String(data.nextNumber) }));
        }
      })
      .catch(err => console.error('Failed to get next stocktaking number:', err));

    if (activeFy) {
      apiFetch(`/api/inv/stocktaking-tags/latest-date?fiscalYearId=${activeFy}`)
        .then(res => res.json())
        .then(data => {
          setLatestStocktakingDate(data?.latestDate || null);
        })
        .catch(err => console.error('Failed to get latest stocktaking date:', err));
    }
  };

  // Print Tags
  const handlePrintTags = () => {
    showToast('پیش‌نمایش چاپ تگ‌های انبارگردانی تولید شد', 'info');
  };

  // Computed issued tag count per warehouse from allWarehouseTags and local items state
  const localIssuedCountMap = useMemo(() => {
    const map: Record<number, number> = {};
    Object.entries(allWarehouseTags).forEach(([whIdStr, itemMap]) => {
      const whId = Number(whIdStr);
      if (whId > 0 && itemMap) {
        const count = Object.values(itemMap).filter((t) => t !== null && t !== undefined && String(t).trim() !== '').length;
        map[whId] = count;
      }
    });

    if (activeWarehouseId && activeWarehouseId > 0) {
      let activeCount = 0;
      items.forEach((item) => {
        if (item.TagNumber !== null && item.TagNumber !== undefined && String(item.TagNumber).trim() !== '') {
          activeCount++;
        }
      });
      map[activeWarehouseId] = activeCount;
    }

    return map;
  }, [allWarehouseTags, items, activeWarehouseId]);

  const totalIssuedCount = useMemo(() => {
    return warehouses.reduce((acc, w) => {
      const localCount = localIssuedCountMap[w.WarehouseID];
      const count = localCount !== undefined && localCount > 0 ? localCount : (w.issuedTagCount || 0);
      return acc + count;
    }, 0);
  }, [warehouses, localIssuedCountMap]);

  const issuedTagsCount = useMemo(() => {
    if (activeWarehouseId === 0) return totalIssuedCount;
    if (activeWarehouseId) {
      const localCount = localIssuedCountMap[activeWarehouseId];
      if (localCount !== undefined && localCount > 0) return localCount;
      return activeWarehouseObj ? (activeWarehouseObj.issuedTagCount || 0) : 0;
    }
    return 0;
  }, [activeWarehouseId, localIssuedCountMap, activeWarehouseObj, totalIssuedCount]);

  // MainDataGrid Columns Definition
  const itemGridColumns = useMemo<DataGridColumn[]>(() => [
    {
      key: 'Code',
      header: 'کد کالا',
      width: 120,
      cell: (info: any) => (
        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
          {info.row.original.Code}
        </span>
      ),
    },
    {
      key: 'Title',
      header: 'عنوان کالا',
      width: 250,
    },
    ...(activeWarehouseId === 0
      ? [
          {
            key: 'WarehouseTitle',
            header: 'انبار',
            width: 150,
            cell: (info: any) => {
              const wh = warehouses.find((w) => w.WarehouseID === info.row.original.WarehouseID);
              return <span>{wh?.Title || `انبار ${info.row.original.WarehouseID || ''}`}</span>;
            },
          },
        ]
      : []),
    {
      key: 'MeasurementUnitName',
      header: 'واحد سنجش',
      width: 120,
    },
    {
      key: 'TagNumber',
      header: `شماره تگ${numberingSetting.fixedChar ? ` (ثابت: ${numberingSetting.fixedChar})` : ''}`,
      width: 160,
      cell: (info: any) => {
        const item = info.row.original;
        return (
          <input
            type="text"
            value={item.TagNumber !== undefined && item.TagNumber !== null ? String(item.TagNumber) : ''}
            onChange={(e) => handleTagNumberChange(item.ItemID, e.target.value)}
            className="w-full px-2 py-0.5 text-center font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
          />
        );
      },
    },
  ], [numberingSetting.fixedChar, items, activeWarehouseId, headerId, warehouses]);

  // Selection change handler for MainDataGrid
  const handleGridSelectionChange = useCallback((selectedRows: any[]) => {
    const selectedIds = new Set(selectedRows.map((r) => r.ItemID));
    setItems((prev) => {
      let hasChanged = false;
      const next = prev.map((item) => {
        const isSelected = selectedIds.has(item.ItemID);
        if (!!item.selected !== isSelected) {
          hasChanged = true;
          return { ...item, selected: isSelected };
        }
        return item;
      });
      return hasChanged ? next : prev;
    });
  }, []);

  const fields: FieldConfig[] = [
    {
      name: 'periodAndMethod',
      type: 'custom',
      customComponent: (
        <div className="grid grid-cols-2 gap-2 w-full">
          <TextInput
            label="دوره انبارگردانی :"
            value={values.stocktakingPeriod || ''}
            onChange={(val) => {
              handleChange('stocktakingPeriod', val);
              handleChange('StocktakingPeriod', val);
            }}
            required={true}
            error={errors.stocktakingPeriod}
            placeholder="دوره انبارگردانی..."
            labelWidth="95px"
          />
          <SingleSelectDropDown
            label="روش انبارگردانی :"
            required={true}
            error={errors.methodRef}
            listApiUrl="/api/inv/stocktaking-settings"
            valueKey="StocktakingSettingID"
            value={values.methodRef}
            onChange={(item, selectedVal) => {
              const rawVal = item?.StocktakingSettingID ?? item?.id ?? item?.ID ?? (typeof selectedVal !== 'object' ? selectedVal : null);
              const numVal = rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal)) ? Number(rawVal) : null;
              handleChange('methodRef', numVal);
            }}
            columns={[
              { key: 'MethodName', label: 'عنوان روش انبارگردانی', width: 220 },
              { key: 'CountTimes', label: 'دفعات شمارش', width: 100 },
            ]}
            displayKey="MethodName"
            placeholder="انتخاب کنید..."
            labelWidth="95px"
            onAdd={() => {
              if (addTab) {
                addTab('تنظیمات انبارگردانی', 'warehouse_group', undefined, 'StocktakingSettingsForm', {});
              }
            }}
          />
        </div>
      ),
    },
    {
      name: 'numberAndDate',
      type: 'custom',
      customComponent: (
        <div className="grid grid-cols-2 gap-2 w-full">
          <NumberInput
            label="شماره :"
            value={String(values.stocktakingNumber !== undefined && values.stocktakingNumber !== null ? values.stocktakingNumber : '')}
            onChange={(val) => handleChange('stocktakingNumber', val)}
            required={true}
            error={errors.stocktakingNumber}
            labelWidth="40px"
          />
          <DateInput
            label="تاریخ انبارگردانی :"
            value={values.stocktakingDate}
            onChange={(val) => handleChange('stocktakingDate', val)}
            required={true}
            error={errors.stocktakingDate}
            isHeader={true}
            outputFormat="dateString"
            fiscalYearRef={values.FiscalYearRef || values.fiscalYearRef}
            labelWidth="85px"
          />
        </div>
      ),
    },
    {
      name: 'officerRow',
      type: 'custom',
      customComponent: (
        <div className="w-full">
          <SingleSelectDropDown
            label="مسئول انبارگردانی :"
            required={false}
            listApiUrl="/api/common/parties"
            valueKey="partyId"
            value={values.officerPartyRef}
            onChange={(item, selectedVal) => {
              const rawVal = item?.partyId ?? item?.PartyID ?? item?.id ?? item?.ID ?? (typeof selectedVal !== 'object' ? selectedVal : null);
              const numVal = rawVal !== null && rawVal !== undefined && !isNaN(Number(rawVal)) ? Number(rawVal) : null;
              handleChange('officerPartyRef', numVal);
            }}
            columns={[
              { key: 'partyId', label: 'کد', width: 80 },
              { key: 'firstName', label: 'نام', width: 120 },
              { key: 'lastName', label: 'نام خانوادگی', width: 150 },
              { key: 'nationalCode', label: 'کد ملی', width: 110 },
            ]}
            displayKey="lastName"
            renderSelection={(item: any) =>
              item ? (`${item.firstName || ''} ${item.lastName || ''}`.trim() || item.lastName || String(item.partyId || '')) : ''
            }
            placeholder="انتخاب کنید (اختیاری)..."
            labelWidth="95px"
            onAdd={() => {
              if (addTab) {
                addTab('تعریف اشخاص', 'general_group', undefined, 'PartyList', {});
              }
            }}
          />
        </div>
      ),
    },
    {
      name: 'descriptionRow',
      type: 'custom',
      customComponent: (
        <div className="w-full">
          <TextareaInput
            label="توضیحات :"
            value={values.Description || values.description || ''}
            onChange={(val) => {
              handleChange('Description', val);
              handleChange('description', val);
            }}
            placeholder="توضیحات (اختیاری)..."
            required={false}
            rows={1}
            labelWidth="60px"
          />
        </div>
      ),
    },
  ];

  return (
    <SimpleFormTwoRow
      title={headerId ? 'ویرایش صدور تگ انبارگردانی' : 'صدور تگ انبارگردانی'}
      icon={<Tag className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      isSubmitting={loading}
      onSave={() => handleSave('save')}
      onSaveNew={() => handleSave('save_new')}
      onSaveClose={() => handleSave('save_close')}
      onNew={handleNew}
      onDelete={headerId ? handleDeleteDocument : undefined}
      onClose={onClose ? onClose : tabId ? () => removeTab(tabId) : undefined}
      listApiUrl="/api/inv/stocktaking-tags"
      listColumns={[
        { key: 'StocktakingNumber', label: 'شماره انبارگردانی', width: 110 },
        { 
          key: 'StocktakingPeriod', 
          label: 'دوره انبارگردانی', 
          width: 140,
          renderItem: (item: any) => item?.StocktakingPeriod || item?.stocktakingPeriod || '—',
          exportValue: (item: any) => item?.StocktakingPeriod || item?.stocktakingPeriod || '',
        },
        { 
          key: 'StocktakingDate', 
          label: 'تاریخ انبارگردانی', 
          width: 120,
          renderItem: (item: any) => {
            const raw = item?.StocktakingDate;
            if (!raw) return '—';
            if (String(raw).startsWith('13') || String(raw).startsWith('14')) {
              return String(raw);
            }
            return formatDateByLocale(String(raw), 'fa');
          },
          exportValue: (item: any) => {
            const raw = item?.StocktakingDate;
            if (!raw) return '';
            if (String(raw).startsWith('13') || String(raw).startsWith('14')) {
              return String(raw);
            }
            return formatDateByLocale(String(raw), 'fa');
          }
        },
        { 
          key: 'OfficerName', 
          label: 'مسئول انبارگردانی', 
          width: 180,
          renderItem: (item: any) => {
            if (item?.OfficerName) return item.OfficerName;
            if (item?.officerParty) {
              const name = `${item.officerParty.firstName || ''} ${item.officerParty.lastName || ''}`.trim();
              return name || item.officerParty.lastName || item.officerParty.firstName || '—';
            }
            return '—';
          },
          exportValue: (item: any) => {
            if (item?.OfficerName) return item.OfficerName;
            if (item?.officerParty) {
              const name = `${item.officerParty.firstName || ''} ${item.officerParty.lastName || ''}`.trim();
              return name || item.officerParty.lastName || item.officerParty.firstName || '';
            }
            return '';
          }
        },
        {
          key: 'Description',
          label: 'توضیحات',
          width: 200,
          renderItem: (item: any) => item?.Description || item?.description || '—',
          exportValue: (item: any) => item?.Description || item?.description || '',
        },
        {
          key: 'MethodName',
          label: 'روش انبارگردانی',
          width: 180,
          renderItem: (item: any) => item?.MethodName || item?.stocktakingSetting?.MethodName || '—',
          exportValue: (item: any) => item?.MethodName || item?.stocktakingSetting?.MethodName || '',
        },
      ]}
      onListSelect={(selectedItem) => {
        const itemHeaderId = selectedItem?.StocktakingTagHeaderID || selectedItem?.id;
        if (itemHeaderId) {
          setValues((prev) => ({ ...prev, StocktakingTagHeaderID: itemHeaderId }));
        }
      }}
      formName="StocktakingTagForm"
      targetForm="StocktakingTagForm"
      showRecordNavigator={true}
      currentRecordId={headerId}
    >
      <div className="flex flex-col h-full w-full min-h-0 overflow-hidden pt-2">
        {/* Tab Title Header */}
        <div className="flex items-center px-1 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 mb-3 shrink-0">
          <div className="px-4 py-1.5 text-xs font-semibold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 rounded-t-md flex items-center gap-1.5 shadow-2xs">
            <Tag className="w-3.5 h-3.5" />
            <span>تگ انبارگردانی</span>
          </div>
        </div>

        {/* Tab Body: Side-by-side Layout (Warehouses Box on Right | Items Box on Left in RTL) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
          {/* Warehouses List Box (Col 4 on LG screens: Right side in RTL) */}
          <div className={`lg:col-span-4 ${isRtl ? 'lg:order-1' : 'lg:order-2'} flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 overflow-hidden shadow-2xs`}>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
              <WarehouseIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200">لیست انبارها</h2>
            </div>

            {/* Warehouse Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!values.methodRef ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    لطفاً ابتدا روش انبارگردانی را انتخاب نمایید.
                  </p>
                </div>
              ) : warehouses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    انباری برای روش انبارگردانی انتخاب شده تعیین نشده است.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (addTab) {
                        addTab(
                          'تنظیمات انبارگردانی',
                          'warehouse_group',
                          undefined,
                          'StocktakingSettingsForm',
                          { id: values.methodRef }
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <span>تنظیم انبارهای این روش</span>
                  </button>
                </div>
              ) : (
                <>
                  {warehouses.length > 1 && (
                    <div
                      onClick={() => setActiveWarehouseId(0)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between mb-2 ${
                        activeWarehouseId === 0
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                          : 'bg-gray-50/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">همه انبارها</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          تگ‌های صادرشده: <span className="text-gray-800 dark:text-gray-200 font-mono font-medium">{totalIssuedCount}</span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold ${
                          activeWarehouseId === 0
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        ★
                      </div>
                    </div>
                  )}

                  {warehouses.map((wh, idx) => {
                    const isActive = wh.WarehouseID === activeWarehouseId;
                    const localCount = localIssuedCountMap[wh.WarehouseID];
                    const whIssuedCount = localCount !== undefined && localCount > 0 ? localCount : (wh.issuedTagCount || 0);
                    return (
                      <div
                        key={wh.WarehouseID}
                        onClick={() => setActiveWarehouseId(wh.WarehouseID)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                            : 'bg-gray-50/60 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">{wh.Title}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                            تگ‌های صادرشده: <span className="text-gray-800 dark:text-gray-200 font-mono font-medium">{whIssuedCount}</span>
                          </div>
                        </div>

                        {/* Badge Number */}
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Warehouse Items Box (Col 8 on LG screens: Left side in RTL) */}
          <div className={`lg:col-span-8 ${isRtl ? 'lg:order-2' : 'lg:order-1'} flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-0 overflow-hidden shadow-2xs`}>
            {/* Header matching Warehouses List Box */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  کالاهای انبار: {values.methodRef ? (activeWarehouseObj?.Title || 'انبار انتخاب نشده') : '—'}
                </h2>
              </div>
              {values.methodRef && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  تعداد تگ‌های صادرشده: <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{issuedTagsCount}</span>
                </div>
              )}
            </div>

            {/* MainDataGrid Container */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <MainDataGrid
                gridId="stocktaking-tag-items-grid-v2"
                title={`کالاهای انبار: ${values.methodRef ? (activeWarehouseObj?.Title || 'انبار انتخاب نشده') : '—'}`}
                className="!border-0 !rounded-none"
                columns={itemGridColumns}
                data={values.methodRef ? filteredItems : []}
                enableMultiSelection={true}
                onSelectionChange={handleGridSelectionChange}
                hideTitleBar={true}
                hideExcelExport={true}
                hidePdfExport={true}
                hideWordExport={true}
                pageSize={100}
                disableAutoColumns={true}
                customFooterActions={
                  <>
                    <ActionButton
                      type="button"
                      onClick={handleGenerateTags}
                      disabled={!values.methodRef}
                      icon={Tag}
                      variant="ghost"
                      hideLabel
                      tooltip="صدور تگ"
                      tooltipPosition="top"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                    />
                    <ActionButton
                      type="button"
                      onClick={handleDeleteTags}
                      disabled={!values.methodRef}
                      icon={Trash2}
                      variant="ghost"
                      hideLabel
                      tooltip="حذف تگ"
                      tooltipPosition="top"
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                    />
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </SimpleFormTwoRow>
  );
}

export default StocktakingTagForm;
