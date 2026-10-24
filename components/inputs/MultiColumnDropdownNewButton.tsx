"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ActionButton } from "@/components/buttons/ActionButton";
import { useLanguage } from "@/components/Providers";

/**
 * MultiColumnDropdownNewButton - Specialized New button for MultiColumnDropdown.
 * Styled exactly like the application's standard Document New button.
 */
export function MultiColumnDropdownNewButton({ 
  onClick, 
  disabled, 
  hideLabel 
}: { 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <ActionButton 
      onClick={onClick} 
      disabled={disabled} 
      icon={Plus} 
      variant="primary" 
      tooltip={(t as any)('new_tooltip') || 'تعریف جدید'} 
      tooltipPosition="top"
      hideLabel={hideLabel}
    >
      {(t as any)('new') || 'جدید'}
    </ActionButton>
  );
}
