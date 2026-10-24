"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useContext, useState } from "react";
import { safeStringify, getDeleteConfirmationMessage, getBandStyleWidth } from "@/lib/utils";
import { ConfirmDialog } from "../ui/ConfirmDialog";
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
  CheckBoxRightLabel,
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
import { VoucherActionButtons } from "../buttons/VoucherActionButtons";
import { CloseButton } from "../buttons/CloseButton";
import { FullscreenButton } from "../buttons/FullscreenButton";
import { HelpButton } from "../buttons/HelpButton";
import { RecordNavigator } from "./RecordNavigator";
import { cn } from "../../lib/utils";
import { useToast } from "../ToastProvider";
import { FiscalYearWarningBanner } from "../ui/FiscalYearWarningBanner";
import { useFormLabelAlignment } from "@/hooks/useFormLabelAlignment";

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'amount'
  | 'date' 
  | 'select' 
  | 'textarea' 
  | 'checkbox' 
  | 'radio' 
  | 'multi-select'
  | 'multi-checkbox'
  | 'email'
  | 'website'
  | 'file'
  | 'custom'
  | 'checkbox-right-label';

import { ClassicToolbar } from "../ui/ClassicToolbar";

export interface BandConfig {
  id: string;
  parentBandId?: string;
  title?: string;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  bgColor?: string;
  borderRadius?: string;
  className?: string;
  layout?: 'flex' | 'grid';
}

export interface FieldConfig {
  name: string;
  label?: string | React.ReactNode;
  text?: string | React.ReactNode;
  type: FieldType;
  required?: boolean;
  isHeader?: boolean;
  options?: { value: string | number; label: string }[]; // For select, radio, multi-checkbox
  accept?: string; // For file input
  placeholder?: string;
  className?: string; // To allow custom width like w-1/2 or w-64
  customComponent?: React.ReactNode; 
  render?: (value: any, onChange: (val: any) => void) => React.ReactNode;
  labelWidth?: string;
  maxLength?: number;
  colSpan?: 1 | 2;
  bandId?: string;
  disabled?: boolean;
  width?: string | number;
  height?: string | number;
  styles?: {
    width?: string;
    height?: string;
    fontFamily?: string;
    fontSize?: string;
    textColor?: string;
    bgColor?: string;
    [key: string]: any;
  };
  onBlur?: (name: string, value: any) => void;
}

interface SimpleFormProps {
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
  onNew?: () => void;
  onList?: () => void;
  listApiUrl?: string;
  listColumns?: any[];
  listDisplayKey?: string;
  onListSelect?: (item: any) => void;
  onDelete?: (type?: string) => Promise<void> | void;
  onHelp?: () => void;
  onClose?: () => void;
  preventTabClose?: boolean;
  showActions?: boolean;
  useClassicToolbar?: boolean;
  showListButton?: boolean;
  isSubmitting?: boolean;
  hideHeader?: boolean;
  showLoadingOverlay?: boolean;
  subHeader?: React.ReactNode;
  contentClassName?: string;
  children?: React.ReactNode;
  isReadonly?: boolean;
  isUsed?: boolean;
  showPrintList?: boolean;
  showVoucherActionbar?: boolean;
  targetFormCode?: string;
  onPrintList?: () => void;
  onVoucherAction?: () => void;
  hasDateInput?: boolean;
  formName?: string;
  showRecordNavigator?: boolean;
  currentRecordId?: number | string | null;
  onNavigate?: (direction: "first" | "prev" | "next" | "last", targetItem: any) => void;
}

// In case TabContext isn't exported, we recreate the import safely using useTabs hook from the file.
import { AlertTriangle } from "lucide-react";
import { useFiscalYearCheck } from "@/hooks/useFiscalYearCheck";
import { useLanguage } from "../Providers";
import { useOptionalTabs } from "../TabsProvider";
import { useHelp } from "../HelpProvider";

import { LoadingOverlay } from "../ui/LoadingOverlay";

