"use client";

import React from "react";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/common/Button";
import {
  Autocomplete,
  AutocompleteItem,
  DatePicker,
} from "@heroui/react";

export const studentName = [
  { label: "Warissara", key: "Warissara" },
  { label: "Kunlanit ", key: "Kunlanit " },
  { label: "Ronnasit ", key: "Ronnasit " },
];

export const invoiceNumber = [
  { label: "0001", key: "0001" },
  { label: "0002", key: "0002" },
  { label: "0003", key: "0003" },
];

export const status = [
  { label: "Paid", key: "Paid" },
  { label: "Unpaid", key: "Unpaid" },
  { label: "Overdue", key: "Overdue" },
  { label: "Partially", key: "Partially Paid" },
];

const invoices = [
  {
    status: "Paid",
    date: "15/09/2025",
    number: "2580",
    customer: "นัท/A2/สาขา1",
    total: "฿12,000.00",
    due: "฿0.00",
  },
  {
    status: "Unpaid",
    date: "14/09/2025",
    number: "2579",
    customer: "พลอย/B1/สาขา2",
    total: "฿18,500.00",
    due: "฿18,500.00",
  },
  {
    status: "Overdue",
    date: "10/09/2025",
    number: "2578",
    customer: "ต้น/A1/สาขา3",
    total: "฿20,000.00",
    due: "฿20,000.00",
  },
  {
    status: "Partially",
    date: "08/09/2025",
    number: "2577",
    customer: "ฝน/C1/สาขา1",
    total: "฿15,000.00",
    due: "฿5,000.00",
  },
];

const statusColors: Record<string, string> = {
  Paid: "bg-green-100 text-green-800",
  Unpaid: "bg-gray-200 text-gray-700",
  Overdue: "bg-red-100 text-red-800",
  Partially: "bg-yellow-100 text-yellow-800",
};

export default function StudentsBillsPage() {
  const { t } = useLanguage();

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.studentBill }]}>
      <div className="space-y-2 p-6 bg-white rounded-lg shadow-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">{t.invoice}</h1>
          <Button variant="common" href="/students/bills/createInvoice">{t.createInvoice}</Button>
        </div>

        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <label className="text-gray-500 font-medium flex-1 min-w-[180px]">
            Student Name
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            Invoice Number
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            Status
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            From
          </label>
          <label className="text-gray-500 font-medium flex-1 min-w-[150px]">
            To
          </label>
        </div>

        {/* filter */}
        <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
          <Autocomplete className="flex-1 min-w-[180px] border border-gray-300 rounded-md">
            {studentName.map((item) => (
              <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <Autocomplete className="flex-1 min-w-[150px] border border-gray-300 rounded-md">
            {invoiceNumber.map((item) => (
              <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
            ))}
          </Autocomplete>

          <Autocomplete className="flex-1 min-w-[150px] border border-gray-300 rounded-md">
            {status.map((item) => (
              <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>
            ))}
          </Autocomplete>
          <DatePicker
            className="flex-1 min-w-[150px] border border-gray-300 rounded-md"
            aria-label="from"
          />
          <DatePicker
            className="flex-1 min-w-[150px] border border-gray-300 rounded-md"
            aria-label="to"
          />
        </div>

        {/* Invoice List Table */}
        <div className="overflow-x-auto bg-white shadow-sm mt-6">
          <table className="w-full text-left border-collapse border-gray-300">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Creat date</th>
                <th className="px-4 py-2">Number</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Amount due</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  {/* Status */}
                  <td className="px-4 py-2">
                     <span
                        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-sm min-w-[80px] text-center ${
                          statusColors[inv.status] || "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {inv.status}
                      </span>
                  </td>

                  <td className="px-4 py-2">{inv.date}</td>
                  <td className="px-4 py-2">{inv.number}</td>
                  <td className="px-4 py-2">{inv.customer}</td>
                  <td className="px-4 py-2">{inv.total}</td>
                  <td className="px-4 py-2">{inv.due}</td>

                  {/* Actions */}
                  <td className="px-4 py-2 text-sm">
                    <Button size="xs" variant="common">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
