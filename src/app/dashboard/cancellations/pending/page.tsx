"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  bulkApproveCancellations,
  getPendingCancellations,
} from "@/services/api/schedules";
import { PendingCancellationItem } from "@/types/session-cancellation.types";
import {
  formatDateReadable,
  formatDateTime,
  formatRelativeTime,
  formatTime,
} from "@/utils/dateFormatter";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Search,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PendingCancellationsPage() {
  const { language, t } = useLanguage();
  const { hasRole } = useAuth();
  const router = useRouter();

  const [cancellations, setCancellations] = useState<PendingCancellationItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<{
    request: PendingCancellationItem;
  } | null>(null);

  const itemsPerPage = 20;

  // Check authorization
  useEffect(() => {
    if (!hasRole(["admin", "owner"])) {
      toast.error(t.unauthorized, { position: "top-center" });
      router.push("/dashboard");
    }
  }, [hasRole, router, t]);

  const fetchCancellations = async (page: number = 1) => {
    try {
      setIsLoading(true);

      // ⚠️ NEW API: /schedules/sessions/pending-cancellations (no pagination)
      const response = await getPendingCancellations();

      setCancellations(response.pending_cancellations || []);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch cancellations:", error);
      toast.error(t.approvalFailed, { position: "top-center" });
      setCancellations([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(["admin", "owner"])) {
      fetchCancellations(1); // Always fetch page 1, pagination is client-side
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch once on mount

  // Calculate filtered and paginated data BEFORE using it in handlers
  const filteredCancellations = (cancellations || []).filter((cancellation) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const teacherName = cancellation.assigned_teacher?.username || "";
    return (
      teacherName.toLowerCase().includes(search) ||
      cancellation.schedule_name?.toLowerCase().includes(search) ||
      cancellation.cancelling_reason?.toLowerCase().includes(search)
    );
  });

  // Client-side pagination (since API returns all items)
  const totalPages = Math.ceil(
    (filteredCancellations?.length || 0) / itemsPerPage
  );
  const paginatedCancellations = (filteredCancellations || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedIds.length === (paginatedCancellations?.length || 0)) {
      setSelectedIds([]);
    } else {
      setSelectedIds((paginatedCancellations || []).map((c) => c.id));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApproveSingle = async (sessionId: number) => {
    try {
      setIsApproving(true);
      await bulkApproveCancellations({
        session_ids: [sessionId],
      });

      toast.success(t.approvalSuccess, {
        position: "top-center",
        icon: "✅",
      });

      // Refresh data
      await fetchCancellations(currentPage);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error(t.approvalFailed, { position: "top-center" });
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsApproving(true);
      const response = await bulkApproveCancellations({
        session_ids: selectedIds,
      });

      // Show detailed toast
      const message = `${t.approvedCount}: ${response.summary.successful}${
        response.summary.failed > 0
          ? `, ${t.failedCount}: ${response.summary.failed}`
          : ""
      }`;

      const totalAffectedStudents = response.successful_approvals.reduce(
        (sum, approval) => sum + approval.affected_students,
        0
      );

      toast.success(
        <div>
          <div className="font-semibold">{t.bulkApprovalSuccess}</div>
          <div className="text-sm">{message}</div>
          {totalAffectedStudents > 0 && (
            <div className="text-sm mt-1">
              {t.affectedStudents}: {totalAffectedStudents}
            </div>
          )}
        </div>,
        {
          position: "top-center",
          duration: 5000,
        }
      );

      // Refresh data
      await fetchCancellations(currentPage);
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to bulk approve:", error);
      toast.error(t.approvalFailed, { position: "top-center" });
    } finally {
      setIsApproving(false);
    }
  };

  const isUrgent = (requestedAt: string) => {
    const requested = new Date(requestedAt);
    const now = new Date();
    const hoursSinceRequest =
      (now.getTime() - requested.getTime()) / (1000 * 60 * 60);
    return hoursSinceRequest > 23; // Urgent if requested more than 23 hours ago
  };

  if (!hasRole(["admin", "owner"])) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 shadow-lg"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                  <span className="break-words">
                    {t.approveCancellationRequestsTitle}
                  </span>
                </h1>
                <p className="text-indigo-100 text-sm sm:text-base lg:text-lg">
                  {t.approveCancellationRequestsSubtitle}
                </p>
              </div>

              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg w-full sm:w-auto"
                >
                  <div className="text-sm font-medium text-center sm:text-left">
                    {t.selectedItemsCount}: {selectedIds.length}{" "}
                    {language === "th" ? "รายการ" : "items"}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchByTeacherOrStudent}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                <Button
                  onClick={handleSelectAll}
                  variant="cancel"
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm flex-1 sm:flex-none"
                  disabled={filteredCancellations.length === 0}
                >
                  {selectedIds.length === filteredCancellations.length
                    ? t.deselectAll
                    : t.selectAll}
                </Button>

                <Button
                  onClick={handleBulkApprove}
                  disabled={selectedIds.length === 0 || isApproving}
                  variant="monthViewClicked"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex-1 sm:flex-none"
                >
                  {isApproving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">{t.approveSelectedItems}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t.approveSelectedItems} ({selectedIds.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-md p-12 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">{t.loading}</p>
              </div>
            </div>
          ) : filteredCancellations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-md p-12"
            >
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t.noPendingCancellationsTitle}
                </h3>
                <p className="text-gray-600">{t.noPendingCancellationsDesc}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length ===
                              filteredCancellations.length &&
                            filteredCancellations.length > 0
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        {t.session}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        {t.requestedBy}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        {t.requestedAt}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        {language === "th" ? "โควต้า/สถานะ" : "Quota/Status"}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        {t.reason}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(paginatedCancellations || []).map(
                      (cancellation, index) => (
                        <motion.tr
                          key={cancellation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:bg-indigo-50/50 transition-colors ${
                            selectedIds.includes(cancellation.id)
                              ? "bg-indigo-50"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(cancellation.id)}
                              onChange={() => handleSelectItem(cancellation.id)}
                              className="h-4 w-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="font-medium text-gray-900">
                                #{cancellation.id}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateReadable(
                                  cancellation.session_date,
                                  language
                                )}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(cancellation.start_time)} -{" "}
                                {formatTime(cancellation.end_time)}
                              </div>
                              {isUrgent(
                                cancellation.cancellation_requested_at
                              ) && (
                                <Badge className="bg-red-100 text-red-800 border-red-300 w-fit">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {t.urgentRequest}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {cancellation.assigned_teacher?.username ||
                                  "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="text-sm text-gray-900 font-medium">
                                {formatRelativeTime(
                                  cancellation.cancellation_requested_at,
                                  language
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDateTime(
                                  cancellation.cancellation_requested_at,
                                  language
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {cancellation.schedule_makeup_remaining}/
                                  {cancellation.schedule_makeup_quota}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {language === "th" ? "โควต้า" : "quota"}
                                </span>
                              </div>
                              {cancellation.can_create_makeup_after_approval && (
                                <div className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {language === "th"
                                    ? "สามารถสร้าง makeup"
                                    : "Can create makeup"}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                {cancellation.hours_since_request}h{" "}
                                {language === "th" ? "ที่แล้ว" : "ago"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              onClick={() => {
                                setSelectedReason({ request: cancellation });
                                setShowReasonModal(true);
                              }}
                              variant="cancel"
                              className="px-3 py-1.5 text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {t.viewReason}
                            </Button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <Button
                                onClick={() =>
                                  handleApproveSingle(cancellation.id)
                                }
                                disabled={isApproving}
                                variant="monthViewClicked"
                                className="px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t.approve}
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {(paginatedCancellations || []).map((cancellation, index) => (
                  <motion.div
                    key={cancellation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 ${
                      selectedIds.includes(cancellation.id)
                        ? "bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(cancellation.id)}
                          onChange={() => handleSelectItem(cancellation.id)}
                          className="mt-1 h-4 w-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            #{cancellation.id} - {cancellation.schedule_name}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {formatDateReadable(
                                  cancellation.session_date,
                                  language
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatTime(cancellation.start_time)} -{" "}
                                {formatTime(cancellation.end_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>
                                {cancellation.assigned_teacher?.username ||
                                  "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isUrgent(cancellation.cancellation_requested_at) && (
                        <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {language === "th" ? "ด่วน" : "Urgent"}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t.requestedAt}:</span>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatRelativeTime(
                              cancellation.cancellation_requested_at,
                              language
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDateTime(
                              cancellation.cancellation_requested_at,
                              language
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {language === "th" ? "โควต้า Makeup" : "Makeup Quota"}
                          :
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {cancellation.schedule_makeup_remaining}/
                            {cancellation.schedule_makeup_quota}
                          </span>
                          {cancellation.can_create_makeup_after_approval && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-start justify-between text-sm">
                        <span className="text-gray-600">{t.reason}:</span>
                        <button
                          onClick={() => {
                            setSelectedReason({ request: cancellation });
                            setShowReasonModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                        >
                          <span className="text-right line-clamp-2 max-w-[200px]">
                            {cancellation.cancelling_reason}
                          </span>
                          <FileText className="h-4 w-4 flex-shrink-0" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveSingle(cancellation.id)}
                        disabled={isApproving}
                        variant="monthViewClicked"
                        className="flex-1 py-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t.approve}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                      {t.page} {currentPage} {t.of} {totalPages}
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        variant="cancel"
                        className="px-3 py-2 flex-1 sm:flex-none text-sm"
                      >
                        <ChevronLeft className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{t.previous}</span>
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        variant="cancel"
                        className="px-3 py-2 flex-1 sm:flex-none text-sm"
                      >
                        <span className="hidden sm:inline">{t.next}</span>
                        <ChevronRight className="h-4 w-4 sm:ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Reason Modal */}
      {showReasonModal && selectedReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 sm:px-6 py-4 sm:py-5 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t.cancellationReason}
                </h3>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedReason(null);
                  }}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg border border-indigo-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">
                        {t.session} ID
                      </p>
                      <p className="text-gray-900 font-semibold">
                        #{selectedReason.request.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">{t.teacher}</p>
                      <p className="text-gray-900 font-semibold break-words">
                        {selectedReason.request.assigned_teacher?.username ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {t.requestedBy}
                      </p>
                      <p className="text-gray-900 font-semibold break-words">
                        {selectedReason.request.requested_by?.name} (
                        {selectedReason.request.requested_by?.role})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "โควต้า Makeup" : "Makeup Quota"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedReason.request.schedule_makeup_remaining}/
                        {selectedReason.request.schedule_makeup_quota}
                        {selectedReason.request
                          .can_create_makeup_after_approval && (
                          <span className="ml-2 text-green-600 text-xs">✓</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "วันที่" : "Date"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {formatDateReadable(
                          selectedReason.request.session_date,
                          language
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "เวลา" : "Time"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {formatTime(selectedReason.request.start_time)} -{" "}
                        {formatTime(selectedReason.request.end_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t.reason}
                  </label>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 min-h-[100px] sm:min-h-[120px]">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm sm:text-base">
                      {selectedReason.request.cancelling_reason}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-amber-900">
                        {language === "th" ? "ข้อมูลเวลา" : "Time Information"}
                      </p>
                      <div className="space-y-1 text-sm text-amber-700">
                        <p className="font-medium">
                          {formatRelativeTime(
                            selectedReason.request.cancellation_requested_at,
                            language
                          )}
                        </p>
                        <p className="text-xs">
                          {formatDateTime(
                            selectedReason.request.cancellation_requested_at,
                            language
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedReason(null);
                  }}
                  variant="cancel"
                  className="px-6 py-2.5 w-full sm:w-auto"
                >
                  {t.close}
                </Button>
                <Button
                  onClick={() => {
                    handleApproveSingle(selectedReason.request.id);
                    setShowReasonModal(false);
                    setSelectedReason(null);
                  }}
                  disabled={isApproving}
                  variant="monthViewClicked"
                  className="px-6 py-2.5 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t.approve}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </SidebarLayout>
  );
}
