import { create } from 'zustand';

export type AiProvider = 'gemini' | 'chatgpt' | 'deepseek';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'success' | 'error';
}

interface AiState {
  isOpen: boolean;
  messages: ChatMessage[];
  provider: AiProvider;
  isLoading: boolean;
  isTabbed: boolean;
  iconPosition: { x: number, y: number } | null;
  toggleOpen: () => void;
  setProvider: (provider: AiProvider) => void;
  addMessage: (msg: ChatMessage) => void;
  updateMessage: (id: string, msg: Partial<ChatMessage>) => void;
  setLoading: (isLoading: boolean) => void;
  clearHistory: () => void;
  setIsTabbed: (isTabbed: boolean) => void;
  setIconPosition: (pos: { x: number, y: number } | null) => void;
}

export const useAiStore = create<AiState>((set) => ({
  isOpen: false,
  isTabbed: false,
  iconPosition: null,
  messages: [],
  provider: 'gemini',
  isLoading: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setProvider: (provider) => set({ provider }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  clearHistory: () => set({ messages: [] }),
  setIsTabbed: (isTabbed) => set({ isTabbed }),
  setIconPosition: (iconPosition) => set({ iconPosition })
}));
