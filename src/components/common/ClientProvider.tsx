"use client";

import { LanguageProvider } from '../../contexts/LanguageContext';
import { SidebarProvider } from '../../contexts/SidebarContext';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <LanguageProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </LanguageProvider>
  );
}