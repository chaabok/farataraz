"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SimpleFormTwoRowTabbed } from '../SimpleFormTwoRowTabbed';
import { FieldConfig } from '../SimpleFormTwoRow';
import { TabCellRow, TabCellConfig } from '../TabCellRow';
import { CheckBoxRightLabel } from '@/components/inputs/CheckBoxRightLabel';
import { TextInput } from '@/components/inputs/TextInput';
import { Select } from '@/components/inputs/Select';
import { CurrencyDropdown } from '@/components/inputs/CurrencyDropdown';
import { SingleSelectDropDown } from '@/components/inputs/SingleSelectDropDown';
import { MultiSelectDropDown } from '@/components/inputs/MultiSelectDropDown';
import { MultiColumnDropdown } from '@/components/inputs/MultiColumnDropdown';
import { AmountInput } from '@/components/inputs/AmountInput';
import { RadioGroup } from '@/components/inputs/RadioGroup';
import { Users, ShoppingCart } from 'lucide-react';
import { apiFetch, safeStringify } from '@/lib/utils';
import { eventBus, EVENTS } from '@/lib/events';
import { useToast } from '@/components/ToastProvider';
import { useTabs } from '@/components/TabsProvider';
import { useFormUpsert } from '@/hooks/useFormUpsert';
import { useFormUsageCheck } from '@/hooks/useFormUsageCheck';

