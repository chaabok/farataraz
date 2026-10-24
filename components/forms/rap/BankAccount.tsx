"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow } from "../SimpleFormTwoRow";
import { NumberInput } from "../../inputs/NumberInput";
import { TextInput } from "../../inputs/TextInput";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { DateInput } from "../../inputs/DateInput";
import { AmountInput } from "../../inputs/AmountInput";
import { ShabaNumberInput } from "../../inputs/ShabaNumberInput";
import { Checkbox } from "../../inputs/Checkbox";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { useLanguage } from "../../Providers";
import { eventBus, EVENTS } from "@/lib/events";
import { apiFetch, toEnglishDigits } from "@/lib/utils";
import { Banknote, Building2, CreditCard } from "lucide-react";
import moment from "moment-jalaali";
import { useFormUpsert } from "@/hooks/useFormUpsert";

export function BankAccountForm({ entityId = null }: { entityId?: string | null }) {
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(entityId);
  const { isUsed } = useFormUsageCheck("BankAccount", activeId);

  const [refreshNumbering, setRefreshNumbering] = useState(0);

  const [formData, setFormData] = useState<any>({
    bankAccountId: "",
    bankBranchRef: null,
    bankAccountTypeRef: null,
    accountNumber: "",
    title: "",
    latinTitle: "",
    shabaNumber: "",
    detailedCode: "",
    accountRef: null,
    subsidiaryLatinTitle: "", // temp field for display
    currencyRef: null,
    initialBalance: 1,
    openingDate: "",
    accountHolderName: "",
    isActive: true,
    isTitleManual: false, // track if user edited title manually
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch default currency and next detailed code for new records
  useEffect(() => {
    if (!activeId) {
      // 1. Fetch Currency
      apiFetch('/api/common/base-settings/tab/2')
        .then(res => res.json())
        .then(async (result) => {
          const settings = result.data || {};
          const defaultCurrencyCandidate = settings.defaultCurrency;
          if (defaultCurrencyCandidate) {
            const currRes = await apiFetch('/api/common/currencies');
            if (currRes.ok) {
              const currData = await currRes.json();
              const currencies = Array.isArray(currData) ? currData : (currData.items || currData.data || []);
              const candidateTitle = typeof defaultCurrencyCandidate === 'object' ? defaultCurrencyCandidate.title : defaultCurrencyCandidate;
              const baseCurr = currencies.find((c: any) => c.title === candidateTitle || c.titleEn === candidateTitle || c.code === candidateTitle);
              if (baseCurr) {
                setFormData((prev: any) => ({ ...prev, currencyRef: baseCurr }));
              }
            }
          }
        })
        .catch(console.error);

      // 2. Fetch Next Detailed Code (Detailed Type '1' is Bank Account)
      apiFetch('/api/accounting/detailed-types')
        .then(res => res.json())
        .then(data => {
            const items = data.items || data.data || data;
            const typeBank = items?.find((t: any) => String(t.code) === '1');
            if (typeBank) {
                const typeId = typeBank.detailedTypesId || typeBank.detailedTypeID;
                return apiFetch(`/api/common/detailed-accounts-numbering/next-code/${typeId}`);
            }
            return null;
        })
        .then(res => res ? res.json() : null)
        .then(data => {
            if (data && data.data) {
                setFormData((prev: any) => ({ ...prev, detailedCode: data.data }));
            }
        })
        .catch(console.error);
    }
  }, [activeId, refreshNumbering]);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/bank-accounts/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setFormData({
            bankAccountId: item.bankAccountId || "",
            bankBranchRef: item.bankBranch || item.bankBranchRef || null,
            bankBranchRef_title: item.bankBranch?.title || "",
            bankBranchRef_bankTitle: item.bankBranch?.bank?.title || "",
            bankAccountTypeRef: item.bankAccountType || item.bankAccountTypeRef || null,
            accountNumber: item.accountNumber || "",
            title: item.title || "",
            latinTitle: item.latinTitle || "",
            shabaNumber: item.shabaNumber || "",
            detailedCode: item.detailedCode || "",
            accountRef: item.account || item.accountRef || null,
            subsidiaryLatinTitle: item.account?.title_en || "", 
            currencyRef: item.currency || item.currencyRef || null,
            initialBalance: item.initialBalance || 1,
            openingDate: item.openingDate || "",
            accountHolderName: item.accountHolderName || "",
            isActive: item.isActive !== undefined ? item.isActive : true,
            isTitleManual: !!item.title, // Treat existing title as manual to avoid overriding on load
          });
        })
        .catch(console.error);
    }
  }, [activeId]);

  // Calculate Title automatically
  useEffect(() => {
    if (formData.isTitleManual && formData.title) return;

    let newTitle = "";
    const acc = formData.accountNumber || "";
    const bank = formData.bankBranchRef_bankTitle || "";
    const branch = formData.bankBranchRef_title || "";

    if (acc || bank || branch) {
      // Format: شماره حساب ..... عنوان بانک ..... شعبه .....
      newTitle = `شماره حساب ${acc} ${bank} شعبه ${branch}`.replace(/\s+/g, ' ').trim();
    }
    
    if (newTitle && newTitle !== formData.title) {
      setFormData((prev: any) => ({ ...prev, title: newTitle }));
    }
  }, [formData.bankBranchRef_bankTitle, formData.bankBranchRef_title, formData.accountNumber, formData.isTitleManual]);

  const validate = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.bankBranchRef) newErrors.bankBranchRef = "بانک و شعبه الزامی است";
    if (!formData.bankAccountTypeRef) newErrors.bankAccountTypeRef = "نوع حساب الزامی است";
    if (!formData.accountNumber) newErrors.accountNumber = "شماره حساب الزامی است";
    if (!formData.title) newErrors.title = "عنوان الزامی است";
    if (!formData.currencyRef) newErrors.currencyRef = "نوع ارز الزامی است";
    if (activeId && !formData.detailedCode) newErrors.detailedCode = "کد تفصیلی الزامی است";

    // Duplicate Check
    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await apiFetch("/api/rap/bank-accounts");
        if (res.ok) {
          const listData = await res.json();
          const list = Array.isArray(listData) ? listData : (listData.items || listData.data || []);
          
          const duplicateTitle = list.find((item: any) => 
            item.title?.trim() === formData.title?.trim() && 
            String(item.bankAccountId) !== String(activeId || '')
          );
          if (duplicateTitle) {
            newErrors.title = "این عنوان قبلاً ثبت شده است";
          }

          if (formData.detailedCode) {
            const duplicateCode = list.find((item: any) => 
              String(item.detailedCode) === String(toEnglishDigits(formData.detailedCode)) && 
              String(item.bankAccountId) !== String(activeId || '')
            );
            if (duplicateCode) {
               newErrors.detailedCode = "کد تفصیلی تکراری است";
            }
          }
        }
      } catch (err) {
        console.error("Validation check failed", err);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    const isValid = await validate();
    if (!isValid) return null;
    setIsSubmitting(true);
    
    try {
      const url = getUrl("/api/rap/bank-accounts");

      const getRefId = (val: any, idKey: string) => {
        if (typeof val === 'object' && val !== null) return val[idKey];
        return val;
      };

      const payload = { 
        ...formData,
        bankBranchRef: Number(toEnglishDigits(getRefId(formData.bankBranchRef, 'bankBranchId'))),
        bankAccountTypeRef: Number(toEnglishDigits(getRefId(formData.bankAccountTypeRef, 'bankAccountTypeId'))),
        detailedCode: formData.detailedCode ? Number(toEnglishDigits(formData.detailedCode)) : null,
        initialBalance: formData.initialBalance ? Number(toEnglishDigits(formData.initialBalance)) : 0,
        accountRef: formData.accountRef ? Number(toEnglishDigits(getRefId(formData.accountRef, 'id'))) : null,
        currencyRef: formData.currencyRef ? Number(toEnglishDigits(getRefId(formData.currencyRef, 'currencyID'))) : null,
        latinTitle: formData.latinTitle?.trim() && formData.latinTitle !== 'EMPTY_STRING' ? formData.latinTitle.trim() : null,
        shabaNumber: formData.shabaNumber?.trim() && formData.shabaNumber !== 'EMPTY_STRING' ? formData.shabaNumber.trim() : null,
        accountHolderName: formData.accountHolderName?.trim() && formData.accountHolderName !== 'EMPTY_STRING' ? formData.accountHolderName.trim() : null,
      };

      // Handle openingDate - convert from Persian string to Gregorian ISO
      if (formData.openingDate) {
        const cleanDate = toEnglishDigits(formData.openingDate).replace(/-/g, '/');
        const m = moment(cleanDate, 'jYYYY/jMM/jDD', true);
        if (m.isValid()) {
          payload.openingDate = m.toDate();
        } else {
          // Try standard Gregorian fallback
          const m2 = moment(cleanDate, 'YYYY/MM/DD', true);
          if (m2.isValid()) {
            payload.openingDate = m2.toDate();
          }
        }
      } else {
        payload.openingDate = null;
      }

      // bankAccountId should not be sent as "" for new records
      if (!payload.bankAccountId) {
        delete payload.bankAccountId;
      } else {
        payload.bankAccountId = Number(toEnglishDigits(payload.bankAccountId));
      }

      // Cleanup internal fields
      delete payload.isTitleManual;
      delete payload.bankBranchRef_title;
      delete payload.bankBranchRef_bankTitle;
      delete payload.subsidiaryLatinTitle;

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
         const d = await res.json();
         throw new Error(d.message || 'خطا در ذخیره حساب بانکی');
      }

      const result = await res.json();
      showToast("حساب بانکی با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'BankAccount' });
      handleResponse(result, 'bankAccountId');
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره سیستم", "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    return await submitData();
  };

  const handleSaveNew = async () => {
    const res = await submitData();
    if (res) {
      setActiveId(null);
      setFormData({
        bankAccountId: "",
        bankBranchRef: null,
        bankAccountTypeRef: null,
        accountNumber: "",
        title: "",
        latinTitle: "",
        shabaNumber: "",
        detailedCode: "",
        accountRef: null,
        subsidiaryLatinTitle: "", 
        currencyRef: null,
        initialBalance: 1,
        openingDate: "",
        accountHolderName: "",
        isActive: true,
      });
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`BankAccountForm-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    setActiveId(null);
    setFormData({
      bankAccountId: "",
      bankBranchRef: null,
      bankAccountTypeRef: null,
      accountNumber: "",
      title: "",
      latinTitle: "",
      shabaNumber: "",
      detailedCode: "",
      accountRef: null,
      subsidiaryLatinTitle: "", 
      currencyRef: null,
      initialBalance: 1,
      openingDate: "",
      accountHolderName: "",
      isActive: true,
    });
    setRefreshNumbering(prev => prev + 1);
  };

  return (
    <SimpleFormTwoRow isReadonly={isUsed || false}
      title={activeId ? "ویرایش حساب بانکی" : "حساب بانکی جدید"}
      icon={<Banknote className="w-4 h-4" />}
      headerGradient="from-indigo-600 to-indigo-500"
      fields={[
        {
          name: "bankBranchRef",
          label: t("bank_and_branch") || "بانک و شعبه",
          type: "custom",
          required: true,
          disabled: isUsed || false,
          customComponent: (
            <SingleSelectDropDown
              disabled={isUsed || false}
              listApiUrl="/api/rap/bank-branchs"
              value={formData.bankBranchRef}
              valueKey="bankBranchId"
              displayKey="title"
              renderSelection={(item: any) => item ? `${item.bank?.title || item.bankTitle || ''} - ${item.title || ''}` : ""}
              onChange={(item: any) => {
                const updated = {
                  ...formData,
                  bankBranchRef: item,
                  bankBranchRef_title: item?.title || "",
                  bankBranchRef_bankTitle: (item?.bank?.title || item?.bankTitle || "")
                };
                setFormData(updated);
              }}
              columns={[
                { key: "bank.title", label: "بانک" },
                { key: "title", label: "عنوان شعبه" },
                { key: "code", label: "کد شعبه" },
              ]}
              placeholder="انتخاب بانک و شعبه..."
              onAdd={() => {
                addTab(
                  "شعبه بانکی جدید",
                  "rap",
                  <Building2 className="w-4 h-4" />,
                  "BankBranchForm"
                );
              }}
            />
          )
        },
        {
          name: "bankAccountTypeRef",
          label: t("account_type_new") || "نوع حساب",
          type: "custom",
          required: true,
          disabled: isUsed || false,
          customComponent: (
            <SingleSelectDropDown
              disabled={isUsed || false}
              listApiUrl="/api/rap/bank-account-types"
              value={formData.bankAccountTypeRef}
              valueKey="bankAccountTypeId"
              displayKey="title"
              onChange={(item: any) => setFormData({ ...formData, bankAccountTypeRef: item })}
              columns={[
                { key: "code", label: "کد" },
                { key: "title", label: "عنوان" },
              ]}
              placeholder="انتخاب نوع حساب..."
              onAdd={() => {
                addTab(
                  "نوع حساب جدید",
                  "rap",
                  <CreditCard className="w-4 h-4" />,
                  "BankAccountTypeForm"
                );
              }}
            />
          )
        },
        {
          name: "accountNumber",
          label: t("account_number") || "شماره حساب",
          type: "number",
          required: true,
        },
        {
          name: "title",
          label: t("title_new") || "عنوان",
          type: "text",
          required: true,
        },
        {
          name: "latinTitle",
          label: t("latin_title") || "عنوان لاتین",
          type: "text",
        },
        {
          name: "shabaNumber",
          label: t("iban_number") || "شماره شبا",
          type: "custom",
          disabled: isUsed || false,
          customComponent: (
            <ShabaNumberInput
              name="shabaNumber"
              value={formData.shabaNumber}
              onChange={(val) => setFormData({ ...formData, shabaNumber: val })}
            />
          ),
        },
        {
          name: "detailedCode",
          label: t("detailed_code") || "کد تفصیلی",
          type: "number",
          required: true,
        },
        {
          name: "accountRef",
          label: t("sub_ledger_account") || "حساب معین",
          type: "custom",
          disabled: isUsed || false,
          customComponent: (
            <SingleSelectDropDown
              disabled={isUsed || false}
              listApiUrl="/api/accounting/accounts?level=3"
              value={formData.accountRef}
              valueKey="id"
              displayKey="title"
              renderSelection={(item: any) => item ? `${item.code ? item.code + ' - ' : ''}${item.title || ''}` : ""}
              onChange={(item: any) => {
                setFormData({
                  ...formData, 
                  accountRef: item,
                  subsidiaryLatinTitle: item?.title_en || ""
                });
              }}
              columns={[
                { key: "code", label: "کد معین" },
                { key: "title", label: "عنوان معین" },
                { key: "parent.code", label: "کد کل" },
                { key: "parent.title", label: "عنوان حساب کل" },
              ]}
              placeholder="انتخاب حساب معین..."
            />
          ),
        },
        {
          name: "subsidiaryLatinTitle",
          label: t("latin_sub_ledger_account") || "حساب معین لاتین",
          type: "text",
          disabled: true,
        },
        {
          name: "currencyRef",
          label: t("currency_new") || "ارز",
          type: "custom",
          required: true,
          disabled: isUsed || false,
          customComponent: (
            <SingleSelectDropDown
              disabled={isUsed || false}
              id="currencyRef"
              listApiUrl="/api/common/currencies"
              value={formData.currencyRef}
              valueKey="currencyID"
              displayKey="title"
              onChange={(item: any) => setFormData({ ...formData, currencyRef: item })}
              columns={[
                { key: "code", label: "کد ارز" },
                { key: "title", label: "عنوان" },
                { key: "titleEn", label: "عنوان لاتین" },
              ]}
              placeholder="انتخاب ارز..."
              onAdd={() => {
                addTab(
                  "تعریف ارز جدید",
                  "common",
                  <Banknote className="w-4 h-4" />,
                  "CurrencyForm"
                );
              }}
            />
          ),
        },
        {
          name: "initialBalance",
          label: t("opening_balance_new") || "موجودی اولیه",
          type: "amount",
          required: true,
        },
        {
          name: "openingDate",
          label: t("account_opening_date") || "تاریخ افتتاح حساب",
          type: "date",
        },
        {
          name: "accountHolderName",
          label: t("account_holder_name") || "نام صاحب حساب",
          type: "text",
        },
        {
          name: "isActive",
          label: t("active_new") || "فعال",
          type: "checkbox",
        },
      ]}
      values={formData}
      onChange={(name, val) => {
        setFormData((prev: any) => {
          const updated = { ...prev, [name]: val };
          if (name === "title") {
            updated.isTitleManual = true;
          }
          return updated;
        });
      }}
      errors={errors}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      isSubmitting={isSubmitting}
      showListButton={true}
      listApiUrl="/api/rap/bank-accounts"
      listDisplayKey="title"
      listColumns={[
        { key: 'bankAccountId', label: 'کد حساب', width: 80 },
        { key: 'accountNumber', label: 'شماره حساب', width: 150 },
        { key: 'title', label: 'عنوان حساب', width: 200 },
      ]}
      onListSelect={(item: any) => {
        if (activeId !== String(item.bankAccountId)) {
          addTab(
            `ویرایش حساب ${item.title || ''}`,
            'rap',
            <Banknote className="w-4 h-4" />,
            "BankAccountForm",
            { entityId: String(item.bankAccountId) }
          );
        }
      }}
    />
  );
}

export default BankAccountForm;
