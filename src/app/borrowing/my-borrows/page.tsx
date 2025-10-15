"use client";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { RoleGuard } from "@/components/common/RoleGuard";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import * as borrowingService from "@/services/api/borrowing";
import type {
  BorrowableItem,
  BorrowRequest,
  BorrowTransaction,
  ItemFilters,
} from "@/types/borrowing.types";
import { useCallback, useEffect, useMemo, useState } from "react";

// NextUI Components (selective - only what we need)
import type { ItemType } from "@/types/borrowing.types";
import {
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import Image from "next/image";
import {
  HiMagnifyingGlass,
  HiOutlineAdjustmentsHorizontal,
} from "react-icons/hi2";

type TabType = "browse" | "my-requests" | "my-borrows";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MyBorrowsPageNextUI() {
  const { language } = useLanguage();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<TabType>("browse");
  const [loading, setLoading] = useState(false);

  // Browse items state
  const [items, setItems] = useState<BorrowableItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const debouncedSearch = useDebounce(itemSearch, 500); // 500ms debounce
  const [itemFilters, setItemFilters] = useState<ItemFilters>({
    available_only: true,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<BorrowRequest[]>([]);

  // Borrows state
  const [borrows, setBorrows] = useState<BorrowTransaction[]>([]);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<BorrowableItem | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<BorrowTransaction | null>(null);

  // Borrow form
  const [borrowForm, setBorrowForm] = useState({
    quantity: 1,
    scheduled_pickup_date: "",
    scheduled_return_date: "",
    request_notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "browse") {
        await loadItems();
      } else if (activeTab === "my-requests") {
        await loadMyRequests();
      } else if (activeTab === "my-borrows") {
        await loadMyBorrows();
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, debouncedSearch, itemFilters]);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadItems = async () => {
    const filters: ItemFilters = { ...itemFilters };
    if (debouncedSearch) {
      filters.search = debouncedSearch;
    }
    const response = await borrowingService.getItems(filters);
    setItems(response.data);
  };

  const loadMyRequests = async () => {
    const response = await borrowingService.getMyRequests();
    setRequests(response.data);
  };

  const loadMyBorrows = async () => {
    const response = await borrowingService.getMyBorrows();
    setBorrows(response.data);
  };

  const handleItemClick = (item: BorrowableItem) => {
    setSelectedItem(item);
    setShowBorrowModal(true);
    // Set default dates
    const today = new Date();
    const maxDays = item.max_borrow_days || 14;
    const returnDate = new Date(today);
    returnDate.setDate(today.getDate() + maxDays);

    setBorrowForm({
      quantity: 1,
      scheduled_pickup_date: today.toISOString().split("T")[0],
      scheduled_return_date: returnDate.toISOString().split("T")[0],
      request_notes: "",
    });
  };

  const handleSubmitBorrowRequest = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      await borrowingService.createBorrowRequest({
        item_id: selectedItem.id,
        ...borrowForm,
      });
      setShowBorrowModal(false);
      setSelectedItem(null);
      alert(t.borrowRequestSent);
      // Reload requests
      if (activeTab === "my-requests") {
        await loadMyRequests();
      }
    } catch (error) {
      console.error("Error submitting borrow request:", error);
      alert(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm(t.confirmCancel)) return;

    try {
      setLoading(true);
      await borrowingService.cancelBorrowRequest(requestId);
      alert(t.requestCancelled);
      await loadMyRequests();
    } catch (error) {
      console.error("Error cancelling request:", error);
      alert(t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewClick = (transaction: BorrowTransaction) => {
    setSelectedTransaction(transaction);
    setShowRenewModal(true);
  };

  const handleRenew = async () => {
    if (!selectedTransaction) return;

    try {
      setLoading(true);
      await borrowingService.renewBorrow(selectedTransaction.id);
      setShowRenewModal(false);
      setSelectedTransaction(null);
      alert(t.renewSuccess);
      await loadMyBorrows();
    } catch (error) {
      console.error("Error renewing borrow:", error);
      alert(t.exceedRenewalLimit);
    } finally {
      setLoading(false);
    }
  };

  const tabs = useMemo(
    () => [
      { key: "browse" as const, label: t.browseItems },
      {
        key: "my-requests" as const,
        label: t.myRequests,
        count: requests.length,
      },
      {
        key: "my-borrows" as const,
        label: t.myBorrowsList,
        count: borrows.length,
      },
    ],
    [t, requests.length, borrows.length]
  );

  return (
    <ProtectedRoute>
      <RoleGuard roles={["teacher", "admin", "owner"]}>
        <SidebarLayout
          breadcrumbItems={[
            { label: t.dashboard, href: "/dashboard" },
            { label: t.myBorrows },
          ]}
        >
          <div className="space-y-6 text-gray-700">
            {/* Header with theme gradient */}
            <div className="bg-gradient-to-r from-[#334293] to-[#4a56b8] rounded-xl shadow-lg p-6 text-white">
              <h1 className="text-3xl font-bold">{t.myBorrows}</h1>
              <p className="mt-2 text-[#EFE957] font-medium">
                {t.borrowingSystem}
              </p>
            </div>

            {/* Tabs with custom theme */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(key as TabType)}
                  variant="underlined"
                  classNames={{
                    tabList: "px-6 bg-gray-50",
                    cursor: "bg-[#334293]",
                    tab: "px-6 h-14 data-[selected=true]:text-[#334293] font-semibold",
                  }}
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.key}
                      title={
                        <div className="flex items-center gap-2">
                          <span>{tab.label}</span>
                          {tab.count !== undefined && tab.count > 0 && (
                            <span className="bg-[#EFE957] text-[#334293] text-xs font-bold px-2 py-1 rounded-full">
                              {tab.count}
                            </span>
                          )}
                        </div>
                      }
                    />
                  ))}
                </Tabs>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Spinner size="lg" color="primary" />
                  </div>
                ) : (
                  <>
                    {/* Browse Items Tab */}
                    {activeTab === "browse" && (
                      <div className="space-y-4">
                        {/* Search & Filters with custom theme */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <HiMagnifyingGlass
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              size={20}
                            />
                            <input
                              type="text"
                              placeholder={t.search}
                              value={itemSearch}
                              onChange={(e) => setItemSearch(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#334293] focus:outline-none focus:ring-2 focus:ring-[#334293]/20 transition-all"
                            />
                          </div>
                          <Button
                            variant="common"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2"
                          >
                            <HiOutlineAdjustmentsHorizontal size={20} />
                            {t.filter}
                          </Button>
                          {Object.keys(itemFilters).length > 1 && (
                            <Button
                              variant="cancel"
                              onClick={() =>
                                setItemFilters({ available_only: true })
                              }
                            >
                              {t.clear}
                            </Button>
                          )}
                        </div>

                        {/* Filter Panel with theme */}
                        {showFilters && (
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-[#334293]/20 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Select
                                label={t.itemType}
                                placeholder={t.all}
                                selectedKeys={
                                  itemFilters.item_type
                                    ? [itemFilters.item_type]
                                    : []
                                }
                                onSelectionChange={(keys) => {
                                  const selected = Array.from(
                                    keys
                                  )[0] as ItemType;
                                  setItemFilters((prev) => ({
                                    ...prev,
                                    item_type: selected,
                                  }));
                                }}
                                classNames={{
                                  trigger:
                                    "border-2 border-gray-200 hover:border-[#334293]",
                                }}
                              >
                                <SelectItem key="book">{t.book}</SelectItem>
                                <SelectItem key="equipment">
                                  {t.equipment}
                                </SelectItem>
                                <SelectItem key="material">
                                  {t.material}
                                </SelectItem>
                                <SelectItem key="other">
                                  {t.otherItem}
                                </SelectItem>
                              </Select>

                              <Input
                                label={t.category}
                                placeholder={t.category}
                                value={itemFilters.category || ""}
                                onChange={(e) =>
                                  setItemFilters((prev) => ({
                                    ...prev,
                                    category: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        )}

                        {/* Items Grid with enhanced cards */}
                        {items.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-gray-500 text-lg">
                              {t.noItemsFound}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-[#334293] overflow-hidden"
                              >
                                {/* Image Section */}
                                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                  {item.cover_image_url ? (
                                    <Image
                                      src={item.cover_image_url}
                                      alt={item.title}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <span className="text-6xl">📚</span>
                                    </div>
                                  )}
                                  {/* Stock Badge */}
                                  <div className="absolute top-2 right-2">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        item.available_stock > 0
                                          ? "bg-green-500 text-white"
                                          : "bg-red-500 text-white"
                                      }`}
                                    >
                                      {item.available_stock}/{item.total_stock}
                                    </span>
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-4">
                                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#334293] transition-colors">
                                    {item.title}
                                  </h3>
                                  {item.author && (
                                    <p className="text-sm text-gray-600 mb-3">
                                      {item.author}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 bg-[#334293]/10 text-[#334293] text-xs rounded-md font-semibold">
                                      {item.item_type}
                                    </span>
                                    {item.category && (
                                      <span className="px-2 py-1 bg-[#EFE957]/20 text-gray-700 text-xs rounded-md font-semibold">
                                        {item.category}
                                      </span>
                                    )}
                                  </div>

                                  {/* Button */}
                                  <button
                                    disabled={item.available_stock === 0}
                                    className={`w-full py-2 rounded-lg font-semibold transition-all ${
                                      item.available_stock > 0
                                        ? "bg-[#334293] text-white hover:bg-[#EFE957] hover:text-[#334293]"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                  >
                                    {item.available_stock > 0
                                      ? t.borrow
                                      : t.outstandingFees}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* My Requests Tab with enhanced UI */}
                    {activeTab === "my-requests" && (
                      <div className="space-y-4">
                        {requests.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-gray-500 text-lg">
                              {t.noRequestsFound}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {requests.map((request) => (
                              <div
                                key={request.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 overflow-hidden"
                              >
                                {/* Header with status */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b-2 border-gray-100">
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
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-500">
                                        {t.quantityItem}:
                                      </span>
                                      <p className="font-semibold text-gray-900">
                                        {request.quantity}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        {t.pickupDate}:
                                      </span>
                                      <p className="font-semibold text-gray-900">
                                        {new Date(
                                          request.scheduled_pickup_date
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-sm">
                                    <span className="text-gray-500">
                                      {t.returnDate}:
                                    </span>
                                    <p className="font-semibold text-gray-900">
                                      {new Date(
                                        request.scheduled_return_date
                                      ).toLocaleDateString()}
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
                                      {t.cancel}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* My Borrows Tab with enhanced UI */}
                    {activeTab === "my-borrows" && (
                      <div className="space-y-4">
                        {borrows.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-6xl mb-4">📖</div>
                            <p className="text-gray-500 text-lg">
                              {t.noBorrowsFound}
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {borrows.map((transaction) => {
                              const dueDate = new Date(transaction.due_date);
                              const today = new Date();
                              const daysUntilDue = Math.ceil(
                                (dueDate.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              const isOverdue = daysUntilDue < 0;

                              return (
                                <div
                                  key={transaction.id}
                                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
                                    isOverdue
                                      ? "border-red-300"
                                      : daysUntilDue <= 3
                                      ? "border-yellow-300"
                                      : "border-gray-100"
                                  }`}
                                >
                                  {/* Header with status */}
                                  <div
                                    className={`p-4 border-b-2 ${
                                      isOverdue
                                        ? "bg-gradient-to-r from-red-50 to-white border-red-100"
                                        : daysUntilDue <= 3
                                        ? "bg-gradient-to-r from-yellow-50 to-white border-yellow-100"
                                        : "bg-gradient-to-r from-gray-50 to-white border-gray-100"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                                        {transaction.item?.title}
                                      </h3>
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                          transaction.status === "borrowed"
                                            ? "bg-blue-100 text-blue-800"
                                            : transaction.status === "returned"
                                            ? "bg-green-100 text-green-800"
                                            : transaction.status === "overdue"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {
                                          t[
                                            transaction.status as keyof typeof t
                                          ]
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="p-4 space-y-3">
                                    <div className="text-sm">
                                      <span className="text-gray-500">
                                        {t.borrowedDate}:
                                      </span>
                                      <p className="font-semibold text-gray-900">
                                        {new Date(
                                          transaction.borrowed_date
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>

                                    <div
                                      className={`text-sm ${
                                        isOverdue
                                          ? "bg-red-50 border-l-4 border-red-500 p-3 rounded"
                                          : ""
                                      }`}
                                    >
                                      <span
                                        className={
                                          isOverdue
                                            ? "text-red-700 font-bold"
                                            : "text-gray-500"
                                        }
                                      >
                                        {t.dueDate}:
                                      </span>
                                      <p
                                        className={`font-semibold ${
                                          isOverdue
                                            ? "text-red-700 text-base"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {dueDate.toLocaleDateString()}
                                        {isOverdue ? (
                                          <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                                            {t.daysOverdue.replace(
                                              "{days}",
                                              Math.abs(daysUntilDue).toString()
                                            )}
                                          </span>
                                        ) : (
                                          <span
                                            className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                              daysUntilDue <= 3
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-green-100 text-green-800"
                                            }`}
                                          >
                                            {t.daysLeft.replace(
                                              "{days}",
                                              daysUntilDue.toString()
                                            )}
                                          </span>
                                        )}
                                      </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                      <span className="text-gray-500">
                                        {t.renewalCount}:
                                      </span>
                                      <p className="font-semibold text-gray-900">
                                        {transaction.renewal_count} /{" "}
                                        {transaction.item?.renewable_count ?? (
                                          <span className="text-green-600">
                                            {t.unlimited}
                                          </span>
                                        )}
                                      </p>
                                    </div>

                                    {/* Renew Button */}
                                    {transaction.status === "borrowed" && (
                                      <Button
                                        variant="common"
                                        onClick={() =>
                                          handleRenewClick(transaction)
                                        }
                                        disabled={
                                          transaction.item?.renewable_count !=
                                            null &&
                                          transaction.renewal_count >=
                                            (transaction.item
                                              ?.renewable_count ?? 0)
                                        }
                                        className="w-full mt-4"
                                      >
                                        {t.renew}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Borrow Request Modal with custom theme */}
          <Modal
            isOpen={showBorrowModal}
            onClose={() => {
              setShowBorrowModal(false);
              setSelectedItem(null);
            }}
            title={t.submitBorrowRequest}
            subtitle={selectedItem?.title}
            size="xl"
          >
            <div className="p-6 space-y-5 text-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                <Input
                  type="number"
                  label={t.quantityItem}
                  value={borrowForm.quantity.toString()}
                  onChange={(e) =>
                    setBorrowForm({
                      ...borrowForm,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  max={selectedItem?.available_stock || 1}
                />
                <div className="flex items-end pb-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3">
                  {t.stockInfo
                    .replace(
                      "{available}",
                      selectedItem?.available_stock.toString() || "0"
                    )
                    .replace(
                      "{total}",
                      selectedItem?.total_stock.toString() || "0"
                    )}
                </div>
              </div>

              <Input
                type="date"
                label={t.pickupDate}
                value={borrowForm.scheduled_pickup_date}
                onChange={(e) =>
                  setBorrowForm({
                    ...borrowForm,
                    scheduled_pickup_date: e.target.value,
                  })
                }
              />

              <Input
                type="date"
                label={t.returnDate}
                value={borrowForm.scheduled_return_date}
                onChange={(e) =>
                  setBorrowForm({
                    ...borrowForm,
                    scheduled_return_date: e.target.value,
                  })
                }
              />

              <div className="flex flex-col gap-1">
                <label className="text-gray-600 font-medium">
                  {t.requestNotes}
                </label>
                <Textarea
                  placeholder={t.requestNotes}
                  value={borrowForm.request_notes}
                  onValueChange={(value) =>
                    setBorrowForm({
                      ...borrowForm,
                      request_notes: value,
                    })
                  }
                  minRows={3}
                  classNames={{
                    input: "resize-none",
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="cancel"
                  onClick={() => {
                    setShowBorrowModal(false);
                    setSelectedItem(null);
                  }}
                >
                  {t.cancel}
                </Button>
                <Button
                  variant="common"
                  onClick={handleSubmitBorrowRequest}
                  disabled={loading}
                >
                  {loading ? "กำลังส่ง..." : t.submit}
                </Button>
              </div>
            </div>
          </Modal>

          {/* Renew Modal with custom theme */}
          <Modal
            isOpen={showRenewModal}
            onClose={() => {
              setShowRenewModal(false);
              setSelectedTransaction(null);
            }}
            title={t.renew}
            subtitle={selectedTransaction?.item?.title}
            size="md"
          >
            <div className="p-6 space-y-4">
              <p className="text-gray-700 text-center text-lg">
                {t.confirmCancel}
              </p>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border-2 border-[#334293]/20">
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t.renewalCount}:</span>
                    <span>
                      {selectedTransaction?.renewal_count} /{" "}
                      {selectedTransaction?.item?.renewable_count ??
                        t.unlimited}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t.maxBorrowDays}:</span>
                    <span>
                      {selectedTransaction?.item?.max_borrow_days ??
                        t.unlimited}{" "}
                      {t.daysLeft.split(" ")[1]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="cancel"
                  onClick={() => {
                    setShowRenewModal(false);
                    setSelectedTransaction(null);
                  }}
                >
                  {t.cancel}
                </Button>
                <Button
                  variant="common"
                  onClick={handleRenew}
                  disabled={loading}
                >
                  {loading ? "กำลังต่ออายุ..." : t.renew}
                </Button>
              </div>
            </div>
          </Modal>
        </SidebarLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
