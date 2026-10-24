"use client";

import React from "react";
import { X } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";
import { useOptionalTabs } from "@/components/TabsProvider";

export function CloseButton({ 
  onClick, 
  disabled, 
  hideLabel, 
  tabIdToClose,
  preventTabClose = false,
  className,
  variant = 'outline'
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  hideLabel?: boolean; 
  tabIdToClose?: string;
  preventTabClose?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'outline' | 'ghost' | 'indigo';
}) {
  const { t } = useLanguage();
  const tabsCtx = useOptionalTabs();

  const handleClose = () => {
    if (onClick) onClick();
    if (tabsCtx && !preventTabClose) {
      const idToClose = tabIdToClose || tabsCtx.activeTabId;
      if (idToClose) {
        tabsCtx.removeTab(idToClose);
      }
    }
  };

  return (
    <ActionButton 
      onClick={handleClose} 
      disabled={disabled} 
      icon={X} 
      variant={variant}
      className={className}
      tooltip={(t('close_tooltip' as any) || 'بستن') as string} 
      hideLabel={hideLabel}
    >
      {(t('close_tooltip' as any) || 'بستن') as string}
    </ActionButton>
  );
}
