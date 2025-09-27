"use client";

import ScheduleInvitationPopup from "@/components/notifications/ScheduleInvitationPopup";
import { Notification } from "@/types/notification";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useCallback, useContext, useState } from "react";

interface PopupItem {
  id: string;
  type: "schedule-invitation" | "general";
  notification: Notification & {
    scheduleData?: {
      id: number;
      schedule_name: string;
      schedule_type: string;
      start_date: string;
      estimated_end_date?: string;
      notes?: string;
      participants?: Array<{
        user_id: number;
        role: string;
        status: string;
        user: { id: number; username: string };
      }>;
      sessions?: Array<{
        id: number;
        date: string;
        start_time: string;
        end_time: string;
        status: string;
      }>;
    };
  };
  priority: number; // higher number = higher priority
  persistent: boolean; // if true, stays until user responds
  onClose?: () => void;
  onConfirm?: (status?: string) => void;
}

interface PopupStackContextType {
  popups: PopupItem[];
  addPopup: (popup: Omit<PopupItem, "id">) => string;
  removePopup: (id: string) => void;
  clearAllPopups: () => void;
  getCurrentPopup: () => PopupItem | null;
}

const PopupStackContext = createContext<PopupStackContextType | undefined>(
  undefined
);

export function usePopupStack() {
  const context = useContext(PopupStackContext);
  if (context === undefined) {
    throw new Error("usePopupStack must be used within a PopupStackProvider");
  }
  return context;
}

interface PopupStackProviderProps {
  children: React.ReactNode;
}

export function PopupStackProvider({ children }: PopupStackProviderProps) {
  const [popups, setPopups] = useState<PopupItem[]>([]);

  const addPopup = useCallback((popup: Omit<PopupItem, "id">): string => {
    const id = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPopup: PopupItem = { ...popup, id };

    setPopups((prev) => {
      // Add the new popup and sort by priority (higher priority first)
      const updated = [...prev, newPopup].sort(
        (a, b) => b.priority - a.priority
      );
      return updated;
    });

    return id;
  }, []);

  const removePopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  const clearAllPopups = useCallback(() => {
    setPopups([]);
  }, []);

  const getCurrentPopup = useCallback((): PopupItem | null => {
    // Return the highest priority popup
    return popups.length > 0 ? popups[0] : null;
  }, [popups]);

  const handlePopupClose = useCallback(
    (popupId: string) => {
      const popup = popups.find((p) => p.id === popupId);
      if (popup && !popup.persistent) {
        popup.onClose?.();
        removePopup(popupId);
      }
    },
    [popups, removePopup]
  );

  const handlePopupConfirm = useCallback(
    (popupId: string, status?: string) => {
      const popup = popups.find((p) => p.id === popupId);
      if (popup) {
        popup.onConfirm?.(status);
        removePopup(popupId);
      }
    },
    [popups, removePopup]
  );

  const renderPopup = (popup: PopupItem, index: number) => {
    const isActive = index === 0;
    const scale = 1 - index * 0.05; // Each popup gets slightly smaller
    const yOffset = index * 10; // Each popup is offset slightly
    const zIndex = 1000 - index; // Higher popups have higher z-index

    switch (popup.type) {
      case "schedule-invitation":
        return (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: isActive ? 1 : 0.7,
              scale,
              y: yOffset,
              zIndex,
            }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%)`,
              zIndex,
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            <ScheduleInvitationPopup
              notification={popup.notification}
              isOpen={true}
              onClose={() => handlePopupClose(popup.id)}
              onConfirm={(status) => handlePopupConfirm(popup.id, status)}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  const contextValue: PopupStackContextType = {
    popups,
    addPopup,
    removePopup,
    clearAllPopups,
    getCurrentPopup,
  };

  return (
    <PopupStackContext.Provider value={contextValue}>
      {children}

      {/* Backdrop for stacked popups */}
      {popups.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[999]"
          style={{ pointerEvents: popups.length > 0 ? "auto" : "none" }}
        />
      )}

      {/* Popup stack indicator */}
      {popups.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg px-4 py-2 z-[1001]"
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex -space-x-1">
              {popups.slice(0, 3).map((popup) => (
                <div
                  key={popup.id}
                  className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"
                />
              ))}
              {popups.length > 3 && (
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-white font-bold">+</span>
                </div>
              )}
            </div>
            <span>
              {popups.length} notification{popups.length > 1 ? "s" : ""} pending
            </span>
          </div>
        </motion.div>
      )}

      {/* Render all popups */}
      <AnimatePresence mode="sync">
        {popups.map((popup, index) => renderPopup(popup, index))}
      </AnimatePresence>
    </PopupStackContext.Provider>
  );
}
