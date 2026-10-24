"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Calculator,
  ChevronDown,
  Tag,
  ShoppingCart,
  PackageOpen,
  X,
  Layers,
  Sparkles,
  ArrowDownToLine,
  Receipt,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { useLanguage } from "@/components/Providers";

export type PricingMethodType = "standardRate" | "lastPurchase" | "lastConsumption";

export interface PricingMethodOption {
  id: PricingMethodType;
  title: string;
  description: string;
  tag: string;
  badgeNumber: string;
  icon: React.ElementType;
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    hoverBg: string;
    badgeBg: string;
  };
}

const PRICING_METHODS: PricingMethodOption[] = [
  {
    id: "standardRate",
    title: "قیمت گذاری بر اساس نرخ استاندارد",
    description: "محاسبه و مقداردهی فی کلیه اقلام بر مبنای نرخ استاندارد و مصوب تعریف‌شده در سیستم کالا",
    tag: "نرخ استاندارد",
    badgeNumber: "۱",
    icon: Scale,
    colorScheme: {
      bg: "bg-blue-50/80 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
      hoverBg: "hover:bg-blue-100/70 dark:hover:bg-blue-900/50 hover:border-blue-400 dark:hover:border-blue-600",
      badgeBg: "bg-blue-600 text-white",
    },
  },
  {
    id: "lastPurchase",
    title: "قیمت گذاری بر اساس آخرین خرید",
    description: "محاسبه و درج فی اقلام بر مبنای آخرین فاکتور خرید قطعی یا رسید خرید تامین‌کننده",
    tag: "آخرین خرید",
    badgeNumber: "۲",
    icon: ShoppingCart,
    colorScheme: {
      bg: "bg-emerald-50/80 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
      hoverBg: "hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-600",
      badgeBg: "bg-emerald-600 text-white",
    },
  },
  {
    id: "lastConsumption",
    title: "قیمت گذاری بر اساس آخرین مصرف",
    description: "محاسبه و درج فی اقلام بر مبنای آخرین حواله مصرف یا میانگین نرخ مصرف خروج از انبار",
    tag: "آخرین مصرف",
    badgeNumber: "۳",
    icon: PackageOpen,
    colorScheme: {
      bg: "bg-amber-50/80 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      hoverBg: "hover:bg-amber-100/70 dark:hover:bg-amber-900/50 hover:border-amber-400 dark:hover:border-amber-600",
      badgeBg: "bg-amber-600 text-white",
    },
  },
];

// Dedicated Vector SVG Icon for Warehouse Receipt Pricing Button
const WarehouseReceiptPricingIcon = ({
  className,
  style,
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ width: "1.35rem", height: "1.35rem", margin: 0, padding: 0, ...style }}
    {...props}
  >
    {/* Receipt / Invoice Sheet */}
    <rect
      x="3"
      y="3"
      width="13"
      height="17"
      rx="1.8"
      fill="#ccfbf1"
      stroke="#0f766e"
      strokeWidth="1.2"
    />
    <path d="M6 7h7M6 10h5" stroke="#0d9488" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M6 13h3" stroke="#0d9488" strokeWidth="1.2" strokeLinecap="round" />

    {/* Calculator / Price Tag emblem */}
    <rect
      x="12"
      y="11"
      width="9"
      height="10"
      rx="1.5"
      fill="#0d9488"
      stroke="#ffffff"
      strokeWidth="1"
    />
    {/* Calculator screen / Price lines */}
    <rect x="13.5" y="12.5" width="6" height="2.2" rx="0.5" fill="#f0fdfa" />
    {/* Calculator buttons / dots */}
    <circle cx="14.5" cy="16.5" r="0.75" fill="#f0fdfa" />
    <circle cx="17.5" cy="16.5" r="0.75" fill="#f0fdfa" />
    <circle cx="14.5" cy="19" r="0.75" fill="#f0fdfa" />
    <circle cx="17.5" cy="19" r="0.75" fill="#f0fdfa" />

    {/* Downward tiny arrow indicating dropdown / megamenu */}
    <path
      d="M10 17l1.5 1.5 1.5-1.5"
      stroke="#0f766e"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface WarehouseReceiptPricingButtonProps {
  onSelectMethod?: (method: PricingMethodType, title: string) => void;
  disabled?: boolean;
  hideLabel?: boolean;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function WarehouseReceiptPricingButton({
  onSelectMethod,
  disabled = false,
  hideLabel = true,
  tooltip,
  tooltipPosition = "bottom",
  className,
}: WarehouseReceiptPricingButtonProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultLabel = "قیمت‌گذاری رسید انبار";
  const defaultTooltip = "قیمت‌گذاری رسید انبار (مگامنو روش‌های محاسبه)";

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleItemSelect = (method: PricingMethodType, title: string) => {
    setIsOpen(false);
    if (onSelectMethod) {
      onSelectMethod(method, title);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Tooltip content={tooltip || defaultTooltip} position={tooltipPosition}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={isOpen}
          style={{ height: "30px", padding: hideLabel ? 0 : "0 10px" }}
          className={cn(
            "flex items-center justify-center gap-1 text-sm font-medium transition-all rounded-md shadow-sm outline-none shrink-0 border-none cursor-pointer select-none",
            hideLabel ? "w-[30px] h-[30px] p-0" : "h-[30px] px-2.5",
            disabled
              ? "opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-700 text-slate-500"
              : "!bg-[#0d9488] !text-white hover:!bg-[#0f766e] active:scale-95 dark:!bg-[#0d9488] dark:hover:!bg-[#0f766e]",
            isOpen && "ring-2 ring-[#0d9488]/50 shadow-md",
            className
          )}
        >
          <WarehouseReceiptPricingIcon />
          {!hideLabel && (
            <>
              <span className="truncate">{defaultLabel}</span>
              <ChevronDown
                className={cn("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")}
              />
            </>
          )}
        </button>
      </Tooltip>

      {/* Mega Menu Dropdown Panel */}
      {isOpen && !disabled && (
        <div
          dir="rtl"
          className="absolute z-[9999] top-[calc(100%+6px)] right-0 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150 text-right select-none"
        >
          {/* Mega Menu Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-2xs border border-teal-200 dark:border-teal-800">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  قیمت‌گذاری رسید انبار
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  روش‌های خودکار محاسبه و مقداردهی فی اقلام
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="بستن منو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mega Menu 3 Pricing Items */}
          <div className="flex flex-col gap-2">
            {PRICING_METHODS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemSelect(item.id, item.title)}
                  className={cn(
                    "group relative flex items-start gap-2.5 p-2.5 rounded-lg border text-right transition-all cursor-pointer",
                    item.colorScheme.bg,
                    item.colorScheme.border,
                    item.colorScheme.hoverBg,
                    "shadow-2xs active:scale-[0.99]"
                  )}
                >
                  {/* Number Badge & Icon */}
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shadow-2xs",
                        item.colorScheme.badgeBg
                      )}
                    >
                      {item.badgeNumber}
                    </span>
                    <Icon className={cn("w-4 h-4 mt-0.5", item.colorScheme.text)} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "text-[9.5px] px-1.5 py-0.5 rounded-full font-medium shrink-0 border",
                          item.colorScheme.bg,
                          item.colorScheme.border,
                          item.colorScheme.text
                        )}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mega Menu Footer */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              محاسبه آنی فی و به‌روزرسانی مبلغ کل اقلام
            </span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              کلید میانبر: Esc جهت خروج
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias for flexible imports
export const WarehouseReceiptPricingMenu = WarehouseReceiptPricingButton;
export const ReceiptPricingDropdown = WarehouseReceiptPricingButton;
