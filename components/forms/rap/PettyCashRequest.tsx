"use client";

import React, { useState, useEffect } from "react";
import { SimpleFormTwoRow, FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { TextInput, DateInput, Select } from "../../inputs";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { StateListInput } from "../../inputs/StateListInput";
import { PrintDropdownButton } from "../../buttons/PrintDropdownButton";
import moment from "moment-jalaali";
import { apiFetch } from "@/lib/utils";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";
import { eventBus, EVENTS } from "@/lib/events";
import { FileText } from "lucide-react";
import { usePettyCashRequestColumns } from "./PettyCashRequestList";

export default function PettyCashRequestForm({ id }: { id?: number }) {
  const rawListColumns = usePettyCashRequestColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const { t } = useLanguage();
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse, setActiveId } = useFormUpsert(id);
  const { isUsed } = useFormUsageCheck("PettyCashRequest", activeId);
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
  const isReadonly = isUsed || isFormDisabledDueToFiscalYear;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialState = {
    basis: "0", 
    status: 2, 
    requestDate: moment().locale('en').format('jYYYY/jMM/jDD'),
    pettyCashRef: null,
    pettyCashSummaryId: null,
    requestNumber: "",
    requestedAmount: 0,
    description: "",
  };

  const [values, setValues] = useState<Record<string, any>>(initialState);

  const [isAutoNumber, setIsAutoNumber] = useState(false);

  const fetchNextNumber = async (dateStr: string) => {
    if (!dateStr) return;
    try {
      const res = await apiFetch(`/api/rap/petty-cash-requests/next-numbers?date=${encodeURIComponent(dateStr)}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (data) {
          if (data.error) {
            showToast(data.error, "error");
          }
          setIsAutoNumber(!!data.isDocumentNumberAuto);
          if (data.documentNumber !== undefined && data.documentNumber !== null) {
            setValues(prev => ({
              ...prev,
              requestNumber: String(data.documentNumber)
            }));
          }
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error("Next number fetch failed:", errJson);
        throw new Error(errJson.message || errJson.error || 'خطا در دریافت شماره بعدی');
      }
    } catch (error: any) {
      console.error("Failed to fetch next number", error);
      showToast(error.message || 'خطا در دریافت شماره بعدی از سرور', 'error');
    }
  };

  useEffect(() => {
    if (!activeId) {
      fetchNextNumber(values.requestDate);
    }
  }, [values.requestDate, activeId]);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/petty-cash-requests/${activeId}`)
        .then(res => res.json())
        .then(data => {
          const item = data.data || data;
          setValues({
            ...item,
            pettyCashHolderNameReadonly: item.pettyCash?.party ? `${item.pettyCash.party.firstName || ''} ${item.pettyCash.party.lastName || ''}`.trim() : "",
            pettyCashName: item.pettyCash?.title || "",
            pettyCashBalance: item.pettyCash?.currentBalance || item.pettyCash?.initialBalance || 0,
            pettyCashCeiling: item.pettyCash?.pettyCashLimit || 0,
            currencyType: item.pettyCash?.currency?.title || "",
          });
        })
        .catch(console.error);
    }
  }, [activeId]);

  // Removed dummy effect

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!values.pettyCashRef) newErrors.pettyCashRef = "نام تنخواه دار الزامی است";
    if (!values.requestNumber) newErrors.requestNumber = "شماره الزامی است";
    if (!values.requestDate) newErrors.requestDate = "تاریخ الزامی است";
    if (values.basis === undefined || values.basis === null || values.basis === "") newErrors.basis = "مبنا الزامی است";
    if (!values.requestedAmount) newErrors.requestedAmount = "مبلغ تنخواه درخواستی الزامی است";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) return null;
    setIsSubmitting(true);
    try {
      const url = getUrl("/api/rap/petty-cash-requests");
      const payload = {
        ...values,
        pettyCashRef: Number(values.pettyCashRef),
        pettyCashSummaryRef: (String(values.basis) === "1" && values.pettyCashSummaryId) ? Number(values.pettyCashSummaryId) : null,
        requestedAmount: Number(values.requestedAmount),
        status: Number(values.status),
        basis: Number(values.basis),
      };

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "خطا در ذخیره اطلاعات");
      }

      const result = await res.json();
      showToast("اطلاعات با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PettyCashRequest' });
      handleResponse(result, 'pettyCashRequestId');
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در سیستم", "error");
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
      setValues(initialState);
      setErrors({});
    }
  };

  const handleSaveClose = async () => {
    const res = await submitData();
    if (res) {
      removeTab(`pettyCashRequest-${activeId || 'new'}`);
    }
  };

  const handleNew = () => {
    setActiveId(null);
    setValues(initialState);
    setErrors({});
  };

  const handleDelete = async () => {
    if (!activeId) return;
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/rap/petty-cash-requests/${activeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast("با موفقیت حذف شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: 'PettyCashRequest' });
      removeTab(`pettyCashRequest-${activeId}`);
    } catch (e) {
      showToast("خطا در حذف", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    {
      name: "pettyCashRef_wrapper",
      type: "custom",
      customComponent: (
        <SingleSelectDropDown
          label="نام تنخواه دار :"
          labelWidth="120px"
          required
          disabled={isReadonly}
          error={errors.pettyCashRef}
          value={values.pettyCashRef ? { id: values.pettyCashRef, name: values.pettyCashHolderNameReadonly } : null}
          onChange={(item) => {
            if (!item) {
              handleChange("pettyCashRef", null);
              handleChange("pettyCashHolderNameReadonly", "");
              handleChange("pettyCashName", "");
              handleChange("pettyCashBalance", 0);
              handleChange("pettyCashCeiling", 0);
              handleChange("currencyType", "");
              return;
            }
            handleChange("pettyCashRef", item.id || item.pettyCashId);
            handleChange("pettyCashHolderNameReadonly", item.party ? `${item.party.firstName || ''} ${item.party.lastName || ''}`.trim() : '');
            handleChange("pettyCashName", item.title);
            handleChange("pettyCashBalance", item.currentBalance || item.initialBalance || 0);
            handleChange("pettyCashCeiling", item.pettyCashLimit || 0);
            handleChange("currencyType", item.currency?.title || "ریال");
          }}
          displayKey="name"
          listApiUrl="/api/rap/petty-cashes"
          filterItem={(item: any) => item.isActive !== false}
          renderSelection={(item: any) => item.name || (item.party ? `${item.party.firstName || ''} ${item.party.lastName || ''}`.trim() : "")}
          columns={[
            { key: "detailedCode", label: "کدتفصیل", renderItem: (item: any) => item.party?.detailedCode || "" },
            { key: "name", label: "نام", renderItem: (item: any) => item.party ? `${item.party.firstName || ''} ${item.party.lastName || ''}`.trim() : "" },
            { key: "pettyCashName", label: "نام تنخواه", renderItem: (item: any) => item.title },
            { key: "pettyCashBalance", label: "مانده تنخواه", renderItem: (item: any) => item.currentBalance || 0 },
            { key: "currencyType", label: "نوع ارز", renderItem: (item: any) => item.currency?.title || "" },
          ]}
        />
      ),
    },
    {
      name: "numberAndDate_wrapper",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1">
            <TextInput
              name="requestNumber"
              label="شماره :"
              labelWidth="84px"
              required
              disabled={isAutoNumber || isReadonly}
              error={errors.requestNumber}
              value={values.requestNumber || ""}
              onChange={(val) => handleChange("requestNumber", val)}
            />
          </div>
          <div className="flex-1">
            <DateInput
              name="requestDate"
              label="تاریخ :"
              labelWidth="60px"
              required
              disabled={isReadonly}
              error={errors.requestDate}
              value={values.requestDate || ""}
              onChange={(val) => handleChange("requestDate", val)}
            />
          </div>
        </div>
      ),
    },
    {
      name: "basis_and_summary",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-4 w-full">
          <div className={String(values.basis) === "1" ? "flex-1" : "w-full"}>
            <Select
              label="مبنا :"
              labelWidth="120px"
              required
              disabled={isReadonly}
              error={errors.basis}
              value={String(values.basis)}
              onChange={(val) => handleChange("basis", val)}
              options={[
                { value: "0", label: "بدون مبنا" },
                { value: "1", label: "صورتخلاصه" },
              ]}
            />
          </div>
          {String(values.basis) === "1" && (
            <div className="flex-1">
              <SingleSelectDropDown
                label="صورتخلاصه :"
                labelWidth="120px"
                disabled={isReadonly}
                value={
                  values.pettyCashSummaryId
                    ? { id: values.pettyCashSummaryId, name: `صورتخلاصه شماره ${values.pettyCashSummaryId}` }
                    : null
                }
                onChange={(item) => handleChange("pettyCashSummaryId", item?.id || item?.pettyCashSummaryId)}
                displayKey="name"
                listApiUrl="/api/rap/petty-cash-summaries"
                renderSelection={(item: any) => item.number ? `صورتخلاصه شماره ${item.number}` : `صورتخلاصه شماره ${item.pettyCashSummaryId}`}
                columns={[
                  { key: "number", label: "شماره", renderItem: (item: any) => item.number },
                  { key: "date", label: "تاریخ", renderItem: (item: any) => item.date ? moment(item.date).format("jYYYY/jMM/jDD") : "" },
                  { key: "amount", label: "مبلغ", renderItem: (item: any) => (item.items || []).reduce((acc: any, cur: any) => acc + (cur.amount || 0), 0) },
                ]}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      name: "status",
      type: "custom",
      customComponent: (
        <StateListInput
          label="وضعیت :"
          labelWidth="84px"
          disabled={isReadonly}
          value={values.status}
          onChange={(val) => handleChange("status", val)}
        />
      ),
    },
    {
      name: "pettyCashName",
      label: "نام تنخواه",
      type: "text",
      disabled: true,
    },
    {
      name: "pettyCashBalance",
      label: "مانده تنخواه",
      type: "amount",
      disabled: true,
      labelWidth: "84px",
    },
    {
      name: "pettyCashCeiling",
      label: "سقف تنخواه",
      type: "amount",
      disabled: true,
    },
    {
      name: "currencyType",
      label: "نوع ارز",
      type: "text",
      disabled: true,
      labelWidth: "84px",
    },
    {
      name: "requestedAmount",
      label: "مبلغ تنخواه درخواستی",
      type: "amount",
      required: true,
    },
    {
      name: "description",
      label: "شرح",
      type: "textarea",
      colSpan: 2,
    },
  ];

  return (
    <SimpleFormTwoRow
      hasDateInput={true}
      title={activeId ? "ویرایش درخواست تنخواه" : "درخواست تنخواه"}
      fields={fields}
      values={values}
      onChange={handleChange}
      errors={errors}
      labelWidth="120px"
      useClassicToolbar={false}
      isSubmitting={isSubmitting}
      isReadonly={isReadonly}
      onSave={handleSave}
      onSaveNew={handleSaveNew}
      
      onNew={handleNew}
      onDelete={handleDelete}
      listApiUrl="/api/rap/petty-cash-requests"
      listColumns={listColumns}
      listDisplayKey="requestNumber"
      onListSelect={(item: any) => {
        if (activeId !== item.pettyCashRequestId && activeId !== item.id) {
          addTab(
            `درخواست تنخواه ${item.requestNumber || item.pettyCashRequestId || item.id}`,
            "rap",
            <FileText className="w-4 h-4" />,
            "PettyCashRequestForm",
            { id: item.pettyCashRequestId || item.id }
          );
        }
      }}
      showListButton={true}
      actionbar={
        <PrintDropdownButton 
          targetForm="PettyCashRequest"
          onPrint={() => {
            // Standard print logic if needed, otherwise it uses templates
          }}
        />
      }
    />
  );
}
