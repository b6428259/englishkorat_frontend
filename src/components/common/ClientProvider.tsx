"use client";

import { LanguageProvider } from '../../contexts/LanguageContext';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from './Toast';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SidebarProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SidebarProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}