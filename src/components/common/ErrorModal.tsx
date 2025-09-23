"use client";

import ErrorDialog from "@/components/ui/ErrorDialog";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  showRetryButton?: boolean;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title = "เกิดข้อผิดพลาด",
  message = "เกิดข้อผิดพลาด",
  showRetryButton = false,
  onRetry,
  retryText = "ลองใหม่",
}: ErrorModalProps) {
  // The new ErrorDialog handles the UI and close behavior. For retry button support
  // we still render the ErrorDialog but the retry action is handled outside when
  // provided via onRetry.
  return (
    <ErrorDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      // keep autoClose default = false for errors
    />
  );
}
