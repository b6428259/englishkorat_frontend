"use client";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDateShort } from "@/utils/dateUtils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mock bill detail data structure similar to Wave's invoice detail
interface BillDetail {
  id: number;
  invoice_number: string;
  customer: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  status: "Paid" | "Unpaid" | "Overdue" | "Draft";
  amount: number;
  currency: string;
  due_date: string;
  paid_date?: string;
  created_date: string;
  bill_type: string;
  notes?: string;
  items: BillItem[];
  payment_history: PaymentRecord[];
  totals: {
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    amount_paid: number;
    amount_due: number;
  };
}

interface BillItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  amount: number;
}

interface PaymentRecord {
  id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference?: string;
}

export default function BillDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const billId = params.id as string;

  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with mock data
    const fetchBillDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data - simulating Wave invoice detail structure
        const mockBillDetail: BillDetail = {
          id: parseInt(billId) || 1654,
          invoice_number: "INV-2523",
          customer: {
            name: "Rosie/B2/สาขา1",
            email: "rosie@example.com",
            address: "123 Main Street, Bangkok 10110",
            phone: "+66 2 123-4567",
          },
          status: "Paid",
          amount: 2000,
          currency: "THB",
          due_date: "2025-04-15",
          paid_date: "2025-03-25",
          created_date: "2025-03-09",
          bill_type: "normal",
          notes: "Monthly English lesson payment",
          items: [
            {
              id: 1,
              description: "English Conversation Class - Basic Level",
              quantity: 8,
              unit_price: 250,
              tax_rate: 0,
              amount: 2000,
            },
          ],
          payment_history: [
            {
              id: 1,
              payment_date: "2025-03-25",
              amount: 2000,
              payment_method: "Bank Transfer",
              reference: "TXN-2350000000000000000",
            },
          ],
          totals: {
            subtotal: 2000,
            tax_amount: 0,
            discount_amount: 0,
            total_amount: 2000,
            amount_paid: 2000,
            amount_due: 0,
          },
        };

        setBill(mockBillDetail);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch bill details";
        setError(
          language === "th"
            ? "ไม่สามารถโหลดรายละเอียดใบแจ้งหนี้ได้"
            : errorMessage
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetail();
  }, [billId, language]);

  const formatCurrency = (amount: number, currency = "THB"): string => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  if (loading) {
    return (
      <SidebarLayout
        breadcrumbItems={[
          { label: t.studentBill, href: "/students/bills" },
          { label: "Loading..." },
        ]}
      >
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </SidebarLayout>
    );
  }

  if (error || !bill) {
    return (
      <SidebarLayout
        breadcrumbItems={[
          { label: t.studentBill, href: "/students/bills" },
          { label: "Error" },
        ]}
      >
        <div className="py-8">
          <ErrorMessage message={error || "Bill not found"} />
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={() => router.push("/students/bills")}
            >
              {language === "th" ? "กลับไปหน้ารายการ" : "Back to Bills"}
            </Button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.studentBill, href: "/students/bills" },
        { label: bill.invoice_number },
      ]}
    >
      <div className="max-w-4xl mx-auto bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "th" ? "ใบแจ้งหนี้" : "Invoice"}{" "}
                {bill.invoice_number}
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    bill.status
                  )}`}
                >
                  {bill.status}
                </span>
                <span className="text-gray-500">
                  {language === "th" ? "สร้างเมื่อ" : "Created"}{" "}
                  {formatDateShort(bill.created_date)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                {language === "th" ? "พิมพ์" : "Print"}
              </Button>
              <Button variant="outline" size="sm">
                {language === "th" ? "ส่ง Email" : "Send Email"}
              </Button>
              {bill.status !== "Paid" && (
                <Button variant="primary" size="sm">
                  {language === "th" ? "บันทึกการชำระเงิน" : "Record Payment"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "th" ? "ข้อมูลลูกค้า" : "Customer Information"}
              </h2>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">
                    {language === "th" ? "ชื่อ:" : "Name:"}
                  </span>
                  <span className="text-gray-900">{bill.customer.name}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">
                    {language === "th" ? "อีเมล:" : "Email:"}
                  </span>
                  <span className="text-gray-900">{bill.customer.email}</span>
                </div>
                {bill.customer.phone && (
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-24">
                      {language === "th" ? "โทรศัพท์:" : "Phone:"}
                    </span>
                    <span className="text-gray-900">{bill.customer.phone}</span>
                  </div>
                )}
                {bill.customer.address && (
                  <div className="flex">
                    <span className="font-medium text-gray-700 w-24">
                      {language === "th" ? "ที่อยู่:" : "Address:"}
                    </span>
                    <span className="text-gray-900">
                      {bill.customer.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "th" ? "รายการ" : "Items"}
              </h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === "th" ? "รายการ" : "Description"}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === "th" ? "จำนวน" : "Qty"}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === "th" ? "ราคาต่อหน่วย" : "Unit Price"}
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {language === "th" ? "ยอดรวม" : "Amount"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bill.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">
                          {formatCurrency(item.unit_price, bill.currency)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(item.amount, bill.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History */}
            {bill.payment_history.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === "th" ? "ประวัติการชำระเงิน" : "Payment History"}
                </h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === "th" ? "วันที่" : "Date"}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === "th" ? "วิธีการชำระ" : "Method"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === "th" ? "จำนวนเงิน" : "Amount"}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {language === "th" ? "อ้างอิง" : "Reference"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bill.payment_history.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {formatDateShort(payment.payment_date)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {payment.payment_method}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(payment.amount, bill.currency)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {payment.reference || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {bill.notes && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === "th" ? "หมายเหตุ" : "Notes"}
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{bill.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invoice Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "th" ? "สรุป" : "Summary"}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === "th" ? "ยอดย่อย:" : "Subtotal:"}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(bill.totals.subtotal, bill.currency)}
                  </span>
                </div>
                {bill.totals.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === "th" ? "ภาษี:" : "Tax:"}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(bill.totals.tax_amount, bill.currency)}
                    </span>
                  </div>
                )}
                {bill.totals.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {language === "th" ? "ส่วนลด:" : "Discount:"}
                    </span>
                    <span className="font-medium">
                      -
                      {formatCurrency(
                        bill.totals.discount_amount,
                        bill.currency
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {language === "th" ? "ยอดรวม:" : "Total:"}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(bill.totals.total_amount, bill.currency)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === "th" ? "ชำระแล้ว:" : "Paid:"}
                  </span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(bill.totals.amount_paid, bill.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {language === "th" ? "คงค้าง:" : "Due:"}
                  </span>
                  <span
                    className={`font-bold ${
                      bill.totals.amount_due > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(bill.totals.amount_due, bill.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === "th" ? "รายละเอียด" : "Details"}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">
                    {language === "th"
                      ? "หมายเลขใบแจ้งหนี้:"
                      : "Invoice Number:"}
                  </span>
                  <p className="font-medium">{bill.invoice_number}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {language === "th" ? "วันที่สร้าง:" : "Created:"}
                  </span>
                  <p className="font-medium">
                    {formatDateShort(bill.created_date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {language === "th" ? "วันที่กำหนดชำระ:" : "Due Date:"}
                  </span>
                  <p className="font-medium">
                    {formatDateShort(bill.due_date)}
                  </p>
                </div>
                {bill.paid_date && (
                  <div>
                    <span className="text-sm text-gray-600">
                      {language === "th" ? "วันที่ชำระ:" : "Paid Date:"}
                    </span>
                    <p className="font-medium text-green-600">
                      {formatDateShort(bill.paid_date)}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">
                    {language === "th" ? "ประเภท:" : "Type:"}
                  </span>
                  <p className="font-medium capitalize">{bill.bill_type}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button variant="primary" className="w-full">
                {language === "th" ? "ดาวน์โหลด PDF" : "Download PDF"}
              </Button>
              <Button variant="outline" className="w-full">
                {language === "th" ? "ส่งใบแจ้งหนี้" : "Send Invoice"}
              </Button>
              {bill.status !== "Paid" && (
                <Button variant="secondary" className="w-full">
                  {language === "th" ? "แก้ไข" : "Edit"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
