"use client";

import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  bulkApproveCancellations,
  getAllCancellations,
} from "@/services/api/schedules";
import { CancellationRequestItem } from "@/types/session-cancellation.types";
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
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PendingCancellationsPage() {
  const { language, t } = useLanguage();
  const { hasRole } = useAuth();
  const router = useRouter();

  const [cancellations, setCancellations] = useState<CancellationRequestItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isApproving, setIsApproving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<{
    request: CancellationRequestItem;
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
      const offset = (page - 1) * itemsPerPage;
      const response = await getAllCancellations({
        status: "pending",
        offset,
        limit: itemsPerPage,
      });

      setCancellations(response.requests);
      const calculatedTotalPages = Math.ceil(
        response.pagination.total / itemsPerPage
      );
      setTotalPages(calculatedTotalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch cancellations:", error);
      toast.error(t.approvalFailed, { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRole(["admin", "owner"])) {
      fetchCancellations(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCancellations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCancellations.map((c) => c.session_id));
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

  const filteredCancellations = cancellations.filter((cancellation) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cancellation.teacher_name?.toLowerCase().includes(search) ||
      cancellation.students.some((s) => s.name.toLowerCase().includes(search))
    );
  });

  const isUrgent = (requestedAt: string) => {
    const requested = new Date(requestedAt);
    const now = new Date();
    const hoursSinceRequest =
      (now.getTime() - requested.getTime()) / (1000 * 60 * 60);
    return hoursSinceRequest > 23; // Urgent if requested more than 23 hours ago
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString(language === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-8 py-10 shadow-lg"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <CheckCircle className="h-10 w-10" />
                  {t.approveCancellationRequestsTitle}
                </h1>
                <p className="text-indigo-100 text-lg">
                  {t.approveCancellationRequestsSubtitle}
                </p>
              </div>

              {selectedIds.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg"
                >
                  <div className="text-sm font-medium">
                    {t.selectedItemsCount}: {selectedIds.length}{" "}
                    {language === "th" ? "รายการ" : "items"}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Actions Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchByTeacherOrStudent}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleSelectAll}
                  variant="cancel"
                  className="px-4 py-2.5 text-sm"
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
                  className="px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
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
              <div className="overflow-x-auto">
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
                        {t.students}
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
                    {filteredCancellations.map((cancellation, index) => (
                      <motion.tr
                        key={cancellation.session_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-indigo-50/50 transition-colors ${
                          selectedIds.includes(cancellation.session_id)
                            ? "bg-indigo-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              cancellation.session_id
                            )}
                            onChange={() =>
                              handleSelectItem(cancellation.session_id)
                            }
                            className="h-4 w-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="font-medium text-gray-900">
                              #{cancellation.session_id}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {cancellation.session_date}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {cancellation.start_time} -{" "}
                              {cancellation.end_time}
                            </div>
                            {isUrgent(cancellation.requested_at) && (
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
                              {cancellation.teacher_name || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {formatDateTime(cancellation.requested_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {cancellation.students.length}
                            </span>
                            <span className="text-xs text-gray-500">
                              {language === "th" ? "คน" : "students"}
                            </span>
                          </div>
                          {cancellation.students.slice(0, 2).map((student) => (
                            <div
                              key={student.id}
                              className="text-xs text-gray-600 ml-6"
                            >
                              {student.name}
                            </div>
                          ))}
                          {cancellation.students.length > 2 && (
                            <div className="text-xs text-indigo-600 ml-6">
                              +{cancellation.students.length - 2}{" "}
                              {language === "th" ? "เพิ่มเติม" : "more"}
                            </div>
                          )}
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
                                handleApproveSingle(cancellation.session_id)
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {t.page} {currentPage} {t.of} {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        variant="cancel"
                        className="px-3 py-2"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t.previous}
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        variant="cancel"
                        className="px-3 py-2"
                      >
                        {t.next}
                        <ChevronRight className="h-4 w-4 ml-1" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
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
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">
                        {t.session} ID
                      </p>
                      <p className="text-gray-900 font-semibold">
                        #{selectedReason.request.session_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {t.requestedBy}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedReason.request.teacher_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "วันที่" : "Date"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedReason.request.session_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">
                        {language === "th" ? "เวลา" : "Time"}
                      </p>
                      <p className="text-gray-900 font-semibold">
                        {selectedReason.request.start_time} -{" "}
                        {selectedReason.request.end_time}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t.reason}
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[120px]">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedReason.request.reason}
                    </p>
                  </div>
                </div>

                {selectedReason.request.students.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t.affectedStudents} (
                      {selectedReason.request.students.length})
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {selectedReason.request.students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                          >
                            <span className="text-sm text-gray-900">
                              {student.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    setShowReasonModal(false);
                    setSelectedReason(null);
                  }}
                  variant="cancel"
                  className="px-6 py-2.5"
                >
                  {t.close}
                </Button>
                <Button
                  onClick={() => {
                    handleApproveSingle(selectedReason.request.session_id);
                    setShowReasonModal(false);
                    setSelectedReason(null);
                  }}
                  disabled={isApproving}
                  variant="monthViewClicked"
                  className="px-6 py-2.5"
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
