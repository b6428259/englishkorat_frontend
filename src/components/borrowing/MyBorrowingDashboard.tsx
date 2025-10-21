"use client";

import Loading from "@/components/common/Loading";
import * as borrowingService from "@/services/api/borrowing";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiArrowPath,
  HiBookOpen,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
} from "react-icons/hi2";

interface MyBorrowingStats {
  active_borrows: number;
  pending_requests: number;
  overdue_count: number;
  pending_requisitions: number;
  total_borrowed_this_month: number;
  total_requisitioned_this_month: number;
}

/**
 * My Borrowing Dashboard - สำหรับครู
 * แสดงเฉพาะข้อมูลการยืม-คืน และการเบิกของตัวเอง
 */
export function MyBorrowingDashboard() {
  const [stats, setStats] = useState<MyBorrowingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyStats();
  }, []);

  const loadMyStats = async () => {
    try {
      // Load personal borrowing and requisition data
      const [borrowsRes, requestsRes, requisitionsRes] = await Promise.all([
        borrowingService.getMyBorrows(),
        borrowingService.getMyRequests(),
        borrowingService.getMyRequisitions({}),
      ]);

      const borrows = borrowsRes.data || [];
      const requests = requestsRes.data || [];
      const requisitions = requisitionsRes.data || [];

      // Calculate stats
      const activeBorrows = borrows.filter(
        (b) => b.status === "borrowed" || b.status === "overdue"
      ).length;

      const overdueCount = borrows.filter((b) => b.status === "overdue").length;

      const pendingRequests = requests.filter(
        (r) => r.status === "pending" && r.request_type === "borrowing"
      ).length;

      const pendingRequisitions = requests.filter(
        (r) =>
          (r.status === "pending" || r.status === "approved") &&
          r.request_type === "requisition"
      ).length;

      // This month counts
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const borrowedThisMonth = borrows.filter((b) => {
        const borrowDate = new Date(b.borrowed_date);
        return borrowDate >= thisMonthStart;
      }).length;

      const requisitionedThisMonth = requisitions.filter((r) => {
        const approvedDate = new Date(r.approved_date || "");
        return approvedDate >= thisMonthStart;
      }).length;

      setStats({
        active_borrows: activeBorrows,
        pending_requests: pendingRequests,
        overdue_count: overdueCount,
        pending_requisitions: pendingRequisitions,
        total_borrowed_this_month: borrowedThisMonth,
        total_requisitioned_this_month: requisitionedThisMonth,
      });
    } catch (error) {
      console.error("Error loading my borrowing stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Loading />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const quickStats = [
    {
      label: "กำลังยืมอยู่",
      value: stats.active_borrows,
      icon: HiBookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/borrowing/my-borrows?tab=my-borrows",
    },
    {
      label: "คำขอรอดำเนินการ",
      value: stats.pending_requests + stats.pending_requisitions,
      icon: HiClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/borrowing/my-borrows?tab=my-requests",
    },
    {
      label: "เลยกำหนดคืน",
      value: stats.overdue_count,
      icon: HiExclamationCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      link: "/borrowing/my-borrows?tab=my-borrows",
    },
    {
      label: "ยืมเดือนนี้",
      value: stats.total_borrowed_this_month,
      icon: HiArrowPath,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/borrowing/my-borrows?tab=my-borrows",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            การยืม-คืน & เบิกของของฉัน
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            ข้อมูลการยืมและการเบิกของส่วนตัว
          </p>
        </div>
        <Link
          href="/borrowing/my-borrows"
          className="text-sm text-[#334293] hover:underline font-medium"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.link}
              className="flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Borrowing vs Requisition This Month */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <Link
          href="/borrowing/my-borrows"
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-shadow border-2 border-blue-200"
        >
          <HiBookOpen className="w-10 h-10 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              ยืม-คืน (เดือนนี้)
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {stats.total_borrowed_this_month}
            </p>
            <p className="text-xs text-blue-700">รายการยืมที่ต้องคืน</p>
          </div>
        </Link>

        <Link
          href="/borrowing/my-requisitions"
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-shadow border-2 border-purple-200"
        >
          <HiCheckCircle className="w-10 h-10 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-900">
              เบิกของ (เดือนนี้)
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.total_requisitioned_this_month}
            </p>
            <p className="text-xs text-purple-700">รายการเบิกถาวร</p>
          </div>
        </Link>
      </div>

      {/* Overdue Warning */}
      {stats.overdue_count > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-3">
            <HiExclamationCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                ⚠️ คุณมี {stats.overdue_count} รายการที่เลยกำหนดคืน
              </p>
              <p className="text-xs text-red-700 mt-1">
                กรุณาติดต่อเจ้าหน้าที่เพื่อส่งคืนหรือต่ออายุ
              </p>
            </div>
            <Link
              href="/borrowing/my-borrows?tab=my-borrows"
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              ดูรายการ
            </Link>
          </div>
        </div>
      )}

      {/* Pending Actions */}
      {(stats.pending_requests > 0 || stats.pending_requisitions > 0) && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <div className="flex items-center gap-3">
            <HiClock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                📋 คุณมี {stats.pending_requests + stats.pending_requisitions}{" "}
                คำขอรอดำเนินการ
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                {stats.pending_requests > 0 &&
                  `คำขอยืม: ${stats.pending_requests} รายการ`}
                {stats.pending_requests > 0 &&
                  stats.pending_requisitions > 0 &&
                  " | "}
                {stats.pending_requisitions > 0 &&
                  `คำขอเบิก: ${stats.pending_requisitions} รายการ`}
              </p>
            </div>
            <Link
              href="/borrowing/my-borrows?tab=my-requests"
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              ดูคำขอ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
