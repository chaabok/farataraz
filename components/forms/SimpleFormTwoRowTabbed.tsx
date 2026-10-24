"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useContext, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, GripHorizontal, Maximize2, Minimize2 } from "lucide-react";
import { safeStringify, getDeleteConfirmationMessage, getBandStyleWidth } from "@/lib/utils";
import { 
  TextInput, 
  DateInput, 
  Select, 
  NumberInput, 
  AmountInput,
  TextArea,
  Checkbox,
  RadioGroup,
  MultiSelect,
  MultiCheckbox,
  EmailInput,
  WebsiteInput,
  FileUpload,
} from "../inputs";
import { FormFieldWrapper } from "../inputs/FormFieldWrapper";
import { NewButton } from "../buttons/NewButton";
import { ListButton } from "../buttons/ListButton";
import { SaveButton } from "../buttons/SaveButton";
import { SaveCloseButton } from "../buttons/SaveCloseButton";
import { SaveNewButton } from "../buttons/SaveNewButton";
import { DeleteButton } from "../buttons/DeleteButton";
import { DeleteAndNewButton } from "../buttons/DeleteAndNewButton";
import { PrintDropdownButton } from "../buttons/PrintDropdownButton";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { CloseButton } from "../buttons/CloseButton";
import { FullscreenButton } from "../buttons/FullscreenButton";
import { HelpButton } from "../buttons/HelpButton";
import { cn } from "../../lib/utils";
import { ClassicToolbar } from "../ui/ClassicToolbar";
import { RecordNavigator } from "./RecordNavigator";
import { FieldConfig } from "./SimpleFormTwoRow";
import { BandConfig } from "./SimpleForm";
import { useToast } from "../ToastProvider";
import { FiscalYearWarningBanner } from "../ui/FiscalYearWarningBanner";
import { useFormLabelAlignment } from "@/hooks/useFormLabelAlignment";

interface TabDefinition {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  tabClassName?: string;
  activeTabClassName?: string;
}

interface SimpleFormTwoRowTabbedProps {
  fields: FieldConfig[];
  bands?: BandConfig[];
  hideBands?: boolean;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors?: Record<string, string>;
  className?: string;
  labelWidth?: string;
  headerTop?: React.ReactNode;
  actionbar?: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  headerGradient?: string;
  onSave?: () => void;
  onSaveNew?: () => void;
  onSaveClose?: () => void;
  onClose?: () => void;
  onNew?: () => void;
  onList?: () => void;
  onPrint?: () => void;
  onPrintPdf?: () => void;
  onDeleteCross?: () => void;
  onSaveCross?: () => void;
  listApiUrl?: string;
  listColumns?: any[];
  listDisplayKey?: string;
  onListSelect?: (item: any) => void;
  onDelete?: (type?: string) => Promise<void> | void;
  onHelp?: () => void;
  showActions?: boolean;
  useClassicToolbar?: boolean;
  showListButton?: boolean;
  isSubmitting?: boolean;
  hideHeader?: boolean;
  showLoadingOverlay?: boolean;
  bottomTabs?: TabDefinition[];
  defaultBottomTabId?: string;
  tabResetTrigger?: any;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  showPrintDropdownData?: boolean;
  printData?: any[];
  printColumns?: { key: string; label: string; hidden?: boolean }[];
  printTitle?: string;
  isReadonly?: boolean;
  isUsed?: boolean;
  hasDateInput?: boolean;
  childrenPaddingClassName?: string;
  targetForm?: string;
  formName?: string;
  showRecordNavigator?: boolean;
  currentRecordId?: number | string | null;
  onNavigate?: (direction: "first" | "prev" | "next" | "last", targetItem: any) => void;
}

import { AlertTriangle } from "lucide-react";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";
import { useLanguage } from "../Providers";
import { useOptionalTabs } from "../TabsProvider";
import { useHelp } from "../HelpProvider";

import { LoadingOverlay } from "../ui/LoadingOverlay";
import { PrintDropdownData } from "../inputs/PrintDropdownData";

