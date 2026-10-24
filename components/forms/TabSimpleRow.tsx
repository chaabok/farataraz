"use client";

import { useFormUsageCheck } from "@/hooks/useFormUsageCheck";
import React, { useState } from "react";
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
import { CloseButton } from "../buttons/CloseButton";
import { FullscreenButton } from "../buttons/FullscreenButton";
import { HelpButton } from "../buttons/HelpButton";
import { cn } from "../../lib/utils";
import { FieldConfig } from "./SimpleFormTwoRow";
import { useFormLabelAlignment } from "@/hooks/useFormLabelAlignment";

export interface TabConfig {
  id: string;
  label: string;
  fields: FieldConfig[];
}

export interface TabSimpleRowProps {
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
  onDelete?: () => void;
  onHelp?: () => void;
  showActions?: boolean;
  showListButton?: boolean;
  isSubmitting?: boolean;
  hideHeader?: boolean;
  showLoadingOverlay?: boolean;
  children?: React.ReactNode;
}

// In case TabContext isn't exported, we recreate the import safely using useTabs hook from the file.
import { useLanguage } from "../Providers";
import { useOptionalTabs } from "../TabsProvider";
import { useHelp } from "../HelpProvider";

import { LoadingOverlay } from "../ui/LoadingOverlay";

