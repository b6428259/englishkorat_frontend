"use client";

import { ItemCard, RequestCard, TransactionCard } from "@/components/borrowing";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Loading from "@/components/common/Loading";
import Modal from "@/components/common/Modal";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RoleGuard } from "@/components/common/RoleGuard";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/useToast";
import * as borrowingService from "@/services/api/borrowing";
import type {
  BorrowableItem,
  BorrowRequest,
  BorrowTransaction,
  CreateItemRequest,
  ItemCondition,
} from "@/types/borrowing.types";
import { useEffect, useState } from "react";

type TabType = "items" | "requests" | "transactions" | "requisitions";

export default function BorrowingManagementPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  const [loading, setLoading] = useState(false);

  // Items state
  const [items, setItems] = useState<BorrowableItem[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BorrowableItem | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingRequest, setReviewingRequest] =
    useState<BorrowRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [reviewNotes, setReviewNotes] = useState("");

  // Transactions state
  const [transactions, setTransactions] = useState<BorrowTransaction[]>([]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkingInTransaction, setCheckingInTransaction] =
    useState<BorrowTransaction | null>(null);
  const [checkInForm, setCheckInForm] = useState<{
    condition_on_return: ItemCondition;
    damage_fee: number;
    return_notes: string;
  }>({
    condition_on_return: "good",
    damage_fee: 0,
    return_notes: "",
  });

  // Requisitions state (new)
  const [requisitions, setRequisitions] = useState<
    import("@/types/borrowing.types").RequisitionTransaction[]
  >([]);
  const [processingRequisition, setProcessingRequisition] = useState<
    number | null
  >(null);
  const [requisitionFilters, setRequisitionFilters] = useState<{
    status: "all" | "approved" | "picked_up" | "cancelled";
    search: string;
    dateFrom: string;
    dateTo: string;
  }>({
    status: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Item form
  const [itemForm, setItemForm] = useState<CreateItemRequest>({
    branch_id: user?.branch_id || 1,
    item_mode: "borrowable", // Default to borrowable
    item_type: "book",
    category: "",
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    published_year: new Date().getFullYear(),
    description: "",
    total_stock: 1,
    available_stock: 1,
    max_borrow_days: 14,
    renewable_count: 2,
    late_fee_per_day: 10,
    requires_approval: true,
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "items") {
        await loadItems();
      } else if (activeTab === "requests") {
        await loadRequests();
      } else if (activeTab === "transactions") {
        await loadTransactions();
      } else if (activeTab === "requisitions") {
        await loadRequisitions();
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    const response = await borrowingService.getItems();
    setItems(response.data);
  };

  const loadRequests = async () => {
    const response = await borrowingService.getAllRequests();
    setRequests(response.data);
  };

  const loadTransactions = async () => {
    const response = await borrowingService.getAllTransactions();
    setTransactions(response.data);
  };

  const loadRequisitions = async () => {
    const response = await borrowingService.getAllRequisitions();
    setRequisitions(response.data);
  };

  // Item Management
  const handleCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      branch_id: user?.branch_id || 1,
      item_mode: "borrowable", // Default to borrowable
      item_type: "book",
      category: "",
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      published_year: new Date().getFullYear(),
      description: "",
      total_stock: 1,
      available_stock: 1,
      max_borrow_days: 14,
      renewable_count: 2,
      late_fee_per_day: 10,
      requires_approval: true,
    });
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item: BorrowableItem) => {
    setEditingItem(item);
    setItemForm({
      branch_id: item.branch_id,
      item_mode: item.item_mode || "borrowable",
      item_type: item.item_type,
      category: item.category,
      title: item.title,
      author: item.author || "",
      isbn: item.isbn || "",
      publisher: item.publisher || "",
      published_year: item.published_year || new Date().getFullYear(),
      description: item.description || "",
      total_stock: item.total_stock,
      available_stock: item.available_stock,
      max_borrow_days: item.max_borrow_days || 14,
      renewable_count: item.renewable_count || 2,
      late_fee_per_day: item.late_fee_per_day || 10,
      requires_approval: item.requires_approval,
    });
    // Set existing image preview
    setCoverImagePreview(item.cover_image_url || null);
    setCoverImageFile(null);
    setShowItemModal(true);
  };

  // Image upload handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.warning("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)");
      return;
    }

    setCoverImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
  };

  const handleSaveItem = async () => {
    try {
      setLoading(true);

      let itemId: number;

      if (editingItem) {
        // Update existing item
        const response = await borrowingService.updateItem(
          editingItem.id,
          itemForm
        );
        itemId = response.data.id;

        // Upload new image if selected
        if (coverImageFile) {
          setUploadingImage(true);
          try {
            await borrowingService.uploadItemImage(itemId, coverImageFile);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.warning("บันทึกรายการสำเร็จ แต่อัพโหลดรูปภาพล้มเหลว");
          } finally {
            setUploadingImage(false);
          }
        }

        toast.success("อัพเดทรายการสำเร็จ");
      } else {
        // Create new item first
        const response = await borrowingService.createItem(itemForm);
        itemId = response.data.id;

        // Upload image after creation if file selected
        if (coverImageFile) {
          setUploadingImage(true);
          try {
            await borrowingService.uploadItemImage(itemId, coverImageFile);
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.warning("เพิ่มรายการสำเร็จ แต่อัพโหลดรูปภาพล้มเหลว");
          } finally {
            setUploadingImage(false);
          }
        }

        toast.success("เพิ่มรายการสำเร็จ");
      }

      // Reset form and close modal
      setShowItemModal(false);
      setCoverImageFile(null);
      setCoverImagePreview(null);

      // Reload items
      await loadItems();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    const confirmed = await toast.confirm("ต้องการลบรายการนี้ใช่หรือไม่?");
    if (!confirmed) return;

    try {
      setLoading(true);
      await borrowingService.deleteItem(id);
      toast.success("ลบรายการสำเร็จ");
      await loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("เกิดข้อผิดพลาดในการลบ");
    } finally {
      setLoading(false);
    }
  };

  // Request Management
  const handleReviewRequest = (
    request: BorrowRequest,
    action: "approve" | "reject"
  ) => {
    setReviewingRequest(request);
    setReviewAction(action);
    setReviewNotes("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingRequest) return;
    if (reviewAction === "reject" && !reviewNotes.trim()) {
      toast.warning("กรุณาระบุเหตุผลในการปฏิเสธ");
      return;
    }

    try {
      setLoading(true);
      if (reviewAction === "approve") {
        await borrowingService.approveBorrowRequest(reviewingRequest.id, {
          review_notes: reviewNotes,
        });
        toast.success("อนุมัติคำขอยืมสำเร็จ");
      } else {
        await borrowingService.rejectBorrowRequest(reviewingRequest.id, {
          review_notes: reviewNotes,
        });
        toast.success("ปฏิเสธคำขอยืมสำเร็จ");
      }
      setShowReviewModal(false);
      await loadRequests();
    } catch (error) {
      console.error("Error reviewing request:", error);
      toast.error("เกิดข้อผิดพลาด: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Transaction Management
  const handleCheckInClick = (transaction: BorrowTransaction) => {
    setCheckingInTransaction(transaction);
    setCheckInForm({
      condition_on_return: "good",
      damage_fee: 0,
      return_notes: "",
    });
    setShowCheckInModal(true);
  };

  const handleSubmitCheckIn = async () => {
    if (!checkingInTransaction) return;

    try {
      setLoading(true);
      const result = await borrowingService.checkInBorrow(
        checkingInTransaction.id,
        checkInForm
      );

      let message = "รับคืนสำเร็จ";
      if (result.fees.total_fee > 0) {
        message += `\n\nค่าธรรมเนียมทั้งหมด: ${result.fees.total_fee} บาท`;
        if (result.fees.late_fee > 0) {
          message += `\n- ค่าปรับล่าช้า: ${result.fees.late_fee} บาท (${result.fees.late_days} วัน)`;
        }
        if (result.fees.damage_fee > 0) {
          message += `\n- ค่าเสียหาย: ${result.fees.damage_fee} บาท`;
        }
      }

      toast.success(message);
      setShowCheckInModal(false);
      await loadTransactions();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("เกิดข้อผิดพลาดในการรับคืน");
    } finally {
      setLoading(false);
    }
  };

  // Requisition Management
  const handleCompleteRequisition = async (requisitionId: number) => {
    const confirmed = await toast.confirm(
      "ยืนยันการรับสินค้า?\n\nการดำเนินการนี้จะบันทึกว่าผู้ใช้ได้รับสินค้าแล้ว"
    );
    if (!confirmed) {
      return;
    }

    try {
      setProcessingRequisition(requisitionId);
      await borrowingService.completeRequisition(requisitionId, {
        notes: "รับสินค้าเรียบร้อย",
      });
      toast.success("ยืนยันการรับสินค้าสำเร็จ");
      await loadRequisitions();
    } catch (error) {
      console.error("Error completing requisition:", error);
      toast.error("เกิดข้อผิดพลาดในการยืนยันการรับสินค้า");
    } finally {
      setProcessingRequisition(null);
    }
  };

  const handleCancelRequisition = async (requisitionId: number) => {
    const reason = await toast.prompt(
      "โปรดระบุเหตุผลในการยกเลิก:\n\n(สินค้าจะถูกคืนกลับเข้าคลังอัตโนมัติ)",
      "",
      "ยืนยัน",
      "ยกเลิก"
    );

    if (!reason) return;

    try {
      setProcessingRequisition(requisitionId);
      await borrowingService.cancelRequisition(requisitionId, reason);
      toast.success(
        "ยกเลิกคำขอเบิกสำเร็จ\n\nสินค้าได้ถูกคืนกลับเข้าคลังแล้ว (ทั้ง available_stock และ total_stock)"
      );
      await loadRequisitions();
    } catch (error) {
      console.error("Error cancelling requisition:", error);
      toast.error("เกิดข้อผิดพลาดในการยกเลิก");
    } finally {
      setProcessingRequisition(null);
    }
  };

  const getStatusBadgeClass = (
    status: "approved" | "picked_up" | "cancelled"
  ) => {
    if (status === "approved") return "bg-purple-100 text-purple-800";
    if (status === "picked_up") return "bg-gray-100 text-gray-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const tabs: { key: TabType; label: string; count?: number }[] = [
    {
      key: "requests",
      label: t.pendingWithdrawalRequests,
      count: requests.filter((r) => r.status === "pending").length,
    },
    {
      key: "transactions",
      label: t.activeWithdrawals,
      count: transactions.filter(
        (t) => t.status === "borrowed" || t.status === "overdue"
      ).length,
    },
    {
      key: "requisitions",
      label: t.pendingRequisitionRequests,
      count: requisitions.filter((r) => r.status === "approved").length,
    },
    { key: "items", label: t.manageItemsAndInventory, count: items.length },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard roles={["admin", "owner"]}>
        <SidebarLayout
          breadcrumbItems={[
            { label: t.dashboard, href: "/dashboard" },
            { label: t.manageStockSystem },
          ]}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t.manageStockSystem}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {t.approveRequestsAndReceiveReturns}
                  </p>
                </div>
                {activeTab === "items" && (
                  <Button variant="common" onClick={handleCreateItem}>
                    {t.addBookOrItem}
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-[#334293] text-[#334293]"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && tab.count > 0 && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                            activeTab === tab.key
                              ? "bg-[#334293] text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {loading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Items Tab */}
                    {activeTab === "items" && (
                      <div className="space-y-4">
                        {items.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            {t.noItemsYetClickAdd}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map((item) => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                showActions
                                onEdit={() => handleEditItem(item)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === "requests" && (
                      <div className="space-y-4">
                        {/* Pending Requests */}
                        {requests.filter((r) => r.status === "pending").length >
                          0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              รอการอนุมัติ (
                              {
                                requests.filter((r) => r.status === "pending")
                                  .length
                              }
                              )
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {requests
                                .filter((r) => r.status === "pending")
                                .map((request) => (
                                  <RequestCard
                                    key={request.id}
                                    request={request}
                                    showActions
                                    onApprove={() =>
                                      handleReviewRequest(request, "approve")
                                    }
                                    onReject={() =>
                                      handleReviewRequest(request, "reject")
                                    }
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Other Requests */}
                        {requests.filter((r) => r.status !== "pending").length >
                          0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                              ประวัติคำขอ
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {requests
                                .filter((r) => r.status !== "pending")
                                .map((request) => (
                                  <RequestCard
                                    key={request.id}
                                    request={request}
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {requests.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            ยังไม่มีคำขอยืม
                          </div>
                        )}
                      </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === "transactions" && (
                      <div className="space-y-4">
                        {/* Active Borrows */}
                        {transactions.filter(
                          (t) =>
                            t.status === "borrowed" || t.status === "overdue"
                        ).length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              กำลังยืม (
                              {
                                transactions.filter(
                                  (t) =>
                                    t.status === "borrowed" ||
                                    t.status === "overdue"
                                ).length
                              }
                              )
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {transactions
                                .filter(
                                  (t) =>
                                    t.status === "borrowed" ||
                                    t.status === "overdue"
                                )
                                .map((transaction) => (
                                  <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    showActions
                                    onCheckIn={() =>
                                      handleCheckInClick(transaction)
                                    }
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Returned */}
                        {transactions.filter((t) => t.status === "returned")
                          .length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">
                              คืนแล้ว
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {transactions
                                .filter((t) => t.status === "returned")
                                .slice(0, 9)
                                .map((transaction) => (
                                  <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {transactions.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            {t.noWithdrawalsYet}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Requisitions Tab */}
                    {activeTab === "requisitions" && (
                      <div className="space-y-4">
                        {/* Filters Section */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Status Filter */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                สถานะ
                              </label>
                              <select
                                value={requisitionFilters.status}
                                onChange={(e) => {
                                  setRequisitionFilters({
                                    ...requisitionFilters,
                                    status: e.target.value as
                                      | "all"
                                      | "approved"
                                      | "picked_up"
                                      | "cancelled",
                                  });
                                  setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="all">ทั้งหมด</option>
                                <option value="approved">รออนุมัติรับ</option>
                                <option value="picked_up">รับแล้ว</option>
                                <option value="cancelled">ยกเลิก</option>
                              </select>
                            </div>

                            {/* Search */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t.searchUserOrItem}
                              </label>
                              <input
                                type="text"
                                value={requisitionFilters.search}
                                onChange={(e) => {
                                  setRequisitionFilters({
                                    ...requisitionFilters,
                                    search: e.target.value,
                                  });
                                  setCurrentPage(1);
                                }}
                                placeholder={t.searchUserOrItem}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                              <button
                                onClick={() => {
                                  setRequisitionFilters({
                                    status: "all",
                                    search: "",
                                    dateFrom: "",
                                    dateTo: "",
                                  });
                                  setCurrentPage(1);
                                }}
                                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {t.clear}
                              </button>
                            </div>
                          </div>

                          {/* Date Range Filter */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                วันที่เริ่มต้น
                              </label>
                              <input
                                type="date"
                                value={requisitionFilters.dateFrom}
                                onChange={(e) => {
                                  setRequisitionFilters({
                                    ...requisitionFilters,
                                    dateFrom: e.target.value,
                                  });
                                  setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                วันที่สิ้นสุด
                              </label>
                              <input
                                type="date"
                                value={requisitionFilters.dateTo}
                                onChange={(e) => {
                                  setRequisitionFilters({
                                    ...requisitionFilters,
                                    dateTo: e.target.value,
                                  });
                                  setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Results Count */}
                        {(() => {
                          const filtered = requisitions.filter((r) => {
                            // Status filter
                            if (
                              requisitionFilters.status !== "all" &&
                              r.status !== requisitionFilters.status
                            ) {
                              return false;
                            }

                            // Search filter
                            if (requisitionFilters.search) {
                              const search =
                                requisitionFilters.search.toLowerCase();
                              const userName =
                                `${r.user?.student?.first_name} ${r.user?.student?.last_name}`.toLowerCase();
                              const itemName =
                                r.item?.title.toLowerCase() || "";
                              if (
                                !userName.includes(search) &&
                                !itemName.includes(search)
                              ) {
                                return false;
                              }
                            }

                            // Date range filter
                            if (requisitionFilters.dateFrom) {
                              const createdDate = new Date(
                                r.created_at
                              ).toISOString();
                              if (createdDate < requisitionFilters.dateFrom) {
                                return false;
                              }
                            }
                            if (requisitionFilters.dateTo) {
                              const createdDate = new Date(
                                r.created_at
                              ).toISOString();
                              if (createdDate > requisitionFilters.dateTo) {
                                return false;
                              }
                            }

                            return true;
                          });

                          const totalPages = Math.ceil(
                            filtered.length / itemsPerPage
                          );
                          const startIdx = (currentPage - 1) * itemsPerPage;
                          const endIdx = startIdx + itemsPerPage;
                          const paginatedData = filtered.slice(
                            startIdx,
                            endIdx
                          );

                          return (
                            <>
                              {filtered.length > 0 && (
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <span>
                                    พบ {filtered.length} รายการ
                                    {filtered.length !== requisitions.length &&
                                      ` (จากทั้งหมด ${requisitions.length} รายการ)`}
                                  </span>
                                  {totalPages > 1 && (
                                    <span>
                                      หน้า {currentPage} จาก {totalPages}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Requisitions Grid */}
                              {paginatedData.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {paginatedData.map((requisition) => (
                                    <div
                                      key={requisition.id}
                                      className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900">
                                            {requisition.item?.title}
                                          </h4>
                                          <p className="text-sm text-gray-600 mt-1">
                                            {
                                              requisition.user?.student
                                                ?.first_name
                                            }{" "}
                                            {
                                              requisition.user?.student
                                                ?.last_name
                                            }
                                          </p>
                                        </div>
                                        <span
                                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                                            requisition.status
                                          )}`}
                                        >
                                          {requisition.status === "approved" &&
                                            "รออนุมัติรับ"}
                                          {requisition.status === "picked_up" &&
                                            "รับแล้ว"}
                                          {requisition.status === "cancelled" &&
                                            "ยกเลิก"}
                                        </span>
                                      </div>

                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            จำนวน:
                                          </span>
                                          <span className="font-semibold">
                                            {requisition.quantity}{" "}
                                            {requisition.item?.unit}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            วันที่ขอ:
                                          </span>
                                          <span className="font-semibold">
                                            {new Date(
                                              requisition.created_at
                                            ).toLocaleDateString("th-TH")}
                                          </span>
                                        </div>
                                        {requisition.purpose && (
                                          <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-600">
                                              <span className="font-semibold">
                                                วัตถุประสงค์:
                                              </span>{" "}
                                              {requisition.purpose}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {requisition.status === "approved" && (
                                        <div className="mt-4 flex gap-2">
                                          <button
                                            onClick={() =>
                                              handleCompleteRequisition(
                                                requisition.id
                                              )
                                            }
                                            disabled={
                                              processingRequisition ===
                                              requisition.id
                                            }
                                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                                          >
                                            ✓ ยืนยันรับสินค้า
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleCancelRequisition(
                                                requisition.id
                                              )
                                            }
                                            disabled={
                                              processingRequisition ===
                                              requisition.id
                                            }
                                            className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                          >
                                            ✗ ยกเลิก
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                  <button
                                    onClick={() =>
                                      setCurrentPage(
                                        Math.max(1, currentPage - 1)
                                      )
                                    }
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    ← ก่อนหน้า
                                  </button>

                                  <div className="flex gap-1">
                                    {Array.from(
                                      { length: totalPages },
                                      (_, i) => i + 1
                                    )
                                      .filter(
                                        (page) =>
                                          page === 1 ||
                                          page === totalPages ||
                                          Math.abs(page - currentPage) <= 1
                                      )
                                      .map((page, idx, arr) => {
                                        if (
                                          idx > 0 &&
                                          arr[idx - 1] !== page - 1
                                        ) {
                                          return (
                                            <span
                                              key={`ellipsis-${page}`}
                                              className="px-2 py-2 text-gray-500"
                                            >
                                              ...
                                            </span>
                                          );
                                        }
                                        return (
                                          <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                              currentPage === page
                                                ? "bg-purple-600 text-white"
                                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                            }`}
                                          >
                                            {page}
                                          </button>
                                        );
                                      })}
                                  </div>

                                  <button
                                    onClick={() =>
                                      setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                      )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    ถัดไป →
                                  </button>
                                </div>
                              )}

                              {/* Empty State */}
                              {filtered.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                  {requisitions.length === 0
                                    ? t.noRequisitionsYet
                                    : t.noMatchingResults}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Item Modal */}
          <Modal
            isOpen={showItemModal}
            onClose={() => {
              setShowItemModal(false);
              setCoverImageFile(null);
              setCoverImagePreview(null);
            }}
            title={editingItem ? "แก้ไขรายการ" : "เพิ่มหนังสือ/สิ่งของ"}
            size="xl"
          >
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-gray-700">
              {/* Cover Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  รูปปก
                </label>

                {/* Image Preview or Upload Area */}
                {coverImagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-48 sm:h-64 bg-gray-100 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleImageDrop}
                    onDragOver={handleImageDragOver}
                    className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                          คลิกเพื่ออัพโหลด
                        </span>{" "}
                        หรือลากไฟล์มาวางที่นี่
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF ขนาดไม่เกิน 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ประเภท *
                  </label>
                  <select
                    value={itemForm.item_type}
                    onChange={(e) => {
                      const value = e.target.value as
                        | "book"
                        | "equipment"
                        | "material"
                        | "other";
                      setItemForm({ ...itemForm, item_type: value });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="book">หนังสือ</option>
                    <option value="equipment">อุปกรณ์</option>
                    <option value="material">สื่อการสอน</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>

                <Input
                  label="หมวดหมู่"
                  value={itemForm.category}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, category: e.target.value })
                  }
                  placeholder="เช่น Programming, Fiction"
                />
              </div>

              <Input
                label="ชื่อ *"
                value={itemForm.title}
                onChange={(e) =>
                  setItemForm({ ...itemForm, title: e.target.value })
                }
                placeholder="ชื่อหนังสือหรือสิ่งของ"
              />

              {itemForm.item_type === "book" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ผู้แต่ง"
                    value={itemForm.author || ""}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, author: e.target.value })
                    }
                  />
                  <Input
                    label="ISBN"
                    value={itemForm.isbn || ""}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, isbn: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="item-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  รายละเอียด
                </label>
                <textarea
                  id="item-description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={itemForm.description || ""}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="จำนวนทั้งหมด *"
                  type="number"
                  min={1}
                  value={itemForm.total_stock}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      total_stock: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <Input
                  label="จำนวนที่พร้อมให้ยืม *"
                  type="number"
                  min={0}
                  max={itemForm.total_stock}
                  value={itemForm.available_stock}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      available_stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="ยืมได้สูงสุด (วัน) * (0 = ไม่จำกัด)"
                  type="number"
                  min={0}
                  value={itemForm.max_borrow_days?.toString() || "0"}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setItemForm({
                      ...itemForm,
                      max_borrow_days: val === 0 ? null : val,
                    });
                  }}
                />
                <Input
                  label="ต่ออายุได้ (ครั้ง) * (0 = ไม่จำกัด)"
                  type="number"
                  min={0}
                  value={itemForm.renewable_count?.toString() || "0"}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setItemForm({
                      ...itemForm,
                      renewable_count: val === 0 ? null : val,
                    });
                  }}
                />
                <Input
                  label="ค่าปรับ/วัน (บาท) * (0 = ไม่มีค่าปรับ)"
                  type="number"
                  min={0}
                  value={itemForm.late_fee_per_day}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      late_fee_per_day: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="common"
                  onClick={handleSaveItem}
                  className="flex-1"
                  disabled={loading || uploadingImage}
                >
                  {uploadingImage
                    ? "กำลังอัพโหลดรูปภาพ..."
                    : editingItem
                    ? "บันทึกการแก้ไข"
                    : "เพิ่มรายการ"}
                </Button>
                {editingItem && (
                  <Button
                    variant="cancel"
                    onClick={() => handleDeleteItem(editingItem.id)}
                    disabled={loading || uploadingImage}
                  >
                    ลบ
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowItemModal(false);
                    setCoverImageFile(null);
                    setCoverImagePreview(null);
                  }}
                  disabled={loading || uploadingImage}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </Modal>

          {/* Review Request Modal */}
          <Modal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            title={
              reviewAction === "approve" ? "อนุมัติคำขอยืม" : "ปฏิเสธคำขอยืม"
            }
            subtitle={reviewingRequest?.item?.title}
            size="md"
          >
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  {reviewAction === "approve"
                    ? "ต้องการอนุมัติคำขอยืมนี้ใช่หรือไม่?"
                    : "ต้องการปฏิเสธคำขอยืมนี้ใช่หรือไม่?"}
                </p>
                {reviewingRequest && (
                  <div className="text-sm text-gray-600 space-y-1 p-3 bg-gray-50 rounded">
                    <p>• ผู้ขอยืม: {reviewingRequest.user?.username}</p>
                    <p>• จำนวน: {reviewingRequest.quantity} รายการ</p>
                    {reviewingRequest.request_notes && (
                      <p>• หมายเหตุ: {reviewingRequest.request_notes}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="review-notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {reviewAction === "approve"
                    ? "หมายเหตุ (ถ้ามี)"
                    : "เหตุผลในการปฏิเสธ *"}
                </label>
                <textarea
                  id="review-notes"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === "approve"
                      ? "เช่น กรุณารับหนังสือภายในวันที่กำหนด"
                      : "ระบุเหตุผลที่ปฏิเสธ..."
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant={reviewAction === "approve" ? "common" : "cancel"}
                  onClick={handleSubmitReview}
                  className="flex-1"
                  disabled={loading}
                >
                  {reviewAction === "approve"
                    ? "ยืนยันอนุมัติ"
                    : "ยืนยันปฏิเสธ"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </Modal>

          {/* Check-in Modal */}
          <Modal
            isOpen={showCheckInModal}
            onClose={() => setShowCheckInModal(false)}
            title="รับคืนหนังสือ/สิ่งของ"
            subtitle={checkingInTransaction?.item?.title}
            size="md"
          >
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="condition-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  สภาพตอนคืน *
                </label>
                <select
                  id="condition-select"
                  value={checkInForm.condition_on_return}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      condition_on_return: e.target.value as ItemCondition,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="excellent">ดีเยี่ยม</option>
                  <option value="good">ดี</option>
                  <option value="fair">พอใช้</option>
                  <option value="poor">แย่</option>
                  <option value="damaged">เสียหาย</option>
                  <option value="lost">สูญหาย</option>
                </select>
              </div>

              {(checkInForm.condition_on_return === "damaged" ||
                checkInForm.condition_on_return === "lost") && (
                <Input
                  label="ค่าเสียหาย (บาท)"
                  type="number"
                  min={0}
                  value={checkInForm.damage_fee}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      damage_fee: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              )}

              <div>
                <label
                  htmlFor="return-notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมายเหตุ
                </label>
                <textarea
                  id="return-notes"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={checkInForm.return_notes}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      return_notes: e.target.value,
                    })
                  }
                  placeholder="บันทึกสภาพหรือหมายเหตุอื่นๆ..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="common"
                  onClick={handleSubmitCheckIn}
                  className="flex-1"
                  disabled={loading}
                >
                  ยืนยันรับคืน
                </Button>
                <Button
                  variant="cancel"
                  onClick={() => setShowCheckInModal(false)}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
              </div>
            </div>
          </Modal>
        </SidebarLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
