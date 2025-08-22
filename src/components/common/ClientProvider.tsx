"use client";

import { LanguageProvider } from '../../contexts/LanguageContext';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from './Toast';
import { ConditionalAuth } from './ConditionalAuth';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SidebarProvider>
          <ToastProvider>
            <ConditionalAuth>
              {children}
            </ConditionalAuth>
          </ToastProvider>
        </SidebarProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}