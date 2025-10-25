"use client";

import Button from "@/components/common/Button";
import { Copy, QrCode, RefreshCw, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SessionCodeDisplayProps {
  sessionCode: string;
  sessionName: string;
  expiresAt: string;
  onRefreshCode?: () => void;
  onViewStudents?: () => void;
  onClose?: () => void;
}

export default function SessionCodeDisplay({
  sessionCode,
  sessionName,
  expiresAt,
  onRefreshCode,
  onViewStudents,
  onClose,
}: Readonly<SessionCodeDisplayProps>) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("หมดอายุ");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(
          `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      toast.success("คัดลอกโค้ดแล้ว!");
    } catch (error) {
      toast.error("ไม่สามารถคัดลอกได้");
      console.error(error);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    sessionCode
  )}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#334293] mb-2">
            ✅ Check-in สำเร็จ
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">{sessionName}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* QR Code Section */}
      <div className="bg-gradient-to-br from-[#334293] to-[#4a5ab3] rounded-xl p-6 mb-6">
        <div className="bg-white rounded-lg p-4 inline-block mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="w-64 h-64 sm:w-72 sm:h-72 mx-auto"
          />
        </div>
        <p className="text-white text-center mt-4 text-sm sm:text-base">
          สแกน QR Code หรือพิมพ์โค้ดด้านล่าง
        </p>
      </div>

      {/* Session Code Text */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-center gap-4">
          <QrCode className="h-8 w-8 text-[#334293]" />
          <h1 className="text-4xl sm:text-5xl font-bold text-[#334293] tracking-[0.3em] font-mono">
            {sessionCode}
          </h1>
        </div>
        <button
          onClick={copyToClipboard}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-[#334293] text-[#334293] rounded-lg hover:bg-[#334293] hover:text-white transition-all"
        >
          <Copy className="h-4 w-4" />
          <span>คัดลอกโค้ด</span>
        </button>
      </div>

      {/* Timer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800 font-medium">เวลาที่เหลือ:</span>
          <span className="text-2xl font-bold text-yellow-600 font-mono">
            {timeRemaining}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {onRefreshCode && (
          <Button
            variant="outline"
            onClick={onRefreshCode}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>สร้างโค้ดใหม่</span>
          </Button>
        )}
        {onViewStudents && (
          <Button
            variant="common"
            onClick={onViewStudents}
            className="flex items-center justify-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span>ดูรายชื่อนักเรียน</span>
          </Button>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          💡 นักเรียนสามารถเช็คชื่อได้โดยสแกน QR Code หรือพิมพ์โค้ด 6 ตัวอักษร
        </p>
      </div>
    </div>
  );
}