export function SimpleForm({ 
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
  onNew,
  onList,
  listApiUrl,
  listColumns,
  listDisplayKey,
  onListSelect,
  onDelete,
  onHelp,
  onClose,
  preventTabClose = false,
  showActions = true,
  useClassicToolbar = false,
  showListButton = true,
  isSubmitting = false,
  hideHeader = false,
  showLoadingOverlay = true,
  subHeader,
  contentClassName,
  children,
  isReadonly = false,
  isUsed = false,
  showPrintList = false,
  showVoucherActionbar = false,
  targetFormCode,
  onPrintList,
  onVoucherAction,
  hasDateInput,
  formName,
  showRecordNavigator = true,
  currentRecordId,
  onNavigate,
}: SimpleFormProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { openHelp } = useHelp();
  const formRef = React.useRef<HTMLDivElement>(null);

  const containsDateField = (fields || []).some(f => f.type === 'date');
  const hasDateField = hasDateInput !== undefined ? hasDateInput : containsDateField;
  const { isFormDisabledDueToFiscalYear } = useFiscalYearCheck(hasDateField);
  const effectiveIsReadonly = isReadonly || isFormDisabledDueToFiscalYear;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [deleteActionType, setDeleteActionType] = useState<'delete' | 'delete_and_new' | null>(null);

  // Auto-align label widths so input fields align perfectly
  useFormLabelAlignment(formRef, [fields, values, bands]);

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
  
  // Conditionally getting tab context (without throwing if it doesn't exist)
  const tabsCtx = useOptionalTabs();
  if (tabsCtx && tabsCtx.tabs && tabsCtx.activeTabId) {
    activeTabId = tabsCtx.activeTabId;
    const activeTab = tabsCtx.tabs.find(t => t.id === tabsCtx.activeTabId);
    if (activeTab) {
      groupId = activeTab.groupId;
      setTabDirty = tabsCtx.setTabDirty;
    }
  }

  // Effect to mark tab as clean initially
  React.useEffect(() => {
    if (setTabDirty && activeTabId) {
      // Don't mark dirty until there's an actual user edit
      // setTabDirty(activeTabId, false);
    }
    // Update baseline when not dirty
    if (!activeTabId || (tabsCtx && !tabsCtx.dirtyTabs[activeTabId])) {
      lastSavedValuesRef.current = safeStringify(values);
    }
  }, [values, activeTabId, tabsCtx?.dirtyTabs]);

  const handleChange = (name: string, value: any) => {
    if (isFormDisabledDueToFiscalYear) return;
    onChange(name, value);
    if (setTabDirty && activeTabId) {
      setTabDirty(activeTabId, true);
    }
  };

  const clearDirtyAndExecute = async (action?: () => void | Promise<void>) => {
    if (!action) return;
    await action();
    if (setTabDirty && activeTabId) {
      setTabDirty(activeTabId, false);
    }
  };

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

  let dynamicLabelWidth = labelWidth === "80px" ? "auto" : labelWidth;

  const renderField = (field: FieldConfig) => {
    const value = values[field.name];
    const errorText = errors[field.name];

    // Apply the " :" suffix to strictly match the requested visual only for strings
    const displayLabel = field.label 
      ? (typeof field.label === 'string' ? `${field.label} :` : field.label) 
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
      disabled: field.disabled || effectiveIsReadonly, // DISABLE IF READONLY OR NO FISCAL YEAR
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
        fieldElement = <DateInput {...commonProps} isHeader={field.isHeader !== undefined ? field.isHeader : true} fiscalYearRef={values.FiscalYearRef || values.fiscalYearRef} />;
        break;
      case 'email':
        fieldElement = <EmailInput {...commonProps} placeholder={field.placeholder} />;
        break;
      case 'website':
        fieldElement = <WebsiteInput {...commonProps} placeholder={field.placeholder} />;
        break;
      case 'checkbox':
        fieldElement = <Checkbox {...commonProps} text={field.text as any} checked={!!value} onChange={(checked) => handleChange(field.name, checked)} />;
        break;
      case 'checkbox-right-label':
        fieldElement = (
          <CheckBoxRightLabel
            label={displayLabel}
            text={field.text}
            checked={value !== false && !!value}
            onChange={(checked) => handleChange(field.name, checked)}
            disabled={field.disabled || isReadonly}
            required={field.required}
            error={errorText as string}
          />
        );
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
          let customEl = field.customComponent;
          if (!customEl && field.render) {
            customEl = field.render(value, (val: any) => handleChange(field.name, val));
          }
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
          fieldElement = (
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
        field.className
      )}>
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center">
          {fieldElement}
        </div>
      </div>
    );
  };

  return (
    <div ref={formRef} className={cn(
      "form-container flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-x-hidden relative",
      !hideHeader ? `rounded-lg border border-gray-200 dark:border-gray-800 ${currentFormStyle}` : "border-none shadow-none",
      className
    )}>
      {showLoadingOverlay && <LoadingOverlay visible={isSubmitting || localSubmitting} message={t('please_wait' as any) || 'لطفا منتظر بمانید...'} />}
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
                <CloseButton onClick={onClose} preventTabClose={preventTabClose} hideLabel variant="ghost" className="text-white hover:text-white/80 hover:bg-transparent dark:hover:bg-transparent p-1 shadow-none" />
              </div>
            </div>
          )}
          {(actionbar || showActions) && (
            <div className="Actionbar w-full bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 flex flex-nowrap items-center justify-between gap-4 overflow-visible">
              <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
                {showActions && (
                  <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
                    {useClassicToolbar ? (
                      <ClassicToolbar 
                        onNew={onNew} disableNew={false}
                        onList={onList}
                        onSave={onSave ? () => executeAction(onSave, 'save') : undefined} disableSave={isSubmitting}
                        onSaveNew={onSaveNew ? () => executeAction(onSaveNew, 'save_new') : undefined}
                        onSaveClose={(onSaveClose || onSave) ? () => executeAction(onSaveClose, 'save_close') : undefined}
                        onDeleteCross={onDelete ? () => { setDeleteActionType('delete_and_close'); setIsDeleteModalOpen(true); } : undefined}
                        onDeleteNew={(onDelete && onNew) ? () => { setDeleteActionType('delete_and_new'); setIsDeleteModalOpen(true); } : undefined}
                        onDelete={onDelete ? () => { setDeleteActionType('delete'); setIsDeleteModalOpen(true); } : undefined} disableDelete={isSubmitting || !onDelete || (isInserting && !hasSaved)}
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
                        <SaveButton onClick={onSave ? () => executeAction(onSave, 'save') : undefined} disabled={!onSave || isSubmitting || effectiveIsReadonly || isUsed} hideLabel />
                        <SaveNewButton onClick={onSaveNew ? () => executeAction(onSaveNew, 'save_new') : undefined} disabled={!onSaveNew || isSubmitting || effectiveIsReadonly || isUsed} hideLabel />
                        <SaveCloseButton onClick={(onSaveClose || onSave) ? () => executeAction(onSaveClose, 'save_close') : undefined} disabled={(!onSaveClose && !onSave) || isSubmitting || effectiveIsReadonly || isUsed} hideLabel />
                        <DeleteButton 
                          onClick={onDelete ? () => { 
                            setDeleteActionType('delete'); 
                            setIsDeleteModalOpen(true); 
                          } : undefined} 
                          disabled={!onDelete || (isInserting && !hasSaved) || isSubmitting || effectiveIsReadonly || isUsed} 
                          hideLabel 
                        />
                        <DeleteAndNewButton 
                          onClick={onDelete && onNew ? () => { 
                            setDeleteActionType('delete_and_new'); 
                            setIsDeleteModalOpen(true); 
                          } : undefined} 
                          disabled={!onDelete || !onNew || (isInserting && !hasSaved) || isSubmitting || effectiveIsReadonly || isUsed} 
                          hideLabel 
                        />
                        {showPrintList && (
                          <PrintDropdownButton 
                            targetForm={targetFormCode || 'dynamic_form'} 
                            onPrint={onPrintList} 
                          />
                        )}
                        {showVoucherActionbar && (
                          <VoucherActionButtons 
                            action="insert" 
                            onClick={onVoucherAction} 
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
          {subHeader && (
            <div className="w-full shrink-0 relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              {subHeader}
            </div>
          )}
        </div>
      )}
      <div className={cn("flex flex-col flex-1 overflow-y-auto gap-y-4 w-full px-6 pt-4 pb-6", contentClassName)}>
        {isFormDisabledDueToFiscalYear && (
          <FiscalYearWarningBanner />
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
                      style={{ width: bandWidthStyle, flexBasis: bandWidthStyle, flexGrow: 0, flexShrink: 0 }} 
                      className="flex flex-col gap-y-3 box-border"
                    >
                      <div className="flex flex-wrap gap-x-4 gap-y-3 w-full">
                        {bandFields.map(renderField)}
                      </div>
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
                    <div className="flex flex-wrap gap-x-4 gap-y-3 w-full">
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
          (fields || []).map(renderField)
        )}
        {children}
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
