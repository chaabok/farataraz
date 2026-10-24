"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SingleSelectDropDown, SingleSelectColumn } from "@/components/inputs/SingleSelectDropDown";
import { NumberInput } from "@/components/inputs/NumberInput";
import { DateInput, getTodayFormattedDate } from "@/components/inputs/DateInput";
import { TextArea } from "@/components/inputs/TextArea";
import { FormLabel } from "@/components/inputs/FormLabel";
import { useToast } from "@/components/ToastProvider";
import { useTabs } from "@/components/TabsProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { apiFetch } from "@/lib/utils";
import { StocktakingShortageVoucherIcon } from "@/components/buttons/StocktakingDiscrepancyButtons";
import { Tooltip } from "@/components/ui/Tooltip";
import { X, PackageMinus, AlertCircle, AlertTriangle, FileText, Trash2 } from "lucide-react";

interface StocktakingShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocktakingCountId?: number | string | null;
  tagHeaderId?: number | string | null;
  warehouseId?: number | string | null;
  stocktakingNumber?: number | string | null;
  items?: any[];
  onSuccess?: (createdIssueId?: number, isDeleted?: boolean) => void;
}

export function StocktakingShortageModal({
  isOpen,
  onClose,
  stocktakingCountId,
  tagHeaderId,
  warehouseId,
  stocktakingNumber,
  items = [],
  onSuccess,
}: StocktakingShortageModalProps) {
  const { showToast } = useToast();
  const { addTab } = useTabs();
  const { confirm } = useConfirm();

  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<any>(null);
  const [issueNumber, setIssueNumber] = useState<number | string>("");
  const [issueDate, setIssueDate] = useState<string>(getTodayFormattedDate());
  const [description, setDescription] = useState<string>("");

  const [loadingDocTypes, setLoadingDocTypes] = useState<boolean>(false);
  const [loadingNextNumber, setLoadingNextNumber] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ docType?: string; issueNumber?: string; issueDate?: string }>({});

  const [alreadyIssued, setAlreadyIssued] = useState<boolean>(false);
  const [existingIssueDoc, setExistingIssueDoc] = useState<any>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState<boolean>(false);

  // 1. Fetch Outgoing Warehouse Document Types (nature = 2 / حواله / کاهنده)
  const fetchDocumentTypes = useCallback(async () => {
    try {
      setLoadingDocTypes(true);
      const res = await apiFetch("/api/inv/warehouse-document-types?nature=2");
      if (res && res.ok) {
        const rawData = await res.json();
        const list = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);

        // Filter outgoing nature (2 / کاهنده)
        const outgoingTypes = list.filter((dt: any) => {
          const nat = dt.WarehouseDocumentNature ?? dt.warehouseDocumentNature;
          return nat === 2 || String(nat) === "2" || nat === undefined;
        });

        const availableTypes = outgoingTypes.length > 0 ? outgoingTypes : list;
        setDocTypes(availableTypes);

        if (availableTypes.length > 0) {
          // Default to document type with code "62" (کسری انبارگردانی) or title containing "کسری انبارگردانی"
          const defaultShortageType = availableTypes.find((dt: any) => {
            const code = String(dt.WarehouseDocumentTypeCode ?? dt.code ?? dt.Code ?? "").trim();
            return code === "62";
          }) || availableTypes.find((dt: any) => {
            const title = String(dt.WarehouseDocumentTypeTitle || dt.title || dt.name || "");
            return title.includes("کسری انبارگردانی") || title.includes("کسری");
          }) || availableTypes[0];

          setSelectedDocType(defaultShortageType);
        }
      }
    } catch (err) {
      console.error("Error fetching outgoing warehouse document types:", err);
    } finally {
      setLoadingDocTypes(false);
    }
  }, []);

  // 2. Fetch Next Issue Number according to warehouse issue numbering method
  const fetchNextIssueNumber = useCallback(async () => {
    try {
      setLoadingNextNumber(true);
      const res = await apiFetch("/api/inv/warehouse-issues/next-number");
      if (res && res.ok) {
        const data = await res.json();
        const num = data?.documentNumber ?? data?.nextNumber ?? data;
        if (num !== undefined && num !== null && num !== "") {
          setIssueNumber(num);
        }
      }
    } catch (err) {
      console.error("Error fetching next warehouse issue number:", err);
    } finally {
      setLoadingNextNumber(false);
    }
  }, []);

  // 3. Check duplicate shortage voucher issuance for this warehouse & stocktaking count / period
  const checkDuplicateIssuance = useCallback(async () => {
    if (!warehouseId) return;
    try {
      setCheckingDuplicate(true);
      const res = await apiFetch(`/api/inv/warehouse-issues?nature=2`);
      if (res && res.ok) {
        const rawData = await res.json();
        const list = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);

        const docNum = String(stocktakingNumber || stocktakingCountId || "");

        // Find existing shortage voucher with BaseType = 6 or matching base document / description
        const found = list.find((doc: any) => {
          const docWhRef = doc.WarehouseRef || doc.warehouseRef;
          const baseType = Number(doc.BaseType || doc.baseType || 0);
          const baseDocNum = String(doc.BaseDocumentNumber || doc.baseDocumentNumber || "");
          const desc = String(doc.Description || doc.description || "");

          const isSameWarehouse = Number(docWhRef) === Number(warehouseId);
          const isShortageBase = baseType === 6;
          const isSameDoc = !docNum || baseDocNum === docNum || desc.includes(`شمارش شماره ${docNum}`) || desc.includes(`برگه شمارش شماره ${docNum}`);

          return isSameWarehouse && isShortageBase && isSameDoc;
        });

        if (found) {
          setAlreadyIssued(true);
          setExistingIssueDoc(found);
        } else {
          setAlreadyIssued(false);
          setExistingIssueDoc(null);
        }
      }
    } catch (err) {
      console.error("Error checking duplicate shortage issue:", err);
    } finally {
      setCheckingDuplicate(false);
    }
  }, [warehouseId, stocktakingNumber, stocktakingCountId]);

  useEffect(() => {
    if (isOpen) {
      fetchDocumentTypes();
      fetchNextIssueNumber();
      checkDuplicateIssuance();
      setIssueDate(getTodayFormattedDate());
      setDescription(
        stocktakingNumber
          ? `حواله کسری انبارگردانی بابت برگه شمارش شماره ${stocktakingNumber}`
          : "حواله کسری انبارگردانی"
      );
      setErrors({});
    }
  }, [isOpen, fetchDocumentTypes, fetchNextIssueNumber, checkDuplicateIssuance, stocktakingNumber]);

  if (!isOpen) return null;

  // Open existing shortage issue form in a new tab
  const handleOpenExistingIssue = () => {
    const issueId = existingIssueDoc?.WarehouseReceiptID || existingIssueDoc?.id;
    const docNumber = existingIssueDoc?.ReceiptNumber || existingIssueDoc?.id || issueId;
    if (issueId) {
      addTab({
        id: `WarehouseIssue-${issueId}`,
        title: `حواله انبار (${docNumber})`,
        groupId: "warehouse_group",
        componentName: "WarehouseIssueForm",
        props: { id: issueId },
        closable: true,
      });
      onClose();
    }
  };

  // Delete existing shortage issue document
  const handleDeleteExistingIssue = async () => {
    const issueId = existingIssueDoc?.WarehouseReceiptID || existingIssueDoc?.id || existingIssueDoc?.WarehouseIssueID;
    const docNumber = existingIssueDoc?.ReceiptNumber || existingIssueDoc?.receiptNumber || existingIssueDoc?.id || issueId;
    if (!issueId) {
      showToast("شناسه سند برای حذف یافت نشد.", "warning");
      return;
    }

    const isConfirmed = await confirm({
      title: "تایید حذف سند کسری",
      message: `آیا از حذف حواله کسری انبارگردانی به شماره ${docNumber} اطمینان دارید؟`,
      confirmText: "حذف سند",
      cancelText: "انصراف",
    });

    if (!isConfirmed) return;

    try {
      setDeleting(true);
      const res = await apiFetch(`/api/inv/warehouse-issues/${issueId}`, {
        method: "DELETE",
      });

      if (res && res.ok) {
        showToast(`حواله کسری انبارگردانی به شماره ${docNumber} با موفقیت حذف گردید.`, "success");
        setAlreadyIssued(false);
        setExistingIssueDoc(null);
        fetchNextIssueNumber();
        if (onSuccess) {
          onSuccess(undefined, true);
        }
        onClose();
      } else {
        const errText = await res.text();
        console.error("Error deleting shortage issue:", errText);
        showToast("خطا در حذف حواله کسری انبارگردانی.", "error");
      }
    } catch (err) {
      console.error("Error deleting shortage issue:", err);
      showToast("خطا در ارتباط با سرور جهت حذف حواله کسری.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Columns for Warehouse Document Type SingleSelectDropDown
  const docTypeColumns: SingleSelectColumn[] = [
    {
      key: "WarehouseDocumentTypeCode",
      label: "کد سند",
      width: 90,
      renderItem: (row: any) => row?.WarehouseDocumentTypeCode || row?.code || "—",
    },
    {
      key: "WarehouseDocumentTypeTitle",
      label: "عنوان نوع سند انبار",
      width: 220,
      renderItem: (row: any) => row?.WarehouseDocumentTypeTitle || row?.title || row?.name || "—",
    },
  ];

  // Submit Handler: Calculate shortage and issue Warehouse Issue
  const handleIssueShortageVoucher = async () => {
    if (alreadyIssued) {
      showToast(
        `سند کسری انبارگردانی برای این انبار و برگه شمارش قبلاً به شماره ${existingIssueDoc?.ReceiptNumber || existingIssueDoc?.id} صادر گردیده است.`,
        "warning"
      );
      return;
    }

    const newErrors: { docType?: string; issueNumber?: string; issueDate?: string } = {};

    const docTypeRef = selectedDocType?.WarehouseDocumentTypeID || selectedDocType?.id || selectedDocType?.value;
    if (!docTypeRef) {
      newErrors.docType = "انتخاب نوع سند انبار الزامی است.";
    }

    if (!issueNumber || isNaN(Number(issueNumber)) || Number(issueNumber) <= 0) {
      newErrors.issueNumber = "ورود شماره حواله الزامی است.";
    }

    if (!issueDate) {
      newErrors.issueDate = "ورود تاریخ حواله الزامی است.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("لطفاً فیلدهای اجباری را تکمیل نمایید.", "warning");
      return;
    }

    try {
      setSubmitting(true);

      // Fetch accurate item details including SystemStockQty if needed
      let countItems = items;
      if (tagHeaderId && warehouseId && (!countItems || countItems.length === 0 || countItems[0]?.SystemStockQty === undefined)) {
        const url = `/api/inv/stocktaking-counts/items?tagHeaderId=${tagHeaderId}&warehouseId=${warehouseId}&countId=${stocktakingCountId || ""}`;
        const itemsRes = await apiFetch(url);
        if (itemsRes && itemsRes.ok) {
          const fetchedItems = await itemsRes.json();
          if (Array.isArray(fetchedItems)) {
            countItems = fetchedItems;
          }
        }
      }

      // Calculate shortage for each item: SystemStockQty - CountedQuantity
      const shortageDetails: any[] = [];
      let rowIdx = 1;

      for (const item of countItems || []) {
        const itemRef = item.ItemRef || item.ItemID || item.id;
        const countedMainQty = Number(item.CountedQuantity || 0);
        const kardexMainQty = Number(item.SystemStockQty ?? item.KardexQuantity ?? item.systemStockQty ?? 0);

        // Difference in Main Unit = KardexQuantity - CountedQuantity
        const shortageMainQty = kardexMainQty - countedMainQty;

        if (shortageMainQty > 0) {
          // Check if entered in sub-unit
          const selectedSubUnitName = item.selectedSubUnitName;
          const isSubUnit = Boolean(
            selectedSubUnitName &&
            selectedSubUnitName !== item.MeasurementUnitName &&
            ((item.subUnits && Array.isArray(item.subUnits) && item.subUnits.length > 0) || item.SubQuantity)
          );

          let finalUnitType = 1;
          let finalUnitName = item.MeasurementUnitName || item.unitName || "";
          let finalQuantity = shortageMainQty;

          if (isSubUnit) {
            const subList = item.subUnits || [];
            const subObj = subList.find((su: any) => su.SubUnitName === selectedSubUnitName || su.SubUnitTitle === selectedSubUnitName) || subList[0];
            const ratio = Number(subObj?.MainToSubRatio || 1);
            if (ratio > 0) {
              finalUnitType = 2; // Sub unit
              finalUnitName = selectedSubUnitName;
              finalQuantity = Number((shortageMainQty / ratio).toFixed(4));
            }
          }

          shortageDetails.push({
            RowNo: rowIdx++,
            ItemRef: Number(itemRef),
            WarehouseRef: Number(warehouseId),
            UnitName: finalUnitName,
            UnitType: finalUnitType,
            Quantity: finalQuantity,
            Description: `کسری انبارگردانی (شمارش نهایی: ${countedMainQty} - کاردکس: ${kardexMainQty})`,
          });
        }
      }

      if (shortageDetails.length === 0) {
        showToast("هیچ کالایی دارای کسری موجودی (شمارش‌شده کمتر از موجودی کاردکس) یافت نشد.", "warning");
        setSubmitting(false);
        return;
      }

      // Payload for Create Warehouse Issue (BaseType = 6 بابت کسری انبارگردانی)
      const payload = {
        WarehouseDocumentTypeRef: Number(docTypeRef),
        ReceiptNumber: Number(issueNumber),
        ReceiptDate: issueDate,
        WarehouseRef: Number(warehouseId),
        DeliverWarehouseRef: Number(warehouseId),
        BaseType: 9995, // Stocktaking Shortage Base Type (شمارش انبارگردانی)
        BaseDocumentNumber: String(stocktakingNumber || stocktakingCountId || ''),
        Status: 5, // Approved (تایید شده)
        Description: description || `حواله کسری انبارگردانی بابت برگه شمارش شماره ${stocktakingNumber || stocktakingCountId || ''}`,
        details: shortageDetails,
      };

      const saveRes = await apiFetch("/api/inv/warehouse-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (saveRes && saveRes.ok) {
        const createdData = await saveRes.json();
        const createdId = createdData?.WarehouseReceiptID || createdData?.id;

        showToast(
          `حواله کسری انبارگردانی به شماره ${issueNumber} با موفقیت صادر گردید (شامل ${shortageDetails.length} قلم کالا).`,
          "success"
        );

        onClose();
        if (onSuccess) {
          onSuccess(createdId);
        }
      } else {
        const errText = await saveRes.text();
        console.error("Error creating shortage issue:", errText);
        showToast("خطا در صدور حواله کسری انبارگردانی.", "error");
      }
    } catch (err) {
      console.error("Error issuing shortage issue:", err);
      showToast("خطا در ارتباط با سرور جهت صدور حواله کسری.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-lg text-rose-600 dark:text-rose-400">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                صدور حواله کسری انبارگردانی
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت حواله انبار بابت کسری موجودی شمارش‌شده نسبت به کاردکس
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Duplicate Issuance Alert Banner */}
          {alreadyIssued && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg flex items-start gap-2.5 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-0.5">سند کسری قبلاً صادر شده است</p>
                <p>
                  سند کسری انبارگردانی برای این انبار و دوره انبارگردانی قبلاً به شماره{" "}
                  <span className="font-bold underline">{existingIssueDoc?.ReceiptNumber || existingIssueDoc?.id}</span> صادر گردیده است.
                  امکان صدور سند کسری تکراری وجود ندارد.
                </p>
              </div>
            </div>
          )}

          {/* Field 1: نوع سند انبار (SingleSelectDropDown - Outgoing nature 2 - Mandatory) */}
          <div className="space-y-1">
            <FormLabel htmlFor="WarehouseDocumentTypeRef" required>
              نوع سند انبار
            </FormLabel>
            <SingleSelectDropDown
              value={selectedDocType}
              onChange={(item) => {
                setSelectedDocType(item);
                if (item) setErrors((prev) => ({ ...prev, docType: undefined }));
              }}
              columns={docTypeColumns}
              items={docTypes}
              listApiUrl="/api/inv/warehouse-document-types?nature=2"
              valueKey="WarehouseDocumentTypeID"
              titleKey="WarehouseDocumentTypeTitle"
              codeKey="WarehouseDocumentTypeCode"
              placeholder="نوع سند کسری انبارگردانی را انتخاب نمایید..."
              isLoading={loadingDocTypes}
              disabled={submitting || alreadyIssued}
              className={errors.docType ? "border-red-500 ring-1 ring-red-500" : ""}
            />
            {errors.docType && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.docType}
              </p>
            )}
          </div>

          {/* Field 2: شماره حواله (NumberInput - Mandatory) */}
          <div className="space-y-1">
            <FormLabel htmlFor="IssueNumber" required>
              شماره حواله
            </FormLabel>
            <NumberInput
              value={issueNumber}
              onChange={(val) => {
                setIssueNumber(val);
                if (val) setErrors((prev) => ({ ...prev, issueNumber: undefined }));
              }}
              placeholder="شماره حواله انبار"
              disabled={submitting || loadingNextNumber || alreadyIssued}
              className={`w-full ${errors.issueNumber ? "border-red-500" : ""}`}
            />
            {errors.issueNumber && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.issueNumber}
              </p>
            )}
          </div>

          {/* Field 3: تاریخ حواله (DateInput - Mandatory) */}
          <div className="space-y-1">
            <FormLabel htmlFor="IssueDate" required>
              تاریخ حواله
            </FormLabel>
            <DateInput
              value={issueDate}
              onChange={(val) => {
                setIssueDate(val);
                if (val) setErrors((prev) => ({ ...prev, issueDate: undefined }));
              }}
              disabled={submitting || alreadyIssued}
              className={errors.issueDate ? "border-red-500" : ""}
            />
            {errors.issueDate && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.issueDate}
              </p>
            )}
          </div>

          {/* Field 4: توضیحات (TextArea - Optional) */}
          <div className="space-y-1">
            <FormLabel htmlFor="Description">
              توضیحات
            </FormLabel>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات اختیاری حواله کسری انبارگردانی..."
              rows={3}
              disabled={submitting || alreadyIssued}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || deleting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              انصراف
            </button>
          </div>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-2">
            {/* Delete Shortage Issue Icon Button (if already issued) */}
            {alreadyIssued && existingIssueDoc && (
              <Tooltip content="حذف حواله کسری انبارگردانی" side="top">
                <button
                  type="button"
                  onClick={handleDeleteExistingIssue}
                  disabled={deleting || submitting}
                  className="p-2.5 text-rose-600 hover:text-white bg-rose-100 hover:bg-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-600 border border-rose-300 dark:border-rose-700 rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Tooltip>
            )}

            {/* View Shortage Issue Icon Button (if already issued) */}
            {alreadyIssued && existingIssueDoc && (
              <Tooltip content="مشاهده حواله کسری انبارگردانی" side="top">
                <button
                  type="button"
                  onClick={handleOpenExistingIssue}
                  disabled={submitting}
                  className="p-2.5 text-blue-600 hover:text-white bg-blue-100 hover:bg-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-600 border border-blue-300 dark:border-blue-700 rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </Tooltip>
            )}

            {/* Issue Shortage Voucher Icon Button */}
            <Tooltip content="صدور سند کسری انبارگردانی" side="top">
              <button
                type="button"
                onClick={handleIssueShortageVoucher}
                disabled={submitting || alreadyIssued || checkingDuplicate || deleting}
                className="p-2.5 text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                <StocktakingShortageVoucherIcon className="w-5 h-5 text-white" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