export function TabSimpleRow({ 
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
  showActions = true,
  showListButton = true,
  isSubmitting = false,
  hideHeader = false,
  showLoadingOverlay = true,
  children
}: TabSimpleRowProps) {
  const { t } = useLanguage();
  const { openHelp } = useHelp();
  const formRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-align label widths per column so input fields align perfectly
  useFormLabelAlignment(formRef, [topFields, tabs, values, activeTabId]);

  const [activeTabId, setActiveTabIdState] = useState<string>(tabs.length > 0 ? tabs[0].id : '');

  let groupId = 'general';
  
  let setTabDirty: ((id: string, isDirty: boolean) => void) | undefined = undefined;
  let activeAppTabId: string | null = null;
  
  // Conditionally getting tab context
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

  const clearDirtyAndExecute = async (action?: () => void | Promise<void>) => {
    if (!action) return;
    await action();
    if (setTabDirty && activeAppTabId) {
      setTabDirty(activeAppTabId, false);
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
    general: 'border-blue-100 dark:border-blue-900/30 shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)]',
    financial: 'border-emerald-100 dark:border-emerald-900/30 shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)]',
    warehouse: 'border-cyan-100 dark:border-cyan-900/30 shadow-[0_8px_30px_-4px_rgba(6,182,212,0.15)]',
    hr: 'border-rose-100 dark:border-rose-900/30 shadow-[0_8px_30px_-4px_rgba(244,63,94,0.15)]',
    production: 'border-orange-100 dark:border-orange-900/30 shadow-[0_8px_30px_-4px_rgba(249,115,22,0.15)]',
    admin: 'border-purple-100 dark:border-purple-900/30 shadow-[0_8px_30px_-4px_rgba(168,85,247,0.15)]',
  };

  const currentHeaderGradient = headerGradient || groupHeaderGradients[groupId] || groupHeaderGradients['general'];
  const currentFormStyle = groupFormStyles[groupId] || groupFormStyles['general'];

  const activeTabConfig = tabs.find(t => t.id === activeTabId) || tabs[0];

  let dynamicLabelWidth = labelWidth;
  if (labelWidth === "80px" && activeTabConfig && activeTabConfig.fields) {
    const maxLen = Math.max(0, ...activeTabConfig.fields.map(f => f.label ? f.label.length : 0));
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
      label: displayLabel,
      value: value || '',
      onChange: (val: any) => handleChange(field.name, val),
      onBlur: field.onBlur ? () => field.onBlur!(field.name, value) : undefined,
      required: field.required,
      error: errorText,
      labelWidth: currentLabelWidth,
      name: field.name,
      disabled: field.disabled,
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
        fieldElement = <Select {...commonProps} options={field.options || []} placeholder={field.placeholder} />;
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
        fieldElement = <Checkbox {...commonProps} checked={!!value} onChange={(checked) => handleChange(field.name, checked)} />;
        break;
      case 'radio':
        fieldElement = <RadioGroup {...commonProps} options={field.options || []} />;
        break;
      case 'multi-select':
        fieldElement = <MultiSelect {...commonProps} options={field.options || []} values={value || []} placeholder={field.placeholder} />;
        break;
      case 'multi-checkbox':
        fieldElement = <MultiCheckbox {...commonProps} options={field.options || []} values={value || []} />;
        break;
      case 'file':
        fieldElement = (
          <FileUpload 
            label={displayLabel} 
            onChange={(file) => handleChange(field.name, file)} 
            required={field.required} 
            error={errorText}
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
            error={errorText} 
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

    return (
      <div key={field.name} className={cn(
        "flex items-center w-full",
        field.className,
        field.colSpan === 2 ? "col-span-2" : "col-span-1"
      )}>
        <div className="flex-1 min-w-0">
          {fieldElement}
        </div>
      </div>
    );
  };

  return (
    <div ref={formRef} className={cn(
      "flex flex-col h-full w-full relative bg-white dark:bg-gray-900 overflow-x-hidden",
      !hideHeader ? `md:rounded-lg md:border md:border-gray-200 md:dark:border-gray-800 ${currentFormStyle}` : "border-none shadow-none",
      className
    )}>
      {showLoadingOverlay && <LoadingOverlay visible={isSubmitting} message={t('saving' as any) || 'در حال ذخیره سازی...'} />}
      
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
            <div className="Actionbar w-full bg-gray-50/50 dark:bg-gray-800/20 px-4 py-2 flex flex-nowrap items-center justify-start gap-4 overflow-visible">
              {showActions && (
                <div className="flex flex-nowrap items-center gap-1.5 shrink-0">
                  <NewButton onClick={onNew} disabled={!onNew} hideLabel />
                  {showListButton && (
                    <ListButton 
                      onClick={onList} 
                      disabled={!onList && (!listApiUrl || !listColumns)}
                      hideLabel 
                      listApiUrl={listApiUrl} 
                      columns={listColumns} 
                      displayKey={listDisplayKey as any} 
                      onSelect={onListSelect}
                    />
                  )}
                  <SaveButton onClick={onSave ? () => clearDirtyAndExecute(onSave) : undefined} disabled={!onSave || isSubmitting} hideLabel />
                  <SaveNewButton onClick={onSaveNew ? () => clearDirtyAndExecute(onSaveNew) : undefined} disabled={!onSaveNew || isSubmitting} hideLabel />
                  <SaveCloseButton onClick={onSaveClose ? () => clearDirtyAndExecute(onSaveClose) : undefined} disabled={!onSaveClose || isSubmitting} hideLabel />
                  <DeleteButton onClick={onDelete} disabled={!onDelete || isSubmitting} hideLabel />
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
        {/* Top Fields */}
        {topFields && topFields.length > 0 && (
          <div className="px-2 md:px-6 pt-4 pb-4 grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-4 content-start shrink-0 h-[30%] md:h-auto md:max-h-[min(400px,40vh)] md:shrink-0">
            {topFields.map(renderField)}
          </div>
        )}

        {/* Tab Content (flattened out, without nested tabs) */}
        {tabs.length > 0 && (
          <div className="px-2 md:px-6 pt-4 pb-6 grid grid-cols-2 md:grid-cols-2 gap-x-2 md:gap-x-6 gap-y-4 content-start flex-1 shrink-0 h-[65%] md:h-auto">
            {tabs.flatMap((tab) => tab.fields || []).map(renderField)}
          </div>
        )}

        {/* Generic Children Content appended at the bottom */}
        {children && (
           <div className="px-6 pb-6 col-span-1 md:col-span-2">
             {children}
           </div>
        )}
      </div>

      {/* Footer Toolbar */}
      <div className="flex items-center justify-start p-0.5 px-2 bg-gradient-to-b from-[#e8e8e8] to-[#d4d4d4] dark:from-gray-800 dark:to-gray-900 border-t border-gray-300 dark:border-gray-700 gap-1 h-8">
      </div>
    </div>
  );
}
