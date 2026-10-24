"use client";
import { eventBus, EVENTS } from '@/lib/events';

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import React, { useState, useEffect } from "react";
import { useConfirm } from '@/components/ConfirmProvider';
import moment from "moment-jalaali";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { TabCellRow, TabCellConfig, TabCellColumn } from "../TabCellRow";
import {
  NumberInput,
  DateInput,
  TextArea,
  BankAccountDropDown,
} from "../../inputs";
import { usePaidDocumentClearingColumns } from "./PaidDocumentClearingList";
import { SingleSelectDropDown } from "../../inputs/SingleSelectDropDown";
import { MultiColumnDropdown } from "@/components/inputs/MultiColumnDropdown";
import { PrintDropdownButton } from "@/components/buttons/PrintDropdownButton";
import { VoucherActionButtons } from "@/components/buttons/VoucherActionButtons";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { DocumentAccountingInfoModal } from "@/components/ui/DocumentAccountingInfoModal";
import { useRouter } from "next/navigation";
import { apiFetch, toEnglishDigits } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";
import { useOptionalTabs } from "@/components/TabsProvider";
import { generateVoucherInitialDataFromAccountingInfo } from "@/lib/voucher-utils";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { StateListInput } from "../../inputs/StateListInput";

export default function PaidDocumentClearing({ id, tabId }: { id?: string; tabId?: string }) {
  const { confirm } = useConfirm();
  const rawListColumns = usePaidDocumentClearingColumns();
  const listColumns = rawListColumns.map((c: any) => ({ ...c, label: c.header || c.label }));
  const [isAccModalOpen, setIsAccModalOpen] = React.useState(false);

  const router = useRouter();

  const [values, setValues] = useState<Record<string, any>>({
    fiscalYearRef:
      typeof window !== "undefined"
        ? localStorage.getItem("app-fiscal-year")
        : null,
    bank_account: null,
    number: "",
    date: moment().locale("en").format("jYYYY/jMM/jDD"),
    description: "",
    status: 2,
    voucherHeaderRef: null,
    items: [],
  });
  const [originalData, setOriginalData] = useState<any>(null);

  const { isUsed } = useFormUsageCheck("PaidDocumentClearing", id);
  const [associatedVoucher, setAssociatedVoucher] = useState<any>(null);
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
  const isReadonly = isUsed || !!associatedVoucher || String(values.status) === "8" || isFormDisabledDueToFiscalYear;
  const { showToast } = useToast();
  const tabsCtx = useOptionalTabs();
  const activeTabId = tabsCtx?.activeTabId;
  const addTab = tabsCtx?.addTab;

  const { activeId, setActiveId, isUpdate, method, getUrl, handleResponse } =
    useFormUpsert(id);
  const activeIdRef = React.useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [fiscalYearDetails, setFiscalYearDetails] = useState<any>(null);
  const [dateError, setDateError] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);

  const [isVoucherLoading, setIsVoucherLoading] = useState(false);
  const [isDeletingVoucher, setIsDeletingVoucher] = useState(false);

  
  
  const loadAssociatedVoucher = async () => {
    const currentId = activeIdRef.current;
    if (!currentId) {
      setAssociatedVoucher(null);
      return;
    }
    try {
      let currentVoucherHeaderRef = values.voucherHeaderRef;
      
      if (currentId) {
        const parentRes = await apiFetch(`/api/rap/paid-document-clearings/${currentId}`);
        if (parentRes.ok) {
          if (activeIdRef.current !== currentId) return;
          const parentData = await parentRes.json();
          const pData = parentData.data || parentData;
          currentVoucherHeaderRef = pData.voucherHeaderRef || null;
          setValues(prev => ({
            ...prev,
            status: pData.status !== undefined ? pData.status : prev.status,
            voucherHeaderRef: pData.voucherHeaderRef || null
          }));
          if (typeof setOriginalData === 'function') {
            setOriginalData((prev: any) => prev ? ({ ...prev, status: pData.status !== undefined ? pData.status : prev.status, voucherHeaderRef: pData.voucherHeaderRef || null }) : prev);
          }
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
  useEffect(() => {
    if (activeTabId && tabId && activeTabId === tabId) {
      loadAssociatedVoucher();
    }
  }, [activeTabId, tabId]);

  useEffect(() => {
    const handleDataChanged = () => {
      loadAssociatedVoucher();
    };
    eventBus.on(EVENTS.DATA_CHANGED, handleDataChanged);
    return () => {
      eventBus.off(EVENTS.DATA_CHANGED, handleDataChanged);
    };
  }, []);

  const handleVoucherInsert = async () => {
    setIsVoucherLoading(true);
    try {
      const initialData = await generateVoucherInitialDataFromAccountingInfo(
        "PaidDocumentClearing",
        Number(id || activeId),
        values,
        false,
        "بابت وصول اسناد پرداختنی شماره",
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
      addTab?.(
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
            const apiPath = 'paid-document-clearings';
            
            // 1. Update document to clear voucherHeaderRef and set status back to 5
            const updateRes = await apiFetch(`/api/rap/${apiPath}/${currentId}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 5, voucherHeaderRef: null })
            });
            
            if (updateRes.ok) {
              // 2. Delete the voucher
              const res = await apiFetch(`/api/accounting/vouchers/${finalId}`, { method: 'DELETE' });
              if (res.ok) {
                showToast(`حذف سند شماره ${voucherNum} با موفقیت انجام گردید.`, 'success');
                
                if (typeof setValues === 'function') {
                  setValues((prev: any) => ({ ...prev, status: 5, voucherHeaderRef: null }));
                }
                if (typeof setOriginalData === 'function') {
                  setOriginalData((prev: any) => prev ? ({ ...prev, status: 5, voucherHeaderRef: null }) : prev);
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
    if (typeof window !== "undefined") {
      setSelectedFiscalYear(localStorage.getItem("app-fiscal-year") || "");
    }
    const handleStorage = () => {
      setSelectedFiscalYear(localStorage.getItem("app-fiscal-year") || "");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (selectedFiscalYear) {
      apiFetch(`/api/common/fiscalyear/${selectedFiscalYear}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch fiscal year details");
        })
        .then((data) => {
          const detail = data?.data || data;
          if (detail && detail.startDate && detail.endDate) {
            setFiscalYearDetails({
              startDate: detail.startDate,
              endDate: detail.endDate,
            });
          }
        })
        .catch(console.error);
    }
  }, [selectedFiscalYear]);

  // validation effect
  useEffect(() => {
    if (!values?.date) {
      setDateError("");
      return;
    }
    const dateMoment = moment(toEnglishDigits(values.date), "jYYYY/jMM/jDD");
    if (!dateMoment.isValid() || values.date.length !== 10) {
      if (values.date.length !== 10) {
        setDateError("");
      } else {
        setDateError("تاریخ وارد شده نامعتبر است.");
      }
      return;
    }
    if (fiscalYearDetails) {
      const startMoment = moment(fiscalYearDetails.startDate).startOf("day");
      const endMoment = moment(fiscalYearDetails.endDate).endOf("day");
      if (startMoment.isValid() && endMoment.isValid()) {
        if (
          dateMoment.isBefore(startMoment, "day") ||
          dateMoment.isAfter(endMoment, "day")
        ) {
          const startJalali = moment(fiscalYearDetails.startDate).format(
            "jYYYY/jMM/jDD",
          );
          const endJalali = moment(fiscalYearDetails.endDate).format(
            "jYYYY/jMM/jDD",
          );
          setDateError(
            `تاریخ سند خارج از محدوده سال مالی است (بازه مجاز: از ${startJalali} تا ${endJalali})`,
          );
        } else {
          setDateError("");
        }
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [values?.date, fiscalYearDetails]);

  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/paid-document-clearings/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            const op = data.data;
            setValues({
              fiscalYearRef: op.fiscalYearRef || "",
              bank_account: op.bank_account || null,
              number: op.number || "",
              date: op.date || "",
              description: op.description || "",
              status: op.status !== undefined ? op.status : 2,
              voucherHeaderRef: op.voucherHeaderRef || null,
              items: op.items || [],
            });
          }
        });
    }
  }, [activeId]);

  const [isDocumentNoAuto, setIsDocumentNoAuto] = useState(false);

  useEffect(() => {
    if (!isUpdate && values.date) {
      apiFetch(
        `/api/rap/paid-document-clearings/next-numbers?date=${values.date}`,
      )
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

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!values.date) {
      showToast("وارد کردن تاریخ الزامی است.", "error");
      setErrors((prev: any) => ({
        ...prev,
        date: "وارد کردن تاریخ الزامی است.",
      }));
      throw new Error("VALIDATION_FAILED");
    }
    if (dateError) {
      showToast(dateError, "error");
      setErrors((prev: any) => ({ ...prev, date: dateError }));
      throw new Error("VALIDATION_FAILED");
    }
    setErrors((prev: any) => ({ ...prev, date: "" }));
    if (!values.bank_account) {
      showToast("انتخاب حساب بانکی الزامی است.", "error");
      throw new Error("VALIDATION_FAILED");
    }
    if (!values.items || values.items.length === 0) {
      showToast("وارد کردن حداقل یک ردیف در جزئیات فرم الزامی است.", "error");
      throw new Error("VALIDATION_FAILED");
    }

    for (let i = 0; i < values.items.length; i++) {
      const item = values.items[i];
      const docType = item.document_type || "cheque";
      if (!docType) {
        showToast(`ردیف ${i + 1}: انتخاب نوع الزامی است.`, "error");
        throw new Error("VALIDATION_FAILED");
      }
      if (!item.document) {
        showToast(`ردیف ${i + 1}: انتخاب شماره سند الزامی است.`, "error");
        throw new Error("VALIDATION_FAILED");
      }
    }

    setIsSaving(true);
    const payload = {
      fiscalYearRef: values.fiscalYearRef
        ? Number(values.fiscalYearRef)
        : undefined,
      bankAccountRef:
        values.bank_account?.bankAccountId || values.bank_account?.id
          ? Number(
              values.bank_account?.bankAccountId || values.bank_account?.id,
            )
          : undefined,
      number: values.number,
      date: values.date,
      description: values.description,
      status: values.status ? Number(values.status) : undefined,
      items: values.items.map((item: any) => ({
        documentType: item.document_type || "cheque",
        documentId:
          item.document?.id ||
          item.document?.paymentChequeId ||
          item.document?.paymentPromissoryNoteId
            ? Number(
                item.document?.id ||
                  item.document?.paymentChequeId ||
                  item.document?.paymentPromissoryNoteId,
              )
            : undefined,
      })),
    };
    try {
      const res = await apiFetch(getUrl("/api/rap/paid-document-clearings"), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        handleResponse(data, "paidDocumentClearingId");
        
        const savedId = activeId || data?.data?.paidDocumentClearingId || data?.paidDocumentClearingId;
        if (savedId) {
          try {
            const freshRes = await apiFetch(`/api/rap/paid-document-clearings/${savedId}`);
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
        
        showToast("اطلاعات با موفقیت ذخیره شد.", "success");
      } else {
        const errorText = await res.text();
        console.error("Failed to save", errorText);
        showToast("خطا در ذخیره سازی اطلاعات", "error");
        throw new Error(errorText);
      }
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNew = async () => {
    await handleSave();
    activeIdRef.current = undefined;
    setActiveId(undefined);
    setValues({
      fiscalYearRef:
        typeof window !== "undefined"
          ? localStorage.getItem("app-fiscal-year")
          : null,
      bank_account: null,
      number: "",
      date: moment().locale("en").format("jYYYY/jMM/jDD"),
      description: "",
      status: 2,
      items: [],
    });
  };

  const handleSaveClose = async () => {
    await handleSave();
    if (tabsCtx && tabsCtx.removeTab) {
      tabsCtx.removeTab(`PaidDocumentClearing-${id || "new"}`);
    }
  };

  const handleDelete = async (actionType: "delete" | "delete_and_new") => {
    if (!activeId) return;
    try {
      const res = await apiFetch(
        `/api/rap/paid-document-clearings/${activeId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        if (actionType === "delete_and_new") {
          setActiveId(undefined);
          setValues({
            fiscalYearRef:
              typeof window !== "undefined"
                ? localStorage.getItem("app-fiscal-year")
                : null,
            bank_account: null,
            number: "",
            date: moment().locale("en").format("jYYYY/jMM/jDD"),
            description: "",
            status: 2,
            items: [],
          });
        } else {
          if (tabsCtx && tabsCtx.removeTab) {
            tabsCtx.removeTab(`PaidDocumentClearing-${id || "new"}`);
          }
        }
      } else {
        throw new Error("delete failed");
      }
    } catch (e) {
      showToast("خطا در حذف اطلاعات", "error");
      throw e;
    }
  };

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const fields: import("../SimpleFormTwoRow").FieldConfig[] = [
    {
      name: "bank_account",
      label: "حساب بانکی",
      type: "custom",
      colSpan: 1,
      required: true,
      customComponent: (
        <BankAccountDropDown
          value={values.bank_account || null}
          onChange={(item) => handleChange("bank_account", item)}
          placeholder="انتخاب..."
          disabled={isReadonly}
        />
      ),
    },
    {
      name: "numberAndDate",
      label: "",
      labelWidth: "0px",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <div className="flex w-full items-center gap-x-2">
          <div className="flex-[1.5]">
            <NumberInput
              label="شماره"
              labelWidth="80px"
              value={values.number}
              onChange={(val) => handleChange("number", val)}
              required
              disabled={isDocumentNoAuto || isReadonly}
            />
          </div>
          <div className="flex-1">
            <DateInput
              label="تاریخ"
              labelWidth="40px"
              value={values.date}
              onChange={(val) => {
                handleChange("date", val);
                setErrors((prev: any) => ({ ...prev, date: undefined }));
              }}
              required
              disabled={isReadonly}
              error={dateError || errors?.date}
            />
          </div>
        </div>
      ),
    },
    {
      name: "description",
      label: "توضیحات",
      type: "text",
      colSpan: 1,
    },
    {
      name: "status",
      label: "وضعیت",
      type: "custom",
      colSpan: 1,
      customComponent: (
        <StateListInput
          value={values.status}
          onChange={(val) => handleChange("status", val)}
          disabled={isReadonly}
        />
      ),
    },
  ];

  const itemsColumns: TabCellColumn[] = [
    {
      key: "rowNumber",
      header: "ردیف",
      type: "custom",
      width: "45px",
      render: (row, index) => (
        <div className="w-full text-center text-gray-600 dark:text-gray-300 pt-0.5">
          {index + 1}
        </div>
      ),
    },
    {
      key: "document_type",
      header: "نوع",
      type: "custom",
      required: true,
      width: "120px",
      render: (row, index, onChange) => (
        <div className="w-full h-full py-0.5 px-1">
          <select
            value={row.document_type || "cheque"}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadonly}
            className="w-full text-xs py-0.5 px-1 focus:bg-white focus:dark:bg-gray-800 bg-transparent dark:text-gray-200 outline-none h-full min-w-0 font-sans border border-gray-300 dark:border-gray-500 rounded"
          >
            <option value="cheque">چک</option>
            <option value="promissory_note">سفته</option>
          </select>
        </div>
      ),
    },
    {
      key: "document",
      header:
        (activeRowIndex !== null
          ? values.items[activeRowIndex]?.document_type
          : values.items[0]?.document_type) === "promissory_note"
          ? "شماره سفته"
          : (activeRowIndex !== null
                ? values.items[activeRowIndex]?.document_type
                : values.items[0]?.document_type) === "cheque" ||
              !(activeRowIndex !== null
                ? values.items[activeRowIndex]?.document_type
                : values.items[0]?.document_type)
            ? "شماره چک"
            : "شماره",
      type: "custom",
      required: true,
      width: "200px",
      render: (row, index, onChange) => {
        const currentDocType = row.document_type || "cheque";
        if (currentDocType === "cheque") {
          return (
            <div className="w-full h-full flex items-center">
              <MultiColumnDropdown
                key={`cheque-${index}`}
                columns={[
                  { key: "chequeNumber", label: "شماره چک", width: 96 },
                  {
                    key: "amount",
                    label: "مبلغ",
                    width: 96,
                    renderItem: (item) =>
                      item.amount ? Number(item.amount).toLocaleString() : "",
                  },
                  { key: "dueDate", label: "تاریخ سررسید", width: 96 },
                  {
                    key: "accountingOperationTitle",
                    label: "عملیات حسابداری",
                    width: 120,
                  },
                  { key: "reasonTitle", label: "بابت", width: 120 },
                  { key: "receiverName", label: "گیرنده", width: 120 },
                ]}
                listApiUrl="/api/rap/payment-notifications/cheques/payable"
                value={row.document || null}
                onChange={(item) => onChange(item)}
                placeholder="شماره چک..."
                displayKey="chequeNumber"
                disabled={isReadonly}
                enableMultiSelection={false}
              />
            </div>
          );
        } else if (currentDocType === "promissory_note") {
          return (
            <div className="w-full h-full flex items-center">
              <MultiColumnDropdown
                key={`note-${index}`}
                columns={[
                  { key: "noteNumber", label: "شماره سفته", width: 96 },
                  {
                    key: "amount",
                    label: "مبلغ",
                    width: 96,
                    renderItem: (item) =>
                      item.amount ? Number(item.amount).toLocaleString() : "",
                  },
                  { key: "dueDate", label: "تاریخ سررسید", width: 96 },
                  {
                    key: "accountingOperationTitle",
                    label: "عملیات حسابداری",
                    width: 120,
                  },
                  { key: "reasonTitle", label: "بابت", width: 120 },
                  { key: "receiverName", label: "گیرنده", width: 120 },
                ]}
                listApiUrl="/api/rap/payment-notifications/promissory-notes/payable"
                value={row.document || null}
                onChange={(item) => onChange(item)}
                placeholder="شماره سفته..."
                displayKey="noteNumber"
                disabled={isReadonly}
                enableMultiSelection={false}
              />
            </div>
          );
        }
        return (
          <div className="text-gray-400 text-[11px] p-1">
            ابتدا نوع را انتخاب کنید
          </div>
        );
      },
    },
    {
      key: "due_date",
      header: "تاریخ سررسید",
      type: "custom",
      width: "120px",
      render: (row) => (
        <div className="w-full h-full flex items-center">
          <DateInput
            value={row.document?.dueDate || ""}
            onChange={() => {}}
            disabled={true}
          />
        </div>
      ),
    },
    {
      key: "party",
      header: "طرف حساب",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
          {row.document?.receiverName || row.document?.partyName || ""}
        </div>
      ),
    },
    {
      key: "amount",
      header: "مبلغ",
      type: "custom",
      width: "150px",
      render: (row) => {
        const title =
          row.document_type === "cheque"
            ? "مبلغ چک: "
            : row.document_type === "promissory_note"
              ? "مبلغ سفته: "
              : "";
        return (
          <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-gray-400 ml-1 text-[10px]">{title}</span>
            {row.document?.amount != null
              ? Number(row.document.amount).toLocaleString()
              : ""}
          </div>
        );
      },
    },
    {
      key: "accountingOperationTitle",
      header: "عملیات حسابداری",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div
          className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap"
          title={row.document?.accountingOperationTitle || ""}
        >
          {row.document?.accountingOperationTitle || ""}
        </div>
      ),
    },
    {
      key: "reasonTitle",
      header: "بابت",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div
          className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap"
          title={row.document?.reasonTitle || ""}
        >
          {row.document?.reasonTitle || ""}
        </div>
      ),
    },
    {
      key: "endorsement_number",
      header: "پشت نمره",
      type: "custom",
      width: "120px",
      render: (row) => {
        if (row.document_type !== "cheque") return null;
        return (
          <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
            {row.document?.endorsementNumber ||
              row.document?.endorsement_number ||
              ""}
          </div>
        );
      },
    },
    {
      key: "sayad_code",
      header: "کد صیادی",
      type: "custom",
      width: "150px",
      render: (row) => {
        if (row.document_type !== "cheque") return null;
        return (
          <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
            {row.document?.sayadCode || row.document?.sayad_code || ""}
          </div>
        );
      },
    },
  ];

  let currentColumns = [...itemsColumns];
  if (
    activeRowIndex !== null &&
    values.items[activeRowIndex]?.document_type === "promissory_note"
  ) {
    currentColumns = currentColumns.filter(
      (c) => c.key !== "endorsement_number" && c.key !== "sayad_code",
    );
  }

  const tabConfig: TabCellConfig[] = [
    {
      id: "items",
      label: "اسناد",
      columns: currentColumns,
    },
  ];

  const tabs = [
    {
      id: "details",
      label: "جزئیات",
      content: (
        <TabCellRow
          tabs={tabConfig}
          value={values.items}
          onChange={(newItems) => handleChange("items", newItems)}
          onActiveRowChange={(tabId, index, row) => setActiveRowIndex(index)}
          className="h-full border-none shadow-none rounded-none"
          hideHeader={true}
          isReadonly={isReadonly}

          footerActions={
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsAccModalOpen(true)}
                className="p-1 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300 transition-colors drop-shadow-sm flex items-center justify-center"
                title="اطلاعات حسابداری"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              {associatedVoucher && (
                <div className="flex items-center gap-4 text-xs pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-700 dark:text-white font-bold">شماره سند حسابداری:</span>
                    <span className="font-mono text-slate-800 dark:text-white">
                      {associatedVoucher.voucherNumber || associatedVoucher.number || associatedVoucher.voucherId || associatedVoucher.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-700 dark:text-white font-bold">تاریخ سند حسابداری:</span>
                    <span className="font-mono text-slate-800 dark:text-white">
                      {associatedVoucher.voucherDate || associatedVoucher.date
                        ? moment(associatedVoucher.voucherDate || associatedVoucher.date).format("jYYYY/jMM/jDD")
                        : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          }
        />
      ),
    },
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
        title="وصول اسناد پرداختنی جدید"
        fields={fields}
        values={values}
        onChange={handleChange}
        errors={errors}
        bottomTabs={tabs}
        showListButton={true}
        listApiUrl="/api/rap/paid-document-clearings"
        listColumns={listColumns}
        listDisplayKey="number"
        onListSelect={(item: any) => {
          const targetId = item.paidDocumentClearingId || item.id;
          if (activeId !== targetId) {
            if (!activeId) {
               // Update current tab if it's empty
               setActiveId(targetId);
               return;
            }
            if (addTab && tabsCtx?.activeTabId) {
              addTab(
                `ویرایش وصول اسناد پرداختنی ${item.number || targetId}`,
                "rap",
                null,
                "PaidDocumentClearing",
                { id: targetId }
              );
            } else {
              router.push(`/forms/rap/paid-document-clearing/${targetId}`);
            }
          }
        }}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        
        onDelete={handleDelete as any}
        isReadonly={isReadonly}
        onNew={() => {
          activeIdRef.current = undefined;
          setAssociatedVoucher(null);
          setActiveId(null);
          setValues({
            fiscalYearRef:
              typeof window !== "undefined"
                ? localStorage.getItem("app-fiscal-year")
                : null,
            bank_account: null,
            number: "",
            date: moment().locale("en").format("jYYYY/jMM/jDD"),
            description: "",
            status: 2,
            items: [],
          });
          setRefreshNumberingTrigger((prev) => prev + 1);
        }}
        actionbar={
          <div className="flex items-center gap-1.5 w-full">
            <VoucherActionButtons
              action="insert"
              onClick={handleVoucherInsert}
              disabled={!activeId || !!associatedVoucher || values.status !== 5}
            />
            <VoucherActionButtons
              action="view"
              onClick={handleVoucherView}
              disabled={!activeId || (!associatedVoucher && String(values.status) !== "8")}
            />
            <VoucherActionButtons
              action="edit"
              onClick={handleVoucherEdit}
              disabled={!activeId || (!associatedVoucher && String(values.status) !== "8")}
            />
            <VoucherActionButtons
              action="delete"
              onClick={handleVoucherDelete}
              disabled={!activeId || (!associatedVoucher && String(values.status) !== "8")}
            />
            <PrintDropdownButton
              targetForm="PaidDocumentClearing"
              disabled={isReadonly}
            />

            <DocumentAccountingInfoModal
              isOpen={isAccModalOpen}
              onClose={() => setIsAccModalOpen(false)}
              documentType="PaidDocumentClearing"
              documentRef={activeId ? Number(activeId) : null}
            />
          </div>
        }
      />
    </>
  );
}
