"use client";

import Loading from "@/components/common/Loading";
import { useLanguage } from "@/contexts/LanguageContext";
import * as borrowingService from "@/services/api/borrowing";
import type { StockAlert } from "@/types/borrowing.types";
import { useCallback, useEffect, useState } from "react";
import {
  HiArrowPath,
  HiExclamationTriangle,
  HiShoppingCart,
} from "react-icons/hi2";

interface LowStockAlertsWidgetProps {
  branchId?: number;
  showReorderButton?: boolean;
  maxItems?: number;
}

export function LowStockAlertsWidget({
  branchId,
  showReorderButton = true,
  maxItems = 10,
}: LowStockAlertsWidgetProps) {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const response = await borrowingService.getStockAlerts(branchId);
      // Response structure: { success, data: { all_alerts, critical, warning, info }, summary, ... }
      const alertsData = response?.data?.all_alerts || [];
      setAlerts(alertsData.slice(0, maxItems));
    } catch (error) {
      console.error("Error loading stock alerts:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [branchId, maxItems]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const getStockLevel = (available: number, reorder: number) => {
    const percentage = (available / reorder) * 100;
    if (percentage === 0) return "empty";
    if (percentage < 50) return "critical";
    if (percentage < 100) return "low";
    return "normal";
  };

  const getStockColor = (level: string) => {
    switch (level) {
      case "empty":
        return "bg-red-100 text-red-800 border-red-300";
      case "critical":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStockLabel = (level: string) => {
    switch (level) {
      case "empty":
        return t.outOfStock;
      case "critical":
        return t.criticalLevel;
      case "low":
        return t.lowLevel;
      default:
        return t.normalLevel;
    }
  };

  const getStockBarColor = (level: string) => {
    switch (level) {
      case "empty":
        return "bg-red-500";
      case "critical":
        return "bg-orange-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Loading />
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t.lowStockAlerts}
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <HiArrowPath
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="text-center py-8">
          <HiShoppingCart className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">{t.allStockNormal}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" id="low-stock">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiExclamationTriangle className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t.lowStockAlerts}
          </h3>
          <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
            {alerts.length}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <HiArrowPath
            className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="space-y-3">
        {alerts.map((item) => {
          const stockLevel = getStockLevel(
            item.available_stock,
            item.reorder_level
          );
          const stockColor = getStockColor(stockLevel);
          const stockLabel = getStockLabel(stockLevel);

          return (
            <div
              key={item.item_id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded border ${stockColor}`}
                    >
                      {stockLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">{t.remaining}</p>
                      <p className="font-semibold text-gray-900">
                        {item.available_stock} {item.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t.reorderLevel}</p>
                      <p className="font-semibold text-gray-900">
                        {item.reorder_level} {item.unit}
                      </p>
                    </div>
                  </div>

                  {item.estimated_cost_per_unit && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">
                        {t.estimatedPrice}:{" "}
                        <span className="font-semibold text-gray-900">
                          {item.estimated_cost_per_unit.toFixed(2)} บาท/
                          {item.unit}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Stock Level Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStockBarColor(
                          stockLevel
                        )}`}
                        style={{
                          width: `${Math.min(
                            (item.available_stock / item.reorder_level) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (item.available_stock / item.reorder_level) * 100
                      )}
                      {t.percentOfReorderLevel}
                    </p>
                  </div>
                </div>

                {showReorderButton && (
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap">
                    <HiShoppingCart className="w-4 h-4" />
                    {t.reorder}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {alerts.length >= maxItems && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {t.showingFirstItems.replace("{count}", maxItems.toString())}
          </p>
        </div>
      )}
    </div>
  );
}
