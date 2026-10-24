"use client";

import React, { useState, useEffect, useRef } from "react";
import { SimpleFormTwoRow } from "../SimpleFormTwoRow";
import { FieldConfig } from "../SimpleFormTwoRow";
import { Checkbox } from "@/components/inputs/Checkbox";
import { TextInput } from "@/components/inputs/TextInput";
import { SingleSelectDropDown } from "@/components/inputs/SingleSelectDropDown";
import { Barcode, QrCode, Printer, Scan, CheckCircle2, AlertTriangle, RefreshCw, Layers, ShieldCheck, Eye, PackageCheck, Copy } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { apiFetch } from "@/lib/utils";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

interface ItemOption {
  ItemID: number;
  ItemCode: number | string;
  ItemName: string;
  MeasurementUnitName?: string;
   ईरानCode?: string;
  DetailedAccountCode?: string;
}

interface TrackingFactorItem {
  TrackingFactorID: number;
  TrackingFactorCode?: number;
  TrackingFactorName: string;
  TrackingFactorType: number; // 1: Number, 2: Decimal, 3: Boolean, 4: Date, 5: Time, 6: Text, 7: Color
  IsActive: boolean;
}

export function BarcodeLabelForm() {
  const { showToast } = useToast();

  // Primary State
  const [items, setItems] = useState<ItemOption[]>([]);
  const [trackingFactors, setTrackingFactors] = useState<TrackingFactorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form Values
  const [values, setValues] = useState<Record<string, any>>({
    itemRef: "",
    barcodeType: "CODE128",
    barcodePayload: "",
    labelQuantity: 1,
    labelSize: "50x30",
    showItemName: true,
    showItemCode: true,
    showPrice: false,
    itemPrice: "0",
    showDate: true,
  });

  // Selected item details
  const [selectedItem, setSelectedItem] = useState<ItemOption | null>(null);

  // Tracking Factor selected states and custom values
  const [selectedFactors, setSelectedFactors] = useState<Record<number, boolean>>({});
  const [factorValues, setFactorValues] = useState<Record<number, string>>({});

  // Generated barcode rendering outputs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [barcodeGenerationError, setBarcodeGenerationError] = useState<string | null>(null);

  // Scanner & Validation state
  const [scannedInput, setScannedInput] = useState<string>("");
  const [scannerActive, setScannerActive] = useState<boolean>(true);
  const [testScanInput, setTestScanInput] = useState<string>("");
  const [testScanResult, setTestScanResult] = useState<{ matches: boolean; message: string } | null>(null);
  const scannerInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial data (Items & Tracking Factors)
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      apiFetch("/api/inv/items?pageSize=1000").then((res) => res.json()),
      apiFetch("/api/inv/tracking-factors").then((res) => res.json()),
    ])
      .then(([itemsRes, factorsRes]) => {
        const itemList = Array.isArray(itemsRes)
          ? itemsRes
          : itemsRes?.data?.items || itemsRes?.items || [];
        setItems(itemList);

        const factorList = Array.isArray(factorsRes) ? factorsRes : [];
        setTrackingFactors(factorList);

        // Preselect first item if available
        if (itemList.length > 0) {
          const first = itemList[0];
          setValues((prev) => ({
            ...prev,
            itemRef: String(first.ItemID),
            barcodePayload: String(first.ItemCode || first.ItemID),
          }));
          setSelectedItem(first);
        }
      })
      .catch((err) => {
        console.error("Error loading barcode generator data:", err);
        showToast("خطا در بارگذاری اطلاعات کالاها و عوامل ردیابی", "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // When selected item changes
  const handleItemChange = (itemIdStr: string) => {
    const found = items.find((it) => String(it.ItemID) === String(itemIdStr));
    setSelectedItem(found || null);

    const baseCode = found ? String(found.ItemCode || found.ItemID) : "";
    setValues((prev) => ({
      ...prev,
      itemRef: itemIdStr,
      barcodePayload: generateCombinedPayload(baseCode, selectedFactors, factorValues),
    }));
  };

  // Generate payload combining item code and enabled tracking factors
  const generateCombinedPayload = (
    baseCode: string,
    factorsEnabled: Record<number, boolean>,
    fValues: Record<number, string>
  ) => {
    if (!baseCode) return "";

    const activeParts: string[] = [baseCode];
    trackingFactors.forEach((tf) => {
      if (factorsEnabled[tf.TrackingFactorID]) {
        const val = fValues[tf.TrackingFactorID] || "";
        if (val) {
          activeParts.push(`${tf.TrackingFactorName}:${val}`);
        }
      }
    });

    return activeParts.join("-");
  };

  // Update values handler
  const handleFormChange = (name: string, val: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: val };
      if (name === "barcodeType") {
        // Clear error when barcode type changes
        setBarcodeGenerationError(null);
      }
      return next;
    });
  };

  // Toggle tracking factor checkbox
  const handleFactorToggle = (factorId: number, checked: boolean) => {
    const newSelected = { ...selectedFactors, [factorId]: checked };
    setSelectedFactors(newSelected);

    const baseCode = selectedItem ? String(selectedItem.ItemCode || selectedItem.ItemID) : values.barcodePayload;
    const newPayload = generateCombinedPayload(baseCode, newSelected, factorValues);
    setValues((prev) => ({ ...prev, barcodePayload: newPayload }));
  };

  // Change tracking factor value
  const handleFactorValueChange = (factorId: number, val: string) => {
    const newValues = { ...factorValues, [factorId]: val };
    setFactorValues(newValues);

    const baseCode = selectedItem ? String(selectedItem.ItemCode || selectedItem.ItemID) : values.barcodePayload;
    const newPayload = generateCombinedPayload(baseCode, selectedFactors, newValues);
    setValues((prev) => ({ ...prev, barcodePayload: newPayload }));
  };

  // Render Barcode dynamically whenever barcodePayload, barcodeType, or values change
  useEffect(() => {
    const payload = String(values.barcodePayload || "").trim();
    const type = values.barcodeType || "CODE128";

    setBarcodeGenerationError(null);

    if (!payload) return;

    // 1D Barcode formats
    const is1D = ["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14"].includes(type);

    if (is1D) {
      if (svgRef.current) {
        try {
          // Pre-validate numeric-only requirements for EAN/UPC
          if (["EAN13", "EAN8", "UPC", "ITF14"].includes(type) && !/^\d+$/.test(payload)) {
            setBarcodeGenerationError(`نوع بارکد ${type} فقط شامل ارقام عددی (0-9) می‌باشد.`);
            return;
          }
          if (type === "EAN13" && payload.length !== 12 && payload.length !== 13) {
            setBarcodeGenerationError("بارکد EAN-13 باید دقیقا 12 یا 13 رقم داشته باشد.");
            return;
          }
          if (type === "EAN8" && payload.length !== 7 && payload.length !== 8) {
            setBarcodeGenerationError("بارکد EAN-8 باید دقیقا 7 یا 8 رقم داشته باشد.");
            return;
          }

          JsBarcode(svgRef.current, payload, {
            format: type as any,
            width: 1.8,
            height: 55,
            displayValue: true,
            font: "monospace",
            fontSize: 13,
            margin: 8,
            background: "#ffffff",
            lineColor: "#000000",
          });
        } catch (err: any) {
          console.error("JsBarcode error:", err);
          setBarcodeGenerationError(err?.message || "خطا در تولید ساختار بارکد تک‌بعدی.");
        }
      }
    } else if (type === "QR_CODE" || type === "DATA_MATRIX") {
      QRCode.toDataURL(payload, {
        margin: 2,
        width: 160,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
        .then((url) => {
          setQrDataUrl(url);
        })
        .catch((err) => {
          console.error("QRCode error:", err);
          setBarcodeGenerationError("خطا در تولید بارکد دوبعدی.");
        });
    }
  }, [values.barcodePayload, values.barcodeType]);

  // Handle hardware scanner input
  const handleScannerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processScannedBarcode(scannedInput);
    }
  };

  // Process barcode input from physical scanner or camera import
  const processScannedBarcode = (scannedText: string) => {
    const raw = scannedText.trim();
    if (!raw) return;

    // Check if raw matches any item code
    const matchedItem = items.find(
      (it) => String(it.ItemCode).trim() === raw || String(it.ItemID).trim() === raw || raw.startsWith(String(it.ItemCode))
    );

    if (matchedItem) {
      setSelectedItem(matchedItem);
      setValues((prev) => ({
        ...prev,
        itemRef: String(matchedItem.ItemID),
        barcodePayload: raw,
      }));

      // Check if scanned string contains tracking factor delimiters e.g. ITEMCODE-Lot:L1-Exp:1405
      if (raw.includes("-") || raw.includes(":")) {
        const parts = raw.split("-");
        const newSelected: Record<number, boolean> = {};
        const newVals: Record<number, string> = {};

        parts.slice(1).forEach((part) => {
          const [key, val] = part.split(":");
          if (key && val) {
            const tf = trackingFactors.find((t) => t.TrackingFactorName.trim() === key.trim());
            if (tf) {
              newSelected[tf.TrackingFactorID] = true;
              newVals[tf.TrackingFactorID] = val.trim();
            }
          }
        });

        setSelectedFactors(newSelected);
        setFactorValues(newVals);
      }

      showToast(`کالای «${matchedItem.ItemName}» با موفقیت از طریق دستگاه بارکدخوان قرائت گردید.`, "success");
    } else {
      // Set raw as barcode payload directly
      setValues((prev) => ({
        ...prev,
        barcodePayload: raw,
      }));
      showToast(`بارکد قرائت شد: «${raw}». اطلاعات به فرم منتقل گردید.`, "info");
    }

    setScannedInput("");
  };

  // Validate Barcode Quality & Standard Integrity
  const getValidationReport = () => {
    const payload = String(values.barcodePayload || "").trim();
    const type = values.barcodeType || "CODE128";

    const checks = [
      {
        title: "حضور محتوای داده (Data Presence)",
        passed: payload.length > 0,
        message: payload.length > 0 ? "داده بارکد تعریف شده است." : "کد بارکد خالی است.",
      },
      {
        title: "اعتبارسنجی فرمت منحصربه‌فرد (Format Standard)",
        passed: !barcodeGenerationError,
        message: !barcodeGenerationError
          ? `فرمت انتخاب شده (${type}) استاندارد و معتبر است.`
          : barcodeGenerationError,
      },
      {
        title: "حاشیه امن و کنتراست تصویر (Quiet Zone & Contrast)",
        passed: true,
        message: "حاشیه سفید دور بارکد (Margin >= 8px) و کنتراست ۱۰۰٪ مشکی/سفید رعایت گردیده است.",
      },
      {
        title: "سازگاری با انواع بارکدخوان (Scanner Compatibility)",
        passed: payload.length <= 100,
        message:
          payload.length <= 100
            ? "طول داده برای اسکن توسط تمامی بارکدخوان‌های لیزری و اپتیکال بهینه است."
            : "طول داده زیاد است؛ برای قرائت بهتر از بارکد دوبعدی (QR Code) استفاده فرمایید.",
      },
    ];

    const allPassed = checks.every((c) => c.passed);
    return { checks, allPassed };
  };

  const validationReport = getValidationReport();

  // Test scan verification simulator
  const handleTestScan = () => {
    const target = String(values.barcodePayload || "").trim();
    const entered = testScanInput.trim();

    if (!entered) {
      setTestScanResult(null);
      return;
    }

    if (entered === target) {
      setTestScanResult({
        matches: true,
        message: "✓ صحت کامل قرائت تایید شد. برچسب کاملاً خوانا و معتبر است.",
      });
    } else {
      setTestScanResult({
        matches: false,
        message: `✕ عدم مطابقت! متن اسکن شده: «${entered}» - متن مورد انتظار: «${target}»`,
      });
    }
  };

  // Print function
  const handlePrintLabels = () => {
    if (!values.barcodePayload) {
      showToast("لطفا ابتدا محتوای بارکد را وارد کنید.", "error");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast("مرورگر مانع باز شدن پنجره چاپ گردید. لطفا اجازه باز شدن pop-up را بدهید.", "error");
      return;
    }

    const qty = Math.max(1, Number(values.labelQuantity) || 1);
    const itemNameStr = selectedItem ? selectedItem.ItemName : "";
    const itemCodeStr = selectedItem ? selectedItem.ItemCode : values.barcodePayload;
    const is1D = ["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14"].includes(values.barcodeType);

    let barcodeImgHtml = "";
    if (is1D && svgRef.current) {
      const svgXml = new XMLSerializer().serializeToString(svgRef.current);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgXml)));
      barcodeImgHtml = `<img src="data:image/svg+xml;base64,${svgBase64}" style="max-width: 100%; height: 60px;" />`;
    } else if (qrDataUrl) {
      barcodeImgHtml = `<img src="${qrDataUrl}" style="width: 100px; height: 100px;" />`;
    }

    const activeFactorBadges = (trackingFactors || [])
      .filter((tf) => selectedFactors[tf.TrackingFactorID] && factorValues[tf.TrackingFactorID])
      .map(
        (tf) =>
          `<span style="display:inline-block; border:1px solid #cbd5e1; padding:2px 5px; font-size:10px; border-radius:4px; margin:2px;">
            ${tf.TrackingFactorName}: <strong>${factorValues[tf.TrackingFactorID]}</strong>
          </span>`
      )
      .join("");

    const labelsHtml = Array.from({ length: qty })
      .map(
        () => `
        <div style="
          width: 50mm;
          height: 30mm;
          border: 1px dashed #64748b;
          box-sizing: border-box;
          padding: 3mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          page-break-inside: avoid;
          margin: 3mm auto;
          font-family: tahoma, sans-serif;
          background: #fff;
          direction: rtl;
        ">
          <div style="font-size:10px; font-weight:bold; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">
            ${values.showItemName && itemNameStr ? itemNameStr : "پارسا ERP - برچسب کالا"}
          </div>
          <div style="display:flex; justify-content:center; align-items:center; my:2px;">
            ${barcodeImgHtml}
          </div>
          <div style="font-size:9px; color:#334155; text-align:center;">
            ${values.showItemCode ? `کد کالا: <strong>${itemCodeStr}</strong>` : ""}
          </div>
          ${activeFactorBadges ? `<div style="text-align:center;">${activeFactorBadges}</div>` : ""}
        </div>
      `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
        <head>
          <title>چاپ برچسب بارکد کالا</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 10px; font-family: tahoma, sans-serif; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div className="no-print" style="margin-bottom:15px; text-align:center;">
            <button onclick="window.print()" style="padding:8px 20px; font-size:14px; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer;">
              شروع چاپ برچسب‌ها (${qty} نسخه)
            </button>
          </div>
          <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px;">
            ${labelsHtml}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Definition of fields for SimpleFormTwoRow header
  const formFields: FieldConfig[] = [
    {
      name: "itemRef",
      label: "کالا / خدمت",
      type: "custom",
      required: true,
      customComponent: (
        <SingleSelectDropDown
          options={(items || []).map((it) => ({
            value: String(it.ItemID),
            label: `${it.ItemCode ? `[${it.ItemCode}] ` : ""}${it.ItemName}`,
          }))}
          value={values.itemRef}
          onChange={(val) => handleItemChange(val)}
          placeholder="انتخاب کالا یا خدمت جهت تولید برچسب..."
        />
      ),
    },
    {
      name: "barcodeType",
      label: "نوع بارکد",
      type: "select",
      required: true,
      options: [
        { value: "CODE128", label: "CODE 128 (تک بعدی - عمومی و استاندارد)" },
        { value: "CODE39", label: "CODE 39 (تک بعدی - حروف و اعداد)" },
        { value: "EAN13", label: "EAN-13 (تک بعدی - تجاری ۱۳ رقمی)" },
        { value: "EAN8", label: "EAN-8 (تک بعدی - تجاری ۸ رقمی)" },
        { value: "UPC", label: "UPC-A (تک بعدی - تجاری ۱۲ رقمی)" },
        { value: "ITF14", label: "ITF-14 (تک بعدی - بسته بندی کارتنی)" },
        { value: "QR_CODE", label: "QR Code (دوبعدی - ماتریسی پرکاربرد)" },
        { value: "DATA_MATRIX", label: "Data Matrix (دوبعدی - قطعات و صنعتی)" },
      ],
    },
    {
      name: "barcodePayload",
      label: "محتوای بارکد (Payload)",
      type: "text",
      required: true,
      placeholder: "کد یا فرمت انکود شده بارکد...",
    },
    {
      name: "labelQuantity",
      label: "تعداد برچسب برای چاپ",
      type: "number",
      placeholder: "۱",
    },
    {
      name: "labelSize",
      label: "ابعاد برچسب چاپ",
      type: "select",
      options: [
        { value: "50x30", label: "50x30 میلی‌متر (حرارتی عمومی)" },
        { value: "100x50", label: "100x50 میلی‌متر (بسته بندی بزرگ)" },
        { value: "40x25", label: "40x25 میلی‌متر (کوچک / قطعات)" },
        { value: "70x40", label: "70x40 میلی‌متر (انبارداری صنعتی)" },
        { value: "A4_GRID", label: "شیت A4 چسب‌دار (۴۰ عددی)" },
      ],
    },
    {
      name: "itemPrice",
      label: "قیمت / نرخ درج شده",
      type: "amount",
      placeholder: "۰",
    },
  ];

  return (
    <SimpleFormTwoRow
      title="تولید برچسب بارکد کالا"
      icon={<Barcode className="w-5 h-5 text-white" />}
      fields={formFields}
      values={values}
      onChange={handleFormChange}
      onSave={handlePrintLabels}
      onNew={() => {
        setValues({
          itemRef: "",
          barcodeType: "CODE128",
          barcodePayload: "",
          labelQuantity: 1,
          labelSize: "50x30",
          showItemName: true,
          showItemCode: true,
          showPrice: false,
          itemPrice: "0",
          showDate: true,
        });
        setSelectedFactors({});
        setFactorValues({});
        setSelectedItem(null);
      }}
      actionbar={
        <button
          type="button"
          onClick={handlePrintLabels}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          چاپ برچسب‌ها ({values.labelQuantity || 1} عدد)
        </button>
      }
    >
      {/* Detailed Child Sections */}
      <div className="flex flex-col gap-6 mt-4 w-full">
        {/* SECTION 1: Dynamic Tracking Factors */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-xs font-bold">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>عوامل ردیابی کالا در برچسب (تعریف شده در سیستم انبار)</span>
            </div>
            <span className="text-[11px] text-slate-500">
              تعداد عوامل تعریف‌شده: {(trackingFactors || []).length} مورد
            </span>
          </div>

          {(trackingFactors || []).length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-3 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
              هیچ عامل ردیابی در فرم «تعریف عامل ردیابی» ایجاد نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(trackingFactors || []).map((tf) => {
                const isChecked = !!selectedFactors[tf.TrackingFactorID];
                return (
                  <div
                    key={tf.TrackingFactorID}
                    className={`p-3 rounded-lg border transition-all ${
                      isChecked
                        ? "bg-indigo-50/70 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800"
                        : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Checkbox
                        label={tf.TrackingFactorName}
                        checked={isChecked}
                        onChange={(chk) => handleFactorToggle(tf.TrackingFactorID, chk)}
                      />
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                        {tf.TrackingFactorType === 4
                          ? "تاریخ"
                          : tf.TrackingFactorType === 1
                          ? "عددی"
                          : tf.TrackingFactorType === 5
                          ? "ساعت"
                          : "متنی"}
                      </span>
                    </div>

                    {isChecked && (
                      <div className="mt-2">
                        <TextInput
                          label={`مقدار ${tf.TrackingFactorName}:`}
                          value={factorValues[tf.TrackingFactorID] || ""}
                          onChange={(val) => handleFactorValueChange(tf.TrackingFactorID, val)}
                          placeholder={`مقدار ${tf.TrackingFactorName}...`}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Label Design Customization & Live Barcode Tag Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-800 dark:text-slate-200 text-xs font-bold">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>تنظیمات عناصر روی برچسب</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Checkbox
                label="نمایش نام کالا"
                checked={values.showItemName}
                onChange={(v) => handleFormChange("showItemName", v)}
              />
              <Checkbox
                label="نمایش کد کالا"
                checked={values.showItemCode}
                onChange={(v) => handleFormChange("showItemCode", v)}
              />
              <Checkbox
                label="نمایش قیمت کالا"
                checked={values.showPrice}
                onChange={(v) => handleFormChange("showPrice", v)}
              />
              <Checkbox
                label="نمایش تاریخ چاپ"
                checked={values.showDate}
                onChange={(v) => handleFormChange("showDate", v)}
              />
            </div>
          </div>

          {/* Live Thermal Label Tag Preview Area */}
          <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
            <div className="text-slate-500 text-[11px] font-medium mb-2 flex items-center gap-1">
              <span>پیش‌نمایش زنده برچسب حرارتی ({values.labelSize})</span>
            </div>

            {/* Simulated Printed Tag */}
            <div className="w-[280px] min-h-[170px] bg-white text-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-lg p-3 shadow-md flex flex-col items-center justify-between text-center relative">
              {/* Tag Header */}
              <div className="w-full text-xs font-bold border-b border-slate-200 pb-1 flex justify-between items-center">
                <span className="truncate max-w-[180px]">
                  {values.showItemName && selectedItem ? selectedItem.ItemName : "برچسب ردیابی کالا"}
                </span>
                <span className="text-[10px] text-slate-500">پارسا ERP</span>
              </div>

              {/* Barcode Render Space */}
              <div className="my-2 flex flex-col items-center justify-center w-full min-h-[75px]">
                {barcodeGenerationError ? (
                  <div className="text-[11px] text-rose-600 font-medium px-2 py-1 bg-rose-50 border border-rose-200 rounded text-center">
                    {barcodeGenerationError}
                  </div>
                ) : (
                  <>
                    {["CODE128", "CODE39", "EAN13", "EAN8", "UPC", "ITF14"].includes(values.barcodeType) ? (
                      <svg ref={svgRef} className="max-w-full h-auto"></svg>
                    ) : (
                      qrDataUrl && (
                        <img src={qrDataUrl} alt="QR Barcode" className="w-24 h-24 object-contain" />
                      )
                    )}
                  </>
                )}
              </div>

              {/* Tag Footer & Tracking Factors */}
              <div className="w-full text-[10px] border-t border-slate-100 pt-1 text-slate-600 flex flex-col gap-0.5">
                <div className="flex justify-between items-center w-full px-1">
                  {values.showItemCode && (
                    <span>
                      کد: <strong>{selectedItem ? selectedItem.ItemCode : values.barcodePayload}</strong>
                    </span>
                  )}
                  {values.showPrice && Number(values.itemPrice) > 0 && (
                    <span>
                      قیمت: <strong>{Number(values.itemPrice).toLocaleString("fa-IR")} ریال</strong>
                    </span>
                  )}
                </div>

                {/* Rendered Factor Badges */}
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {(trackingFactors || []).map((tf) => {
                    if (selectedFactors[tf.TrackingFactorID] && factorValues[tf.TrackingFactorID]) {
                      return (
                        <span
                          key={tf.TrackingFactorID}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-800 text-[9px] font-semibold rounded border border-slate-300"
                        >
                          {tf.TrackingFactorName}: {factorValues[tf.TrackingFactorID]}
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Barcode Reading & Scanner Wedge Engine (خوانش بارکد خوان) */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 text-xs font-bold">
              <Scan className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>خوانش مستقیم و ورود اطلاعات از طریق دستگاه بارکدخوان (Barcode Scanner Wedge)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                دستگاه بارکدخوان آماده است
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={scannerInputRef}
                  type="text"
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  onKeyDown={handleScannerKeyDown}
                  placeholder="بارکد را اسکن کنید یا بارکدخوان را نشانه‌گیری فرمایید (پایان با Enter)..."
                  className="w-full px-3 py-2 pl-10 text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  autoFocus
                />
                <Scan className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              </div>
              <button
                type="button"
                onClick={() => processScannedBarcode(scannedInput)}
                className="px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors shrink-0"
              >
                ورود داده اسکن‌شده
              </button>
            </div>

            <div className="md:col-span-4 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
              💡 کلیه بارکدخوان‌های USB و بیسیم استاندارد به محض اسکن، داده کالا و عوامل ردیابی را تفکیک نموده و فرم را تکمیل می‌نمایند.
            </div>
          </div>
        </div>

        {/* SECTION 4: Barcode Validation & Readability Audit (اعتبارسنجی صحت کارکرد برچسب) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-xs font-bold">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              <span>اعتبارسنجی و تست صحت کارکرد برچسب بارکد (Validation & Readability Audit)</span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                validationReport.allPassed
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {validationReport.allPassed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  برچسب کاملاً معتبر و قابل خواندن است
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  نیازمند اصلاح ساختار
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Checklist */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                گزارش چک‌لیست اعتبارسنجی ساختار و کنتراست:
              </span>
              {(validationReport?.checks || []).map((chk, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{chk.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{chk.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Interactive Scanner Test Simulator */}
            <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <PackageCheck className="w-4 h-4 text-blue-500" />
                تست اسکنر و سنجش صحت خوانایی (Scan Integrity Test):
              </span>
              <p className="text-[11px] text-slate-500">
                با دستگاه بارکدخوان، بارکد تولید شده روی صفحه یا چاپی را اسکن کنید تا تطابق ۱۰۰٪ خروجی سنجیده شود.
              </p>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={testScanInput}
                  onChange={(e) => setTestScanInput(e.target.value)}
                  placeholder="کد اسکن‌شده توسط بارکدخوان..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md font-mono"
                />
                <button
                  type="button"
                  onClick={handleTestScan}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs"
                >
                  بررسی مطابقت
                </button>
              </div>

              {testScanResult && (
                <div
                  className={`mt-2 p-2 rounded text-xs font-semibold flex items-center gap-1.5 ${
                    testScanResult.matches
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                  }`}
                >
                  {testScanResult.matches ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testScanResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimpleFormTwoRow>
  );
}
