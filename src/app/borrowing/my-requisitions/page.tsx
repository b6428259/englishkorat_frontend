"use client";

import Button from "@/components/common/Button";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RoleGuard } from "@/components/common/RoleGuard";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/useToast";
import { translations } from "@/locales/translations";
import * as borrowingService from "@/services/api/borrowing";
import type {
  BorrowRequest,
  RequisitionTransaction,
  TransactionFilters,
} from "@/types/borrowing.types";
import { Spinner, Tab, Tabs } from "@heroui/react";
import { useEffect, useState } from "react";

type TabType = "my-requests" | "my-requisitions";

export default function MyRequisitionsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("my-requests");
  const [loading, setLoading] = useState(false);

  // Requisition Requests state (approved but not picked up yet)
  const [requests, setRequests] = useState<BorrowRequest[]>([]);

  // Requisitions state (picked up - completed)
  const [requisitions, setRequisitions] = useState<RequisitionTransaction[]>(
    []
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "my-requests") {
        await loadMyRequests();
      } else if (activeTab === "my-requisitions") {
        await loadMyRequisitions();
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRequests = async () => {
    // Load requisition type requests
    const response = await borrowingService.getMyRequests({
      request_type: "requisition",
    });
    setRequests(response.data);
  };

  const loadMyRequisitions = async () => {
    const filters: TransactionFilters = {};
    const response = await borrowingService.getMyRequisitions(filters);
    setRequisitions(response.data);
  };

  const handleCancelRequest = async (requestId: number) => {
    const confirmed = await toast.confirm(t.confirmCancel);
    if (!confirmed) return;

    try {
      setLoading(true);
      await borrowingService.cancelBorrowRequest(requestId);
      toast.success(t.requestCancelled);
      await loadMyRequests();
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast.error(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={["teacher", "admin", "owner"]}>
        <SidebarLayout
          breadcrumbItems={[
            { label: t.dashboard, href: "/dashboard" },
            { label: "การเบิกของถาวร" },
          ]}
        >
          <div className="space-y-6 text-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] rounded-xl shadow-lg p-6 text-white">
              <h1 className="text-3xl font-bold">การเบิกของถาวร</h1>
              <p className="mt-2 text-[#EFE957] font-medium">
                ระบบเบิกอุปกรณ์และเครื่องเขียน (ไม่ต้องคืน)
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as TabType)}
                  variant="underlined"
                  classNames={{
                    tabList: "px-6 bg-gray-50",
                    cursor: "bg-[#6B46C1]",
                    tab: "px-6 h-14 data-[selected=true]:text-[#6B46C1] font-semibold",
                  }}
                >
                  <Tab
                    key="my-requests"
                    title={
                      <div className="flex items-center gap-2">
                        <span>คำขอเบิกของ</span>
                        {requests.length > 0 && (
                          <span className="bg-[#EFE957] text-[#6B46C1] text-xs font-bold px-2 py-1 rounded-full">
                            {requests.length}
                          </span>
                        )}
                      </div>
                    }
                  />
                  <Tab
                    key="my-requisitions"
                    title={
                      <div className="flex items-center gap-2">
                        <span>ประวัติการเบิก</span>
                        {requisitions.length > 0 && (
                          <span className="bg-[#EFE957] text-[#6B46C1] text-xs font-bold px-2 py-1 rounded-full">
                            {requisitions.length}
                          </span>
                        )}
                      </div>
                    }
                  />
                </Tabs>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="secondary" />
                  </div>
                ) : (
                  <>
                    {/* My Requests Tab */}
                    {activeTab === "my-requests" && (
                      <div className="space-y-4">
                        {requests.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-gray-500 text-lg">
                              ไม่มีคำขอเบิกของ
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                              คำขอที่ได้รับอนุมัติแล้วจะปรากฏที่นี่
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {requests.map((request) => (
                              <div
                                key={request.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 overflow-hidden"
                              >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-purple-50 to-white p-4 border-b-2 border-purple-100">
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                                      {request.item?.title}
                                    </h3>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                        request.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : request.status === "approved"
                                          ? "bg-green-100 text-green-800"
                                          : request.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {t[request.status as keyof typeof t]}
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                  <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-purple-700 font-bold">
                                        จำนวน:
                                      </span>
                                      <span className="text-purple-900 font-semibold text-lg">
                                        {request.quantity}{" "}
                                        {request.item?.unit || "ชิ้น"}
                                      </span>
                                    </div>
                                  </div>

                                  {request.purpose && (
                                    <div className="text-sm">
                                      <span className="text-gray-500 font-medium">
                                        วัตถุประสงค์:
                                      </span>
                                      <p className="text-gray-900 mt-1">
                                        {request.purpose}
                                      </p>
                                    </div>
                                  )}

                                  <div className="text-sm">
                                    <span className="text-gray-500">
                                      วันที่ขอ:
                                    </span>
                                    <p className="font-semibold text-gray-900">
                                      {new Date(
                                        request.created_at
                                      ).toLocaleDateString("th-TH", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>

                                  {request.review_notes && (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                      <p className="text-xs text-blue-900 font-medium">
                                        {request.review_notes}
                                      </p>
                                    </div>
                                  )}

                                  {/* Action Button */}
                                  {request.status === "pending" && (
                                    <Button
                                      variant="cancel"
                                      onClick={() =>
                                        handleCancelRequest(request.id)
                                      }
                                      className="w-full mt-4"
                                    >
                                      ยกเลิกคำขอ
                                    </Button>
                                  )}

                                  {request.status === "approved" && (
                                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mt-4">
                                      <p className="text-green-800 text-sm font-semibold text-center">
                                        ✅ รออนุมัติจากเจ้าหน้าที่เพื่อรับของ
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* My Requisitions Tab */}
                    {activeTab === "my-requisitions" && (
                      <div className="space-y-4">
                        {requisitions.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-500 text-lg">
                              ยังไม่มีประวัติการเบิกของ
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {requisitions.map((requisition) => (
                              <div
                                key={requisition.id}
                                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
                                  requisition.status === "picked_up"
                                    ? "border-green-200"
                                    : requisition.status === "cancelled"
                                    ? "border-red-200"
                                    : "border-gray-100"
                                }`}
                              >
                                {/* Header */}
                                <div
                                  className={`p-4 border-b-2 ${
                                    requisition.status === "picked_up"
                                      ? "bg-gradient-to-r from-green-50 to-white border-green-100"
                                      : requisition.status === "cancelled"
                                      ? "bg-gradient-to-r from-red-50 to-white border-red-100"
                                      : "bg-gradient-to-r from-gray-50 to-white border-gray-100"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                                      {requisition.item?.title}
                                    </h3>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                        requisition.status === "picked_up"
                                          ? "bg-green-100 text-green-800"
                                          : requisition.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {requisition.status === "picked_up"
                                        ? "รับของแล้ว"
                                        : requisition.status === "cancelled"
                                        ? "ยกเลิก"
                                        : requisition.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                  <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-purple-700 font-bold">
                                        จำนวนที่เบิก:
                                      </span>
                                      <span className="text-purple-900 font-semibold text-lg">
                                        {requisition.quantity}{" "}
                                        {requisition.item?.unit || "ชิ้น"}
                                      </span>
                                    </div>
                                  </div>

                                  {requisition.purpose && (
                                    <div className="text-sm">
                                      <span className="text-gray-500 font-medium">
                                        วัตถุประสงค์:
                                      </span>
                                      <p className="text-gray-900 mt-1">
                                        {requisition.purpose}
                                      </p>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-500">
                                        วันที่อนุมัติ:
                                      </span>
                                      <p className="font-semibold text-gray-900">
                                        {new Date(
                                          requisition.approved_date
                                        ).toLocaleDateString("th-TH")}
                                      </p>
                                    </div>
                                    {requisition.pickup_date && (
                                      <div>
                                        <span className="text-gray-500">
                                          วันที่รับของ:
                                        </span>
                                        <p className="font-semibold text-green-700">
                                          {new Date(
                                            requisition.pickup_date
                                          ).toLocaleDateString("th-TH")}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {requisition.confirmed_by_user && (
                                    <div className="text-sm bg-gray-50 rounded-lg p-3">
                                      <span className="text-gray-500">
                                        ผู้รับของ:
                                      </span>
                                      <p className="font-semibold text-gray-900">
                                        {requisition.confirmed_by_user.username}
                                      </p>
                                    </div>
                                  )}

                                  {requisition.notes && (
                                    <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                                      <p className="text-xs text-blue-900">
                                        <span className="font-semibold">
                                          หมายเหตุ:
                                        </span>{" "}
                                        {requisition.notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </SidebarLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
