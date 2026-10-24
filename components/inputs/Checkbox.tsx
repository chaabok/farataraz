"use client";

import React from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";

export interface CheckboxProps {
  label?: string | React.ReactNode;
  text?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  name?: string;
  disabled?: boolean;
  labelWidth?: string;
  alignVertical?: boolean;
  className?: string;
}

export function Checkbox({ 
  label, 
  text,
  checked, 
  onChange, 
  required, 
  error, 
  name,
  disabled,
  labelWidth,
  alignVertical,
  className
}: CheckboxProps) {
  
  return (
    <FormFieldWrapper 
      label={label} 
      required={required} 
      error={error} 
      labelWidth={labelWidth}
      alignVertical={alignVertical}
      className={className}
    >
      <div 
        className="flex items-center h-full pt-2 gap-2 cursor-pointer select-none"
        onClick={() => !disabled && onChange(!checked)}
      >
        <input
          type="checkbox"
          name={name}
          checked={!!checked}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.checked);
          }}
          disabled={disabled}
          className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {text && (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {text}
          </span>
        )}
      </div>
    </FormFieldWrapper>
  );
}
