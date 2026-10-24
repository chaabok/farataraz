"use client";

import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

export function FullscreenButton({ 
  onClick, 
  disabled, 
  hideLabel,
  className,
  variant = 'outline',
  targetRef
}: { 
  onClick?: () => void; 
  disabled?: boolean; 
  hideLabel?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'info' | 'outline' | 'ghost' | 'indigo';
  targetRef?: React.RefObject<HTMLElement | null>;
}) {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (onClick) onClick();
    
    if (!document.fullscreenElement) {
      const element = targetRef?.current || document.documentElement;
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <ActionButton 
      onClick={toggleFullscreen} 
      disabled={disabled} 
      icon={isFullscreen ? Minimize : Maximize} 
      variant={variant} 
      className={className}
      tooltip={t('fullscreen_tooltip' as any) || 'تمام صفحه'} 
      hideLabel={hideLabel}
    >
      {t('fullscreen_tooltip' as any) || 'تمام صفحه'}
    </ActionButton>
  );
}
