"use client";

import Button from "@/components/common/Button";
import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface QRScannerProps {
  onScanSuccess: (code: string) => void;
  onClose: () => void;
}

export default function QRScanner({
  onScanSuccess,
  onClose,
}: Readonly<QRScannerProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);

        // Start scanning loop
        scanIntervalRef.current = setInterval(() => {
          scanQRCode();
        }, 500);
      }
    } catch (err) {
      const error = err as Error;
      setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้กล้อง");
      toast.error(error.message || "Camera access denied");
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // For future QR detection implementation:
      // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = detectQRCode();

      if (code) {
        stopCamera();
        onScanSuccess(code);
      }
    } catch (err) {
      console.error("QR scan error:", err);
    }
  };

  // Simple QR detection - In production, use a proper library like jsQR
  const detectQRCode = (): string | null => {
    // This is a placeholder - you should use jsQR library for proper QR detection
    // For now, we'll rely on the manual input as backup
    // Install: bun add jsqr
    // import jsQR from 'jsqr';
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // return code?.data || null;
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-lg mx-4">
        {/* Close button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-800" />
        </button>

        {/* Scanner container */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#334293] to-[#4a5ab3] p-6 text-white">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">สแกน QR Code</h2>
                <p className="text-sm text-blue-100">
                  วางกล้องให้ตรงกับ QR Code
                </p>
              </div>
            </div>
          </div>

          {/* Video preview */}
          <div className="relative bg-black aspect-square">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-4">{error}</p>
                  <Button onClick={startCamera} variant="common">
                    ลองอีกครั้ง
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500" />

                    {/* Scanning line animation */}
                    {scanning && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="scanning-line" />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Hidden canvas for QR detection */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Footer */}
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600">
              หรือปิดและพิมพ์โค้ด 6 ตัวอักษรแทน
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }

        .scanning-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #3b82f6,
            transparent
          );
          animation: scan 2s linear infinite;
          box-shadow: 0 0 10px #3b82f6;
        }
      `}</style>
    </div>
  );
}
