'use client';

import React, { createContext, useContext } from 'react';
import arMessages from '@/messages/ar.json';
import enMessages from '@/messages/en.json';

type Messages = typeof arMessages;

interface I18nContextType {
  locale: string;
  messages: Messages;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ 
  children, 
  locale 
}: { 
  children: React.ReactNode;
  locale: string;
}) {
  const messages = locale === 'ar' ? arMessages : enMessages;

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider');
  }
  return context.t;
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLocale must be used within I18nProvider');
  }
  return context.locale;
}