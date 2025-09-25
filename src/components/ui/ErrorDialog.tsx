"use client"

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function ErrorDialog({
  isOpen,
  onClose,
  title = 'เกิดข้อผิดพลาด',
  message = 'เกิดข้อผิดพลาด โปรดลองอีกครั้ง',
  autoClose = false,
  autoCloseDelay = 2000,
}: ErrorDialogProps) {
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
          <div className="rounded-full bg-red-50 p-3 shadow-sm">
            <svg
              className="h-10 w-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl font-semibold">{title}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground max-w-xs mx-auto">{message}</p>

          <div className="flex gap-3 mt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">ปิด</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
