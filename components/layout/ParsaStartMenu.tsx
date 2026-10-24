'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  FileText,
  Boxes,
  ClipboardCheck,
  PackageSearch,
  Package,
  Layers,
  FileCode,
  Banknote,
  Building2,
  Users,
  Calendar,
  Settings,
  BarChart2,
  FolderTree,
  Plus,
  RefreshCw,
  Key,
  Sparkles,
  Wallet,
  Scale,
  List,
  FileSpreadsheet,
  Truck,
  BookOpen,
  Network
} from 'lucide-react';
import { useTabs } from '@/components/TabsProvider';
import { clsx } from 'clsx';

interface ParsaStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  lockNumber?: string | null;
}

// Custom Pinned Forms definition matching Windows 11 pinned apps style
const PINNED_FORMS = [
  {
    id: 'VouchersList',
    title: 'اسناد حسابداری',
    category: 'accounting',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600',
    componentName: 'VouchersList',
  },
  {
    id: 'AccountReview',
    title: 'مرور حساب‌ها',
    category: 'accounting',
    icon: BarChart2,
    color: 'from-emerald-500 to-teal-600',
    componentName: 'AccountReview',
  },
  {
    id: 'WarehouseReceiptForm',
    title: 'رسید انبار',
    category: 'inventory',
    icon: Boxes,
    color: 'from-amber-500 to-orange-600',
    componentName: 'WarehouseReceiptForm',
  },
  {
    id: 'WarehouseIssueForm',
    title: 'حواله انبار',
    category: 'inventory',
    icon: Truck,
    color: 'from-cyan-500 to-blue-600',
    componentName: 'WarehouseIssueForm',
  },
  {
    id: 'StocktakingForm',
    title: 'انبارگردانی',
    category: 'inventory',
    icon: ClipboardCheck,
    color: 'from-rose-500 to-pink-600',
    componentName: 'StocktakingForm',
  },
  {
    id: 'StocktakingList',
    title: 'فهرست کسری/اضافات',
    category: 'inventory',
    icon: FileSpreadsheet,
    color: 'from-purple-500 to-indigo-600',
    componentName: 'StocktakingList',
  },
  {
    id: 'ItemCardexReport',
    title: 'کاردکس کالا',
    category: 'inventory',
    icon: PackageSearch,
    color: 'from-teal-500 to-emerald-600',
    componentName: 'ItemCardexReport',
  },
  {
    id: 'ProductServiceList',
    title: 'کالاها و خدمات',
    category: 'inventory',
    icon: Package,
    color: 'from-sky-500 to-blue-600',
    componentName: 'ProductServiceList',
  },
  {
    id: 'ReceivedChequeOperationList',
    title: 'عملیات دریافت/پرداخت',
    category: 'rap',
    icon: Banknote,
    color: 'from-emerald-600 to-green-700',
    componentName: 'ReceivedChequeOperationList',
  },
  {
    id: 'BankAccountList',
    title: 'حساب‌های بانکی',
    category: 'rap',
    icon: Building2,
    color: 'from-violet-500 to-purple-600',
    componentName: 'BankAccountList',
  },
  {
    id: 'PartyList',
    title: 'اشخاص و طرف حساب',
    category: 'general',
    icon: Users,
    color: 'from-fuchsia-500 to-pink-600',
    componentName: 'PartyList',
  },
  {
    id: 'FiscalYearList',
    title: 'دوره‌های مالی',
    category: 'general',
    icon: Calendar,
    color: 'from-amber-600 to-yellow-500',
    componentName: 'FiscalYearList',
  },
];

