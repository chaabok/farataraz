"use client";

import React from "react";
import { Save } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { useLanguage } from "@/components/Providers";

export function SaveNoteButton({ onClick, disabled, hideLabel }: { onClick?: () => void; disabled?: boolean; hideLabel?: boolean }) {
  const { t } = useLanguage();
  return (
    <ActionButton onClick={onClick} disabled={disabled} icon={Save} variant="warning" tooltip={t('saveNote' as any) || 'ذخیره یادداشت'} hideLabel={hideLabel}>
      {t('saveNote' as any) || 'ذخیره یادداشت'}
    </ActionButton>
  );
}
