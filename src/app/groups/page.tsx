"use client";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { groupService } from "@/services/api/groups";
import { CreateGroupRequest, Group } from "@/types/group.types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import SidebarLayout from "../../components/common/SidebarLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import { AddMemberModal } from "./components/AddMemberModal";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { GroupCard } from "./components/GroupCard";
import { GroupDetailsModal } from "./components/GroupDetailsModal";

export default function GroupsPage() {
  const { language } = useLanguage();

  // State management
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Filter state (now from search query)
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Helper: normalize filter values to API-accepted union types
  const toStatusParam = (value: string): Group["status"] | undefined => {
    if (value === "all" || !value) return undefined;
    const allowed: Group["status"][] = [
      "active",
      "inactive",
      "suspended",
      "full",
      "need-feeling",
      "empty",
    ];
    return (allowed as readonly string[]).includes(value)
      ? (value as Group["status"])
      : undefined;
  };

  const toPaymentParam = (
    value: string
  ): Group["payment_status"] | undefined => {
    if (value === "all" || !value) return undefined;
    const allowed: Group["payment_status"][] = [
      "pending",
      "deposit_paid",
      "fully_paid",
    ];
    return (allowed as readonly string[]).includes(value)
      ? (value as Group["payment_status"])
      : undefined;
  };

  // Fetch groups data with pagination and search
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        status?: Group["status"];
        payment_status?: Group["payment_status"];
        page?: number;
        per_page?: number;
        search?: string;
      } = {
        page: currentPage,
        per_page: perPage,
      };

      // Add search if provided - send raw query to backend (backend will parse it)
      if (searchQuery) {
        params.search = searchQuery;
      } else {
        // Use dropdown filters only when no search query
        const s = toStatusParam(statusFilter);
        const p = toPaymentParam(paymentFilter);
        if (s) params.status = s;
        if (p) params.payment_status = p;
      }

      const response = await groupService.getGroups(params);
      setGroups(response.groups);
      setTotalPages(response.total_pages || 1);
      setTotalGroups(response.total || 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch groups";
      setError(
        language === "th" ? "ไม่สามารถโหลดข้อมูลกลุ่มได้" : errorMessage
      );
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  }, [
    statusFilter,
    paymentFilter,
    searchQuery,
    currentPage,
    perPage,
    language,
  ]);

  // Load groups on mount and when filters change
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle group creation
  const handleCreateGroup = async (groupData: CreateGroupRequest) => {
    try {
      setFormLoading(true);
      setFormError(null);

      await groupService.createGroup(groupData);
      setIsCreateModalOpen(false);
      await fetchGroups(); // Refresh the list

      // Success notification would go here
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create group";
      setFormError(
        language === "th" ? "เกิดข้อผิดพลาดในการสร้างกลุ่ม" : errorMessage
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Handle group details view
  const handleViewDetails = (group: Group) => {
    setSelectedGroup(group);
    setIsDetailsModalOpen(true);
  };

  // Handle add member
  const handleAddMember = (group: Group) => {
    setSelectedGroup(group);
    setIsAddMemberModalOpen(true);
  };

  // Handle member addition
  const handleMemberAdded = async () => {
    setIsAddMemberModalOpen(false);
    await fetchGroups(); // Refresh to show updated member count
  };

  // Handle group status update
  const handleUpdateGroup = async (
    groupId: string,
    updates: Partial<CreateGroupRequest>
  ) => {
    try {
      await groupService.updateGroup(groupId, updates);
      await fetchGroups(); // Refresh the list
    } catch (err) {
      console.error("Error updating group:", err);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Calculate pagination range
  const getPaginationRange = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: language === "th" ? "จัดการกลุ่ม" : "Groups" },
      ]}
    >
      <div className="h-full flex flex-col bg-gray-50 min-h-screen">
        {/* Header Section - Clean & Minimal */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 sm:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {language === "th" ? "จัดการกลุ่มเรียน" : "Group Management"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {language === "th"
                  ? `ทั้งหมด ${totalGroups} กลุ่ม`
                  : `Total ${totalGroups} groups`}
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="monthViewClicked"
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              + {language === "th" ? "สร้างกลุ่มใหม่" : "Create New Group"}
            </Button>
          </div>

          {/* Advanced Search Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={
                    language === "th"
                      ? "ค้นหา: toeic, status:active, branch:korat, payment:pending..."
                      : "Search: toeic, status:active, branch:korat, payment:pending..."
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  variant="monthViewClicked"
                  className="px-6 py-2.5 rounded-lg text-sm font-medium"
                >
                  {language === "th" ? "ค้นหา" : "Search"}
                </Button>
                {searchQuery && (
                  <Button
                    onClick={handleClearSearch}
                    variant="cancel"
                    className="px-4 py-2.5 rounded-lg text-sm font-medium"
                  >
                    {language === "th" ? "ล้าง" : "Clear"}
                  </Button>
                )}
              </div>
            </div>

            {/* Search Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                💡 {language === "th" ? "เคล็ดลับการค้นหา:" : "Search tips:"}{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                  status:active
                </code>
                {", "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                  branch:korat
                </code>
                {", "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                  payment:pending
                </code>
                {", "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                  course:toeic
                </code>
              </p>
            </div>

            {/* Quick Filters - Only show when no search query */}
            {!searchQuery && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    {language === "th" ? "สถานะกลุ่ม" : "Group Status"}
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">
                      {language === "th" ? "ทั้งหมด" : "All"}
                    </option>
                    <option value="active">
                      {language === "th" ? "ใช้งาน" : "Active"}
                    </option>
                    <option value="full">
                      {language === "th" ? "เต็ม" : "Full"}
                    </option>
                    <option value="empty">
                      {language === "th" ? "ว่าง" : "Empty"}
                    </option>
                    <option value="need-feeling">
                      {language === "th" ? "ต้องการนักเรียน" : "Need Students"}
                    </option>
                    <option value="inactive">
                      {language === "th" ? "ไม่ใช้งาน" : "Inactive"}
                    </option>
                  </select>
                </div>

                {/* Payment Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    {language === "th" ? "สถานะการชำระเงิน" : "Payment Status"}
                  </label>
                  <select
                    value={paymentFilter}
                    onChange={(e) => {
                      setPaymentFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">
                      {language === "th" ? "ทั้งหมด" : "All"}
                    </option>
                    <option value="pending">
                      {language === "th" ? "รอชำระ" : "Pending"}
                    </option>
                    <option value="deposit_paid">
                      {language === "th" ? "ชำระมัดจำ" : "Deposit Paid"}
                    </option>
                    <option value="fully_paid">
                      {language === "th" ? "ชำระครบ" : "Fully Paid"}
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchGroups} />
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📚</div>
              <div className="text-gray-600 text-lg font-medium mb-2">
                {language === "th" ? "ไม่พบกลุ่มเรียน" : "No groups found"}
              </div>
              <p className="text-gray-500 text-sm mb-6">
                {searchQuery
                  ? language === "th"
                    ? "ลองค้นหาด้วยคำอื่น"
                    : "Try different search terms"
                  : language === "th"
                  ? "เริ่มต้นสร้างกลุ่มแรกของคุณ"
                  : "Start by creating your first group"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="monthViewClicked"
                  className="px-6 py-3 rounded-lg"
                >
                  {language === "th" ? "สร้างกลุ่มแรก" : "Create First Group"}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Groups Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onViewDetails={handleViewDetails}
                    onAddMember={handleAddMember}
                    onUpdateGroup={handleUpdateGroup}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Page Info */}
                    <div className="text-sm text-gray-600">
                      {language === "th"
                        ? `แสดง ${(currentPage - 1) * perPage + 1}-${Math.min(
                            currentPage * perPage,
                            totalGroups
                          )} จาก ${totalGroups} กลุ่ม`
                        : `Showing ${
                            (currentPage - 1) * perPage + 1
                          }-${Math.min(
                            currentPage * perPage,
                            totalGroups
                          )} of ${totalGroups} groups`}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      {/* First Page */}
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Page Numbers */}
                      <div className="hidden sm:flex items-center gap-1">
                        {getPaginationRange().map((page, idx) =>
                          page === "..." ? (
                            <span
                              key={`dots-${idx}`}
                              className="px-3 py-1 text-gray-400"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => goToPage(page as number)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                      </div>

                      {/* Mobile: Current Page Display */}
                      <div className="sm:hidden px-3 py-1 text-sm font-medium text-gray-700">
                        {currentPage} / {totalPages}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Per Page Selector */}
                    <div className="flex items-center gap-2 text-sm">
                      <label className="text-gray-600 whitespace-nowrap">
                        {language === "th" ? "แสดง:" : "Show:"}
                      </label>
                      <select
                        value={perPage}
                        onChange={(e) => {
                          setPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateGroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onConfirm={handleCreateGroup}
          isLoading={formLoading}
          error={formError}
        />
      )}

      {isDetailsModalOpen && selectedGroup && (
        <GroupDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          group={selectedGroup}
          onGroupUpdated={() => fetchGroups()}
        />
      )}

      {isAddMemberModalOpen && selectedGroup && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          group={selectedGroup}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </SidebarLayout>
  );
}