// All system forms categorized for the "All Apps" view
const ALL_MODULE_FORMS = [
  {
    categoryTitle: 'حسابداری و مالی',
    categoryIcon: BookOpen,
    items: [
      { id: 'VouchersList', title: 'فهرست اسناد حسابداری', componentName: 'VouchersList', icon: BookOpen },
      { id: 'Voucher', title: 'سند حسابداری جدید', componentName: 'Voucher', icon: Plus },
      { id: 'AccountReview', title: 'مرور حساب‌ها (دفاتر)', componentName: 'AccountReview', icon: BarChart2 },
      { id: 'TrialBalanceAndLedgerReport', title: 'ترازنامه و دفتر کل', componentName: 'TrialBalanceAndLedgerReport', icon: FileText },
      { id: 'Accounts', title: 'درخت‌واره کدگری حساب‌ها', componentName: 'Accounts', icon: FolderTree },
      { id: 'CostCenterList', title: 'مراکز هزینه', componentName: 'CostCenterList', icon: Layers },
      { id: 'DetailedAccountList', title: 'حساب‌های تفصیلی', componentName: 'DetailedAccountList', icon: List },
    ],
  },
  {
    categoryTitle: 'انبارداری و تامین کالا',
    categoryIcon: Boxes,
    items: [
      { id: 'WarehouseReceiptForm', title: 'رسید انبار (ورودی)', componentName: 'WarehouseReceiptForm', icon: Boxes },
      { id: 'WarehouseIssueForm', title: 'حواله انبار (خروجی)', componentName: 'WarehouseIssueForm', icon: Truck },
      { id: 'StocktakingForm', title: 'فرم شمارش انبارگردانی', componentName: 'StocktakingForm', icon: ClipboardCheck },
      { id: 'StocktakingList', title: 'فهرست انبارگردانی و کسر/اضافه', componentName: 'StocktakingList', icon: FileSpreadsheet },
      { id: 'ItemCardexReport', title: 'کاردکس و گردش کالا', componentName: 'ItemCardexReport', icon: PackageSearch },
      { id: 'ProductServiceList', title: 'تعریف کالاها و خدمات', componentName: 'ProductServiceList', icon: Package },
      { id: 'WarehouseDocumentTypeForm', title: 'انواع سند انبار', componentName: 'WarehouseDocumentTypeForm', icon: FileCode },
      { id: 'ItemServiceGroupForm', title: 'گروه بندی کالا انبار', componentName: 'ItemServiceGroupForm', icon: Layers },
    ],
  },
  {
    categoryTitle: 'خزانه و دریافت/پرداخت',
    categoryIcon: Banknote,
    items: [
      { id: 'ReceivedChequeOperationList', title: 'مدیریت چک‌ها و اسناد', componentName: 'ReceivedChequeOperationList', icon: Banknote },
      { id: 'BankAccountList', title: 'حساب‌های بانکی و شعبه', componentName: 'BankAccountList', icon: Building2 },
      { id: 'CashList', title: 'صندوق‌ها', componentName: 'CashList', icon: Wallet },
      { id: 'PettyCashList', title: 'تنخواه‌گردان‌ها', componentName: 'PettyCashList', icon: Wallet },
      { id: 'BankReconciliationForm', title: 'مغایرت‌گیری بانکی', componentName: 'BankReconciliationForm', icon: Scale },
    ],
  },
  {
    categoryTitle: 'اطلاعات پایه و سیستم',
    categoryIcon: Settings,
    items: [
      { id: 'BusinessStructure', title: 'ساختار کسب و کار', componentName: 'BusinessStructure', icon: Network },
      { id: 'PartyList', title: 'اشخاص و طرف‌های حساب', componentName: 'PartyList', icon: Users },
      { id: 'FiscalYearList', title: 'سال‌ها و دوره‌های مالی', componentName: 'FiscalYearList', icon: Calendar },
      { id: 'UserList', title: 'مدیریت کاربران سیستم', componentName: 'UserList', icon: Settings },
      { id: 'BaseSettings', title: 'تنظیمات عمومی سیستم', componentName: 'BaseSettings', icon: Settings },
      { id: 'DfbBuilder', title: 'فرم‌ساز پویا (DFB)', componentName: 'DfbBuilder', icon: LayoutGrid },
    ],
  },
];

// Recommended quick links
const RECOMMENDED_ITEMS = [
  {
    id: 'Voucher',
    title: 'ثبت سند حسابداری جدید',
    subTitle: 'ایجاد سند جدید در سال مالی جاری',
    componentName: 'Voucher',
    icon: Plus,
  },
  {
    id: 'WarehouseReceiptForm',
    title: 'صدور رسید انبار',
    subTitle: 'ورود مستقیم کالا به انبار',
    componentName: 'WarehouseReceiptForm',
    icon: Boxes,
  },
  {
    id: 'StocktakingForm',
    title: 'ثبت شمارش انبارگردانی',
    subTitle: 'ثبت تگ‌ها و مقادیر شمارش شده',
    componentName: 'StocktakingForm',
    icon: ClipboardCheck,
  },
  {
    id: 'DfbBuilder',
    title: 'طراحی فرم پویا',
    subTitle: 'فرم‌ساز پیشرفته پارسا ERP',
    componentName: 'DfbBuilder',
    icon: LayoutGrid,
  },
];

