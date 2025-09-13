"use client";

import { LanguageProvider } from '../../contexts/LanguageContext';
import { SidebarProvider } from '../../contexts/SidebarContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
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
          <NotificationProvider>
            <ToastProvider>
              <ConditionalAuth>
                {children}
              </ConditionalAuth>
            </ToastProvider>
          </NotificationProvider>
        </SidebarProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}