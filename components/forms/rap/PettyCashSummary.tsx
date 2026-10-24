"use client";

import React, { useState, useEffect } from "react";
import { useConfirm } from '@/components/ConfirmProvider';
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { FieldConfig } from "../SimpleFormTwoRow";
import { useLanguage } from "../../Providers";
import { useTabs } from "../../TabsProvider";
import { useToast } from "../../ToastProvider";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { SimpleSelectDropDown } from "../../inputs/SimpleSelectDropDown";
import { AmountInput } from "../../inputs/AmountInput";
import { NumberInput } from "../../inputs/NumberInput";
import { DateInput } from "../../inputs/DateInput";
import { ReasonSingleDropDown } from "../../inputs/ReasonSingleDropDown";
import { TextArea } from "../../inputs/TextArea";
import { apiFetch, toEnglishDigits, gregorianToJalaliDisplay, jalaliToGregorianISO } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import moment from "moment";
import momentJalaali from "moment-jalaali";
import { FileText } from "lucide-react";
import { TabCellRow } from "../TabCellRow";
import { PrintDropdownButton } from "../../buttons/PrintDropdownButton";
import { VoucherActionButtons } from "../../buttons/VoucherActionButtons";
import { DocumentAccountingInfoModal } from "../../ui/DocumentAccountingInfoModal";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateVoucherInitialDataFromAccountingInfo } from "@/lib/voucher-utils";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";
import { usePettyCashSummaryColumns } from "./PettyCashSummaryList";

interface PettyCashSummaryFormProps {
  id?: number | string;
}

