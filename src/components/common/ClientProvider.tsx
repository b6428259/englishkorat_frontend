"use client";

import { AuthProvider } from "../../contexts/AuthContext";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { NotificationProvider } from "../../contexts/NotificationContext";
import { PopupStackProvider } from "../../contexts/PopupStackContext";
import { SidebarProvider } from "../../contexts/SidebarContext";
import { ConditionalAuth } from "./ConditionalAuth";
import { ToastProvider } from "./Toast";

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SidebarProvider>
          <PopupStackProvider>
            <NotificationProvider>
              <ToastProvider>
                <ConditionalAuth>{children}</ConditionalAuth>
              </ToastProvider>
            </NotificationProvider>
          </PopupStackProvider>
        </SidebarProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
