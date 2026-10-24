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
import { StocktakingSurplusVoucherIcon } from "@/components/buttons/StocktakingDiscrepancyButtons";
import { Tooltip } from "@/components/ui/Tooltip";
import { X, PackagePlus, AlertCircle, AlertTriangle, FileText, Trash2 } from "lucide-react";

interface StocktakingSurplusModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocktakingCountId?: number | string | null;
  tagHeaderId?: number | string | null;
  warehouseId?: number | string | null;
  stocktakingNumber?: number | string | null;
  items?: any[];
  onSuccess?: (createdReceiptId?: number, isDeleted?: boolean) => void;
}

export function StocktakingSurplusModal({
  isOpen,
  onClose,
  stocktakingCountId,
  tagHeaderId,
  warehouseId,
  stocktakingNumber,
  items = [],
  onSuccess,
}: StocktakingSurplusModalProps) {
  const { showToast } = useToast();
  const { addTab } = useTabs();
  const { confirm } = useConfirm();

  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<any>(null);
  const [receiptNumber, setReceiptNumber] = useState<number | string>("");
  const [receiptDate, setReceiptDate] = useState<string>(getTodayFormattedDate());
  const [description, setDescription] = useState<string>("");

  const [loadingDocTypes, setLoadingDocTypes] = useState<boolean>(false);
  const [loadingNextNumber, setLoadingNextNumber] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ docType?: string; receiptNumber?: string; receiptDate?: string }>({});

  const [alreadyIssued, setAlreadyIssued] = useState<boolean>(false);
  const [existingReceiptDoc, setExistingReceiptDoc] = useState<any>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState<boolean>(false);

  // 1. Fetch Warehouse Document Types with incoming nature (WarehouseDocumentNature = 1 / وارده / افزاینده)
  const fetchDocumentTypes = useCallback(async () => {
    try {
      setLoadingDocTypes(true);
      const res = await apiFetch("/api/inv/warehouse-document-types?nature=1");
      if (res && res.ok) {
        const rawData = await res.json();
        const list = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);
        
        // Filter incoming nature (1)
        const incomingTypes = list.filter((dt: any) => {
          const nat = dt.WarehouseDocumentNature ?? dt.warehouseDocumentNature;
          return nat === 1 || String(nat) === "1" || nat === undefined;
        });

        const availableTypes = incomingTypes.length > 0 ? incomingTypes : list;
        setDocTypes(availableTypes);

        // Default to "نوع سند اضافی انبارگردانی" or "اضافی انبارگردانی" or "رسید اضافی"
        if (availableTypes.length > 0) {
          const defaultSurplusType = availableTypes.find((dt: any) => {
            const title = String(dt.WarehouseDocumentTypeTitle || dt.title || dt.name || "");
            return title.includes("اضافی انبارگردانی") || title.includes("اضافی") || title.includes("رسید اضافی");
          }) || availableTypes[0];

          setSelectedDocType(defaultSurplusType);
        }
      }
    } catch (err) {
      console.error("Error fetching incoming warehouse document types:", err);
    } finally {
      setLoadingDocTypes(false);
    }
  }, []);

  // 2. Fetch Next Receipt Number according to warehouse receipt numbering method
  const fetchNextReceiptNumber = useCallback(async () => {
    try {
      setLoadingNextNumber(true);
      const res = await apiFetch("/api/inv/warehouse-receipts/next-number");
      if (res && res.ok) {
        const data = await res.json();
        const num = data?.documentNumber ?? data?.nextNumber ?? data;
        if (num !== undefined && num !== null && num !== "") {
          setReceiptNumber(num);
        }
      }
    } catch (err) {
      console.error("Error fetching next warehouse receipt number:", err);
    } finally {
      setLoadingNextNumber(false);
    }
  }, []);

  // 3. Check duplicate surplus receipt issuance for this warehouse & stocktaking count / period
  const checkDuplicateIssuance = useCallback(async () => {
    if (!warehouseId) return;
    try {
      setCheckingDuplicate(true);
      const res = await apiFetch(`/api/inv/warehouse-receipts?nature=1`);
      if (res && res.ok) {
        const rawData = await res.json();
        const list = Array.isArray(rawData) ? rawData : (rawData?.data || rawData?.items || []);

        const docNum = String(stocktakingNumber || stocktakingCountId || "");

        // Find existing surplus receipt with BaseType = 5 or matching base document / description
        const found = list.find((doc: any) => {
          const docWhRef = doc.WarehouseRef || doc.warehouseRef;
          const baseType = Number(doc.BaseType || doc.baseType || 0);
          const baseDocNum = String(doc.BaseDocumentNumber || doc.baseDocumentNumber || "");
          const desc = String(doc.Description || doc.description || "");

          const isSameWarehouse = Number(docWhRef) === Number(warehouseId);
          const isSurplusBase = baseType === 5;
          const isSameDoc = !docNum || baseDocNum === docNum || desc.includes(`شمارش شماره ${docNum}`) || desc.includes(`برگه شمارش شماره ${docNum}`);

          return isSameWarehouse && isSurplusBase && isSameDoc;
        });

        if (found) {
          setAlreadyIssued(true);
          setExistingReceiptDoc(found);
        } else {
          setAlreadyIssued(false);
          setExistingReceiptDoc(null);
        }
      }
    } catch (err) {
      console.error("Error checking duplicate surplus receipt:", err);
    } finally {
      setCheckingDuplicate(false);
    }
  }, [warehouseId, stocktakingNumber, stocktakingCountId]);

  useEffect(() => {
    if (isOpen) {
      fetchDocumentTypes();
      fetchNextReceiptNumber();
      checkDuplicateIssuance();
      setReceiptDate(getTodayFormattedDate());
      setDescription(
        stocktakingNumber
          ? `رسید اضافات انبارگردانی بابت برگه شمارش شماره ${stocktakingNumber}`
          : "رسید اضافات انبارگردانی"
      );
      setErrors({});
    }
  }, [isOpen, fetchDocumentTypes, fetchNextReceiptNumber, checkDuplicateIssuance, stocktakingNumber]);

  if (!isOpen) return null;

  // Open existing surplus receipt form in a new tab
  const handleOpenExistingReceipt = () => {
    const receiptId = existingReceiptDoc?.WarehouseReceiptID || existingReceiptDoc?.id;
    const docNumber = existingReceiptDoc?.ReceiptNumber || existingReceiptDoc?.id || receiptId;
    if (receiptId) {
      addTab({
        id: `WarehouseReceipt-${receiptId}`,
        title: `رسید انبار (${docNumber})`,
        groupId: "warehouse_group",
        componentName: "WarehouseReceiptForm",
        props: { id: receiptId },
        closable: true,
      });
      onClose();
    }
  };

  // Delete existing surplus receipt document
  const handleDeleteExistingReceipt = async () => {
    const receiptId = existingReceiptDoc?.WarehouseReceiptID || existingReceiptDoc?.id || existingReceiptDoc?.WarehouseIssueID;
    const docNumber = existingReceiptDoc?.ReceiptNumber || existingReceiptDoc?.receiptNumber || existingReceiptDoc?.id || receiptId;
    if (!receiptId) {
      showToast("شناسه سند برای حذف یافت نشد.", "warning");
      return;
    }

    const isConfirmed = await confirm({
      title: "تایید حذف سند اضافات",
      message: `آیا از حذف رسید اضافات انبارگردانی به شماره ${docNumber} اطمینان دارید؟`,
      confirmText: "حذف سند",
      cancelText: "انصراف",
    });

    if (!isConfirmed) return;

    try {
      setDeleting(true);
      const res = await apiFetch(`/api/inv/warehouse-receipts/${receiptId}`, {
        method: "DELETE",
      });

      if (res && res.ok) {
        showToast(`رسید اضافات انبارگردانی به شماره ${docNumber} با موفقیت حذف گردید.`, "success");
        setAlreadyIssued(false);
        setExistingReceiptDoc(null);
        fetchNextReceiptNumber();
        if (onSuccess) {
          onSuccess(undefined, true);
        }
        onClose();
      } else {
        const errText = await res.text();
        console.error("Error deleting surplus receipt:", errText);
        showToast("خطا در حذف رسید اضافات انبارگردانی.", "error");
      }
    } catch (err) {
      console.error("Error deleting surplus receipt:", err);
      showToast("خطا در ارتباط با سرور جهت حذف رسید اضافات.", "error");
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

  // Submit Handler: Calculate surplus and issue Warehouse Receipt
  const handleIssueSurplusReceipt = async () => {
    if (alreadyIssued) {
      showToast(
        `سند اضافات انبارگردانی برای این انبار و برگه شمارش قبلاً به شماره ${existingReceiptDoc?.ReceiptNumber || existingReceiptDoc?.id} صادر گردیده است.`,
        "warning"
      );
      return;
    }

    const newErrors: { docType?: string; receiptNumber?: string; receiptDate?: string } = {};

    const docTypeRef = selectedDocType?.WarehouseDocumentTypeID || selectedDocType?.id || selectedDocType?.value;
    if (!docTypeRef) {
      newErrors.docType = "انتخاب نوع سند انبار الزامی است.";
    }

    if (!receiptNumber || isNaN(Number(receiptNumber)) || Number(receiptNumber) <= 0) {
      newErrors.receiptNumber = "ورود شماره رسید الزامی است.";
    }

    if (!receiptDate) {
      newErrors.receiptDate = "ورود تاریخ رسید الزامی است.";
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

      // Calculate surplus for each item: CountedQuantity - SystemStockQty
      const surplusDetails: any[] = [];
      let rowIdx = 1;

      for (const item of countItems || []) {
        const itemRef = item.ItemRef || item.ItemID || item.id;
        const countedMainQty = Number(item.CountedQuantity || 0);
        const kardexMainQty = Number(item.SystemStockQty ?? item.KardexQuantity ?? item.systemStockQty ?? 0);

        // Difference = CountedQuantity - KardexQuantity
        const surplusMainQty = countedMainQty - kardexMainQty;

        if (surplusMainQty > 0) {
          // Check if entered in sub-unit
          const selectedSubUnitName = item.selectedSubUnitName;
          const isSubUnit = Boolean(
            selectedSubUnitName &&
            selectedSubUnitName !== item.MeasurementUnitName &&
            ((item.subUnits && Array.isArray(item.subUnits) && item.subUnits.length > 0) || item.SubQuantity)
          );

          let finalUnitType = 1;
          let finalUnitName = item.MeasurementUnitName || item.unitName || "";
          let finalQuantity = surplusMainQty;

          if (isSubUnit) {
            const subList = item.subUnits || [];
            const subObj = subList.find((su: any) => su.SubUnitName === selectedSubUnitName || su.SubUnitTitle === selectedSubUnitName) || subList[0];
            const ratio = Number(subObj?.MainToSubRatio || 1);
            if (ratio > 0) {
              finalUnitType = 2; // Sub unit
              finalUnitName = selectedSubUnitName;
              finalQuantity = Number((surplusMainQty / ratio).toFixed(4));
            }
          }

          surplusDetails.push({
            RowNo: rowIdx++,
            ItemRef: Number(itemRef),
            WarehouseRef: Number(warehouseId),
            UnitName: finalUnitName,
            UnitType: finalUnitType,
            Quantity: finalQuantity,
            Description: `اضافه انبارگردانی (شمارش نهایی: ${countedMainQty} - کاردکس: ${kardexMainQty})`,
          });
        }
      }

      if (surplusDetails.length === 0) {
        showToast("هیچ کالایی دارای اضافه موجودی (شمارش‌شده بیشتر از موجودی کاردکس) یافت نشد.", "warning");
        setSubmitting(false);
        return;
      }

      // Payload for Create Warehouse Receipt
      const payload = {
        WarehouseDocumentTypeRef: Number(docTypeRef),
        ReceiptNumber: Number(receiptNumber),
        ReceiptDate: receiptDate,
        WarehouseRef: Number(warehouseId),
        DeliverWarehouseRef: Number(warehouseId),
        BaseType: 9995, // Stocktaking Surplus Base Type (شمارش انبارگردانی)
        BaseDocumentNumber: String(stocktakingNumber || stocktakingCountId || ''),
        Status: 5, // Approved (تایید شده)
        Description: description || `رسید اضافات انبارگردانی بابت برگه شمارش شماره ${stocktakingNumber || stocktakingCountId || ''}`,
        details: surplusDetails,
      };

      const saveRes = await apiFetch("/api/inv/warehouse-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (saveRes && saveRes.ok) {
        const createdData = await saveRes.json();
        const createdId = createdData?.WarehouseReceiptID || createdData?.id;

        showToast(
          `رسید اضافات انبارگردانی به شماره ${receiptNumber} با موفقیت صادر گردید (شامل ${surplusDetails.length} قلم کالا).`,
          "success"
        );

        onClose();
        if (onSuccess) {
          onSuccess(createdId);
        }
      } else {
        const errText = await saveRes.text();
        console.error("Error creating surplus receipt:", errText);
        showToast("خطا در صدور رسید اضافات انبارگردانی.", "error");
      }
    } catch (err) {
      console.error("Error issuing surplus receipt:", err);
      showToast("خطا در ارتباط با سرور جهت صدور رسید اضافات.", "error");
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
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                صدور رسید اضافات انبارگردانی
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ثبت رسید انبار بابت مازاد موجودی شمارش‌شده نسبت به کاردکس
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
                <p className="font-bold text-sm mb-0.5">سند اضافات قبلاً صادر شده است</p>
                <p>
                  سند اضافات انبارگردانی برای این انبار و دوره انبارگردانی قبلاً به شماره{" "}
                  <span className="font-bold underline">{existingReceiptDoc?.ReceiptNumber || existingReceiptDoc?.id}</span> صادر گردیده است.
                  امکان صدور سند اضافات تکراری وجود ندارد.
                </p>
              </div>
            </div>
          )}

          {/* Field 1: نوع سند انبار (SingleSelectDropDown - Mandatory) */}
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
              listApiUrl="/api/inv/warehouse-document-types?nature=1"
              valueKey="WarehouseDocumentTypeID"
              titleKey="WarehouseDocumentTypeTitle"
              codeKey="WarehouseDocumentTypeCode"
              placeholder="نوع سند اضافه انبارگردانی را انتخاب نمایید..."
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

          {/* Field 2: شماره رسید (NumberInput - Mandatory) */}
          <div className="space-y-1">
            <FormLabel htmlFor="ReceiptNumber" required>
              شماره رسید
            </FormLabel>
            <NumberInput
              value={receiptNumber}
              onChange={(val) => {
                setReceiptNumber(val);
                if (val) setErrors((prev) => ({ ...prev, receiptNumber: undefined }));
              }}
              placeholder="شماره رسید انبار"
              disabled={submitting || loadingNextNumber || alreadyIssued}
              className={`w-full ${errors.receiptNumber ? "border-red-500" : ""}`}
            />
            {errors.receiptNumber && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.receiptNumber}
              </p>
            )}
          </div>

          {/* Field 3: تاریخ رسید (DateInput - Mandatory) */}
          <div className="space-y-1">
            <FormLabel htmlFor="ReceiptDate" required>
              تاریخ رسید
            </FormLabel>
            <DateInput
              value={receiptDate}
              onChange={(val) => {
                setReceiptDate(val);
                if (val) setErrors((prev) => ({ ...prev, receiptDate: undefined }));
              }}
              disabled={submitting || alreadyIssued}
              className={errors.receiptDate ? "border-red-500" : ""}
            />
            {errors.receiptDate && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.receiptDate}
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
              placeholder="توضیحات اختیاری رسید اضافه انبارگردانی..."
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
            {/* Delete Surplus Receipt Icon Button (if already issued) */}
            {alreadyIssued && existingReceiptDoc && (
              <Tooltip content="حذف رسید اضافات انبارگردانی" side="top">
                <button
                  type="button"
                  onClick={handleDeleteExistingReceipt}
                  disabled={deleting || submitting}
                  className="p-2.5 text-rose-600 hover:text-white bg-rose-100 hover:bg-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-600 border border-rose-300 dark:border-rose-700 rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Tooltip>
            )}

            {/* View Surplus Receipt Icon Button (if already issued) */}
            {alreadyIssued && existingReceiptDoc && (
              <Tooltip content="مشاهده رسید اضافات انبارگردانی" side="top">
                <button
                  type="button"
                  onClick={handleOpenExistingReceipt}
                  disabled={submitting}
                  className="p-2.5 text-blue-600 hover:text-white bg-blue-100 hover:bg-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-600 border border-blue-300 dark:border-blue-700 rounded-lg transition-all shadow-2xs disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </Tooltip>
            )}

            {/* Issue Surplus Voucher Icon Button */}
            <Tooltip content="صدور سند اضافات انبارگردانی" side="top">
              <button
                type="button"
                onClick={handleIssueSurplusReceipt}
                disabled={submitting || alreadyIssued || checkingDuplicate || deleting}
                className="p-2.5 text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center"
              >
                <StocktakingSurplusVoucherIcon className="w-5 h-5 text-white" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
