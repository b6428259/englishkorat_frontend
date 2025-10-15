"use client";

import Loading from "@/components/common/Loading";
import * as borrowingService from "@/services/api/borrowing";
import type { BorrowDashboardOverview } from "@/types/borrowing.types";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiBookOpen,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
} from "react-icons/hi2";

export function BorrowingDashboard() {
  const [overview, setOverview] = useState<BorrowDashboardOverview | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const response = await borrowingService.getDashboardOverview();
      setOverview(response.data);
    } catch (error) {
      console.error("Error loading borrowing overview:", error);
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

  if (!overview) {
    return null;
  }

  const stats = [
    {
      label: "รายการทั้งหมด",
      value: overview.inventory.total_items,
      icon: HiBookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "กำลังยืม",
      value: overview.transactions.currently_borrowed,
      icon: HiClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "เกินกำหนด",
      value: overview.transactions.overdue_count,
      icon: HiExclamationCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "รออนุมัติ",
      value: overview.transactions.pending_requests,
      icon: HiCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          ระบบยืม-คืนหนังสือ
        </h2>
        <Link
          href="/borrowing/management"
          className="text-sm text-[#334293] hover:underline font-medium"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-3">
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Info */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">คงเหลือพร้อมให้ยืม</p>
          <p className="text-xl font-semibold text-green-600">
            {overview.inventory.available_stock} /{" "}
            {overview.inventory.total_stock}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">เดือนนี้</p>
          <p className="text-xl font-semibold text-gray-900">
            ยืม {overview.this_month.borrowed} | คืน{" "}
            {overview.this_month.returned}
          </p>
        </div>
      </div>

      {/* Outstanding Fees */}
      {overview.fees.outstanding_fees > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-semibold">ค่าธรรมเนียมค้างชำระ:</span>{" "}
            {overview.fees.outstanding_fees.toFixed(2)} บาท
          </p>
        </div>
      )}
    </div>
  );
}
