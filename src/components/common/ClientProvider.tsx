"use client";

import { LanguageProvider } from '../../contexts/LanguageContext';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}