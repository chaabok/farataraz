"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function FormLabel({ children, required, htmlFor, className = "" }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor} 
      className={cn("text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1", className)}
    >
      {children}
      {required && <span className="text-rose-500 font-bold">*</span>}
    </label>
  );
}
