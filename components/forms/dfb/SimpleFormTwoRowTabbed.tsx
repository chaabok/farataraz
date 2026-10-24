"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { safeStringify, getDeleteConfirmationMessage } from "@/lib/utils";
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
} from "@/components/inputs";
import { FormFieldWrapper } from "@/components/inputs/FormFieldWrapper";
import { useFormLabelAlignment } from "@/hooks/useFormLabelAlignment";
import { NewButton } from "@/components/buttons/NewButton";
import { ListButton } from "@/components/buttons/ListButton";
import { SaveButton } from "@/components/buttons/SaveButton";
import { SaveCloseButton } from "@/components/buttons/SaveCloseButton";
import { SaveNewButton } from "@/components/buttons/SaveNewButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { DeleteAndNewButton } from "@/components/buttons/DeleteAndNewButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CloseButton } from "@/components/buttons/CloseButton";
import { FullscreenButton } from "@/components/buttons/FullscreenButton";
import { HelpButton } from "@/components/buttons/HelpButton";
import { cn } from "@/lib/utils";
import { FieldConfig } from "./SimpleFormTwoRow";
import { useToast } from "@/components/ToastProvider";

export interface TabConfig {
  id: string;
  label: string;
  fields: FieldConfig[];
}

export interface SimpleFormTwoRowTabbedProps {
  topFields?: FieldConfig[];
  tabs: TabConfig[];
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
  onNew?: () => void;
  onList?: () => void;
  listApiUrl?: string;
  listColumns?: any[];
  listDisplayKey?: string;
  onListSelect?: (item: any) => void;
  onDelete?: (type?: string) => Promise<void> | void;
  onHelp?: () => void;
  onClose?: () => void;
  showActions?: boolean;
  showListButton?: boolean;
  isSubmitting?: boolean;
  hideHeader?: boolean;
  showLoadingOverlay?: boolean;
  children?: React.ReactNode;
  isReadonly?: boolean;
  isUsed?: boolean;
}

import { useLanguage } from "@/components/Providers";
import { useOptionalTabs } from "@/components/TabsProvider";
import { useHelp } from "@/components/HelpProvider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

