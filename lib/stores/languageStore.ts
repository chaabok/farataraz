import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import en from '../locales/en.json';
import fa from '../locales/fa.json';
import ar from '../locales/ar.json';
import zh from '../locales/zh.json';
import ku from '../locales/ku.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import hi from '../locales/hi.json';
import ru from '../locales/ru.json';
import af from '../locales/af.json';

export type Language = 'en' | 'fa' | 'ar' | 'zh' | 'ku' | 'de' | 'fr' | 'hi' | 'ru' | 'af';
export type Direction = 'ltr' | 'rtl';

const dictionaries = { en, fa, ar, zh, ku, de, fr, hi, ru, af };

interface LanguageState {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStoreBase = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fa', // Default to Persian
      direction: 'rtl',
      setLanguage: (lang: Language) => {
        const direction: Direction = ['fa', 'ar', 'ku', 'af'].includes(lang) ? 'rtl' : 'ltr';
        set({ language: lang, direction });
        
        // Update DOM attributes immediately when language changes
        if (typeof document !== 'undefined') {
          document.documentElement.dir = direction;
          document.documentElement.lang = lang;
        }
      },
    }),
    {
      name: 'app-language-storage',
      // We only need to persist the language, direction can be derived, but persisting both is fine.
    }
  )
);

export function useLanguage() {
  const language = useLanguageStoreBase(useShallow((state) => state.language));
  const direction = useLanguageStoreBase(useShallow((state) => state.direction));
  const setLanguage = useLanguageStoreBase(useShallow((state) => state.setLanguage));

  const t = React.useCallback((key: keyof typeof en | string, fallback?: string): string => {
    return (dictionaries[language] as any)[key] || (dictionaries['en'] as any)[key] || fallback || key;
  }, [language]);

  return {
    language,
    direction,
    setLanguage,
    t,
  };
}

// Function to initialize DOM attributes on load
export const initializeLanguageDOM = () => {
  const { language, direction } = useLanguageStoreBase.getState();
  if (typeof document !== 'undefined') {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }
};
