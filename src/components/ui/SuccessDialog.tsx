"use client"

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  loadingMessage?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function SuccessDialog({
  isOpen,
  onClose,
  title = 'สำเร็จ',
  message = 'กำลังดำเนินการ...',
  loadingMessage = 'กำลังเปลี่ยนหน้า...',
  autoClose = true,
  autoCloseDelay = 2000,
}: SuccessDialogProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <div className="flex flex-col items-center text-center gap-4 py-6 px-4">
          <div className="rounded-full bg-green-50 p-3 shadow-sm">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-1">
            <DialogHeader>
              <DialogTitle className="text-center text-lg sm:text-xl font-semibold">{title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">{message}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-600">{loadingMessage}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
