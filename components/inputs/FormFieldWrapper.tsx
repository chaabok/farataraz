"use client";

import React from "react";
import { FormLabel } from "./FormLabel";
import { AlertTriangle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FormFieldWrapperProps {
  label?: string | React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  id?: string;
  alignTop?: boolean;
  alignVertical?: boolean;
  labelWidth?: string; // e.g. "80px" or "130px"
  hideErrorText?: boolean;
  className?: string;
  labelClassName?: string;
  isDescription?: boolean;
  name?: string;
}

export function FormFieldWrapper({ 
  label, 
  error, 
  required, 
  children, 
  id, 
  alignTop, 
  alignVertical,
  labelWidth = "auto", 
  hideErrorText,
  className,
  labelClassName,
  isDescription,
  name
}: FormFieldWrapperProps) {
  const hasError = !!error;

  const isDesc = isDescription || 
    (name && ['description', 'Description', 'VoucherDescription', 'description1', 'description2'].includes(name)) ||
    (typeof label === 'string' && (
      label.includes("توضیحات") || 
      label.includes("شرح") || 
      label.includes("توضیح")
    ));

  return (
    <div className={cn("w-full group/field", className)}>
      <div 
        className={cn(
          "flex relative gap-[5px]",
          alignVertical ? "flex-col" : "flex-row items-center",
          alignTop && !alignVertical && "items-start"
        )}
      >
        {label && (
          <div 
            className={cn(
              "form-label-container shrink-0 flex justify-start px-1 transition-colors whitespace-nowrap",
              alignVertical && "form-label-vertical",
              alignTop && !alignVertical ? "pt-1.5" : "",
              hasError ? "text-rose-500 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"
            )}
          >
            <FormLabel htmlFor={id} required={required} className={cn(hasError && "text-rose-500", labelClassName)}>
              {label}
            </FormLabel>
          </div>
        )}
        
        <div className={cn(
          "relative flex items-center gap-[5px]",
          alignVertical ? "w-full" : "flex-1 min-w-0"
        )}>
          <div className="flex-1 min-w-0">
            {children}
          </div>
          
          <AnimatePresence>
            {hasError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: 5 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 5 }}
                className="shrink-0"
              >
                <Tooltip content={error} position="bottom">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-500 shadow-sm transition-all hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50 cursor-help">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {!hideErrorText && hasError && alignVertical && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 font-medium px-1.5"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
