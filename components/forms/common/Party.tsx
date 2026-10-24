"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useEffect } from "react";
import { FieldConfig } from "../SimpleFormTwoRow";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { TabCellRow } from "../TabCellRow";
import { TabSimpleRow } from "../TabSimpleRow";
import { Users } from "lucide-react";
import { useToast } from "../../ToastProvider";
import { useTabs } from "../../TabsProvider";
import { apiFetch, safeStringify } from "@/lib/utils";
import { MultiColumnDropdown } from "../../inputs/MultiColumnDropdown";
import { CheckBoxRightLabel, AmountInput, RadioGroup } from "@/components/inputs";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { eventBus, EVENTS } from "@/lib/events";
import { usePartyStore } from "@/lib/stores/partyStore";

export function Party({ id }: { id?: number }) {
  const { showToast } = useToast();
  const { addTab, removeTab, activeTabId } = useTabs();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("Party", activeId);


  const { values, setValues, errors, setErrors, isSubmitting, setIsSubmitting, isLoading, setIsLoading } = usePartyStore();
  const [refreshNumbering, setRefreshNumbering] = React.useState(0);

  useEffect(() => {
    if (!activeId) {
      const typeCode = values.nature === 'real_person' ? '6' : '7';
      apiFetch('/api/accounting/detailed-types')
        .then(res => res.json())
        .then(data => {
            const items = data.items || data.data || data;
            const typeParty = items?.find((t: any) => String(t.code) === typeCode);
            if (typeParty) {
                const typeId = typeParty.detailedTypesId || typeParty.detailedTypeID;
                return apiFetch(`/api/common/detailed-accounts-numbering/next-code/${typeId}`);
            }
            return null;
        })
        .then(res => res ? res.json() : null)
        .then(data => {
            if (data && data.data) {
                setValues(prev => ({ ...prev, detailedCode: data.data }));
            }
        })
        .catch(console.error);
    }
  }, [activeId, values.nature, refreshNumbering, setValues]);

  useEffect(() => {
    if (activeId) {
      const fetchParty = async () => {
        setIsLoading(true);
        try {
          const response = await apiFetch(`/api/common/parties/${activeId}`);
          if (response.ok) {
            const data = (await response.json()).data;
            if (data) {
              setValues({
                ...data,
                detailedCode: data.detailedAccount ? data.detailedAccount.code : '',
                PartyAddresses: data.partyAddresses || data.PartyAddresses || [],
                PartyPhones: data.partyPhones || data.PartyPhones || [],
                PartyRelatedPersons: data.partyRelatedPersons || data.PartyRelatedPersons || [],
                PartyOtherInfo: {
                  website: data.website || '',
                  email: data.email || '',
                  passportNumber: data.passportNumber || '',
                  birthDate: data.birthDate || '',
                  marriageDate: data.marriageDate || '',
                },
                PartyMoreDetail: {
                  isSupplier: data.isSupplier || false,
                  balance: data.balance || '',
                  balanceStatus: data.balanceStatus || '',
                  isCustomer: data.isCustomer || false,
                  customerBalance: data.customerBalance || '',
                  customerBalanceStatus: data.customerBalanceStatus || '',
                  isSalesIntermediary: data.isSalesIntermediary || false,
                  salesIntermediaryBalance: data.salesIntermediaryBalance || '',
                  salesIntermediaryBalanceStatus: data.salesIntermediaryBalanceStatus || '',
                }
              });
            }
          }
        } catch (error) {
          console.error("Error fetching party:", error);
          showToast("خطا در دریافت اطلاعات", "error");
        } finally {
          setIsLoading(false);
        }
      };
      fetchParty();
    }
  }, [activeId, showToast]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.firstName) newErrors.firstName = "نام الزامی است";
    if (values.nature === 'real_person' && !values.lastName) newErrors.lastName = "نام خانوادگی الزامی است";

    // Validate balance amount & balance status in PartyMoreDetail (Supplier)
    const balance = values.PartyMoreDetail?.balance;
    const balanceStatus = values.PartyMoreDetail?.balanceStatus;
    const hasBalance = balance !== undefined && balance !== null && String(balance).trim() !== '' && String(balance).trim() !== '0';
    if (hasBalance && (!balanceStatus || String(balanceStatus).trim() === '')) {
      newErrors.balanceStatus = "در تب جزئیات، انتخاب وضعیت (بدهکار/بستانکار) تامین‌کننده الزامی است.";
      showToast("در تب جزئیات، در صورت وارد کردن مبلغ مانده تامین‌کننده، انتخاب وضعیت (بدهکار/بستانکار) الزامی است.", "error");
    }

    // Validate customer balance amount & balance status in PartyMoreDetail (Customer)
    const customerBalance = values.PartyMoreDetail?.customerBalance;
    const customerBalanceStatus = values.PartyMoreDetail?.customerBalanceStatus;
    const hasCustomerBalance = customerBalance !== undefined && customerBalance !== null && String(customerBalance).trim() !== '' && String(customerBalance).trim() !== '0';
    if (hasCustomerBalance && (!customerBalanceStatus || String(customerBalanceStatus).trim() === '')) {
      newErrors.customerBalanceStatus = "در تب جزئیات، انتخاب وضعیت (بدهکار/بستانکار) مشتری الزامی است.";
      showToast("در تب جزئیات، در صورت وارد کردن مبلغ مانده مشتری، انتخاب وضعیت (بدهکار/بستانکار) الزامی است.", "error");
    }

    // Validate sales intermediary balance amount & balance status in PartyMoreDetail (Sales Intermediary)
    const salesBalance = values.PartyMoreDetail?.salesIntermediaryBalance;
    const salesBalanceStatus = values.PartyMoreDetail?.salesIntermediaryBalanceStatus;
    const hasSalesBalance = salesBalance !== undefined && salesBalance !== null && String(salesBalance).trim() !== '' && String(salesBalance).trim() !== '0';
    if (hasSalesBalance && (!salesBalanceStatus || String(salesBalanceStatus).trim() === '')) {
      newErrors.salesIntermediaryBalanceStatus = "در تب جزئیات، انتخاب وضعیت (بدهکار/بستانکار) واسط فروش الزامی است.";
      showToast("در تب جزئیات، در صورت وارد کردن مبلغ مانده واسط فروش، انتخاب وضعیت (بدهکار/بستانکار) الزامی است.", "error");
    }

    // Validate addresses grid if there are any rows
    if (values.PartyAddresses && values.PartyAddresses.length > 0) {
      let hasAddressError = false;
      values.PartyAddresses.forEach((addr: any, index: number) => {
        if (!addr.addressType || !addr.city || !addr.fullAddress) {
          hasAddressError = true;
        }
      });
      if (hasAddressError) {
        newErrors.PartyAddresses = "در تب نشانی، تکمیل فیلدهای نوع آدرس، شهر و آدرس کامل الزامی است.";
        showToast(newErrors.PartyAddresses, "error");
      }
    }

    // Validate related persons grid if there are any rows
    if (values.PartyRelatedPersons && values.PartyRelatedPersons.length > 0) {
      let hasRelatedPersonsError = false;
      values.PartyRelatedPersons.forEach((person: any) => {
        if (!person.firstName || !person.lastName) {
          hasRelatedPersonsError = true;
        }
      });
      if (hasRelatedPersonsError) {
        newErrors.PartyRelatedPersons = "در تب افراد مرتبط، تکمیل فیلدهای نام و نام خانوادگی الزامی است.";
        showToast(newErrors.PartyRelatedPersons, "error");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (closeAfterSave = false, emptyAfterSave = false) => {
    if (!validate()) {
      throw new Error("VALIDATION_FAILED");
    }
    setIsSubmitting(true);
    try {
      const url = getUrl('/api/common/parties');
      
      const payload = { ...values };
      delete payload.detailedCode;

      if (payload.PartyOtherInfo) {
        Object.assign(payload, payload.PartyOtherInfo);
        delete payload.PartyOtherInfo;
      }
      
      if (payload.PartyMoreDetail) {
        Object.assign(payload, payload.PartyMoreDetail);
        delete payload.PartyMoreDetail;
      }

      if (payload.PartyAddresses) {
        payload.partyAddresses = payload.PartyAddresses;
      }
      if (payload.PartyPhones) {
        payload.partyPhones = payload.PartyPhones;
      }
      if (payload.PartyRelatedPersons) {
        payload.partyRelatedPersons = payload.PartyRelatedPersons;
      }

      // Fix date fields to undefined if they are empty strings
      if (payload.birthDate === '') delete payload.birthDate;
      if (payload.marriageDate === '') delete payload.marriageDate;

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'خطا در ذخیره اطلاعات');
      }
      
      handleResponse(responseData, 'partyId');
      if (!activeId && responseData && responseData.data && responseData.data.partyId) {
        setActiveId(responseData.data.partyId);
      }

      showToast("اطلاعات با موفقیت ذخیره شد", "success");

      // Emit events to refresh both Party and DetailedAccount list views across the app
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'Party' });
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'DetailedAccount' });

      if (emptyAfterSave) {
        setActiveId(undefined);
        setValues({
          nature: 'real_person',
          isActive: true,
          PartyMoreDetail: {
            isSupplier: false,
            balance: '',
            balanceStatus: '',
            isCustomer: false,
            customerBalance: '',
            customerBalanceStatus: '',
            isSalesIntermediary: false,
            salesIntermediaryBalance: '',
            salesIntermediaryBalanceStatus: '',
          }
        });
      }
      if (closeAfterSave && activeTabId) {
        removeTab(activeTabId);
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNew = () => {
    setActiveId(undefined);
    setValues({
      nature: 'real_person',
      isActive: true,
      PartyRelatedPersons: [],
      PartyAddresses: [],
      PartyPhones: [],
      PartyMoreDetail: {
        isSupplier: false,
        balance: '',
        balanceStatus: '',
        isCustomer: false,
        customerBalance: '',
        customerBalanceStatus: '',
        isSalesIntermediary: false,
        salesIntermediaryBalance: '',
        salesIntermediaryBalanceStatus: '',
      }
    });
    setRefreshNumbering(prev => prev + 1);
  };

  const isRealPerson = values.nature === 'real_person';

  // Fields mapping carefully ordered for right-to-left two column layout
  const fields: FieldConfig[] = [
    {
      name: 'nature',
      label: 'ماهیت',
      type: 'select',
      required: true,
      options: [
        { label: 'شخص حقیقی', value: 'real_person' },
        { label: 'شخص حقوقی', value: 'legal_entity' }
      ]
    },
    {
      name: 'subType',
      label: 'نوع فرعی',
      type: 'select',
      disabled: isRealPerson,
      options: [
        { label: 'سایر', value: 'other' },
        { label: 'وزارتخانه', value: 'ministry' },
        { label: 'موسسه دولتی', value: 'gov_inst' },
        { label: 'شرکت دولتی', value: 'gov_company' },
        { label: 'سایر دستگاه های دولتی', value: 'other_gov' },
        { label: 'نهادهای عمومی غیر دولتی', value: 'non_gov_public' },
        { label: 'بخش خصوصی', value: 'private' }
      ]
    },
    {
      name: 'firstName',
      label: 'نام',
      type: 'text',
      required: true
    }
  ];

  if (isRealPerson) {
    fields.push(
      {
        name: 'lastName',
        label: 'نام خانوادگی',
        type: 'text',
        required: true
      },
      {
        name: 'latinFirstName',
        label: 'نام (2)',
        type: 'text'
      },
      {
        name: 'latinLastName',
        label: 'نام خانوادگی (2)',
        type: 'text',
        required: false
      }
    );
  } else {
    fields.push(
      {
        name: 'latinFirstName',
        label: 'نام لاتین',
        type: 'text'
      }
    );
  }

  fields.push(
    {
      name: 'detailedCode',
      label: 'کد تفصیلی',
      type: 'text',
      required: true,
      disabled: false
    },
    {
      name: 'economicCode',
      label: 'کد اقتصادی',
      type: 'text'
    }
  );

  if (isRealPerson) {
    fields.push(
      {
        name: 'nationalCode',
        label: 'کد ملی',
        type: 'text'
      }
    );
  } else {
    fields.push(
      {
        name: 'nationalId',
        label: 'شناسه ملی',
        type: 'text'
      },
      {
        name: 'registrationNumber',
        label: 'شماره ثبت',
        type: 'text'
      }
    );
  }

  // Active status at the end
  fields.push({
    name: 'isActive',
    label: 'فعال',
    type: 'checkbox'
  });

  // Handle onChange
  const handleChange = (name: string, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      
      // If switching to 'real_person', clear legal entity only fields
      if (name === 'nature' && value === 'real_person') {
        next.subType = '';
        next.nationalId = '';
        next.registrationNumber = '';
      }
      
      // If switching to 'legal_entity', clear real person only fields
      if (name === 'nature' && value === 'legal_entity') {
        next.lastName = '';
        next.latinLastName = '';
        next.nationalCode = '';
        if (next.PartyOtherInfo) {
          next.PartyOtherInfo.marriageDate = '';
          next.PartyOtherInfo.birthDate = '';
          next.PartyOtherInfo.passportNumber = '';
        }
      }
      
      return next;
    });
  };

  const listColumns = [
    { 
      key: "detailedAccount.code", 
      label: "کد تفصیلی", 
      width: 100,
      renderItem: (item: any) => item.detailedAccount?.code || item.detailedCode || ''
    },
    { 
      key: "nature", 
      label: "نوع", 
      width: 90,
      renderItem: (item: any) => item.nature === 'real_person' ? 'حقیقی' : (item.nature === 'legal_entity' ? 'حقوقی' : item.nature || '')
    },
    { key: "firstName", label: "نام", width: 120 },
    { key: "lastName", label: "نام خانوادگی", width: 140 },
    { key: "nationalCode", label: "کد ملی", width: 120 },
    { key: "economicCode", label: "کد اقتصادی", width: 120 },
  ];

  return (
    <>
      <LoadingOverlay visible={isLoading} message="در حال دریافت اطلاعات..." />
      <SimpleFormTwoRowTabbed isReadonly={isUsed || false}
        title="تعریف طرف حساب"
        icon={<Users className="w-4 h-4" />}
        fields={fields}
        values={values}
        onChange={handleChange}
        errors={errors}
        isSubmitting={isSubmitting}
        onSave={() => handleSave(false, false)}
        onSaveNew={() => handleSave(false, true)}
        onSaveClose={() => handleSave(true, false)}
        onNew={handleNew}
        listApiUrl="/api/common/parties"
        listColumns={listColumns}
        listDisplayKey="firstName"
        onListSelect={(item: any) => {
          if (item && item.partyId && activeId !== item.partyId) {
            const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
            addTab(
              `ویرایش طرف حساب - ${fullName}`,
              'persons',
              <Users className="h-[14px] w-[14px]" />,
              'Party',
              { id: item.partyId }
            );
          }
        }}
        onList={() => {
          addTab(
            'فهرست طرف حساب ها',
            'persons',
            <Users className="h-[14px] w-[14px]" />,
            'PartyList'
          );
        }}
        showListButton={true}
      bottomTabs={[
        {
          id: 'PartyMoreDetail',
          label: 'جزئیات',
          content: (
            <div className="flex-1 min-h-0 flex flex-col w-full p-4 bg-white dark:bg-gray-900 overflow-y-auto">
              <div className="flex flex-col gap-4 max-w-5xl">
                {/* ردیف تامین کننده */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* تامین کننده و مبلغ مانده با فاصله ۵ پیکسل */}
                  <div className="flex items-center gap-[5px]">
                    {/* تامین کننده */}
                    <div className="flex items-center h-[32px] w-[110px]">
                      <CheckBoxRightLabel 
                        text="تامین کننده" 
                        checked={!!(values.PartyMoreDetail?.isSupplier)} 
                        onChange={(checked) => {
                          const updatedDetail = {
                            ...(values.PartyMoreDetail || {}),
                            isSupplier: checked
                          };
                          if (!checked) {
                            updatedDetail.balance = '';
                            updatedDetail.balanceStatus = '';
                          }
                          handleChange('PartyMoreDetail', updatedDetail);
                        }}
                        disabled={isUsed}
                      />
                    </div>

                    {/* مبلغ مانده */}
                    <div className="w-[280px] flex items-center h-[32px]">
                      <AmountInput
                        label="مبلغ مانده :"
                        value={values.PartyMoreDetail?.balance || ''}
                        onChange={(val) => {
                          handleChange('PartyMoreDetail', {
                            ...(values.PartyMoreDetail || {}),
                            balance: val
                          });
                        }}
                        placeholder="0"
                        disabled={isUsed || !(values.PartyMoreDetail?.isSupplier)}
                        error={errors.balance}
                        labelWidth="85px"
                      />
                    </div>
                  </div>

                  {/* وضعیت (بدهکار / بستانکار) */}
                  <div className="flex items-center h-[32px]">
                    <RadioGroup
                      label="وضعیت :"
                      name="balanceStatus"
                      value={values.PartyMoreDetail?.balanceStatus || ''}
                      onChange={(val) => {
                        handleChange('PartyMoreDetail', {
                          ...(values.PartyMoreDetail || {}),
                          balanceStatus: val
                        });
                      }}
                      options={[
                        { label: 'بدهکار', value: 'debtor' },
                        { label: 'بستانکار', value: 'creditor' }
                      ]}
                      required={!!(values.PartyMoreDetail?.isSupplier && values.PartyMoreDetail?.balance && String(values.PartyMoreDetail.balance).trim() !== '' && String(values.PartyMoreDetail.balance).trim() !== '0')}
                      error={errors.balanceStatus}
                      disabled={isUsed || !(values.PartyMoreDetail?.isSupplier)}
                      labelWidth="65px"
                    />
                  </div>
                </div>

                {/* ردیف مشتری */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* مشتری و مبلغ مانده با فاصله ۵ پیکسل */}
                  <div className="flex items-center gap-[5px]">
                    {/* مشتری */}
                    <div className="flex items-center h-[32px] w-[110px]">
                      <CheckBoxRightLabel 
                        text="مشتری" 
                        checked={!!(values.PartyMoreDetail?.isCustomer)} 
                        onChange={(checked) => {
                          const updatedDetail = {
                            ...(values.PartyMoreDetail || {}),
                            isCustomer: checked
                          };
                          if (!checked) {
                            updatedDetail.customerBalance = '';
                            updatedDetail.customerBalanceStatus = '';
                          }
                          handleChange('PartyMoreDetail', updatedDetail);
                        }}
                        disabled={isUsed}
                      />
                    </div>

                    {/* مبلغ مانده */}
                    <div className="w-[280px] flex items-center h-[32px]">
                      <AmountInput
                        label="مبلغ مانده :"
                        value={values.PartyMoreDetail?.customerBalance || ''}
                        onChange={(val) => {
                          handleChange('PartyMoreDetail', {
                            ...(values.PartyMoreDetail || {}),
                            customerBalance: val
                          });
                        }}
                        placeholder="0"
                        disabled={isUsed || !(values.PartyMoreDetail?.isCustomer)}
                        error={errors.customerBalance}
                        labelWidth="85px"
                      />
                    </div>
                  </div>

                  {/* وضعیت (بدهکار / بستانکار) */}
                  <div className="flex items-center h-[32px]">
                    <RadioGroup
                      label="وضعیت :"
                      name="customerBalanceStatus"
                      value={values.PartyMoreDetail?.customerBalanceStatus || ''}
                      onChange={(val) => {
                        handleChange('PartyMoreDetail', {
                          ...(values.PartyMoreDetail || {}),
                          customerBalanceStatus: val
                        });
                      }}
                      options={[
                        { label: 'بدهکار', value: 'debtor' },
                        { label: 'بستانکار', value: 'creditor' }
                      ]}
                      required={!!(values.PartyMoreDetail?.isCustomer && values.PartyMoreDetail?.customerBalance && String(values.PartyMoreDetail.customerBalance).trim() !== '' && String(values.PartyMoreDetail.customerBalance).trim() !== '0')}
                      error={errors.customerBalanceStatus}
                      disabled={isUsed || !(values.PartyMoreDetail?.isCustomer)}
                      labelWidth="65px"
                    />
                  </div>
                </div>

                {/* ردیف واسط فروش */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* واسط فروش و مبلغ مانده با فاصله ۵ پیکسل */}
                  <div className="flex items-center gap-[5px]">
                    {/* واسط فروش */}
                    <div className="flex items-center h-[32px] w-[110px]">
                      <CheckBoxRightLabel 
                        text="واسط فروش" 
                        checked={!!(values.PartyMoreDetail?.isSalesIntermediary)} 
                        onChange={(checked) => {
                          const updatedDetail = {
                            ...(values.PartyMoreDetail || {}),
                            isSalesIntermediary: checked
                          };
                          if (!checked) {
                            updatedDetail.salesIntermediaryBalance = '';
                            updatedDetail.salesIntermediaryBalanceStatus = '';
                          }
                          handleChange('PartyMoreDetail', updatedDetail);
                        }}
                        disabled={isUsed}
                      />
                    </div>

                    {/* مبلغ مانده */}
                    <div className="w-[280px] flex items-center h-[32px]">
                      <AmountInput
                        label="مبلغ مانده :"
                        value={values.PartyMoreDetail?.salesIntermediaryBalance || ''}
                        onChange={(val) => {
                          handleChange('PartyMoreDetail', {
                            ...(values.PartyMoreDetail || {}),
                            salesIntermediaryBalance: val
                          });
                        }}
                        placeholder="0"
                        disabled={isUsed || !(values.PartyMoreDetail?.isSalesIntermediary)}
                        error={errors.salesIntermediaryBalance}
                        labelWidth="85px"
                      />
                    </div>
                  </div>

                  {/* وضعیت (بدهکار / بستانکار) */}
                  <div className="flex items-center h-[32px]">
                    <RadioGroup
                      label="وضعیت :"
                      name="salesIntermediaryBalanceStatus"
                      value={values.PartyMoreDetail?.salesIntermediaryBalanceStatus || ''}
                      onChange={(val) => {
                        handleChange('PartyMoreDetail', {
                          ...(values.PartyMoreDetail || {}),
                          salesIntermediaryBalanceStatus: val
                        });
                      }}
                      options={[
                        { label: 'بدهکار', value: 'debtor' },
                        { label: 'بستانکار', value: 'creditor' }
                      ]}
                      required={!!(values.PartyMoreDetail?.isSalesIntermediary && values.PartyMoreDetail?.salesIntermediaryBalance && String(values.PartyMoreDetail.salesIntermediaryBalance).trim() !== '' && String(values.PartyMoreDetail.salesIntermediaryBalance).trim() !== '0')}
                      error={errors.salesIntermediaryBalanceStatus}
                      disabled={isUsed || !(values.PartyMoreDetail?.isSalesIntermediary)}
                      labelWidth="65px"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'PartyRelatedPersons',
          label: 'افراد مرتبط',
          content: (
            <TabCellRow 
              tabs={[
                {
                  id: 'PartyRelatedPersons',
                  label: 'افراد مرتبط',
                  columns: [
                    { key: 'firstName', header: 'نام', type: 'text' },
                    { key: 'lastName', header: 'نام خانوادگی', type: 'text' },
                    { key: 'relation', header: 'نسبت', type: 'text' },
                    { key: 'nationalCode', header: 'کد ملی', type: 'number' },
                    { key: 'phone', header: 'شماره تلفن', type: 'text' },
                    { key: 'description', header: 'توضیحات', type: 'text' }
                  ]
                }
              ]}
              value={values.PartyRelatedPersons}
              onChange={(val) => handleChange('PartyRelatedPersons', val)}
              hideHeader={true}
              className="flex-1 min-h-0 w-full border-none shadow-none rounded-none"
            />
          )
        },
        {
          id: 'PartyAddresses',
          label: 'نشانی',
          content: (
            <TabCellRow 
              tabs={[
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
                  ]
                }
              ]}
              value={values.PartyAddresses}
              onChange={(val) => handleChange('PartyAddresses', val)}
              hideHeader={true}
              className="flex-1 min-h-0 w-full border-none shadow-none rounded-none"
            />
          )
        },
        {
          id: 'PartyPhones',
          label: 'تلفن',
          content: (
            <TabCellRow 
              tabs={[
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
                  ]
                }
              ]}
              value={values.PartyPhones}
              onChange={(val) => handleChange('PartyPhones', val)}
              hideHeader={true}
              className="flex-1 min-h-0 w-full border-none shadow-none rounded-none"
            />
          )
        },
        {
          id: 'PartyOtherInfo',
          label: 'سایر اطلاعات',
          content: (
            <div className="flex-1 min-h-0 flex flex-col w-full">
              <TabSimpleRow 
                tabs={[
                  {
                    id: 'PartyOtherInfo',
                    label: 'سایر اطلاعات',
                    fields: [
                      { name: 'passportNumber', label: 'شماره گذرنامه', type: 'text', disabled: !isRealPerson },
                      { name: 'website', label: 'آدرس وبسایت', type: 'website' },
                      { name: 'email', label: 'آدرس ایمیل', type: 'email' },
                      { name: 'marriageDate', label: 'تاریخ ازدواج', type: 'date', disabled: !isRealPerson },
                      { name: 'birthDate', label: 'تاریخ تولد', type: 'date', disabled: !isRealPerson }
                    ]
                  }
                ]}
                values={values.PartyOtherInfo || {}}
                onChange={(fieldName, val) => {
                  handleChange('PartyOtherInfo', {
                    ...(values.PartyOtherInfo || {}),
                    [fieldName]: val
                  });
                }}
                hideHeader={true}
                showActions={false}
                className="flex-1 min-h-0 w-full border-none shadow-none rounded-none"
              />
            </div>
          )
        }
      ]}
    />
    </>
  );
}