export function SimpleFormTwoRowTabbed({ 
  topFields = [],
  tabs = [],
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
  onNew,
  onList,
  listApiUrl,
  listColumns,
  listDisplayKey,
  onListSelect,
  onDelete,
  onHelp,
  onClose,
  showActions = true,
  showListButton = true,
  isSubmitting = false,
  hideHeader = false,
  showLoadingOverlay = true,
  children,
  isReadonly = false,
  isUsed = false,
}: SimpleFormTwoRowTabbedProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { openHelp } = useHelp();
  const formRef = React.useRef<HTMLDivElement>(null);

  // Form-wide label alignment: all labels sized to the widest label of the form
  useFormLabelAlignment(formRef, []);
  const [activeTabId, setActiveTabIdState] = useState<string>(tabs.length > 0 ? tabs[0].id : '');
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [deleteActionType, setDeleteActionType] = useState<'delete' | 'delete_and_new' | 'delete_and_close' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
  }, [tabs]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150;
      tabsContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const checkIsInserting = () => {
    if (title) {
      const tLower = title.toLowerCase();
      if (
        tLower.includes("ویرایش") || 
        tLower.includes("edit") || 
        tLower.includes("تعديل") || 
        tLower.includes("تحرير") || 
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

  const lastSavedValuesRef = React.useRef<string>("");
  const executeAction = async (
    actionFn: (() => void | Promise<any>) | undefined,
    actionType: 'save' | 'save_note' | 'save_new' | 'save_close'
  ) => {
    let finalActionFn = actionFn;
    if (actionType === 'save_close' && !actionFn && onSave) {
      finalActionFn = onSave;
    }
    
    if (!finalActionFn) return;

    setLocalSubmitting(true);
    let success = false;
    try {
      const res = await finalActionFn();
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

  let groupId = 'general';
  let setTabDirty: ((id: string, isDirty: boolean) => void) | undefined = undefined;
  let activeAppTabId: string | null = null;
  
  const tabsCtx = useOptionalTabs();
  if (tabsCtx && tabsCtx.tabs && tabsCtx.activeTabId) {
    activeAppTabId = tabsCtx.activeTabId;
    const activeTab = tabsCtx.tabs.find(t => t.id === tabsCtx.activeTabId);
    if (activeTab) {
      groupId = activeTab.groupId;
      setTabDirty = tabsCtx.setTabDirty;
    }
  }

  const handleChange = (name: string, value: any) => {
    onChange(name, value);
    if (setTabDirty && activeAppTabId) {
      setTabDirty(activeAppTabId, true);
    }
  };

  React.useEffect(() => {
    if (!activeAppTabId || (tabsCtx && !tabsCtx.dirtyTabs[activeAppTabId])) {
      lastSavedValuesRef.current = safeStringify(values);
    }
  }, [values, activeAppTabId, tabsCtx?.dirtyTabs]);

  const groupHeaderGradients: Record<string, string> = {
    general: 'from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600',
    financial: 'from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600',
    warehouse: 'from-cyan-600 to-cyan-500 dark:from-cyan-700 dark:to-cyan-600',
    hr: 'from-rose-600 to-rose-500 dark:from-rose-700 dark:to-rose-600',
    production: 'from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600',
    admin: 'from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600',
  };

  const groupFormStyles: Record<string, string> = {
    general: 'border-blue-100 dark:border-blue-900/30 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.05)]',
    financial: 'border-emerald-100 dark:border-emerald-900/30 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.05)]',
    warehouse: 'border-cyan-100 dark:border-cyan-900/30 shadow-[0_8px_30px_-4px_rgba(6,182,212,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(6,182,212,0.05)]',
    hr: 'border-rose-100 dark:border-rose-900/30 shadow-[0_8px_30px_-4px_rgba(244,63,94,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.05)]',
    production: 'border-orange-100 dark:border-orange-900/30 shadow-[0_8px_30px_-4px_rgba(249,115,22,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(249,115,22,0.05)]',
    admin: 'border-purple-100 dark:border-purple-900/30 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.15)] dark:shadow-[0_8px_30px_-4px_rgba(168,85,247,0.05)]',
  };

  const currentHeaderGradient = headerGradient || groupHeaderGradients[groupId] || groupHeaderGradients['general'];
  const currentFormStyle = groupFormStyles[groupId] || groupFormStyles['general'];

  const activeTabConfig = tabs.find(t => t.id === activeTabId) || tabs[0];

  let dynamicLabelWidth = labelWidth;
  if (labelWidth === "80px" && activeTabConfig && activeTabConfig.fields) {
    const maxLen = Math.max(0, ...activeTabConfig.fields.map(f => f.label ? f.label.length : 0));
    if (maxLen > 0) {
      dynamicLabelWidth = `${Math.max(60, Math.ceil(maxLen * 6) + 9)}px`;
    }
  }

  const renderField = (field: FieldConfig) => {
    const value = values[field.name];
    const errorText = errors[field.name];

    const displayLabel = field.label 
      ? (field.label.trim() === "" ? " " : `${field.label} :`) 
      : undefined;
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
      disabled: field.disabled || isReadonly,
      alignVertical: false, 
    };

    let fieldElement = null;

    switch (field.type) {
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
        fieldElement = <TextArea {...commonProps} placeholder={field.placeholder} />;
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
        fieldElement = <RadioGroup {...commonProps} options={field.options as any || []} containerClassName={field.containerClassName} />;
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
        fieldElement = (
          <FormFieldWrapper 
            label={displayLabel} 
            required={field.required} 
            error={errorText as string} 
            labelWidth={currentLabelWidth} 
            alignVertical={false}
          >
            {field.customComponent}
          </FormFieldWrapper>
        );
        break;
      default:
        fieldElement = null;
    }

    const customW = field.width || field.styles?.width;
    const customH = field.height || field.styles?.height;

    const fieldContainerStyle: React.CSSProperties = {};
    if (customW) {
      fieldContainerStyle.width = customW;
      fieldContainerStyle.maxWidth = '100%';
    }
    if (customH) {
      fieldContainerStyle.height = customH;
      fieldContainerStyle.minHeight = customH;
    }

    return (
      <div key={field.name} style={fieldContainerStyle} className={cn(
        "flex items-center w-full",
        field.className,
        field.colSpan === 2 ? "col-span-2" : "col-span-1"
      )}>
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
          {fieldElement}
        </div>
      </div>
    );
  };

  return (
    <div ref={formRef} className={cn(
      "form-container flex flex-col h-full w-full relative bg-white dark:bg-gray-900 overflow-x-hidden [&_label]:!text-[10px]",
      !hideHeader ? `md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-800 ${currentFormStyle}` : "border-none shadow-none",
      className
    )}>
      {showLoadingOverlay && <LoadingOverlay visible={isSubmitting || localSubmitting} message={t('saving' as any) || 'در حال ذخیره سازی...'} />}
      
      {!hideHeader && (title || headerTop || actionbar || showActions) && (
        <div className={`relative flex flex-col flex-shrink-0 w-full m-0 border-b border-x-0 border-b-gray-200 dark:border-b-gray-800 rounded-none z-30`}>
          {(title || headerTop) && (
            <div className={`w-full bg-gradient-to-r rtl:bg-gradient-to-l ${currentHeaderGradient} px-4 py-2 flex items-center justify-between text-white`}>
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
            <div className="Actionbar w-full px-4 py-2 flex flex-nowrap items-center justify-start gap-4 overflow-visible">
              {showActions && (
                <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
                  <NewButton onClick={onNew} disabled={isInserting && !hasSaved} hideLabel />
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
                  <SaveButton onClick={onSave ? () => executeAction(onSave, 'save') : undefined} disabled={!onSave || isSubmitting || isReadonly || isUsed} hideLabel />
                  <SaveNewButton onClick={onSaveNew ? () => executeAction(onSaveNew, 'save_new') : undefined} disabled={!onSaveNew || isSubmitting || isReadonly || isUsed} hideLabel />
                  <SaveCloseButton onClick={(onSaveClose || onSave) ? () => executeAction(onSaveClose, 'save_close') : undefined} disabled={(!onSaveClose && !onSave) || isSubmitting || isReadonly || isUsed} hideLabel />
                  <DeleteButton 
                    onClick={onDelete ? () => { 
                      setDeleteActionType('delete'); 
                      setIsDeleteModalOpen(true); 
                    } : undefined} 
                    disabled={isSubmitting || isReadonly || isUsed || (isInserting && !hasSaved)} 
                    hideLabel 
                  />
                  <DeleteAndNewButton 
                    onClick={onDelete && onNew ? () => { 
                      setDeleteActionType('delete_and_new'); 
                      setIsDeleteModalOpen(true); 
                    } : undefined} 
                    disabled={isSubmitting || isReadonly || isUsed || (isInserting && !hasSaved)} 
                    hideLabel 
                  />
                </div>
              )}
              {actionbar && (
                <div className="flex flex-nowrap items-center gap-2 shrink-0">
                  {actionbar}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-y-auto w-full">
        {topFields && topFields.length > 0 && (
          <div className="px-2 md:px-6 pt-4 pb-4 grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-4 shrink-0 h-[30%] md:h-auto md:max-h-[min(400px,40vh)] md:shrink-0 overflow-y-auto w-full">
            {topFields.map(renderField)}
          </div>
        )}

        {tabs.length > 0 && (
          <div className="relative flex items-center border-b border-gray-200 dark:border-gray-800 w-full group">
            {showRightArrow && (
              <button 
                type="button"
                className="absolute right-0 z-20 h-full px-1 bg-gradient-to-l from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent flex items-center justify-center hover:text-blue-500 opacity-80 hover:opacity-100 transition-opacity"
                onClick={() => scrollTabs('right')}
              >
                <ChevronRight className="w-5 h-5 text-gray-500 hover:text-blue-500" />
              </button>
            )}

            <div 
              ref={tabsContainerRef}
              className="flex px-6 overflow-x-auto no-scrollbar scroll-smooth flex-1 w-full"
              onScroll={checkScroll}
            >
              {tabs.map((tab) => {
                const isActive = activeTabId === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabIdState(tab.id)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap outline-none border-b-2",
                      isActive 
                        ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400" 
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {showLeftArrow && (
              <button 
                type="button"
                className="absolute left-0 z-20 h-full px-1 bg-gradient-to-r from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent flex items-center justify-center hover:text-blue-500 opacity-80 hover:opacity-100 transition-opacity"
                onClick={() => scrollTabs('left')}
              >
                <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-blue-500" />
              </button>
            )}
          </div>
        )}

        {activeTabConfig && (
          <div className="flex-1 shrink-0 h-[65%] md:h-auto overflow-y-auto px-2 md:px-6 pt-4 pb-6 grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-4">
            {activeTabConfig.fields && activeTabConfig.fields.map(renderField)}
          </div>
        )}

        {children && (
           <div className="flex-1 shrink-0 h-[65%] md:h-auto overflow-y-auto px-2 md:px-6 pb-6">
             {children}
           </div>
        )}
      </div>
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
