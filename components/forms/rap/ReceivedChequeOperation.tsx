"use client";
import { eventBus, EVENTS } from '@/lib/events';

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import { useFormUpsert } from "@/hooks/useFormUpsert";
import React, { useState, useEffect } from "react";
import { useConfirm } from '@/components/ConfirmProvider';
import moment from "moment-jalaali";
import { SimpleFormTwoRowTabbed } from "../SimpleFormTwoRowTabbed";
import { TabCellRow, TabCellConfig, TabCellColumn } from "../TabCellRow";
import { StateListInput } from "../../inputs/StateListInput";
import { TextInput, DateInput, BankAccountDropDown } from "../../inputs";
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
import { useReceivedChequeOperationColumns } from "./ReceivedChequeOperationList";

export default function ReceivedChequeOperation({ id, tabId }: { id?: string; tabId?: string }) {
  const { confirm } = useConfirm();
  const rawListColumns = useReceivedChequeOperationColumns();
  const listColumns = rawListColumns.map((c: any) => {
    let renderItem;
    if (c.key === 'operationType') {
      renderItem = (item: any) => {
        const val = item.operationType;
        if (val === 1) return 'واگذار به بانک';
        if (val === 2) return 'وصول / واخواست';
        if (val === 3) return 'نقد کردن واریز به حساب';
        if (val === 4) return 'نقد کردن';
        return val;
      };
    } else if (c.key === 'status') {
      renderItem = (item: any) => {
        const val = item.status;
        if (val === 1) return 'ثبت اولیه';
        if (val === 2) return 'تایید شده';
        if (val === 8) return 'لغو شده';
        return val;
      };
    } else if (c.key === 'documentDate' || c.type === 'date') {
      renderItem = (item: any) => {
        const val = item[c.key];
        if (!val) return '';
        
        // If it's already a Shamsi date format (e.g. 1403/05/10), return it directly
        if (typeof val === 'string' && val.length === 10 && val.includes('/')) {
          const parts = val.split('/');
          if (parts.length === 3 && parseInt(parts[0]) >= 1300 && parseInt(parts[0]) <= 1500) {
            return val;
          }
        }
        
        try {
          return moment(val).format('jYYYY/jMM/jDD');
        } catch (e) {
          return val;
        }
      };
    }
    
    return { ...c, label: c.header || c.label, renderItem };
  });
  const [isAccModalOpen, setIsAccModalOpen] = React.useState(false);

  const router = useRouter();
  const [values, setValues] = useState<Record<string, any>>({
    operation_type: 1,
    status: 2,
    date: moment().locale("en").format("jYYYY/jMM/jDD"),
    number: "",
    assignment_number: "",
    bank_account: "",
    realizer: "",
    cash_register: "",
    voucherHeaderRef: null,
    cheques: [],
  });
  const [originalData, setOriginalData] = useState<any>(null);

  const { isUsed } = useFormUsageCheck("ReceivedChequeOperation", id);
  const [associatedVoucher, setAssociatedVoucher] = useState<any>(null);
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(true);
  const isReadonly = isUsed || !!associatedVoucher || String(values.status) === "8" || isFormDisabledDueToFiscalYear;
  const { showToast } = useToast();
  const tabsCtx = useOptionalTabs();
  const activeTabId = tabsCtx?.activeTabId;
  const addTab = tabsCtx?.addTab;

  // Find the exact ID in case it's string or numeric
  const { activeId, setActiveId, isUpdate, method, getUrl, handleResponse } =
    useFormUpsert(id);
  const activeIdRef = React.useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [fiscalYearDetails, setFiscalYearDetails] = useState<any>(null);
  const [dateError, setDateError] = useState<string>("");
  const [refreshNumberingTrigger, setRefreshNumberingTrigger] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleVoucherInsert = async () => {
    setIsVoucherLoading(true);
    try {
      const initialData = await generateVoucherInitialDataFromAccountingInfo(
        "ReceivedChequeOperation",
        Number(id || activeId),
        values,
        true,
        "بابت عملیات چک دریافتنی شماره",
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
            const apiPath = 'received-cheque-operations';
            
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

  useEffect(() => {
    if (activeId) {
      apiFetch(`/api/rap/received-cheque-operations/${activeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            const op = data.data;
            setValues({
              operation_type: op.operationType,
              status: op.status,
              date: op.documentDate,
              number: op.documentNumber,
              assignment_number: op.assignmentNumber || "",
              bank_account: op.bankAccount || "",
              realizer: op.realizer || "",
              voucherHeaderRef: op.voucherHeaderRef || null,
              cheques: op.items
                ? op.items.map((item: any) => ({
                    id: item.receivedChequeOperationItemId || item.id,
                    receivedChequeOperationItemId: item.receivedChequeOperationItemId,
                    number: item.receiptCheque ? {
                      ...item.receiptCheque,
                      endorsement_number: item.receiptCheque.endorsementNumber || "",
                      sayad_code: item.receiptCheque.sayyadNumber || "",
                      bankName: item.receiptCheque.bank?.title || "",
                      partyName: item.receiptCheque.receiptNotification?.party?.title || item.receiptCheque.receiptNotification?.party?.partyName || (item.receiptCheque.receiptNotification?.party?.firstName ? `${item.receiptCheque.receiptNotification.party.firstName} ${item.receiptCheque.receiptNotification.party.lastName || ''}` : ''),
                      transferChequeDate: item.receiptCheque.receiptNotification?.documentDate ? moment(item.receiptCheque.receiptNotification.documentDate).format('jYYYY/jMM/jDD') : '',
                    } : null,
                    cheque_status: item.chequeStatus
                      ? String(item.chequeStatus)
                      : "",
                    forecast_date: item.forecastDate || "",
                    cash_register: item.cash || "",
                  }))
                : [],
            });
          }
        });
    }
  }, [activeId]);

  const [isSaving, setIsSaving] = useState(false);
  const [isNumberAuto, setIsNumberAuto] = useState(false);

  useEffect(() => {
    if (id) return; // Do not auto-fetch numbering if editing an existing record, unless you want it on date change. Wait, numbering should be kept if ID exists? In Voucher.tsx, they do fetch it but use result to disable field.

    const fetchNextNumbers = async () => {
      if (!values.date) return;
      try {
        const res = await apiFetch(
          `/api/rap/received-cheque-operations/next-numbers?date=${values.date}`,
        );
        if (res.ok) {
          const result = await res.json();
          setIsNumberAuto(!!result.isDocumentNumberAuto);

          if (!id || !values.number) {
            setValues((prev) => ({
              ...prev,
              number: result.documentNumber || "",
            }));
          }
        }
      } catch (e) {
        console.error("Failed to fetch next sequence numbers:", e);
      }
    };
    fetchNextNumbers();
  }, [values.date, id, refreshNumberingTrigger]);

  const handleReset = () => {
    activeIdRef.current = undefined;
    setAssociatedVoucher(null);
    setActiveId(undefined);
    setValues({
      operation_type: 1,
      status: 2,
      date: moment().locale("en").format("jYYYY/jMM/jDD"),
      number: "",
      assignment_number: "",
      bank_account: "",
      realizer: "",
      cash_register: "",
      cheques: [],
    });
    setRefreshNumberingTrigger((prev) => prev + 1);
  };

  const handleSave = async () => {
    if (dateError) {
      showToast(dateError, "error");
      setErrors((prev: any) => ({ ...prev, date: dateError }));
      throw new Error("VALIDATION_FAILED");
    }
    setErrors((prev: any) => ({ ...prev, date: "" }));
    if (
      values.operation_type !== 4 &&
      (!values.bank_account || typeof values.bank_account !== "object")
    ) {
      showToast("لطفا حساب بانکی را انتخاب کنید", "error");
      return;
    }

    if (Number(values.operation_type) === 2) {
      for (const ch of values.cheques) {
        if (ch.cheque_status && !ch.forecast_date) {
          showToast(
            "تاریخ پیش بینی/وصول/واخواست برای چک های تعیین وضعیت شده الزامی است",
            "error",
          );
          return;
        }
      }
    }

    for (let i = 0; i < values.cheques.length; i++) {
      const ch = values.cheques[i];
      if (ch.forecast_date && ch.number?.dueDate) {
        const forecastM = moment(toEnglishDigits(ch.forecast_date), "jYYYY/jMM/jDD");
        const dueM = moment(ch.number.dueDate);
        if (forecastM.isValid() && dueM.isValid() && forecastM.startOf("day").isBefore(dueM.startOf("day"))) {
          showToast(
            `تاریخ پیش‌بینی در ردیف ${i + 1} نمی‌تواند از تاریخ سررسید چک کوچکتر باشد`,
            "error"
          );
          return;
        }
      }
    }

    setIsSaving(true);
    const payload = {
      operationType: values.operation_type,
      documentNumber: values.number,
      documentDate: values.date,
      assignmentNumber: values.assignment_number,
      status: values.status,
      bankAccountRef:
        values.bank_account?.bankAccountId ||
        values.bank_account?.id ||
        undefined,
      realizerRef:
        values.realizer?.detailedAccountId || values.realizer?.id || undefined,
      items: values.cheques.map((ch: any) => ({
        receivedChequeOperationItemId: ch.receivedChequeOperationItemId || ch.id || undefined,
        receiptChequeRef: ch.number?.receiptChequeId || ch.number?.id,
        chequeStatus: ch.cheque_status ? Number(ch.cheque_status) : undefined,
        forecastDate: ch.forecast_date || undefined,
        cashRef: ch.cash_register?.cashId || ch.cash_register?.id || undefined,
      })),
    };
    try {
      const res = await apiFetch(
        getUrl("/api/rap/received-cheque-operations"),
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        const data = await res.json();
        handleResponse(data, "receivedChequeOperationId");
        
        const savedId = activeId || data?.data?.receivedChequeOperationId || data?.receivedChequeOperationId;
        if (savedId) {
          try {
            const freshRes = await apiFetch(`/api/rap/received-cheque-operations/${savedId}`);
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
        throw new Error(errorText); // To prevent SimpleFormTwoRowTabbed from setting `hasSaved=true` if it handles it
      }
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (actionType: "delete" | "delete_and_new") => {
    if (!activeId) return;
    try {
      const res = await apiFetch(
        `/api/rap/received-cheque-operations/${activeId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        if (actionType === "delete_and_new") {
          setActiveId(undefined);
          setValues({
            operation_type: 1,
            status: 2,
            date: moment().locale("en").format("jYYYY/jMM/jDD"),
            number: "",
            assignment_number: "",
            bank_account: "",
            realizer: "",
            cash_register: "",
            cheques: [],
          });
        } else {
          if (tabsCtx && tabsCtx.removeTab) {
            tabsCtx.removeTab(`ReceivedChequeOperation-${id || "new"}`);
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
      name: "operation_type",
      label: "نوع",
      type: "custom" as const,
      required: true,
      colSpan: 1,
      customComponent: (
        <div className="flex w-full items-center justify-between gap-1 pt-1 px-1 pb-1">
          {[
            { label: "واگذار به بانک", value: "1" },
            { label: "وصول / واخواست", value: "2" },
            { label: "نقد کردن واریز به حساب", value: "3" },
            { label: "نقد کردن", value: "4" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="operation_type"
                  value={opt.value}
                  checked={String(values.operation_type) === opt.value}
                  onChange={() =>
                    handleChange("operation_type", parseInt(opt.value, 10))
                  }
                  className="peer shrink-0 appearance-none w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-indigo-500 focus:outline-none transition-all"
                />
                <div className={`absolute w-1.5 h-1.5 rounded-full bg-indigo-500 transition-transform ${String(values.operation_type) === opt.value ? "scale-100" : "scale-0"}`} />
              </div>
              <span className="text-[10px] text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors whitespace-nowrap">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      ),
    },
    {
      name: "date_and_number",
      label: "",
      type: "custom" as const,
      colSpan: 1,
      customComponent: (
        <div className="flex w-full items-center gap-x-2">
          <div className="flex-1 w-1/2">
            <TextInput
              name="number"
              label="شماره :"
              required
              value={values.number}
              onChange={(val) => handleChange("number", val)}
              labelWidth="95px"
              disabled={isNumberAuto || isReadonly}
            />
          </div>
          <div className="flex-1 w-1/2">
            <DateInput
              name="date"
              label="تاریخ :"
              required
              value={values.date}
              onChange={(val) => {
                handleChange("date", val);
                setErrors((prev: any) => ({ ...prev, date: undefined }));
              }}
              error={dateError || errors.date}
              labelWidth="60px"
            />
          </div>
        </div>
      ),
    },
    {
      name: "bank_and_realizer",
      label: "",
      type: "custom" as const,
      colSpan: 1,
      customComponent: (
        <div className="flex w-full items-center gap-x-2">
          {values.operation_type !== 4 && (
            <div
              className={`flex-1 flex w-full items-center pl-4 ${values.operation_type === 3 ? "w-1/2" : "w-full"}`}
            >
              <BankAccountDropDown
                value={values.bank_account || null}
                onChange={(item) => handleChange("bank_account", item)}
                label="حساب بانکی"
                labelWidth="85px"
                required
              />
            </div>
          )}
          {(values.operation_type === 3 || values.operation_type === 4) && (
            <div
              className={`flex-1 ${values.operation_type === 3 ? "w-1/2" : "w-full"}`}
            >
              <MultiColumnDropdown
                columns={[
                  { key: "code", label: "کد تفصیل", width: 80 },
                  { key: "title", label: "عنوان", width: 250 },
                ]}
                listApiUrl="/api/accounting/detailed-accounts"
                value={values.realizer || null}
                onChange={(item) => handleChange("realizer", item)}
                placeholder="انتخاب..."
                displayKey="title"
                label="وصول کننده"
                labelWidth="85px"
                required
              />
            </div>
          )}
        </div>
      ),
    },
    {
      name: "status_and_assignment",
      label: "",
      type: "custom" as const,
      colSpan: 1,
      customComponent: (
        <div className="flex w-full items-center gap-x-2">
          <div className="flex-1 w-1/2">
            <TextInput
              name="assignment_number"
              label="شماره واگذاری :"
              value={values.assignment_number}
              onChange={(val) => handleChange("assignment_number", val)}
              labelWidth="95px"
            />
          </div>
          <div className="flex-1 w-1/2">
            <StateListInput
              label="وضعیت :"
              required
              value={values.status || 1}
              onChange={(val) => handleChange("status", val || 1)}
              labelWidth="60px"
            />
          </div>
        </div>
      ),
    },
  ];

  enum ChequeStatus {
    RECEIVED = 1,
    PROTESTED = 2,
  }

  let chequesColumns: TabCellColumn[] = [
    {
      key: "rowNumber",
      header: "ردیف",
      type: "custom",
      width: "50px",
      render: (row, index) => (
        <div className="w-full text-center text-gray-500 pt-1">{index + 1}</div>
      ),
    },
  ];

  if (Number(values.operation_type) === 2) {
    chequesColumns.push({
      key: "cheque_status",
      header: "وضعیت",
      type: "select",
      width: "150px",
      options: [
        { label: "وصول", value: String(ChequeStatus.RECEIVED) },
        { label: "واخواست", value: String(ChequeStatus.PROTESTED) },
      ],
    });
  } else {
    chequesColumns.push({
      key: "cash_register",
      header: "صندوق",
      type: "custom",
      width: "150px",
      render: (row, index, onChange) => (
        <div className="w-full h-full flex items-center">
          <SingleSelectDropDown
            key={`cash-${Number(values.operation_type)}`}
            columns={[
              { key: "code", label: "کد", width: 60 },
              { key: "title", label: "عنوان", width: 140 },
              { key: "detailedAccount.code", label: "کد تفصیل", width: 80 },
              { key: "currency.title", label: "نوع ارز", width: 80 },
              { key: "initialBalance", label: "موجودی", width: 100 },
            ]}
            listApiUrl="/api/rap/cashes"
            value={row.cash_register || null}
            onChange={(item) => onChange(item)}
            placeholder="انتخاب..."
            displayKey="title"
            onAdd={() => console.log("add cash register")}
            filterItem={(item: any) => item.isActive === true}
          />
        </div>
      ),
    });
  }

  let forecastHeader = "تاریخ پیش بینی";
  if (Number(values.operation_type) === 2) {
    const hasReceived = values.cheques?.some(
      (c: any) => String(c.cheque_status) === String(ChequeStatus.RECEIVED),
    );
    const hasProtested = values.cheques?.some(
      (c: any) => String(c.cheque_status) === String(ChequeStatus.PROTESTED),
    );
    if (hasReceived && !hasProtested) forecastHeader = "تاریخ وصول";
    else if (hasProtested && !hasReceived) forecastHeader = "تاریخ واخواست";
    else if (hasReceived && hasProtested) forecastHeader = "تاریخ وصول/واخواست";
  } else if (Number(values.operation_type) === 3 || Number(values.operation_type) === 4) {
    forecastHeader = "تاریخ وصول";
  }

  chequesColumns.push(
    {
      key: "number",
      header: "شماره چک",
      type: "custom",
      width: "150px",
      render: (row, index, onChange) => (
        <div className="w-full h-full flex items-center">
          <SingleSelectDropDown
            key={`cheque-${Number(values.operation_type)}`}
            columns={[
              { key: "chequeNumber", label: "شماره چک", width: 100 },
              { key: "partyName", label: "نام صاحب حساب", width: 140 },
              { key: "amount", label: "مبلغ چک", width: 120 },
              { key: "bankName", label: "نام بانک", width: 100 },
              { key: "branchName", label: "شعبه بانک", width: 100 },
            ]}
            listApiUrl={`/api/rap/receipt-notifications/cheques/available-for-assignment?operationType=${values.operation_type}${Number(values.operation_type) === 2 && values.bank_account ? `&bankAccountRef=${values.bank_account.bankAccountId || values.bank_account.id}` : ""}`}
            value={row.number || null}
            onChange={(item) => onChange?.(item)}
            placeholder="انتخاب..."
            displayKey="chequeNumber"
            onAdd={() => console.log("add cheque")}
            filterItem={(item: any) =>
              !values.cheques.some(
                (c: any, i: number) =>
                  i !== index &&
                  (c.number?.receiptChequeId === item.receiptChequeId ||
                    c.number?.id === item.id),
              )
            }
          />
        </div>
      ),
    },
    {
      key: "endorsement_number",
      header: "پشت نمره",
      type: "custom",
      width: "120px",
      render: (row) => (
        <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
          {row.number?.endorsement_number || ""}
        </div>
      ),
    },
    {
      key: "sayad_code",
      header: "کد صیادی",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
          {row.number?.sayad_code || ""}
        </div>
      ),
    },
    {
      key: "amount",
      header: "مبلغ",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
          {row.number?.amount != null
            ? Number(row.number.amount).toLocaleString()
            : ""}
        </div>
      ),
    },
    ...(Number(values.operation_type) === 2
      ? [
          {
            key: "transferChequeDate",
            header: "تاریخ واگذاری",
            type: "custom",
            width: "120px",
            render: (row: any) => (
              <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
                {row.number?.transferChequeDate || ""}
              </div>
            ),
          } as any,
        ]
      : [
          {
            key: "transferChequeDate",
            header: "تاریخ سررسید/دریافت",
            type: "custom",
            width: "120px",
            render: (row: any) => (
              <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
                {row.number?.transferChequeDate || ""}
              </div>
            ),
          } as any,
        ]),
    {
      key: "forecast_date",
      header: forecastHeader,
      type: "custom",
      width: "120px",
      render: (row: any, index: number, onChange?: (val: any) => void) => {
        let hasError = false;
        if (row.forecast_date && row.number?.dueDate) {
          const forecastM = moment(toEnglishDigits(row.forecast_date), "jYYYY/jMM/jDD");
          const dueM = moment(row.number.dueDate);
          if (forecastM.isValid() && dueM.isValid() && forecastM.startOf("day").isBefore(dueM.startOf("day"))) {
            hasError = true;
          }
        }
        return (
          <div className="w-full h-full flex items-center pt-1" dir="rtl">
            <DateInput
              name="forecast_date"
              value={row.forecast_date || ""}
              onChange={onChange}
              disabled={isReadonly}
              className="w-full"
              error={hasError ? "تاریخ نامعتبر" : undefined}
            />
          </div>
        );
      },
    },
    {
      key: "bank_account",
      header: "حساب بانکی",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
          {row.number?.bankName ||
            row.number?.bank_account_title ||
            row.number?.account_number ||
            ""}
        </div>
      ),
    },
    {
      key: "owner",
      header: "صاحب چک",
      type: "custom",
      width: "150px",
      render: (row) => (
        <div className="w-full h-full flex items-center px-1 text-gray-700 dark:text-gray-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
          {row.number?.partyName ||
            row.number?.account_owner ||
            row.number?.owner ||
            ""}
        </div>
      ),
    },
  );

  const tabConfig: TabCellConfig[] = [
    {
      id: "cheques",
      label: "چک",
      columns: chequesColumns,
    },
  ];

  const tabs = [
    {
      id: "cheques",
      label: "لیست چک‌ها",
      content: (
        <TabCellRow
          tabs={tabConfig}
          value={values.cheques}
          onChange={(newCheques) => {
            const opType = Number(values.operation_type);
            const processed = newCheques.map((newRow: any, i: number) => {
              const oldRow = values.cheques[i] || {};
              let rowToReturn = { ...newRow };
              if (opType === 2) {
                if (
                  rowToReturn.cheque_status &&
                  oldRow.cheque_status !== rowToReturn.cheque_status &&
                  !rowToReturn.forecast_date
                ) {
                  rowToReturn.forecast_date = values.date;
                }
              } else if (opType === 3 || opType === 4) {
                if (
                  rowToReturn.number &&
                  (!oldRow.number || oldRow.number.receiptChequeId !== rowToReturn.number.receiptChequeId || oldRow.number.id !== rowToReturn.number.id)
                ) {
                  if (rowToReturn.number.dueDate) {
                    rowToReturn.forecast_date = moment(rowToReturn.number.dueDate).format("jYYYY/jMM/jDD");
                  } else {
                    rowToReturn.forecast_date = values.date;
                  }
                }
              }
              return rowToReturn;
            });
            handleChange("cheques", processed);
          }}
          className="h-full border-none shadow-none rounded-none"
          hideHeader={true}

          footerLeftActions={
            associatedVoucher && (
              <div className="flex items-center gap-4 text-xs text-gray-700 dark:text-gray-300 font-medium px-2">
                <span>شماره سند حسابداری: {associatedVoucher.voucherNumber || associatedVoucher.voucherId || '-'}</span>
                <span>تاریخ سند حسابداری: {associatedVoucher.voucherDate ? moment(associatedVoucher.voucherDate).format('jYYYY/jMM/jDD') : '-'}</span>
              </div>
            )
          }
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
        title={isUpdate ? `ویرایش عملیات چک دریافتنی ${values.assignment_number || ""}` : "عملیات چک دریافتنی جدید"}
        fields={fields}
        values={values}
        onChange={handleChange}
        bottomTabs={tabs}
        showListButton={true}
        listApiUrl="/api/rap/received-cheque-operations"
        listColumns={listColumns}
        listDisplayKey="assignmentNumber"
        onListSelect={(item: any) => {
          const itemId = item.receivedChequeOperationId || item.id || item.ReceivedChequeOperationID || item.ID;
          if (activeId !== itemId) {
            if (!activeId) {
               // Update current tab if it's empty
               setActiveId(itemId);
               return;
            }
            addTab?.(
              `ویرایش عملیات چک دریافتنی ${item.assignmentNumber || ''}`,
              "rap",
              null,
              "ReceivedChequeOperation",
              { id: itemId }
            );
          }
        }}
        onSave={handleSave}
        onSaveNew={async () => {
          await handleSave();
          handleReset();
        }}
        onSaveClose={async () => {
          await handleSave();
          if (tabsCtx && tabsCtx.removeTab) {
            tabsCtx.removeTab(
              `ReceivedChequeOperation-${activeId || id || "new"}`,
            );
          }
        }}
        onDelete={handleDelete as any}
        isReadonly={isReadonly}
        onNew={handleReset}
        actionbar={
          <div className="flex items-center gap-1.5">
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
              targetForm="ReceivedChequeOperation"
              disabled={isReadonly}
            />

            <DocumentAccountingInfoModal
              isOpen={isAccModalOpen}
              onClose={() => setIsAccModalOpen(false)}
              documentType="ReceivedChequeOperation"
              documentRef={activeId ? Number(activeId) : null}
            />
          </div>
        }
      />
    </>
  );
}
