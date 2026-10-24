"use client";

import React, { useState } from "react";
import { FormFieldWrapper } from "./FormFieldWrapper";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, KeyRound } from "lucide-react";

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  labelWidth?: string;
  alignVertical?: boolean;
  showGenerateButton?: boolean;
}

export function PasswordInput({ 
  label, 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  required, 
  disabled,
  error,
  labelWidth,
  alignVertical,
  showGenerateButton
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    // Generate an 8 character strong password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let p = "";
    for (let i = 0; i < 8; i++) {
        p += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onChange(p);
  }

  return (
    <FormFieldWrapper label={label} required={required} error={error} labelWidth={labelWidth} alignVertical={alignVertical}>
      <div className="relative w-full flex items-center gap-1">
        <div className="relative w-full">
            <input
                type={showPassword ? "text" : "password"}
                value={value ?? ""}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                placeholder={placeholder}
                autoComplete="new-password"
                className={cn(
                "w-full px-4 h-[25px] pr-8 text-[11px] bg-gray-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-100 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed",
                error 
                    ? "border-rose-500 ring-rose-500/20 ring-1" 
                    : ""
                )}
            />
            <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
        {showGenerateButton && (
            <button 
                type="button" 
                onClick={generatePassword}
                title="تولید کلمه عبور قوی"
                className="h-6 px-2 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300 transition-colors"
            >
                <KeyRound size={12} />
            </button>
        )}
      </div>
    </FormFieldWrapper>
  );
}