export function CustomerComponent({
  id,
  onSaved,
  initialData,
}: {
  id?: string | number;
  onSaved?: () => void;
  initialData?: any;
}) {
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("Customers", activeId);

  const [data, setData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!!id && !initialData);

  // Lookup lists
  const [parties, setParties] = useState<any[]>([]);
  const [customerGroups, setCustomerGroups] = useState<any[]>([]);
  const [salesChannels, setSalesChannels] = useState<any[]>([]);
  const [salesTypes, setSalesTypes] = useState<any[]>([]);
  const [intermediaries, setIntermediaries] = useState<any[]>([]);

  const [values, setValues] = useState<Record<string, any>>({
    Code: '',
    CustomerType: 1,
    PartyRef: null,
    Title: '',
    Title2: '',
    CustomerGroupRef: null,
    SalesChannels: [],
    Balance: '0',
    BalanceStatus: 'debtor',
    SalesStatus: 1,
    SalesIntermediaryRef: null,
    SalesTypes: [],
    CurrencyRef: 1,
    IsActive: true,
    PartyAddresses: [],
    PartyPhones: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load lookup data (also re-runs when other forms announce data changes — e.g. new customer group)
  const loadLookups = React.useCallback(async () => {
    try {
        const [partiesRes, groupsRes, channelsRes, typesRes] = await Promise.all([
          apiFetch('/api/common/parties'),
          apiFetch('/api/sle/customer-groups'),
          apiFetch('/api/sle/sales-channels'),
          apiFetch('/api/sle/sales-types'),
        ]);

        const partiesData = await partiesRes.json();
        const rawParties = partiesData?.items || partiesData?.data || partiesData;
        const allParties = Array.isArray(rawParties) ? rawParties : (Array.isArray(rawParties?.data) ? rawParties.data : (Array.isArray(rawParties?.items) ? rawParties.items : []));
        const customerParties = Array.isArray(allParties) ? allParties.filter((p: any) => Boolean(p.isCustomer)) : [];
        setParties(customerParties);
        setIntermediaries(Array.isArray(allParties) ? allParties.filter((p: any) => p.isSalesIntermediary && p.isActive !== false) : []);

        const groupsData = await groupsRes.json();
        const rawGroups = groupsData?.data || groupsData?.items || groupsData;
        const allGroups = Array.isArray(rawGroups) ? rawGroups : (Array.isArray(rawGroups?.data) ? rawGroups.data : (Array.isArray(rawGroups?.items) ? rawGroups.items : []));
        setCustomerGroups(allGroups);

        const channelsData = await channelsRes.json();
        const rawChannels = channelsData?.items || channelsData?.data || channelsData;
        const allChannels = Array.isArray(rawChannels) ? rawChannels : (Array.isArray(rawChannels?.data) ? rawChannels.data : (Array.isArray(rawChannels?.items) ? rawChannels.items : []));
        setSalesChannels(allChannels);

        const typesData = await typesRes.json();
        const rawTypes = typesData?.items || typesData?.data || typesData;
        const allTypes = Array.isArray(rawTypes) ? rawTypes : (Array.isArray(rawTypes?.data) ? rawTypes.data : (Array.isArray(rawTypes?.items) ? rawTypes.items : []));
        setSalesTypes(allTypes);
    } catch (err) {
      console.error('Error loading lookups:', err);
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  // تازه‌سازی لیست‌ها هنگام تغییر داده از فرم‌های دیگر (مثلاً ایجاد گروه مشتری جدید)
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.DATA_CHANGED, () => {
      loadLookups();
    });
    return () => unsubscribe();
  }, [loadLookups]);

  // Fetch record if editing
  useEffect(() => {
    if (id && !initialData) {
      apiFetch(`/api/sle/customers/${id}`)
        .then((res) => res.json())
        .then(async (resData) => {
          const item = resData?.data || resData;
          if (item) {
            setData(item);
            let partyAddresses = [];
            let partyPhones = [];
            let title = '';
            let title2 = '';
            let balance = '0';
            let balanceStatus = 'debtor';

            if (item.PartyRef) {
              try {
                const pRes = await apiFetch(`/api/common/parties/${item.PartyRef}`);
                const pData = (await pRes.json())?.data;
                if (pData) {
                  title = (pData.title || pData.name || pData.nature === 'legal_person') ? (pData.title || pData.name || '') : `${pData.firstName || ''} ${pData.lastName || ''}`.trim();
                  title2 = pData.latinFirstName || pData.latinLastName || '';
                  balance = pData.customerBalance || pData.balance || '0';
                  balanceStatus = pData.customerBalanceStatus || pData.balanceStatus || 'debtor';
                  partyAddresses = pData.partyAddresses || pData.PartyAddresses || [];
                  partyPhones = pData.partyPhones || pData.PartyPhones || [];
                }
              } catch (e) {
                console.error(e);
              }
            }

            setValues({
              Code: item.Code || '',
              CustomerType: item.CustomerType !== undefined ? item.CustomerType : 1,
              PartyRef: item.PartyRef || null,
              Title: title,
              Title2: title2,
              CustomerGroupRef: item.CustomerGroupRef || null,
              SalesChannels: typeof item.SalesChannels === 'string' ? JSON.parse(item.SalesChannels || '[]') : (item.SalesChannels || []),
              Balance: balance,
              BalanceStatus: balanceStatus,
              SalesStatus: item.SalesStatus !== undefined ? item.SalesStatus : 1,
              SalesIntermediaryRef: item.SalesIntermediaryRef || null,
              SalesTypes: typeof item.SalesTypes === 'string' ? JSON.parse(item.SalesTypes || '[]') : (item.SalesTypes || []),
              CurrencyRef: item.CurrencyRef || 1,
              IsActive: item.IsActive !== undefined ? item.IsActive : true,
              PartyAddresses: partyAddresses,
              PartyPhones: partyPhones,
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          showToast('دریافت اطلاعات مشتری با خطا مواجه شد', 'error');
        });
    } else {
      setData(initialData);
    }
  }, [id, initialData]);

  // Get next code for new record
  useEffect(() => {
    if (!id && !initialData?.CustomerID && !activeId) {
      apiFetch('/api/sle/customers/next-number')
        .then((res) => res.json())
        .then((resData) => {
          const info = resData?.data || resData;
          if (info.documentNumber) {
            setValues((prev) => ({ ...prev, Code: info.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [id, initialData, activeId]);

  const handleChange = async (name: string, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });

    if (name === 'PartyRef' && value) {
      try {
        const p = parties.find((item) => String(item.partyId || item.id) === String(value));
        if (p) {
          const title = (p.title || p.name || p.nature === 'legal_person') ? (p.title || p.name || '') : `${p.firstName || ''} ${p.lastName || ''}`.trim();
          const title2 = p.latinFirstName || p.latinLastName || '';
          const balance = p.customerBalance || p.balance || '0';
          const balanceStatus = p.customerBalanceStatus || p.balanceStatus || 'debtor';
          
          let partyAddresses = p.partyAddresses || p.PartyAddresses || [];
          let partyPhones = p.partyPhones || p.PartyPhones || [];

          const res = await apiFetch(`/api/common/parties/${value}`);
          const resData = (await res.json())?.data;
          if (resData) {
            partyAddresses = resData.partyAddresses || resData.PartyAddresses || partyAddresses;
            partyPhones = resData.partyPhones || resData.PartyPhones || partyPhones;
          }

          setValues((prev) => ({
            ...prev,
            Title: title,
            Title2: title2,
            Balance: balance,
            BalanceStatus: balanceStatus,
            PartyAddresses: partyAddresses,
            PartyPhones: partyPhones,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNew = () => {
    setData(undefined);
    setActiveId(null);
    setValues({
      Code: '',
      CustomerType: 1,
      PartyRef: null,
      Title: '',
      Title2: '',
      CustomerGroupRef: null,
      SalesChannels: [],
      Balance: '0',
      BalanceStatus: 'debtor',
      SalesStatus: 1,
      SalesIntermediaryRef: null,
      SalesTypes: [],
      CurrencyRef: 1,
      IsActive: true,
      PartyAddresses: [],
      PartyPhones: [],
    });
    setErrors({});
    apiFetch('/api/sle/customers/next-number')
      .then((res) => res.json())
      .then((resData) => {
        const info = resData?.data || resData;
        if (info.documentNumber) {
          setValues((prev) => ({ ...prev, Code: info.documentNumber }));
        }
      })
      .catch(console.error);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.PartyRef) {
      newErrors.PartyRef = 'انتخاب طرف حساب (مشتری) الزامی است.';
    }
    if (!values.SalesTypes || (Array.isArray(values.SalesTypes) && values.SalesTypes.length === 0)) {
      newErrors.SalesTypes = 'انتخاب نوع فروش الزامی است.';
    }
    if (!values.CurrencyRef) {
      newErrors.CurrencyRef = 'انتخاب ارز الزامی است.';
    }

    // Validate addresses grid if there are any rows
    if (values.PartyAddresses && values.PartyAddresses.length > 0) {
      let hasAddressError = false;
      values.PartyAddresses.forEach((addr: any) => {
        if (!addr.addressType || !addr.city || !addr.fullAddress) {
          hasAddressError = true;
        }
      });
      if (hasAddressError) {
        newErrors.PartyAddresses = "در تب نشانی، تکمیل فیلدهای نوع آدرس، شهر و آدرس کامل الزامی است.";
        showToast(newErrors.PartyAddresses, "error");
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('لطفاً خطاهای فرم را برطرف کنید.', 'error');
      return false;
    }
    return true;
  };

  const saveToApi = async (isNew: boolean = false, isClose: boolean = false) => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const url = getUrl('/api/sle/customers');
      const payload = {
        CustomerID: data?.CustomerID || activeId ? Number(data?.CustomerID || activeId) : undefined,
        Code: values.Code,
        CustomerType: Number(values.CustomerType || 1),
        PartyRef: values.PartyRef ? Number(values.PartyRef) : null,
        CustomerGroupRef: values.CustomerGroupRef ? Number(values.CustomerGroupRef) : null,
        SalesChannels: JSON.stringify(values.SalesChannels || []),
        SalesStatus: Number(values.SalesStatus || 1),
        SalesIntermediaryRef: values.SalesIntermediaryRef ? Number(values.SalesIntermediaryRef) : null,
        SalesTypes: JSON.stringify(values.SalesTypes || []),
        CurrencyRef: values.CurrencyRef ? Number(typeof values.CurrencyRef === 'object' ? (values.CurrencyRef.currencyID || values.CurrencyRef.id) : values.CurrencyRef) : 1,
        IsActive: values.IsActive !== undefined ? values.IsActive : true,
        PartyAddresses: values.PartyAddresses,
        PartyPhones: values.PartyPhones,
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        const saved = result.data || result;
        setData(saved);
        handleResponse(saved, 'CustomerID');
        showToast('اطلاعات مشتری با موفقیت ذخیره شد.', 'success');
        if (onSaved) onSaved();

        if (isClose) {
          if (activeTabId) removeTab(activeTabId);
        } else if (isNew) {
          handleNew();
        }
      } else {
        throw new Error(result.message || 'خطا در ذخیره‌سازی اطلاعات');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا در ذخیره‌سازی اطلاعات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => saveToApi(false, false);
  const handleSaveNew = () => saveToApi(true, false);
  const handleSaveClose = () => saveToApi(false, true);

  // --- ستون‌های سلسله‌مراتب گروه مشتری (Task 49) ---
  // ردیف‌ها = فقط گروه‌های برگ (پایین‌ترین سطح)؛ ریشه «گروه بندی مشتریان» (سطح 0) فقط وقتی نمایش داده می‌شود
  // که هیچ گروه دیگری تعریف نشده باشد. ستون‌ها: اول پایین‌ترین سطح، سپس یک سطح بالاتر، تا سطح ۱ — بدون سطح 0.
  const { leafGroups, groupMaxLevel } = useMemo(() => {
    const map = new Map<string, any>();
    customerGroups.forEach((g) => map.set(String(g.CustomerGroupID ?? g.id), g));
    const childIds = new Set<string>();
    customerGroups.forEach((g) => {
      if (g.ParentRef !== null && g.ParentRef !== undefined) childIds.add(String(g.ParentRef));
    });
    const levelOf = (g: any): number => {
      if (g.ParentRef === null || g.ParentRef === undefined) return 0; // ریشه = سطح 0
      let d = 1; // خود گروه
      const seen = new Set<string>([String(g.CustomerGroupID ?? g.id)]);
      let cur = map.get(String(g.ParentRef));
      while (cur && cur.ParentRef !== null && cur.ParentRef !== undefined && !seen.has(String(cur.CustomerGroupID ?? cur.id))) {
        d++;
        seen.add(String(cur.CustomerGroupID ?? cur.id));
        cur = map.get(String(cur.ParentRef));
      }
      return d;
    };
    const leaves = customerGroups.filter((g) => !childIds.has(String(g.CustomerGroupID ?? g.id)));
    const maxLevel = leaves.reduce((mx, g) => Math.max(mx, levelOf(g)), 0);
    return { leafGroups: leaves, groupMaxLevel: maxLevel };
  }, [customerGroups]);

  const groupColumns = useMemo(() => {
    const faNum = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
    const cols: { key: string; label: string; width: number }[] = [];
    if (groupMaxLevel === 0) {
      // هیچ گروه‌بندی تعریف نشده — فقط سطح 0 (گروه بندی مشتریان) نمایش داده می‌شود
      cols.push({ key: 'Level0Code', label: 'کد سطح ۰', width: 80 });
      cols.push({ key: 'Level0Title', label: 'عنوان سطح ۰', width: 180 });
      return cols;
    }
    for (let k = groupMaxLevel; k >= 1; k--) {
      cols.push({ key: `Level${k}Code`, label: `کد سطح ${faNum(k)}`, width: 90 });
      cols.push({ key: `Level${k}Title`, label: `عنوان سطح ${faNum(k)}`, width: 160 });
    }
    return cols;
  }, [groupMaxLevel]);

  const fields: FieldConfig[] = [
    {
      name: 'Code',
      label: 'کد',
      type: 'text',
      required: true,
      colSpan: 1,
    },
    {
      name: 'CustomerType',
      label: 'نوع مشتری',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'عادی', value: 1 },
        { label: 'متفرقه', value: 2 },
      ],
    },
    {
      name: 'PartyRef',
      label: 'کدتفصیل مشتری',
      type: 'custom',
      required: true,
      colSpan: 1,
      customComponent: (
        <SingleSelectDropDown
          data={parties}
          listApiUrl={`/api/common/parties?isCustomer=true&excludeAssignedCustomers=true${activeId || data?.CustomerID ? `&excludeCustomerId=${activeId || data?.CustomerID}` : ''}`}
          columns={[
            { key: 'partyId', label: 'کد', width: 60 },
            { key: 'code', label: 'کد تفصیلی', width: 80 },
            { key: 'firstName', label: 'نام', width: 100 },
            { key: 'lastName', label: 'نام خانوادگی', width: 120 },
            { key: 'title', label: 'عنوان شرکت', width: 150 },
            { key: 'nationalCode', label: 'کد ملی / شناسه', width: 100 },
          ]}
          displayKey="code"
          renderSelection={(p: any) => p ? String(p.code || p.partyId || '') : ''}
          value={parties.find((p) => String(p.partyId || p.id) === String(values.PartyRef)) || null}
          onChange={(item: any) => {
            handleChange('PartyRef', item ? (item.partyId || item.id) : null);
          }}
          placeholder="انتخاب تفصیل مشتری..."
        />
      ),
    },
    {
      name: 'Title',
      label: 'عنوان',
      type: 'text',
      disabled: true,
      colSpan: 1,
    },
    {
      name: 'Title2',
      label: 'عنوان (2)',
      type: 'text',
      disabled: true,
      colSpan: 1,
    },
    {
      name: 'CustomerGroupRef',
      label: 'گروه مشتری',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <SingleSelectDropDown
          data={leafGroups}
          listApiUrl="/api/sle/customer-groups?leavesOnly=true"
          columns={groupColumns}
          displayKey="Title"
          value={customerGroups.find((g) => String(g.CustomerGroupID || g.id) === String(values.CustomerGroupRef)) || null}
          onChange={(item: any) => {
            handleChange('CustomerGroupRef', item ? (item.CustomerGroupID || item.id) : null);
          }}
          placeholder="انتخاب گروه مشتری..."
        />
      ),
    },
    {
      name: 'SalesChannels',
      label: 'کانال فروش مرتبط',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <MultiColumnDropdown
          data={salesChannels}
          listApiUrl="/api/sle/sales-channels"
          columns={[
            { key: 'Code', label: 'کد', width: 80 },
            { key: 'Title', label: 'عنوان', width: 150 },
          ]}
          displayKey="Title"
          enableMultiSelection={true}
          value={
            Array.isArray(values.SalesChannels)
              ? salesChannels.filter((sc) => values.SalesChannels.includes(sc.SalesChannelID || sc.id))
              : []
          }
          onChange={(selected: any) => {
            const arr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
            handleChange('SalesChannels', arr.map((s: any) => s.SalesChannelID || s.id));
          }}
          placeholder="انتخاب کانال‌های فروش..."
        />
      ),
    },
    {
      name: 'Balance',
      label: 'مانده حساب',
      type: 'custom',
      colSpan: 1,
      customComponent: (
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <AmountInput
              label=""
              value={values.Balance || '0'}
              disabled={true}
            />
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            {values.BalanceStatus === 'creditor' ? 'بستانکار' : 'بدهکار'}
          </span>
        </div>
      ),
    },
    {
      name: 'SalesStatus',
      label: 'وضعیت فروش',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'فروش مستقیم', value: 1 },
        { label: 'فروش غیرمستقیم واسط بدهکار', value: 2 },
        { label: 'فروش غیرمستقیم مشتری بدهکار', value: 3 },
      ],
    },
    ...(Number(values.SalesStatus) > 1
      ? [
          {
            name: 'SalesIntermediaryRef',
            label: 'واسط فروش',
            type: 'custom' as const,
            required: true,
            colSpan: 1,
            customComponent: (
              <SingleSelectDropDown
                data={intermediaries}
                columns={[
                  { key: 'partyId', label: 'کد', width: 60 },
                  { key: 'firstName', label: 'نام', width: 100 },
                  { key: 'lastName', label: 'نام خانوادگی', width: 120 },
                  { key: 'title', label: 'عنوان شرکت', width: 150 },
                ]}
                displayKey="firstName"
                value={intermediaries.find((i) => String(i.partyId || i.id) === String(values.SalesIntermediaryRef)) || null}
                onChange={(item: any) => {
                  handleChange('SalesIntermediaryRef', item ? (item.partyId || item.id) : null);
                }}
                placeholder="انتخاب واسط فروش..."
              />
            ),
          },
        ]
      : []),
    {
      name: 'SalesTypes',
      label: 'نوع فروش',
      type: 'custom',
      required: true,
      colSpan: 1,
      customComponent: (
        <MultiColumnDropdown
          data={salesTypes}
          listApiUrl="/api/sle/sales-types"
          columns={[
            { key: 'Code', label: 'کد', width: 80 },
            { key: 'Title', label: 'عنوان', width: 150 },
          ]}
          displayKey="Title"
          enableMultiSelection={true}
          value={
            Array.isArray(values.SalesTypes)
              ? salesTypes.filter((st) => values.SalesTypes.includes(st.SalesTypeID || st.id))
              : []
          }
          onChange={(selected: any) => {
            const arr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
            handleChange('SalesTypes', arr.map((t: any) => t.SalesTypeID || t.id));
          }}
          placeholder="انتخاب نوع فروش..."
        />
      ),
    },
    {
      name: 'CurrencyRef',
      label: 'ارز',
      type: 'custom',
      required: true,
      colSpan: 1,
      customComponent: (
        <CurrencyDropdown
          value={values.CurrencyRef}
          onChange={(val) => {
            const curId = val && typeof val === 'object' ? (val.currencyID || val.id) : val;
            handleChange('CurrencyRef', curId || 1);
          }}
          required
        />
      ),
    },
    {
      name: 'IsActive',
      label: ' ',
      type: 'custom',
      containerClassName: 'mb-4',
      colSpan: 1,
      customComponent: (
        <CheckBoxRightLabel
          label="فعال"
          checked={values.IsActive}
          onChange={(checked) => handleChange('IsActive', checked)}
        />
      ),
    },
  ];

  const bottomTabsConfig: TabCellConfig[] = [
    {
      id: 'PartyAddresses',
      label: 'نشانی',
      columns: [
        { 
          key: 'addressType', 
          header: 'نوع آدرس', 
          type: 'select',
          required: true,
          options: [
            { label: 'رسمی', value: 'رسمی' },
            { label: 'محل فعالیت', value: 'محل فعالیت' },
            { label: 'ارسال صورت', value: 'ارسال صورت' },
            { label: 'ارسال کالا', value: 'ارسال کالا' },
            { label: 'انبار', value: 'انبار' },
            { label: 'منزل', value: 'منزل' },
            { label: 'پستی', value: 'پستی' },
            { label: 'سایر', value: 'سایر' }
          ]
        },
        { 
          key: 'city', 
          header: 'شهر', 
          type: 'custom',
          required: true,
          render: (row, rowIndex, onChange) => (
            <div className="w-full h-[29px] relative" onClick={(e) => e.stopPropagation()}>
              <MultiColumnDropdown
                listApiUrl="/api/common/geo-locations/cities"
                columns={[
                  { key: 'code', label: 'کد', width: 80 },
                  { key: 'title', label: 'عنوان', width: 120 },
                  { key: 'latinTitle', label: 'عنوان لاتین', width: 120 },
                  { key: 'province', label: 'نام استان', width: 120 },
                  { key: 'country', label: 'نام کشور', width: 120 }
                ]}
                displayKey="title"
                value={row.cityObj || (row.city ? { title: row.city } : null)}
                onChange={(item) => {
                   row.cityObj = item;
                   onChange(item.title);
                }}
                enableMultiSelection={false}
              />
            </div>
          )
        },
        { key: 'fullAddress', header: 'آدرس کامل', type: 'text', width: '250px', required: true },
        { key: 'postalCode', header: 'کد پستی', type: 'text' },
        { key: 'longitude', header: 'طول جغرافیایی', type: 'number' },
        { key: 'latitude', header: 'عرض جغرافیایی', type: 'number' }
      ],
    },
    {
      id: 'PartyPhones',
      label: 'تلفن',
      columns: [
        { 
          key: 'phoneType', 
          header: 'نوع تلفن', 
          type: 'select',
          options: [
            { label: 'تلفن دفتر', value: 'تلفن دفتر' },
            { label: 'تلفن همراه', value: 'تلفن همراه' },
            { label: 'تلفن منزل', value: 'تلفن منزل' },
            { label: 'تلفن سایر', value: 'تلفن سایر' },
            { label: 'دورنگار دفتر', value: 'دورنگار دفتر' },
            { label: 'دورنگار منزل', value: 'دورنگار منزل' },
            { label: 'دورنگار سایر', value: 'دورنگار سایر' }
          ]
        },
        { key: 'phoneNumber', header: 'شماره تلفن', type: 'text' },
        { key: 'internal', header: 'داخلی', type: 'text' },
        { key: 'description', header: 'توضیحات', type: 'text' }
      ],
    },
  ];

  const bottomTabsDefinitions = [
    {
      id: 'addresses',
      label: 'آدرس',
      content: (
        <TabCellRow
          tabs={[bottomTabsConfig[0]]}
          value={values.PartyAddresses || []}
          onChange={(val) => handleChange('PartyAddresses', val)}
          hideHeader={true}
          className="flex-1 min-h-0 w-full border-none shadow-none rounded-none"
        />
      ),
    },
    {
      id: 'phones',
      label: 'تلفن',
      content: (
        <TabCellRow
          tabs={[bottomTabsConfig[1]]}
          value={values.PartyPhones || []}
          onChange={(val) => handleChange('PartyPhones', val)}
          hideHeader={true}
          className="flex-1 min-h-0 w-full border-none shadow-none rounded-none"
        />
      ),
    },
  ];

  return (
    <SimpleFormTwoRowTabbed
      isReadonly={isUsed || false}
      title={data ? 'ویرایش مشتری' : 'مشتری جدید'}
      icon={<ShoppingCart className="w-4 h-4" />}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      onSaveClose={handleSaveClose}
      onNew={handleNew}
      listApiUrl="/api/sle/customers"
      listDisplayKey="Code"
      listColumns={[
        { key: 'Code', header: 'کد' },
        { 
          key: 'CustomerName', 
          header: 'نام مشتری', 
          renderItem: (item: any) => item.party?.title || item.party?.name || `${item.party?.firstName || ''} ${item.party?.lastName || ''}`.trim() || '-' 
        },
        { 
          key: 'PartyRef', 
          header: 'کدتفصیلی', 
          renderItem: (item: any) => item.party?.code || item.PartyRef || '-' 
        },
        { 
          key: 'CustomerGroup', 
          header: 'گروه مشتری', 
          renderItem: (item: any) => item.customerGroup?.name || item.customerGroup?.Title || item.customerGroup?.title || '-' 
        },
        { 
          key: 'Currency', 
          header: 'نام ارز', 
          renderItem: (item: any) => item.currency?.title || item.currency?.Title || '-' 
        },
        { key: 'CustomerType', header: 'نوع مشتری', renderItem: (item: any) => item.CustomerType === 2 ? 'متفرقه' : 'عادی' },
        { key: 'IsActive', header: 'وضعیت', renderItem: (item: any) => item.IsActive !== false ? 'فعال' : 'غیرفعال' },
      ]}
      onListSelect={(item) => {
        if (data?.CustomerID !== item.CustomerID) {
          addTab(
            `ویرایش مشتری - ${item.Code}`,
            'warehouse_logistics_group',
            undefined,
            'CustomerForm',
            { id: item.CustomerID }
          );
        }
      }}
      onDelete={data?.CustomerID ? async () => {
        setIsSubmitting(true);
        try {
          const res = await apiFetch(`/api/sle/customers/${data.CustomerID}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('خطا در حذف');
          showToast('با موفقیت حذف شد', 'success');
          if (activeTabId) removeTab(activeTabId);
        } catch (err: any) {
          showToast(err.message || 'خطا در حذف', 'error');
        } finally {
          setIsSubmitting(false);
        }
      } : undefined}
      isSubmitting={isSubmitting || isLoading}
      labelWidth="110px"
      bottomTabs={bottomTabsDefinitions}
    />
  );
}

export function Customer(props: any) {
  return <CustomerComponent {...props} />;
}

export function CustomerForm(props: any) {
  return <CustomerComponent {...props} />;
}
