import { create } from 'zustand';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolver: { resolve: (value: boolean) => void } | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: { title: '', message: '' },
  resolver: null,
  confirm: (opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: opts,
        resolver: { resolve },
      });
    });
  },
  handleConfirm: () => {
    const { resolver } = get();
    set({ isOpen: false });
    if (resolver) resolver.resolve(true);
  },
  handleCancel: () => {
    const { resolver } = get();
    set({ isOpen: false });
    if (resolver) resolver.resolve(false);
  },
}));
