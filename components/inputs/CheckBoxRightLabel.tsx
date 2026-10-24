"use client";

import React from "react";

export interface CheckBoxRightLabelProps {
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

export function CheckBoxRightLabel({ 
  label, 
  text,
  checked, 
  onChange, 
  required, 
  error, 
  name,
  disabled,
  className
}: CheckBoxRightLabelProps) {
  
  let displayText = text || label;
  if (typeof displayText === "string") {
    displayText = displayText.replace(/[:：]/g, "").trim();
  }

  return (
    <div 
      className={`flex items-center h-full gap-2 select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className || ''}`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        onChange={(e) => {
          e.stopPropagation();
          if (!disabled) {
            onChange(e.target.checked);
          }
        }}
        disabled={disabled}
        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {displayText && (
        <span className={`text-xs font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
          {displayText}
        </span>
      )}
    </div>
  );
}
