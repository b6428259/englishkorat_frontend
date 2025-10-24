"use client";

import Loading from "@/components/common/Loading";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
      label: t.totalItems,
      value: overview.inventory?.total_items ?? 0,
      icon: HiBookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: t.currentlyBorrowed,
      value: overview.borrowing?.currently_borrowed ?? 0,
      icon: HiClock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: t.overdueItems,
      value: overview.borrowing?.overdue_count ?? 0,
      icon: HiExclamationCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: t.pendingApprovals,
      value: overview.borrowing?.pending_requests ?? 0,
      icon: HiCheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t.stockSystem}</h2>
        <Link
          href="/borrowing/management"
          className="text-sm text-[#334293] hover:underline font-medium"
        >
          {t.viewManagement} →
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

      {/* Item Mode Breakdown */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <HiBookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">{t.myTemporaryWithdrawals}</p>
            <p className="text-2xl font-bold text-blue-600">
              {overview.inventory?.available_stock ?? 0} /{" "}
              {overview.inventory?.total_stock ?? 0}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
          <HiCheckCircle className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-sm text-gray-600">{t.myPermanentRequisitions}</p>
            <p className="text-2xl font-bold text-purple-600">
              {t.borrowedThisMonth}{" "}
              {overview.borrowing?.this_month?.borrowed ?? 0} |{" "}
              {t.returnedThisMonth}{" "}
              {overview.borrowing?.this_month?.returned ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Info */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            {t.permanentRequisition} ({t.thisMonth})
          </p>
          <p className="text-xl font-semibold text-purple-600">
            {t.approved} {overview.requisition?.this_month?.approved ?? 0} |{" "}
            {overview.requisition?.this_month?.total_quantity ?? 0} {t.item}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">
            {t.thisMonth} ({t.temporaryWithdrawal})
          </p>
          <p className="text-xl font-semibold text-gray-900">
            {t.borrowedThisMonth}{" "}
            {overview.borrowing?.this_month?.borrowed ?? 0} |{" "}
            {t.returnedThisMonth}{" "}
            {overview.borrowing?.this_month?.returned ?? 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{t.totalItems}</p>
          <p className="text-2xl font-semibold text-green-600">
            {overview.inventory?.available_stock ?? 0} /{" "}
            {overview.inventory?.total_stock ?? 0}
          </p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {(overview.requisition?.low_stock_items ?? 0) > 0 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiExclamationCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-orange-700">
                <span className="font-semibold">สินค้าใกล้หมดคลัง:</span>{" "}
                {overview.requisition?.low_stock_items ?? 0} รายการ
              </p>
            </div>
            <Link
              href="#low-stock"
              className="text-sm text-orange-700 hover:underline font-medium"
            >
              ดูรายละเอียด →
            </Link>
          </div>
        </div>
      )}

      {/* Outstanding Fees */}
      {(overview.fees?.outstanding_fees ?? 0) > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-semibold">{t.outstandingFees}:</span>{" "}
            {(overview.fees?.outstanding_fees ?? 0).toFixed(2)} บาท
          </p>
        </div>
      )}
    </div>
  );
}