export function ParsaStartMenu({ isOpen, onClose, lockNumber }: ParsaStartMenuProps) {
  const { addTab } = useTabs();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'pinned' | 'all'>('pinned');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenForm = (title: string, componentName: string, icon: any, category: string = 'general') => {
    const IconComponent = icon || FileText;
    addTab(title, category, <IconComponent className="w-4 h-4" />, componentName);
    onClose();
  };

  // Search filtering logic
  const filteredPinned = PINNED_FORMS.filter(item =>
    item.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const filteredAllModules = ALL_MODULE_FORMS.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ),
  })).filter(group => group.items.length > 0);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-[44px] left-3 z-50 flex h-[590px] w-[620px] max-w-[95vw] flex-col overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/90 p-5 text-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/95"
        dir="rtl"
      >
        {/* Top Search Input (Windows 11 Style) */}
        <div className="relative mb-5 w-full">
          <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی فرم‌ها، برنامه‌ها و امکانات پارسا ERP..."
            className="w-full rounded-2xl border border-slate-700/70 bg-slate-800/60 py-2.5 pr-10 pl-10 text-xs text-slate-100 placeholder-slate-400 outline-none backdrop-blur-md transition-all focus:border-blue-500 focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-500/30"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Results / Main Content View */}
        <div className="flex-1 overflow-y-auto pl-1 custom-scrollbar">
          {searchQuery ? (
            /* Search Filter Results */
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-400">نتایج جستجو برای &quot;{searchQuery}&quot;:</div>
              {filteredAllModules.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  هیچ فرمی با عنوان وارد شده یافت نشد.
                </div>
              ) : (
                filteredAllModules.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="text-[11px] font-bold text-blue-400">{group.categoryTitle}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleOpenForm(item.title, item.componentName, item.icon)}
                            className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-800/40 p-2.5 text-right transition-all hover:border-blue-500/50 hover:bg-blue-600/20 group"
                          >
                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                              {item.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : viewMode === 'pinned' ? (
            /* Standard Windows 11 Pinned View */
            <div className="flex flex-col h-full justify-between space-y-5">
              {/* Pinned Section Header */}
              <div>
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    فرم‌های سنجاق‌شده (Pinned)
                  </span>
                  <button
                    onClick={() => setViewMode('all')}
                    className="flex items-center gap-1 rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    همه فرم‌ها
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                </div>

                {/* 6-column Grid of App Tiles */}
                <div className="grid grid-cols-6 gap-2.5">
                  {filteredPinned.map((item) => {
                    const TileIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleOpenForm(item.title, item.componentName, item.icon, item.category)}
                        className="group flex flex-col items-center justify-center rounded-2xl border border-slate-800/40 bg-slate-800/30 p-2.5 text-center transition-all duration-200 hover:scale-105 hover:border-slate-600/60 hover:bg-slate-800/80 active:scale-95"
                      >
                        <div className={clsx(
                          "mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200 text-white",
                          item.color
                        )}>
                          <TileIcon className="h-5 w-5" />
                        </div>
                        <span className="line-clamp-2 text-[11px] font-medium leading-snug text-slate-300 group-hover:text-white">
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommended / Recent Section */}
              <div className="mt-4 border-t border-slate-800/80 pt-4">
                <div className="mb-2.5 px-1 text-xs font-bold text-slate-300">
                  پیشنهادی و دسترسی سریع
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {RECOMMENDED_ITEMS.map((item) => {
                    const RecIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleOpenForm(item.title, item.componentName, item.icon)}
                        className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-800/20 p-2.5 text-right transition-all hover:border-slate-700 hover:bg-slate-800/60 group"
                      >
                        <div className="rounded-xl bg-slate-700/50 p-2 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <RecIcon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="truncate text-xs font-semibold text-slate-200 group-hover:text-white">
                            {item.title}
                          </span>
                          <span className="truncate text-[10px] text-slate-400">
                            {item.subTitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Categorized All Forms View */
            <div className="space-y-5 pr-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">فهرست کامل فرم‌های سیستم ERP</span>
                <button
                  onClick={() => setViewMode('pinned')}
                  className="flex items-center gap-1 rounded-lg bg-slate-800/70 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  <ChevronRight className="h-3 w-3" />
                  بازگشت به سنجاق‌شده‌ها
                </button>
              </div>

              {ALL_MODULE_FORMS.map((moduleGroup, idx) => {
                const GroupIcon = moduleGroup.categoryIcon;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                      <GroupIcon className="h-4 w-4" />
                      <span>{moduleGroup.categoryTitle}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {moduleGroup.items.map((item) => {
                        const FormIcon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleOpenForm(item.title, item.componentName, item.icon)}
                            className="flex items-center gap-2.5 rounded-xl border border-slate-800/50 bg-slate-800/20 p-2 text-right transition-all hover:border-blue-500/40 hover:bg-slate-800/80 group"
                          >
                            <FormIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">
                              {item.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Windows 11 Bottom Footer Bar */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
          {/* User Profile (Right Side) */}
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-800/40 px-3 py-1.5 border border-slate-800/60">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-inner">
              P
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-500" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">مدیر سیستم ERP</span>
              <span className="text-[10px] text-slate-400">دفتر مرکزی پارسا</span>
            </div>
          </div>

          {/* Quick Actions (Left Side) */}
          <div className="flex items-center gap-1.5">
            {lockNumber && (
              <div
                title={`قفل سخت‌افزاری: ${lockNumber}`}
                className="flex items-center gap-1 rounded-xl bg-slate-800/50 px-2 py-1 text-[10px] font-medium text-slate-400 border border-slate-800"
              >
                <Key className="h-3 w-3 text-amber-400" />
                <span>{lockNumber.slice(0, 8)}...</span>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              title="بارگذاری مجدد برنامه (Refresh)"
              className="rounded-xl border border-slate-800/80 bg-slate-800/40 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleOpenForm('تنظیمات پایه', 'BaseSettings', Settings)}
              title="تنظیمات سیستم"
              className="rounded-xl border border-slate-800/80 bg-slate-800/40 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
