"use client";

import type { BorrowRequest } from "@/types/borrowing.types";
import { formatDateReadable } from "@/utils/dateFormatter";
import { StatusBadge } from "./StatusBadge";

interface RequestCardProps {
  request: BorrowRequest;
  onClick?: () => void;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function RequestCard({
  request,
  onClick,
  showActions = false,
  onApprove,
  onReject,
  onCancel,
  className = "",
}: RequestCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Extract just the date part if it's a full datetime
    const datePart = dateString.split("T")[0];
    return formatDateReadable(datePart, "th");
  };

  const getUserName = () => {
    if (request.user?.student) {
      return `${request.user.student.first_name} ${request.user.student.last_name}`;
    }
    return request.user?.username || "ไม่ระบุ";
  };

  const CardWrapper = onClick ? "button" : "div";

  return (
    <CardWrapper
      className={`w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {request.item?.title || `รายการ #${request.item_id}`}
          </h3>
          <p className="text-sm text-gray-600">ผู้ขอยืม: {getUserName()}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">จำนวน:</span>
          <span className="font-medium">{request.quantity} รายการ</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">วันที่รับ:</span>
          <span className="font-medium">
            {formatDate(request.scheduled_pickup_date)}
          </span>
        </div>
        {request.scheduled_return_date && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">วันที่คืน:</span>
            <span className="font-medium">
              {formatDate(request.scheduled_return_date)}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {request.request_notes && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <p className="text-gray-600 font-medium mb-1">หมายเหตุ:</p>
          <p className="text-gray-700">{request.request_notes}</p>
        </div>
      )}

      {/* Review Info */}
      {request.reviewed_at && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
          <p className="text-gray-600 font-medium mb-1">
            {request.status === "approved" ? "อนุมัติโดย:" : "พิจารณาโดย:"}{" "}
            {request.reviewed_by_user?.username}
          </p>
          {request.review_notes && (
            <p className="text-gray-700">{request.review_notes}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(request.reviewed_at)}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          {request.status === "pending" && onApprove && onReject && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                อนุมัติ
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject();
                }}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                ปฏิเสธ
              </button>
            </>
          )}
          {request.status === "pending" && onCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="flex-1 px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              ยกเลิก
            </button>
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        ส่งคำขอเมื่อ: {formatDate(request.created_at)}
      </div>
    </CardWrapper>
  );
}
