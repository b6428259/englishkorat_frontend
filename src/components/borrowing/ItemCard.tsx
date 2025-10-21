"use client";

import { getPresignedUrl } from "@/lib/s3";
import type { BorrowableItem } from "@/types/borrowing.types";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HiBookOpen,
  HiCube,
  HiEllipsisHorizontal,
  HiWrench,
} from "react-icons/hi2";
import { StatusBadge } from "./StatusBadge";

interface ItemCardProps {
  item: BorrowableItem;
  onClick?: () => void;
  showActions?: boolean;
  onBorrow?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function ItemCard({
  item,
  onClick,
  showActions = false,
  onBorrow,
  onEdit,
  className = "",
}: ItemCardProps) {
  const getItemIcon = () => {
    switch (item.item_type) {
      case "book":
        return <HiBookOpen className="w-5 h-5" />;
      case "equipment":
        return <HiWrench className="w-5 h-5" />;
      case "material":
        return <HiCube className="w-5 h-5" />;
      default:
        return <HiEllipsisHorizontal className="w-5 h-5" />;
    }
  };

  const getItemTypeLabel = () => {
    const labels: Record<string, string> = {
      book: "หนังสือ",
      equipment: "อุปกรณ์",
      material: "สื่อการสอน",
      other: "อื่นๆ",
    };
    return labels[item.item_type] || item.item_type;
  };

  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const src = item.cover_image_url;
    // If cover image appears to be an S3 key (relative path) or belongs to our S3 bucket, try to presign it
    const s3Bucket = process.env.NEXT_PUBLIC_S3_BUCKET;

    const handle = async () => {
      if (!src) return setResolvedSrc(null);

      try {
        // If it's already a fully qualified URL, use as-is
        if (src.startsWith("http")) {
          setResolvedSrc(src);
          return;
        }

        // Otherwise treat as S3 key and request presigned URL from API
        const presigned = await getPresignedUrl(src.replace(/^\//, ""));
        if (mounted) setResolvedSrc(presigned ?? src);
      } catch (err) {
        console.error("resolve image", err);
        if (mounted) setResolvedSrc(src);
      }
    };

    handle();
    return () => {
      mounted = false;
    };
  }, [item.cover_image_url]);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {item.cover_image_url ? (
          <Image
            src={resolvedSrc ?? item.cover_image_url}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // If using presigned URLs (temporal), skip next/image optimization to avoid edge caching issues
            unoptimized={true}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {getItemIcon()}
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Type */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
            {getItemIcon()}
            {getItemTypeLabel()}
          </span>
          {item.category && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              {item.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {item.title}
        </h3>

        {/* Author (if book) */}
        {item.author && (
          <p className="text-sm text-gray-600 mb-2">โดย {item.author}</p>
        )}

        {/* Stock Info */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-600">คงเหลือ</span>
          <span
            className={`font-semibold ${
              item.available_stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.available_stock} / {item.total_stock}
          </span>
        </div>

        {/* Borrow Info */}
        <div className="text-xs text-gray-600 space-y-1 mb-3">
          <div className="flex justify-between">
            <span>ยืมได้สูงสุด:</span>
            <span className="font-medium">{item.max_borrow_days} วัน</span>
          </div>
          <div className="flex justify-between">
            <span>ต่ออายุได้:</span>
            <span className="font-medium">{item.renewable_count} ครั้ง</span>
          </div>
          {item.late_fee_per_day !== undefined && item.late_fee_per_day > 0 && (
            <div className="flex justify-between">
              <span>ค่าปรับ/วัน:</span>
              <span className="font-medium text-red-600">
                {item.late_fee_per_day} บาท
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            {onBorrow && item.available_stock > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBorrow();
                }}
                className="flex-1 px-3 py-2 bg-[#334293] text-white rounded-lg text-sm font-medium hover:bg-[#2a3778] transition-colors"
              >
                ขอยืม
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                แก้ไข
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