export function SimpleFormTwoRowTabbed({ 
  fields, 
  bands,
  hideBands = true,
  values, 
  onChange, 
  errors = {},
  className = "",
  labelWidth = "80px",
  headerTop,
  actionbar,
  title,
  icon,
  headerGradient,
  onSave,
  onSaveNew,
  onSaveClose,
  onClose,
  onNew,
  onList,
  onPrint,
  onPrintPdf,
  onDeleteCross,
  onSaveCross,
  listApiUrl,
  listColumns,
  listDisplayKey,
  onListSelect,
  onDelete,
  onHelp,
  showActions = true,
  useClassicToolbar = false,
  showListButton = true,
  isSubmitting = false,
  hideHeader = false,
  showLoadingOverlay = true,
  bottomTabs,
  defaultBottomTabId,
  tabResetTrigger,
  footer,
  children,
  showPrintDropdownData = false,
  printData,
  printColumns,
  printTitle,
  isReadonly = false,
  isUsed = false,
  hasDateInput,
  childrenPaddingClassName,
  targetForm,
  formName,
  showRecordNavigator = true,
  currentRecordId,
  onNavigate,
}: SimpleFormTwoRowTabbedProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { openHelp } = useHelp();
  const { addTab } = useOptionalTabs() || {};
  const formRef = React.useRef<HTMLDivElement>(null);

  // Auto-align label widths per column so input fields align perfectly
  useFormLabelAlignment(formRef, [fields, bottomTabs, values]);

  const containsDateField = (fields || []).some(f => f.type === 'date' || f.groupFields?.some(gf => gf.type === 'date'));
  const hasDateField = hasDateInput !== undefined ? hasDateInput : containsDateField;
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(hasDateField);
  const effectiveIsReadonly = isReadonly || isFormDisabledDueToFiscalYear;
  
  // State for bottom tabs
  const [activeBottomTabId, setActiveBottomTabId] = useState<string>(
    defaultBottomTabId || (bottomTabs && bottomTabs.length > 0 ? bottomTabs[0].id : '')
  );

  const prevResetTriggerRef = useRef(tabResetTrigger);
  const prevDefaultTabRef = useRef(defaultBottomTabId);

  // Sync when bottomTabs or defaultBottomTabId or tabResetTrigger changes
  useEffect(() => {
    const isResetTriggered = tabResetTrigger !== prevResetTriggerRef.current;
    const isDefaultTabChanged = defaultBottomTabId !== prevDefaultTabRef.current;
    prevResetTriggerRef.current = tabResetTrigger;
    prevDefaultTabRef.current = defaultBottomTabId;

    if (isResetTriggered || isDefaultTabChanged) {
      if (defaultBottomTabId && bottomTabs?.some(t => t.id === defaultBottomTabId)) {
        setActiveBottomTabId(defaultBottomTabId);
        return;
      }
    }

    if (bottomTabs && bottomTabs.length > 0) {
      if (!activeBottomTabId || !bottomTabs.some(t => t.id === activeBottomTabId)) {
        const fallback = (defaultBottomTabId && bottomTabs.some(t => t.id === defaultBottomTabId))
          ? defaultBottomTabId
          : bottomTabs[0].id;
        setActiveBottomTabId(fallback);
      }
    }
  }, [bottomTabs, defaultBottomTabId, tabResetTrigger, activeBottomTabId]);

  // State for top fields section resizable height
  const [topSectionHeight, setTopSectionHeight] = useState<number | null>(null);
  const [isMaximizedItems, setIsMaximizedItems] = useState<boolean>(false);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState<boolean>(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const topSectionRef = useRef<HTMLDivElement>(null);

  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
    startYRef.current = e.clientY;
    const currentH = topSectionRef.current?.getBoundingClientRect().height || 180;
    startHeightRef.current = currentH;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startYRef.current;
      let newHeight = startHeightRef.current + deltaY;
      if (newHeight < 28) newHeight = 0; // Snap to collapsed / 0
      if (newHeight > 600) newHeight = 600; // Max cap
      setTopSectionHeight(newHeight);
      setIsMaximizedItems(newHeight === 0);
    };

    const handleMouseUp = () => {
      setIsDraggingSplitter(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const toggleMaximizeItems = () => {
    if (isMaximizedItems || topSectionHeight === 0) {
      setTopSectionHeight(null);
      setIsMaximizedItems(false);
    } else {
      setTopSectionHeight(0);
      setIsMaximizedItems(true);
    }
  };

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      if (scrollWidth <= clientWidth) {
        setShowLeftArrow(false);
        setShowRightArrow(false);
        return;
      }
      
      const isRtl = window.getComputedStyle(tabsContainerRef.current).direction === 'rtl';
      
      if (isRtl) {
        const absScrollLeft = Math.abs(Math.round(scrollLeft));
        if (scrollLeft > 0) {
           setShowRightArrow(absScrollLeft < scrollWidth - clientWidth - 1);
           setShowLeftArrow(absScrollLeft > 0);
        } else {
           setShowRightArrow(absScrollLeft > 0);
           setShowLeftArrow(absScrollLeft < scrollWidth - clientWidth - 1);
        }
      } else {
        setShowLeftArrow(Math.round(scrollLeft) > 0);
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [bottomTabs]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150;
      tabsContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [deleteActionType, setDeleteActionType] = useState<'delete' | 'delete_and_new' | 'delete_and_close' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const checkIsInserting = () => {
    if (hasSaved) return false;
    if (values && typeof values === 'object') {
      const hasAnyId = Object.keys(values).some(key => {
        const val = values[key];
        if ((key === 'id' || key.toLowerCase().endsWith('id')) && val !== null && val !== undefined && val !== '') {
          return true;
        }
        return false;
      });
      if (hasAnyId) return false;
    }
    if (title) {
      const tLower = title.toLowerCase();
      if (
        tLower.includes("ویرایش") || 
        tLower.includes("edit") || 
        tLower.includes("تعديل") || 
        tLower.includes("تحرير") || 
        tLower.includes("کمیت") || 
        tLower.includes("编辑")
      ) {
        return false;
      }
      if (
        tLower.includes("تعریف") ||
        tLower.includes("جدید") ||
        tLower.includes("new") ||
        tLower.includes("create") ||
        tLower.includes("add")
      ) {
        return true;
      }
    }
    if (!onDelete) {
      return true;
    }
    return false;
  };

  const isInserting = checkIsInserting();

  // --- Add Dirty Tracking ---
  const lastSavedValuesRef = React.useRef<string>("");
  const executeAction = async (
    actionFn: (() => void | Promise<any>) | undefined,
    actionType: 'save' | 'save_note' | 'save_new' | 'save_close'
  ) => {
    if (isFormDisabledDueToFiscalYear) {
      showToast("برای این شرکت سال مالی تعریف نشده است. امکان ثبت اطلاعات وجود ندارد.", "error");
      return;
    }
    let finalActionFn = actionFn;
    if (actionType === 'save_close' && !actionFn && onSave) {
      finalActionFn = onSave;
    }
    
    if (!finalActionFn) return;

    setLocalSubmitting(true);
    let success = false;
    try {
      const res = await finalActionFn();
      // If validation failed, it typically returns null or false. 
      // Sometimes it returns nothing (undefined), which we treat as success if it didn't throw.
      if (res !== false && res !== null) {
        success = true;
        lastSavedValuesRef.current = safeStringify(values || {});
        setHasSaved(true);
        if (setTabDirty && activeTabId) {
          setTabDirty(activeTabId, false);
        }
      }
    } catch (e: any) {
      if (e?.message !== "VALIDATION_FAILED") {
        console.error(e);
      }
    } finally {
      setLocalSubmitting(false);
    }
    
    if (success && actionType === 'save_close') {
      if (onClose) {
        onClose();
      } else if (activeTabId && tabsCtx?.removeTab) {
        tabsCtx.removeTab(activeTabId);
      } else if (onList) {
        onList();
      }
    }
  };
  // --------------------------

  let groupId = 'general';
  
  let setTabDirty: ((id: string, isDirty: boolean) => void) | undefined = undefined;
  let activeTabId: string | null = null;
  
  const tabsCtx = useOptionalTabs();
  if (tabsCtx && tabsCtx.tabs && tabsCtx.activeTabId) {
    activeTabId = tabsCtx.activeTabId;
    const activeTab = tabsCtx.tabs.find(t => t.id === tabsCtx.activeTabId);
    if (activeTab) {
      groupId = activeTab.groupId;
      setTabDirty = tabsCtx.setTabDirty;
    }
  }

  const handleChange = (name: string, value: any) => {
    if (isFormDisabledDueToFiscalYear) return;
    onChange(name, value);
    if (setTabDirty && activeTabId) {
      setTabDirty(activeTabId, true);
    }
  };

  React.useEffect(() => {
    if (!activeTabId || (tabsCtx && !tabsCtx.dirtyTabs[activeTabId])) {
      lastSavedValuesRef.current = safeStringify(values);
    }
  }, [values, activeTabId, tabsCtx?.dirtyTabs]);

  const groupHeaderGradients: Record<string, string> = {
    general: 'from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600',
    financial: 'from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600',
    warehouse: 'from-cyan-600 to-cyan-500 dark:from-cyan-700 dark:to-cyan-600',
    hr: 'from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600',
    production: 'from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600',
    admin: 'from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600',
  };

  const groupFormStyles: Record<string, string> = {
    general: 'border-blue-100 dark:border-blue-900/30 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)]',
    financial: 'border-emerald-100 dark:border-emerald-900/30 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)]',
    warehouse: 'border-cyan-100 dark:border-cyan-900/30 shadow-[0_8px_30px_-4px_rgba(6,182,212,0.15)]',
    hr: 'border-rose-100 dark:border-rose-900/30 shadow-[0_8px_30px_-4px_rgba(244,63,94,0.15)]',
    production: 'border-orange-100 dark:border-orange-900/30 shadow-[0_8px_30px_-4px_rgba(249,115,22,0.15)]',
    admin: 'border-purple-100 dark:border-purple-900/30 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.15)]',
  };

  const currentHeaderGradient = headerGradient || groupHeaderGradients[groupId] || groupHeaderGradients['general'];
  const currentFormStyle = groupFormStyles[groupId] || groupFormStyles['general'];

  let dynamicLabelWidth = labelWidth;
  if (labelWidth === "80px" && fields && fields.length > 0) {
    const maxLen = Math.max(0, ...fields.map(f => f.label ? f.label.length : 0));
    if (maxLen > 0) {
      dynamicLabelWidth = `${Math.max(80, Math.ceil(maxLen * 8) + 26)}px`;
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = values[field.name];
    const errorText = errors[field.name];

    const displayLabel = field.label ? `${field.label} :` : undefined;
    const currentLabelWidth = field.labelWidth || dynamicLabelWidth;

    const commonProps = {
      label: displayLabel as any,
      value: value || '',
      onChange: (val: any) => handleChange(field.name, val),
      onBlur: field.onBlur ? () => field.onBlur!(field.name, value) : undefined,
      required: field.required,
      error: errorText,
      labelWidth: currentLabelWidth,
      name: field.name,
      disabled: field.disabled || effectiveIsReadonly,
      alignVertical: false, 
    };

    let fieldElement = null;
    const resolvedType = field.type || ((field.render || field.customComponent) ? 'custom' : 'text');

    switch (resolvedType) {
      case 'text':
        fieldElement = <TextInput {...commonProps} placeholder={field.placeholder} />;
        break;
      case 'number':
        fieldElement = <NumberInput {...commonProps} placeholder={field.placeholder} maxLength={field.maxLength} value={String(value !== undefined && value !== null ? value : '')} onChange={(val) => handleChange(field.name, val)} />;
        break;
      case 'amount':
        fieldElement = <AmountInput {...commonProps} placeholder={field.placeholder} value={String(value !== undefined && value !== null ? value : '')} onChange={(val) => handleChange(field.name, val)} />;
        break;
      case 'textarea':
        fieldElement = <TextArea {...commonProps} placeholder={field.placeholder} rows={field.rows} className={field.className} />;
        break;
      case 'select':
        fieldElement = <Select {...commonProps} options={field.options as any || []} placeholder={field.placeholder} />;
        break;
      case 'date':
        fieldElement = <DateInput {...commonProps} />;
        break;
      case 'email':
        fieldElement = <EmailInput {...commonProps} placeholder={field.placeholder} />;
        break;
      case 'website':
        fieldElement = <WebsiteInput {...commonProps} placeholder={field.placeholder} />;
        break;
      case 'checkbox':
        fieldElement = <Checkbox {...commonProps} checked={!!value} onChange={(checked) => handleChange(field.name, checked)} />;
        break;
      case 'radio':
        fieldElement = <RadioGroup {...commonProps} options={field.options as any || []} />;
        break;
      case 'multi-select':
        fieldElement = <MultiSelect {...commonProps} options={field.options as any || []} values={value || []} placeholder={field.placeholder} />;
        break;
      case 'multi-checkbox':
        fieldElement = <MultiCheckbox {...commonProps} options={field.options as any || []} values={value || []} />;
        break;
      case 'file':
        fieldElement = (
          <FileUpload 
            label={displayLabel} 
            onChange={(file) => handleChange(field.name, file)} 
            required={field.required} 
            error={errorText as string}
            selectedFile={value instanceof File ? value : null}
            existingUrl={typeof value === 'string' ? value : null}
            accept={field.accept}
            labelWidth={currentLabelWidth}
          />
        );
        break;
      case 'custom':
        {
          const isFieldDisabled = field.disabled || effectiveIsReadonly;
          let customEl = field.customComponent || (field.render ? field.render({ 
            value, 
            onChange: (n: string, v: any) => handleChange(n, v), 
            disabled: isFieldDisabled, 
            values, 
            errors 
          }) : null);

          if (isFieldDisabled && React.isValidElement(customEl)) {
            const el = customEl as React.ReactElement<any>;
            const isComponent = typeof el.type !== 'string';
            const extraProps: any = { disabled: true };
            if (isComponent) {
              extraProps.isReadonly = true;
            }
            customEl = React.cloneElement(el, {
              ...extraProps,
              children: React.Children.map(el.props.children, child => {
                if (React.isValidElement(child)) {
                  const isChildComponent = typeof (child as React.ReactElement<any>).type !== 'string';
                  return React.cloneElement(child as React.ReactElement<any>, {
                    disabled: true,
                    ...(isChildComponent ? { isReadonly: true } : {})
                  });
                }
                return child;
              })
            });
          }

          fieldElement = field.noWrapper ? (
            <div className={isFieldDisabled ? "pointer-events-none opacity-70 w-full flex-1" : "w-full flex-1"}>
              {customEl}
            </div>
          ) : (
            <FormFieldWrapper 
              label={displayLabel} 
              required={field.required} 
              error={errorText as string} 
              labelWidth={currentLabelWidth} 
              alignVertical={false}
            >
              <div className={isFieldDisabled ? "pointer-events-none opacity-70 w-full flex-1" : "w-full flex-1"}>
                {customEl}
              </div>
            </FormFieldWrapper>
          );
        }
        break;
      default:
        fieldElement = null;
    }

    const spanClass = field.colSpan 
      ? `col-span-${field.colSpan}` 
      : field.span 
        ? `col-span-${field.span}` 
        : "col-span-1";

    const widthClass = field.containerClassName || field.className || "w-full";

    return (
      <div key={field.name} className={cn(
        "flex items-center",
        widthClass,
        spanClass
      )}>
        <div className="flex-1 min-w-0">
          {fieldElement}
        </div>
      </div>
    );
  };

  return (
    <div ref={formRef} className={cn(
      "form-container flex flex-col h-full w-full relative bg-white dark:bg-gray-900 overflow-hidden",
      !hideHeader ? `md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-800 ${currentFormStyle}` : "border-none shadow-none",
      className
    )}>
      {showLoadingOverlay && <LoadingOverlay visible={isSubmitting || localSubmitting} message={t('saving' as any) || 'در حال ذخیره سازی...'} />}
      {!hideHeader && (title || headerTop || actionbar || showActions) && (
        <div className={`relative flex flex-col flex-shrink-0 w-full m-0 border-b border-x-0 border-b-gray-200 dark:border-b-gray-800 rounded-none z-30`}>
          {(title || headerTop) && (
            <div className={`w-full bg-gradient-to-r rtl:bg-gradient-to-l ${currentHeaderGradient} px-4 py-1 flex items-center justify-between text-white`}>
              <div className="flex items-center gap-2">
                {icon && <div className="flex items-center justify-center opacity-90">{icon}</div>}
                {title && <h3 className="text-[13px] font-medium">{title}</h3>}
                {!title && headerTop && <div>{headerTop}</div>}
              </div>
              <div className="flex items-center gap-1">
                <HelpButton onClick={onHelp || (() => openHelp(title || "form", title))} hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                <FullscreenButton targetRef={formRef} hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
                <CloseButton hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
              </div>
            </div>
          )}
          {(actionbar || showActions) && (
            <div className="Actionbar w-full px-4 py-1 flex flex-nowrap items-center justify-between gap-4 overflow-visible">
              <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
                {showActions && (
                  <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
                    {useClassicToolbar ? (
                      <ClassicToolbar 
                        onNew={onNew} disableNew={false}
                        onList={onList}
                        onPrint={onPrint}
                        onPrintPdf={onPrintPdf}
                        onDeleteCross={onDelete && !effectiveIsReadonly ? () => { setDeleteActionType('delete_and_close'); setIsDeleteModalOpen(true); } : undefined}
                        onDeleteNew={(onDelete && onNew && !effectiveIsReadonly) ? () => { setDeleteActionType('delete_and_new'); setIsDeleteModalOpen(true); } : undefined}
                        onSave={onSave && !effectiveIsReadonly ? () => executeAction(onSave, 'save') : undefined} disableSave={isSubmitting || effectiveIsReadonly || isUsed}
                        onSaveNew={onSaveNew ? () => executeAction(onSaveNew, 'save_new') : undefined}
                        onSaveClose={(onSaveClose || onSave) ? () => executeAction(onSaveClose, 'save_close') : undefined}
                        onDelete={onDelete && !effectiveIsReadonly ? () => { setDeleteActionType('delete'); setIsDeleteModalOpen(true); } : undefined} disableDelete={isSubmitting || effectiveIsReadonly || isUsed || (isInserting && !hasSaved)}
                      />
                    ) : (
                      <>
                        <NewButton onClick={onNew} disabled={false} hideLabel />
                        {showListButton && (
                          <ListButton 
                            onClick={onList} 
                            disabled={false}
                            hideLabel 
                            listApiUrl={listApiUrl} 
                            columns={listColumns} 
                            displayKey={listDisplayKey as any} 
                            onSelect={onListSelect}
                          />
                        )}
                        <SaveButton onClick={onSave && !effectiveIsReadonly ? () => executeAction(onSave, 'save') : undefined} disabled={!onSave || isSubmitting || effectiveIsReadonly || isUsed} hideLabel />
                        <SaveNewButton onClick={onSaveNew && !effectiveIsReadonly ? () => executeAction(onSaveNew, 'save_new') : undefined} disabled={!onSaveNew || isSubmitting || effectiveIsReadonly || isUsed} hideLabel />
                        <SaveCloseButton onClick={(onSaveClose || onSave) && !effectiveIsReadonly ? () => executeAction(onSaveClose || onSave, 'save_close') : undefined} disabled={(!onSaveClose && !onSave) || isSubmitting || effectiveIsReadonly || isUsed} hideLabel />
                        <DeleteButton 
                          onClick={onDelete ? () => { 
                            setDeleteActionType('delete'); 
                            setIsDeleteModalOpen(true); 
                          } : undefined} 
                          disabled={!onDelete || isSubmitting || effectiveIsReadonly || isUsed || (isInserting && !hasSaved)} 
                          hideLabel 
                          tooltip="حذف و بستن"
                        />
                        <DeleteAndNewButton 
                          onClick={onDelete && onNew ? () => { 
                            setDeleteActionType('delete_and_new'); 
                            setIsDeleteModalOpen(true); 
                          } : undefined} 
                          disabled={!onDelete || !onNew || isSubmitting || effectiveIsReadonly || isUsed || (isInserting && !hasSaved)} 
                          hideLabel 
                        />
                        {targetForm && (
                          <PrintDropdownButton 
                            targetForm={targetForm}
                            onPrint={(reportId) => {
                              if (reportId) {
                                if (addTab) {
                                  addTab(
                                    `چاپ پیش‌نمایش`,
                                    `general_group`,
                                    undefined,
                                    'ReportViewer',
                                    { reportId: reportId.toString(), recordId: (values?.id || values?.ItemRequestId || values?.ServiceRequestId || values?.ItemServiceSupplyRequestId || values?.ItemPackageID || values?.ItemPackageId)?.toString() }
                                  );
                                }
                              } else {
                                window.print();
                              }
                            }}
                          />
                        )}
                        {(showPrintDropdownData || printData || printColumns) && (
                          <PrintDropdownData
                            data={printData || values?.items || []}
                            columns={printColumns || []}
                            title={printTitle || title}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
                {actionbar && (
                  <div className="flex flex-nowrap items-center gap-2 shrink-0">
                    {actionbar}
                  </div>
                )}
              </div>

              {/* Record Navigator on the left side of the action bar */}
              {showRecordNavigator && (listApiUrl || onListSelect || onNavigate) && (
                <div className="flex flex-nowrap items-center gap-1 shrink-0">
                  <RecordNavigator
                    formName={formName}
                    title={title}
                    listApiUrl={listApiUrl}
                    values={values}
                    currentRecordId={currentRecordId}
                    onSelect={onListSelect}
                    onNavigate={onNavigate}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Split section - Top half for fields */}
      <div 
        ref={topSectionRef}
        style={{
          height: topSectionHeight !== null ? `${topSectionHeight}px` : undefined,
          maxHeight: topSectionHeight !== null ? `${topSectionHeight}px` : '45vh',
          display: topSectionHeight === 0 ? 'none' : 'block',
        }}
        className={cn(
          "overflow-y-auto w-full px-2 md:px-6 pt-2.5 pb-2 content-start shrink-0 transition-all duration-75",
          isDraggingSplitter && "select-none transition-none",
          (!bottomTabs || bottomTabs.length === 0) && !children ? "flex-1" : "border-b border-gray-200 dark:border-gray-800"
        )}
      >
        {isFormDisabledDueToFiscalYear && (
          <FiscalYearWarningBanner className="mb-3" />
        )}
        {bands && bands.length > 0 ? (
          <div className="flex flex-wrap gap-4 items-start w-full">
            {(() => {
              const rootBands = bands.filter(
                b => !b.parentBandId || !bands.some(p => p.id === b.parentBandId)
              );

              const renderBandItem = (band: BandConfig, bIdx: number) => {
                const bandFields = (fields || []).filter(f => (f.bandId ? f.bandId === band.id : bIdx === 0));
                const childBands = bands.filter(b => b.parentBandId === band.id);

                if (bandFields.length === 0 && childBands.length === 0 && (!fields || fields.length > 0)) return null;

                const bandWidthStyle = getBandStyleWidth(band.width);

                if (hideBands) {
                  return (
                    <div 
                      key={band.id || bIdx} 
                      style={{ width: bandWidthStyle, flexBasis: bandWidthStyle, flexGrow: 0, flexShrink: 0, boxSizing: 'border-box' }} 
                      className={cn("flex flex-col gap-y-2 box-border", band.className)}
                    >
                      {band.layout === 'flex' ? (
                        <div className={cn("flex flex-nowrap items-center gap-3 w-full", band.className)}>
                          {bandFields.map(renderField)}
                        </div>
                      ) : (
                        <div className={cn(
                          "grid gap-x-4 gap-y-2.5 w-full",
                          bandFields.length >= 4 
                            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4" 
                            : bandFields.length === 3 
                              ? "grid-cols-1 sm:grid-cols-3" 
                              : (bandFields.length === 1 || (band.width && parseFloat(band.width) <= 50)) 
                                ? "grid-cols-1" 
                                : "grid-cols-1 md:grid-cols-2"
                        )}>
                          {bandFields.map(renderField)}
                        </div>
                      )}
                      {childBands.length > 0 && (
                        <div className="flex flex-wrap gap-4 items-start w-full pt-1">
                          {childBands.map((cb, cbIdx) => renderBandItem(cb, cbIdx))}
                        </div>
                      )}
                    </div>
                  );
                }

                const bandStyle: React.CSSProperties = {
                  width: bandWidthStyle,
                  flexBasis: bandWidthStyle,
                  flexGrow: 0,
                  flexShrink: 0,
                  height: band.height && band.height !== 'auto' ? band.height : undefined,
                  margin: band.margin || '4px 0px',
                  padding: band.padding || '12px',
                  borderWidth: band.borderWidth || '1px',
                  borderStyle: (band.borderStyle as any) || 'solid',
                  borderColor: band.borderColor || '#e2e8f0',
                  backgroundColor: band.bgColor || 'transparent',
                  borderRadius: band.borderRadius || '12px',
                  boxSizing: 'border-box',
                };

                return (
                  <div key={band.id || bIdx} style={bandStyle} className="flex flex-col gap-y-3 box-border">
                    {band.title && (
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200/60 dark:border-gray-800/60 pb-1.5 mb-1">
                        {band.title}
                      </div>
                    )}
                    <div className={cn("grid gap-x-6 gap-y-3 w-full", bandFields.length === 1 || (band.width && parseFloat(band.width) <= 50) ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                      {bandFields.map(renderField)}
                    </div>
                    {childBands.length > 0 && (
                      <div className="flex flex-wrap gap-4 items-start w-full pt-1">
                        {childBands.map((cb, cbIdx) => renderBandItem(cb, cbIdx))}
                      </div>
                    )}
                  </div>
                );
              };

              return rootBands.map((band, bIdx) => renderBandItem(band, bIdx));
            })()}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-[8.6px]">
            {(fields || []).map(renderField)}
          </div>
        )}
      </div>

      {/* Resizable Splitter Bar between Header and Bottom Items Tabs */}
      {((bottomTabs && bottomTabs.length > 0) || children) && (
        <div 
          onMouseDown={handleSplitterMouseDown}
          onDoubleClick={toggleMaximizeItems}
          title="جهت تغییر ارتفاع بالا/پایین بکشید | دبل‌کلیک جهت بزرگ‌نمایی کامل اقلام"
          className={cn(
            "group relative flex items-center justify-center h-3 bg-slate-200/80 hover:bg-blue-500/90 dark:bg-slate-800/80 dark:hover:bg-blue-600/90 cursor-row-resize select-none z-20 shrink-0 border-y border-slate-300/80 dark:border-slate-700/80 transition-colors shadow-2xs",
            isDraggingSplitter && "bg-blue-600 dark:bg-blue-500"
          )}
        >
          <div className="w-16 h-1 rounded-full bg-slate-400 dark:bg-slate-500 group-hover:bg-white group-hover:w-24 transition-all flex items-center justify-center gap-1">
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-white/80"></span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-white/80"></span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-white/80"></span>
          </div>
        </div>
      )}

      {/* Split section - Bottom half for tabs (bottomTabs or children) */}
      {(bottomTabs && bottomTabs.length > 0) ? (
        <div className="flex-1 min-h-0 min-w-0 bg-white dark:bg-gray-900 flex flex-col w-full overflow-hidden">
          <div className="relative flex items-center border-b border-gray-300 dark:border-gray-700 bg-[#f8f9fa] dark:bg-gray-800/80 w-full group">
            {showRightArrow && (
              <button 
                type="button"
                className="absolute right-0 z-20 h-full px-1 bg-gradient-to-l from-[#f8f9fa] dark:from-gray-800/80 via-[#f8f9fa] dark:via-gray-800/80 to-transparent flex items-center justify-center hover:text-blue-500 opacity-80 hover:opacity-100 transition-opacity"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="w-5 h-5 text-gray-500 hover:text-blue-500" />
              </button>
            )}
            
            <div 
              ref={tabsContainerRef}
              className="flex flex-row overflow-x-auto overflow-y-hidden pt-1 px-2 gap-1 flex-1 no-scrollbar scroll-smooth w-full"
              onScroll={checkScroll}
            >
              {bottomTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveBottomTabId(tab.id)}
                  className={cn(
                     "group relative flex h-8 cursor-pointer items-center justify-between gap-2.5 rounded-t-lg px-3 py-1 text-sm font-medium transition-colors border-b-2 shrink-0 select-none",
                     activeBottomTabId === tab.id 
                       ? (tab.activeTabClassName || "bg-blue-600 text-white border-blue-800 dark:border-blue-400 shadow-sm") 
                       : (tab.tabClassName || "bg-white text-gray-700 dark:text-gray-300 border-transparent hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-gray-800")
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {showLeftArrow && (
              <button 
                type="button"
                className="absolute left-0 z-20 h-full px-1 bg-gradient-to-r from-[#f8f9fa] dark:from-gray-800/80 via-[#f8f9fa] dark:via-gray-800/80 to-transparent flex items-center justify-center hover:text-blue-500 opacity-80 hover:opacity-100 transition-opacity"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-blue-500" />
              </button>
            )}
          </div>
          <div key={activeBottomTabId} className="flex-1 overflow-hidden min-h-0 flex flex-col">
             {bottomTabs.find(t => t.id === activeBottomTabId)?.content}
          </div>
        </div>
      ) : children ? (
        <div className={cn(
          "flex-1 w-full bg-gray-50/30 dark:bg-gray-900/30",
          childrenPaddingClassName !== undefined ? childrenPaddingClassName : "overflow-y-auto px-4 py-4"
        )}>
          <div className={cn("flex flex-col md:flex-row h-full", childrenPaddingClassName !== undefined ? "gap-0" : "gap-4")}>
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return (
                  <div className="flex-1 min-w-0 h-full">
                    {child}
                  </div>
                );
              }
              return child;
            })}
          </div>
        </div>
      ) : null}
      
      {footer && (
        <div className="shrink-0 h-[5%] min-h-[40px] md:min-h-0 md:h-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          {footer}
        </div>
      )}
      {onDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          title={deleteActionType === 'delete_and_new' ? (t('delete_and_new' as any) || 'حذف و جدید') : ((t as any)('delete_record') || 'حذف رکورد')}
          message={getDeleteConfirmationMessage(title || "", values)}
          onConfirm={async () => {
            setIsDeleteModalOpen(false);
            if (onDelete) {
              setLocalSubmitting(true);
              try {
                await onDelete(deleteActionType || 'delete');
                showToast("اطلاعات با موفقیت حذف گردید.", "success");
                if (deleteActionType === 'delete_and_new' && onNew) {
                  onNew();
                } else if (deleteActionType === 'delete' || deleteActionType === 'delete_and_close') {
                  if (onClose) {
                    onClose();
                  } else if (activeTabId && tabsCtx?.removeTab) {
                    tabsCtx.removeTab(activeTabId);
                  } else if (onList) {
                    onList();
                  }
                }
              } catch (e) {
                console.error(e);
              } finally {
                setLocalSubmitting(false);
              }
            }
            setDeleteActionType(null);
          }}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setDeleteActionType(null);
          }}
        />
      )}
    </div>
  );
}
