"use client";

import React, { ReactNode } from 'react';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useConfirmStore } from '../lib/stores/confirmStore';
import { useShallow } from 'zustand/react/shallow';

export function useConfirm() {
  const confirm = useConfirmStore(useShallow(state => state.confirm));
  return { confirm };
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore(useShallow(state => ({
    isOpen: state.isOpen,
    options: state.options,
    handleConfirm: state.handleConfirm,
    handleCancel: state.handleCancel,
  })));

  return (
    <>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title || 'هشدار'}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