export function PettyCashSummaryForm({ id }: PettyCashSummaryFormProps) {
  const { confirm } = useConfirm();
  const rawListColumns = usePettyCashSummaryColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const [isAccModalOpen, setIsAccModalOpen] = React.useState(false);

  const { t } = useLanguage();
  const { removeTab, addTab } = useTabs();
  const { showToast } = useToast();
  const { activeId, method, getUrl, handleResponse, setActiveId } =
    useFormUpsert(id as any);
  const isUpdate = !!activeId;
  const activeIdRef = React.useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const [values, setValues] = useState<Record<string, any>>({
    pettyCashRef: null,
    pettyCashLimit: 0,
    currentBalance: 0,
    number: "",
    date: momentJalaali().format("jYYYY/jMM/jDD"),
    description: "",
    state: 1,
    voucherHeaderRef: null,
    items: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);

  const [associatedVoucher, setAssociatedVoucher] = useState<any>(null);
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
  const isReadonly = !!associatedVoucher || isFormDisabledDueToFiscalYear;
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);
  const [isDeletingVoucher, setIsDeletingVoucher] = useState(false);

  useEffect(() => {
    if (associatedVoucher && String(values.state) !== "8") {
      setValues(prev => ({ ...prev, state: "8" }));
    }
  }, [associatedVoucher, values.state]); // sync state 8 effect
  
  
  
  const loadAssociatedVoucher = async () => {
    const currentId = activeIdRef.current;
    if (!currentId) {
      setAssociatedVoucher(null);
      return;
    }
    try {
      let currentVoucherHeaderRef = values.voucherHeaderRef;
      
      if (currentId) {
        const parentRes = await apiFetch(`/api/rap/petty-cash-summaries/${currentId}`);
        if (parentRes.ok) {
          if (activeIdRef.current !== currentId) return;
          const parentData = await parentRes.json();
          const pData = parentData.data || parentData;
          currentVoucherHeaderRef = pData.voucherHeaderRef || null;
          setValues(prev => ({
            ...prev,
            state: pData.state !== undefined ? pData.state : prev.state,
            voucherHeaderRef: pData.voucherHeaderRef || null
          }));
        }
      }

      if (currentVoucherHeaderRef) {
        const vRes = await apiFetch(`/api/accounting/vouchers/${currentVoucherHeaderRef}`);
        if (vRes.ok) {
          if (activeIdRef.current !== currentId) return;
          const vData = await vRes.json();
          setAssociatedVoucher(vData.data || vData);
          return;
        }
      }

      const res = await apiFetch("/api/accounting/vouchers");
      if (res.ok) {
        if (activeIdRef.current !== currentId) return;
        const vouchers = await res.json();
        const list = vouchers.data || vouchers;
        const matched = list.find(
          (v: any) =>
            
            (currentVoucherHeaderRef && String(v.voucherId) === String(currentVoucherHeaderRef)),
        );
        setAssociatedVoucher(matched || null);
      }
    } catch (error) {
      console.error("Error fetching associated voucher:", error);
    }
  };

  useEffect(() => {
    loadAssociatedVoucher();
  }, [activeId, values.voucherHeaderRef]);

  const handleVoucherInsert = async () => {
    setIsVoucherLoading(true);
    try {
      const initialData = await generateVoucherInitialDataFromAccountingInfo(
        "PettyCashSummary",
        Number(id || activeId),
        values,
        false,
        "بابت خلاصه تنخواه شماره",
      );
      addTab("سند حسابداری جدید", "accounting", null, "Voucher", {
        initialData,
      });
    } finally {
      setIsVoucherLoading(false);
    }
  };

  const handleVoucherView = () => {
    if (associatedVoucher) {
      const finalId = associatedVoucher.voucherId || associatedVoucher.id;
      addTab(
        `مشاهده سند ${associatedVoucher.voucherNumber || finalId}`,
        "accounting",
        null,
        "Voucher",
        { id: finalId },
      );
    }
  };

  const handleVoucherEdit = () => {
    if (associatedVoucher) {
      const finalId = associatedVoucher.voucherId || associatedVoucher.id;
      addTab(
        `ویرایش سند ${associatedVoucher.voucherNumber || finalId}`,
        "accounting",
        null,
        "Voucher",
        { id: finalId, isExistingItemsReadOnly: true },
      );
    }
  };

  const handleVoucherDelete = async () => {
    if (associatedVoucher) {
      const finalId = associatedVoucher.voucherId || associatedVoucher.id;
      const voucherNum = associatedVoucher.voucherNumber || associatedVoucher.number || '';
      
      const isConfirmed = await confirm({
        title: 'حذف سند',
        message: `از حذف سند شماره ${voucherNum} اطمینان دارید؟`,
        confirmText: 'بلی',
        cancelText: 'خیر'
      });
      
      if (isConfirmed) {
        setIsDeletingVoucher(true);
        try {
          const currentId = activeIdRef?.current || id;
          if (currentId) {
            const apiPath = 'petty-cash-summaries';
            
            // 1. Update document to clear voucherHeaderRef and set state back to 1
            const updateRes = await apiFetch(`/api/rap/${apiPath}/${currentId}`, {
              method: 'PUT',
              body: JSON.stringify({ state: 1, voucherHeaderRef: null })
            });
            
            if (updateRes.ok) {
              // 2. Delete the voucher
              const res = await apiFetch(`/api/accounting/vouchers/${finalId}`, { method: 'DELETE' });
              if (res.ok) {
                showToast(`حذف سند شماره ${voucherNum} با موفقیت انجام گردید.`, 'success');
                
                if (typeof setValues === 'function') {
                  setValues((prev: any) => ({ ...prev, state: 1, voucherHeaderRef: null }));
                }
                if (typeof eventBus !== 'undefined') {
                  eventBus.emit(EVENTS.DATA_CHANGED);
                }
                setAssociatedVoucher(null);
                if (typeof loadAssociatedVoucher === 'function') {
                  loadAssociatedVoucher();
                }
              } else {
                showToast('خطا در حذف سند حسابداری', 'error');
              }
            } else {
              showToast('خطا در بروزرسانی مدرک جهت حذف سند', 'error');
            }
          }
        } catch (err) {
          console.error("Error deleting voucher:", err);
          showToast('خطا در عملیات حذف سند', 'error');
        } finally {
          setIsDeletingVoucher(false);
        }
      }
    }
  };

  
  useEffect(() => {
    if (!isUpdate && values.date) {
      apiFetch(`/api/rap/petty-cash-summaries/next-numbers?date=${values.date}`)
        .then((res) => res.json())
        .then((data) => {
          setIsDocumentNoAuto(data.isDocumentNumberAuto);
          if (data.error) {
            showToast(data.error, "error");
          }
          if (data.isDocumentNumberAuto) {
            setValues((prev) => ({ ...prev, number: data.documentNumber }));
          }
        })
        .catch(console.error);
    }
  }, [values.date, isUpdate, refreshNumberingTrigger]);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/petty-cash-summaries/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (
            data.error ||
            data.statusCode >= 400 ||
            (data.data && data.data.statusCode >= 400)
          ) {
            showToast("خطا در واکشی اطلاعات فرم", "error");
            return;
          }
          const item = data.data || data;
          setValues({
            pettyCashRef: item.pettyCashRef || null,
            pettyCashRef_title: item.pettyCash
              ? `${item.pettyCash.title || ""} (${[item.pettyCash.party?.firstName, item.pettyCash.party?.lastName].filter(Boolean).join(" ")})`
              : "",
            pettyCashLimit: item.pettyCash?.pettyCashLimit || 0,
            currentBalance: item.pettyCash?.currentBalance || 0,
            number: item.number || "",
            date: item.date
              ? gregorianToJalaliDisplay(item.date)
              : "",
            description: item.description || "",
            state: item.state || 1,
            voucherHeaderRef: item.voucherHeaderRef || null,
            items: (item.items || []).map((it: any) => ({
              ...it,
              reasonRef_title: it.reason?.Title || it.reason?.title || it.reasonRef_title,
              paymentReceiptDate: it.paymentReceiptDate 
                ? gregorianToJalaliDisplay(it.paymentReceiptDate)
                : "",
            })),
          });
        })
        .catch(console.error);
    }
  }, [activeId]);

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
    if (!values.pettyCashRef)
      newErrors.pettyCashRef = "انتخاب تنخواه گردان الزامی است";
    if (!values.date) newErrors.date = "تاریخ الزامی است";
    if (!values.number) newErrors.number = "شماره الزامی است";

    if (values.items && values.items.length > 0) {
      for (let i = 0; i < values.items.length; i++) {
        const item = values.items[i];
        if (!item.reasonRef) {
          showToast(`ردیف ${i + 1}: انتخاب بابت الزامی است`, "error");
          return false;
        }
        if (!item.paymentReceiptNumber) {
          showToast(
            `ردیف ${i + 1}: وارد کردن شماره برگ پرداخت الزامی است`,
            "error",
          );
          return false;
        }
        if (!item.paymentReceiptDate) {
          showToast(
            `ردیف ${i + 1}: وارد کردن تاریخ برگ پرداخت الزامی است`,
            "error",
          );
          return false;
        }
        if (!item.amount || Number(item.amount) <= 0) {
          showToast(
            `ردیف ${i + 1}: وارد کردن مبلغ پرداخت معتبر الزامی است`,
            "error",
          );
          return false;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitData = async () => {
    if (!validate()) return null;

    setIsSubmitting(true);
    try {
      const url = getUrl("/api/rap/petty-cash-summaries");

      const payload: any = {
        ...values,
        pettyCashRef: Number(values.pettyCashRef),
        number: Number(values.number),
        state: Number(values.state),
      };

      if (payload.date) {
        const iso = jalaliToGregorianISO(payload.date);
        if (iso) payload.date = iso;
        else delete payload.date;
      }

      if (payload.items && payload.items.length > 0) {
        payload.items = payload.items.map((it: any) => {
          let rDate = null;
          if (it.paymentReceiptDate) {
            rDate = jalaliToGregorianISO(it.paymentReceiptDate) || null;
          }
          return {
            ...it,
            amount: Number(it.amount || 0),
            reasonRef: it.reasonRef ? Number(it.reasonRef) : null,
            paymentReceiptDate: rDate,
          };
        });
      }

      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "خطا در ذخیره خلاصه تنخواه");
      }

      const result = await res.json();
      showToast("خلاصه تنخواه با موفقیت ذخیره شد", "success");
      eventBus.emit(EVENTS.DATA_CHANGED, { entity: "PettyCashSummary" });
      handleResponse(result, "pettyCashSummaryId");
      
      const savedId = activeId || result?.data?.pettyCashSummaryId || result?.pettyCashSummaryId;
      if (savedId) {
        try {
          const freshRes = await apiFetch(`/api/rap/petty-cash-summaries/${savedId}`);
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            if (freshData && freshData.data) {
              setValues((prev: any) => ({
                ...prev,
                items: freshData.data.items || []
              }));
            }
          }
        } catch (err) {
          console.error("Failed to refresh items after save", err);
        }
      }
      
      return result;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره سیستم", "error");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields: FieldConfig[] = [
    {
      name: "pettyCashRef",
      label: "نام تنخواه گردان",
      type: "custom",
      required: true,
      customComponent: (
        <div className="flex-1 w-full">
          <SingleSelectDropDown
            listApiUrl="/api/rap/petty-cashes"
            columns={[
              { key: "pettyCashId", label: "کد", width: 80 },
              { key: "title", label: "نام تنخواه", width: 150 },
              {
                key: "party.lastName",
                label: "نام و نام خانوادگی تنخواه دار",
                width: 150,
                renderItem: (item: any) =>
                  [item.party?.firstName, item.party?.lastName]
                    .filter(Boolean)
                    .join(" "),
              },
              { key: "pettyCashLimit", label: "سقف تنخواه", width: 120 },
              { key: "currentBalance", label: "مانده تنخواه", width: 120 },
            ]}
            displayKey="title"
            value={
              values?.pettyCashRef
                ? {
                    pettyCashId: values.pettyCashRef,
                    title: values.pettyCashRef_title || "انتخاب شده",
                  }
                : null
            }
            onChange={(item: any) => {
              if (item) {
                handleChange("pettyCashRef", item.pettyCashId || item.id);
                handleChange(
                  "pettyCashRef_title",
                  `${item.title || ""} (${[item.party?.firstName, item.party?.lastName].filter(Boolean).join(" ")})`,
                );
                handleChange("pettyCashLimit", item.pettyCashLimit || 0);
                handleChange("currentBalance", item.currentBalance || 0);
              } else {
                handleChange("pettyCashRef", null);
                handleChange("pettyCashRef_title", "");
                handleChange("pettyCashLimit", 0);
                handleChange("currentBalance", 0);
              }
            }}
          />
        </div>
      ),
    },
    {
      name: "_number_and_date",
      label: "",
      labelWidth: "0px",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0 pr-[4px]">
            <NumberInput
              name="number"
              label="شماره"
              labelWidth="130px"
              value={values.number || ""}
              required
              disabled={isDocumentNoAuto}
              onChange={(val) => handleChange("number", val)}
            />
          </div>
          <div className="flex-1 min-w-0 pr-[4px]">
            <DateInput
              name="date"
              label="تاریخ"
              labelWidth="40px"
              value={values.date || ""}
              required
              onChange={(val) => handleChange("date", val)}
            />
          </div>
        </div>
      ),
    },
    {
      name: "_readonly_amounts",
      label: "",
      labelWidth: "0px",
      type: "custom",
      customComponent: (
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 min-w-0">
            <AmountInput
              name="pettyCashLimit"
              label="سقف تنخواه"
              labelWidth="130px"
              value={String(values.pettyCashLimit || "")}
              readOnly={true}
              onChange={() => {}}
            />
          </div>
          <div className="flex-1 min-w-0 pr-[4px]">
            <AmountInput
              name="currentBalance"
              label="مانده تنخواه"
              labelWidth="75px"
              value={String(values.currentBalance || "")}
              readOnly={true}
              onChange={() => {}}
            />
          </div>
        </div>
      ),
    },
    {
      name: "state",
      label: "وضعیت",
      type: "select",
      options: [
        { value: "1", label: "ثبت اولیه" },
        { value: "2", label: "تایید شده" },
        ...(String(values.state) === "8" ? [{ value: "8", label: "سند حسابداری" }] : []),
      ],
    },
    {
      name: "description",
      label: "شرح",
      type: "custom",
      colSpan: 2,
      customComponent: (
        <TextArea
          value={values.description || ""}
          onChange={(val) => handleChange("description", val)}
          rows={1}
          className="h-[40px]"
        />
      ),
    },
  ];

  const itemColumns = [
    {
      key: "reasonRef",
      header: "بابت",
      required: true,
      type: "custom" as const,
      width: "20%",
      render: (row: any, rowIndex: number, onChange: (val: any) => void) => (
        <ReasonSingleDropDown
          label={"" as any}
          value={
            row.reasonObj ||
            (row.reasonRef
              ? {
                  id: row.reasonRef,
                  Title: row.reasonRef_title || "انتخاب شده",
                }
              : null)
          }
          onChange={(item: any) => {
            row.reasonObj = item;
            row.reasonRef_title = item?.Title;
            onChange(item ? item.RapReasonID : null);
          }}
          noWrapper
          className="h-full"
          displayKey="Title"
        />
      ),
    },
    {
      key: "paymentReceiptNumber",
      header: "شماره برگ پرداخت",
      required: true,
      type: "text" as const,
      width: "15%",
    },
    {
      key: "paymentReceiptDate",
      header: "تاریخ برگ پرداخت",
      required: true,
      type: "custom" as const,
      width: "15%",
      render: (row: any, rowIndex: number, onChange: any) => (
        <DateInput
          value={row.paymentReceiptDate || ""}
          onChange={(val) => {
            row.paymentReceiptDate = val;
            onChange?.(val);
          }}
          labelWidth="0px"
        />
      ),
    },
    {
      key: "amount",
      header: "مبلغ پرداخت",
      required: true,
      type: "amount" as const,
      width: "15%",
      render: (row: any, rowIndex: number, onChange: any) => (
        <AmountInput
          name={`amount-${rowIndex}`}
          value={String(row.amount || "")}
          onChange={(val) => {
            row.amount = val;
            onChange?.(val);
          }}
          labelWidth="0px"
        />
      ),
    },
    { key: "description", header: "شرح", type: "text" as const, width: "35%" },
  ];

  return (
    <>
      <LoadingOverlay visible={isDeletingVoucher} message="در حال حذف سند..." />
      <LoadingOverlay
        visible={isVoucherLoading}
        message="در حال بارگذاری سند حسابداری"
      />
      
      <SimpleFormTwoRowTabbed
        hasDateInput={true}
        isReadonly={isReadonly}
        title={activeId ? "ویرایش خلاصه تنخواه" : "خلاصه تنخواه جدید"}
        icon={<FileText className="w-4 h-4" />}
        headerGradient="from-indigo-600 to-indigo-500"
        labelWidth="130px"
        fields={fields}
        values={values}
        onChange={handleChange}
        errors={errors}
        onSave={submitData}
        onSaveNew={async () => {
          const r = await submitData();
          if (r) {
            activeIdRef.current = undefined;
            setActiveId(null);
            setValues({
              pettyCashRef: null,
              pettyCashLimit: 0,
              currentBalance: 0,
              number: "",
              date: momentJalaali().format("jYYYY/jMM/jDD"),
              description: "",
              state: 1,
              items: [],
            });
            setRefreshNumberingTrigger((prev) => prev + 1);
          }
        }}
        onNew={() => {
          activeIdRef.current = undefined;
          setAssociatedVoucher(null);
          setActiveId(null);
          setValues({
            pettyCashRef: null,
            pettyCashLimit: 0,
            currentBalance: 0,
            number: "",
            date: momentJalaali().format("jYYYY/jMM/jDD"),
            description: "",
            state: 1,
            items: [],
          });
          setRefreshNumberingTrigger((prev) => prev + 1);
        }}
        onSaveClose={async () => {
          const r = await submitData();
          if (r) removeTab(`pettycashsummary-${activeId || "new"}`);
        }}
        listApiUrl="/api/rap/petty-cash-summaries"
        listColumns={listColumns}
        listDisplayKey="number"
        onListSelect={(item: any) => {
          if (activeId !== item.pettyCashSummaryId) {
            addTab(
              `خلاصه تنخواه ${item.number || item.pettyCashSummaryId}`,
              "rap",
              <FileText />,
              "PettyCashSummaryForm",
              { id: item.pettyCashSummaryId || item.id }
            );
          }
        }}
        isSubmitting={isSubmitting}
        tabResetTrigger={activeId}
        defaultBottomTabId="details"
        bottomTabs={[
          {
            id: "details",
            label: "جزئیات",
            content: (
              <div className="flex flex-col flex-1 min-h-0 w-full h-full p-0 m-0">
                <TabCellRow
                  tabs={[
                    { id: "items", label: "جزئیات", columns: itemColumns },
                  ]}
                  value={values.items || []}
                  className="flex-1 w-full h-full border-none rounded-none shadow-none m-0 p-0"
                  onChange={(newData) => handleChange("items", newData)}
                  isReadonly={isReadonly}
                  hideHeader={true}

                  footerActions={
                    <button
                      type="button"
                      onClick={() => setIsAccModalOpen(true)}
                      className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center"
                      title="اطلاعات حسابداری"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  }
                />
              </div>
            ),
          },
        ]}
        actionbar={
          <div className="flex items-center gap-1.5">
            <VoucherActionButtons
              action="insert"
              onClick={handleVoucherInsert}
              disabled={!activeId || !!associatedVoucher || String(values.state) !== "2"}
            />
            <VoucherActionButtons
              action="view"
              onClick={handleVoucherView}
              disabled={!activeId || !associatedVoucher}
            />
            <VoucherActionButtons
              action="edit"
              onClick={handleVoucherEdit}
              disabled={!activeId || !associatedVoucher}
            />
            <VoucherActionButtons
              action="delete"
              onClick={handleVoucherDelete}
              disabled={!activeId || !associatedVoucher}
            />
            <PrintDropdownButton
              targetForm="PettyCashSummary"
              disabled={!activeId}
            />

            <DocumentAccountingInfoModal
              isOpen={isAccModalOpen}
              onClose={() => setIsAccModalOpen(false)}
              documentType="PettyCashSummary"
              documentRef={activeId ? Number(activeId) : null}
            />
          </div>
        }
      />
    </>
  );
}

export default PettyCashSummaryForm;
