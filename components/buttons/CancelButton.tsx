"use client";

import React from "react";
import { Undo2 } from "lucide-react";
import { ActionButton } from "./ActionButton";

export function CancelButton({ 
  onClick, 
  disabled, 
  hideLabel, 
  className,
  variant = 'outline'
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  hideLabel?: boolean; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'outline' | 'ghost' | 'indigo';
}) {
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={Undo2} 
      variant={variant}
      className={className}
      tooltip="انصراف" 
      hideLabel={hideLabel}
    >
      انصراف
    </ActionButton>
  );
}
