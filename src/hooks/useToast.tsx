/**
 * Custom Toast Hook
 * Wrapper for react-hot-toast with consistent styling and behavior
 * Replaces browser alert() and confirm() dialogs
 */

import toast from "react-hot-toast";

export interface ToastOptions {
  duration?: number;
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right";
}

export const useToast = () => {
  /**
   * Show success toast
   */
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 3000,
      position: options?.position || "top-center",
      style: {
        background: "#10B981",
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10B981",
      },
    });
  };

  /**
   * Show error toast
   */
  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 4000,
      position: options?.position || "top-center",
      style: {
        background: "#EF4444",
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#EF4444",
      },
    });
  };

  /**
   * Show info/warning toast
   */
  const info = (message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 3500,
      position: options?.position || "top-center",
      icon: "ℹ️",
      style: {
        background: "#3B82F6",
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  /**
   * Show warning toast
   */
  const warning = (message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 3500,
      position: options?.position || "top-center",
      icon: "⚠️",
      style: {
        background: "#F59E0B",
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  /**
   * Show loading toast with promise
   */
  const loading = (message: string) => {
    return toast.loading(message, {
      position: "top-center",
      style: {
        background: "#334293",
        color: "#fff",
        padding: "16px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
      },
    });
  };

  /**
   * Dismiss a specific toast or all toasts
   */
  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  /**
   * Confirmation dialog replacement (using toast with custom component)
   * Returns a promise that resolves with true/false
   */
  const confirm = (
    message: string,
    confirmText: string = "ยืนยัน",
    cancelText: string = "ยกเลิก"
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex flex-col border-2 border-gray-200`}
          >
            <div className="flex-1 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-3xl">❓</div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    ยืนยันการดำเนินการ
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-300"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#334293] to-[#4a56b8] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                {confirmText}
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
        }
      );
    });
  };

  /**
   * Prompt dialog replacement (using toast with input)
   * Returns a promise that resolves with the input value or null
   */
  const prompt = (
    message: string,
    defaultValue: string = "",
    confirmText: string = "ยืนยัน",
    cancelText: string = "ยกเลิก"
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      let inputValue = defaultValue;

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex flex-col border-2 border-gray-200`}
          >
            <div className="flex-1 p-6">
              <div className="mb-4">
                <p className="text-base font-semibold text-gray-900 mb-2">
                  {message}
                </p>
              </div>
              <input
                type="text"
                defaultValue={defaultValue}
                onChange={(e) => (inputValue = e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#334293] transition-colors"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    toast.dismiss(t.id);
                    resolve(inputValue || null);
                  } else if (e.key === "Escape") {
                    toast.dismiss(t.id);
                    resolve(null);
                  }
                }}
              />
            </div>
            <div className="flex gap-3 p-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-300"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(inputValue || null);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#334293] to-[#4a56b8] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                {confirmText}
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          position: "top-center",
        }
      );
    });
  };

  return {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    confirm,
    prompt,
  };
};
