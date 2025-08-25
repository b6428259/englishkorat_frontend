"use client";
import { useRouter } from 'next/navigation';
import { logout } from '@/services/auth.service';
import { useState } from 'react';
import { ErrorModal, SuccessModal } from '.';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/auth');
      }, 1500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการออกจากระบบ');
      } else {
        setErrorMessage('เกิดข้อผิดพลาดในการออกจากระบบ');
      }
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="ออกจากระบบสำเร็จ!"
        message="คุณได้ออกจากระบบเรียบร้อยแล้ว"
        loadingMessage="กำลังเปลี่ยนหน้า..."
      />
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="ออกจากระบบไม่สำเร็จ"
        message={errorMessage}
      />
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
      </button>
    </>
  );
}
