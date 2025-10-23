"use client";

import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { branchManagementService } from "@/services/branch-management.service";
import { BranchWithBranding } from "@/types/branch-management.types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function BranchManagementPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [branches, setBranches] = useState<BranchWithBranding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  // Check permission
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load branches
  const loadBranches = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let activeParam: "all" | "true" | "false" = "all";
      if (filter === "active") activeParam = "true";
      else if (filter === "inactive") activeParam = "false";

      const response = await branchManagementService.getAllBranches(
        activeParam
      );
      setBranches(response.branches);
    } catch (err) {
      console.error("Error loading branches:", err);
      setError(
        language === "th"
          ? "ไม่สามารถโหลดข้อมูลสาขาได้"
          : "Failed to load branches"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter, language]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleBranchClick = (branchId: number) => {
    router.push(`/settings/branches/${branchId}`);
  };

  const handleCreateBranch = () => {
    router.push("/settings/branches/create");
  };

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return null;
  }

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.settings, href: "/settings" },
        { label: language === "th" ? "จัดการสาขา" : "Branch Management" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "th" ? "จัดการสาขา" : "Branch Management"}
              </h1>
              <p className="text-gray-600">
                {language === "th"
                  ? "จัดการข้อมูลสาขา โลโก้ และแบนเนอร์"
                  : "Manage branch information, logos, and banners"}
              </p>
            </div>
            <button
              onClick={handleCreateBranch}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>
                {language === "th" ? "สร้างสาขาใหม่" : "Create Branch"}
              </span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 border-b border-gray-200">
            {[
              {
                value: "active" as const,
                label: language === "th" ? "ใช้งาน" : "Active",
              },
              {
                value: "inactive" as const,
                label: language === "th" ? "ไม่ใช้งาน" : "Inactive",
              },
              {
                value: "all" as const,
                label: language === "th" ? "ทั้งหมด" : "All",
              },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  filter === tab.value
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={loadBranches}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              {language === "th" ? "ลองอีกครั้ง" : "Try Again"}
            </button>
          </div>
        )}

        {/* Branch List */}
        {!isLoading && !error && (
          <>
            {branches.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {language === "th" ? "ไม่มีสาขา" : "No Branches"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {language === "th"
                    ? "คุณยังไม่มีสาขาในระบบ เริ่มต้นด้วยการสร้างสาขาแรก"
                    : "You don't have any branches yet. Start by creating your first branch"}
                </p>
                <button
                  onClick={handleCreateBranch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {language === "th" ? "สร้างสาขาแรก" : "Create First Branch"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(({ branch, logo, banner }) => (
                  <div
                    key={branch.id}
                    onClick={() => handleBranchClick(branch.id)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer group border-2 border-gray-100 hover:border-blue-300"
                  >
                    {/* Banner Section */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden">
                      {banner ? (
                        <Image
                          src={banner.banner_url}
                          alt={`${branch.name_en} banner`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-6xl opacity-20">
                            🎨
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Logo & Content */}
                    <div className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        {/* Logo */}
                        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                          {logo ? (
                            <Image
                              src={logo.logo_url}
                              alt={`${branch.name_en} logo`}
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 text-2xl">🏢</span>
                          )}
                        </div>

                        {/* Branch Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {language === "th"
                              ? branch.name_th
                              : branch.name_en}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {branch.code}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Branch Color */}
                            <div
                              className="w-6 h-6 rounded border-2 border-white shadow-sm"
                              style={{ backgroundColor: branch.color }}
                              title={branch.color}
                            />
                            {/* Active Status */}
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                branch.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {branch.active
                                ? language === "th"
                                  ? "ใช้งาน"
                                  : "Active"
                                : language === "th"
                                ? "ไม่ใช้งาน"
                                : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start space-x-2">
                          <svg
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="line-clamp-2">{branch.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span>{branch.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {(() => {
                              const timeRegex = /T(\d{2}:\d{2})/;
                              const openMatch = timeRegex.exec(
                                branch.open_time
                              );
                              const closeMatch = timeRegex.exec(
                                branch.close_time
                              );
                              const openTime = openMatch
                                ? openMatch[1]
                                : "08:00";
                              const closeTime = closeMatch
                                ? closeMatch[1]
                                : "20:00";
                              return `${openTime} - ${closeTime}`;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {language === "th" ? "ประเภท:" : "Type:"} {branch.type}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {branches.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    {language === "th"
                      ? `แสดง ${branches.length} สาขา`
                      : `Showing ${branches.length} ${
                          branches.length === 1 ? "branch" : "branches"
                        }`}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
