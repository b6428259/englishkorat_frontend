"use client";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Bill,
  BillListParams,
  billsApi,
  BillStatus,
  calculateDueAmount,
  formatBillAmount,
  getBillStatusColor,
} from "@/services/api/bills";
import { formatDateShort } from "@/utils/dateUtils";
import { Autocomplete, AutocompleteItem, DatePicker } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

// Available filter options
const billStatusOptions = [
  { label: "All", key: "all" },
  { label: "Paid", key: "Paid" },
  { label: "Unpaid", key: "Unpaid" },
  { label: "Overdue", key: "Overdue" },
  { label: "Partially Paid", key: "Partially Paid" },
];

export default function StudentsBillsPage() {
  const { t, language } = useLanguage();

  // State management
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // Helper: convert filter status to API parameter
  const toStatusParam = (value: string): BillStatus | undefined => {
    if (value === "all") return undefined;
    return billStatusOptions.find((option) => option.key === value)?.key as
      | BillStatus
      | undefined;
  };

  // Fetch bills data
  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: BillListParams = {
        page: currentPage,
        page_size: pageSize,
      };

      // Add filters if they have values
      if (customerFilter.trim()) params.customer = customerFilter.trim();
      if (invoiceFilter.trim()) params.invoice = invoiceFilter.trim();
      if (statusFilter !== "all") params.status = toStatusParam(statusFilter);
      if (dateFromFilter) params.date_from = dateFromFilter;
      if (dateToFilter) params.date_to = dateToFilter;

      const response = await billsApi.getBills(params);
      // Defensive defaults in case API returns undefined or malformed data
      setBills(response?.bills ?? []);
      setTotalPages(response?.total_pages ?? 1);
      setTotal(response?.total ?? 0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bills";
      setError(
        language === "th" ? "ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้" : errorMessage
      );
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    customerFilter,
    invoiceFilter,
    statusFilter,
    dateFromFilter,
    dateToFilter,
    language,
  ]);

  // Load bills on mount and when filters change
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Handle filter changes - reset to page 1 when filters change
  const handleFilterChange = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchBills();
    }
  };

  // Get unique customer names for autocomplete (from current bills)
  const customerOptions = Array.from(
    new Set(bills.map((bill) => bill.customer).filter(Boolean))
  ).map((customer) => ({ label: customer!, key: customer! }));

  // Get unique invoice numbers for autocomplete (from current bills)
  const invoiceOptions = Array.from(
    new Set(bills.map((bill) => bill.invoice_number).filter(Boolean))
  ).map((invoice) => ({ label: invoice!, key: invoice! }));

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.studentBill }]}>
      <div className="space-y-2 p-6 bg-white rounded-lg shadow-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-black">{t.invoice}</h1>
            {!loading && (
              <p className="text-sm text-gray-600 mt-1">
                {language === 'th' ? `แสดง ${bills.length} รายการจากทั้งหมด ${total} รายการ` :
                `Showing ${bills.length} of ${total} bills`}
              </p>
            )}
          </div>
          <Button variant="common" href="/students/bills/createInvoice">
            {t.createInvoice}
          </Button>
        </div>

        {/* Filter Section */}
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <label className="text-gray-500 font-medium flex-1 min-w-[180px]">
            {language === "th" ? "ชื่อลูกค้า" : "Customer Name"}
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            {language === "th" ? "หมายเลขใบแจ้งหนี้" : "Invoice Number"}
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            {language === "th" ? "สถานะ" : "Status"}
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            {language === "th" ? "จากวันที่" : "From Date"}
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            {language === "th" ? "ถึงวันที่" : "To Date"}
          </label>
        </div>

        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <Autocomplete
            className="flex-1 min-w-[180px] border border-gray-300 rounded-md"
            placeholder={language === "th" ? "เลือกลูกค้า" : "Select customer"}
            onInputChange={setCustomerFilter}
          >
            {customerOptions.map((item) => (
              <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <Autocomplete
            className="flex-1 min-w-[150px] border border-gray-300 rounded-md"
            placeholder={
              language === "th" ? "เลือกหมายเลขใบแจ้งหนี้" : "Select invoice"
            }
            onInputChange={setInvoiceFilter}
          >
            {invoiceOptions.map((item) => (
              <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <Autocomplete
            className="flex-1 min-w-[150px] border border-gray-300 rounded-md"
            selectedKey={statusFilter}
            onSelectionChange={(key) => setStatusFilter(key as string)}
          >
            {billStatusOptions.map((item) => (
              <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <DatePicker
            className="flex-1 min-w-[150px] border border-gray-300 rounded-md"
            aria-label={language === "th" ? "จากวันที่" : "from date"}
            onChange={(date) => setDateFromFilter(date ? date.toString() : "")}
          />
          <DatePicker
            className="flex-1 min-w-[150px] border border-gray-300 rounded-md"
            aria-label={language === "th" ? "ถึงวันที่" : "to date"}
            onChange={(date) => setDateToFilter(date ? date.toString() : "")}
          />
        </div>

        {/* Apply Filters Button */}
        <div className="flex justify-end mt-4">
          <Button
            variant="common"
            onClick={handleFilterChange}
            disabled={loading}
            size="sm"
          >
            {language === "th" ? "ค้นหา" : "Search"}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Bills List Table */}
        {!loading && !error && (
          <div className="overflow-x-auto bg-white shadow-sm mt-6">
            <table className="w-full text-left border-collapse border-gray-300">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="px-4 py-2">
                    {language === "th" ? "สถานะ" : "Status"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "วันที่สร้าง" : "Transaction Date"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "หมายเลข" : "Invoice Number"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "ลูกค้า" : "Customer"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "จำนวนเงิน" : "Amount"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "ยอดค้างชำระ" : "Amount Due"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "ประเภท" : "Type"}
                  </th>
                  <th className="px-4 py-2">
                    {language === "th" ? "การดำเนินการ" : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {language === "th"
                        ? "ไม่พบข้อมูลใบแจ้งหนี้"
                        : "No bills found"}
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr
                      key={bill.id || bill.row_uid}
                      className="border-t hover:bg-gray-50"
                    >
                      {/* Status */}
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-sm min-w-[80px] text-center ${getBillStatusColor(
                            bill.status
                          )}`}
                        >
                          {bill.status}
                        </span>
                      </td>

                      <td className="px-4 py-2">
                        {formatDateShort(bill.transaction_date ?? undefined)}
                      </td>
                      <td className="px-4 py-2">
                        {bill.invoice_number || "-"}
                      </td>
                      <td className="px-4 py-2">{bill.customer || "-"}</td>
                      <td className="px-4 py-2">
                        {formatBillAmount(
                          bill.amount,
                          bill.currency ?? undefined
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {formatBillAmount(
                          calculateDueAmount(bill),
                          bill.currency ?? undefined
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="capitalize text-sm text-gray-600">
                          {bill.bill_type}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            variant="common"
                            href={`/students/bills/${bill.id}`}
                          >
                            {language === "th" ? "ดู" : "View"}
                          </Button>
                          {bill.status !== 'Paid' && (
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => {
                                // TODO: Implement edit bill
                                console.log("Edit bill:", bill.id);
                              }}
                            >
                              {language === "th" ? "แก้ไข" : "Edit"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  {language === "th" ? "ก่อนหน้า" : "Previous"}
                </Button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  {language === 'th' ?
                    `หน้า ${currentPage} จาก ${totalPages}` :
                    `Page ${currentPage} of ${totalPages}`
                  }
                </span>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  {language === "th" ? "ถัดไป" : "Next"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
