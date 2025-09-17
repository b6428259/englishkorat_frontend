"use client";

import React from "react";
import { DatePicker } from "@heroui/react";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import Input from "@/components/common/Input";

export default function CreateInvoicePage() {
  const { t } = useLanguage();

  return (
    <SidebarLayout breadcrumbItems={[{ label: t.createInvoice }]}>
      <div className="p-6 space-y-6 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-black">{t.createInvoice}</h1>

        {/* Header */}
        <div className="grid grid-cols-2 gap-6 mb-6 border border-gray-300 rounded-lg p-4 shadow-md">
          {/* Column 1 (ซ้าย) */}
          <div className="flex flex-col gap-4">
            {/* Student Name */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-black font-medium">
                {t.studentName}
              </label>
              <Input
                placeholder="Type a student name"
                className="common-input flex-1"
              />
            </div>

            {/* Student ID */}
            <div className="flex items-center gap-4">
              <label className="w-32 text-black font-medium">
                {t.studentID}
              </label>
              <Input
                placeholder="Type a student ID"
                className="common-input flex-1"
              />
            </div>
          </div>

          {/* Column 2 (ขวา) */}
          <div className="flex flex-col gap-4">
            {/* Invoice Number */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-black font-medium text-right">
                {t.invoiceNumber}
              </label>
              <Input
                placeholder="Type an invoice number"
                className="common-input flex-1"
                value="0001"
                readOnly
              />
            </div>

            {/* Invoice Date */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-black font-medium text-right">
                {t.invoiceDate}
              </label>
              <DatePicker className="common-input flex-1 border border-gray-300 rounded-md" />
            </div>

            {/* Payment Due */}
            <div className="flex items-center gap-4">
              <label className="w-40 text-black font-medium text-right">
                {t.paymentDue}
              </label>
              <DatePicker className="common-input flex-1 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="w-full mb-6 border border-gray-300 rounded-lg p-4 shadow-md">
  <div className="overflow-x-auto">
    <table className="w-full table-fixed border-collapse">
      <thead>
        <tr className="bg-gray-100 text-sm text-gray-700">
          <th className="px-4 py-2 text-left w-[40%]">{t.item}</th>
          <th className="px-4 py-2 text-center w-[15%]">{t.quantity}</th>
          <th className="px-4 py-2 text-right w-[20%]">{t.price}</th>
          <th className="px-4 py-2 text-right w-[20%]">{t.amount}</th>
          <th className="px-4 py-2 text-center w-[5%]">{t.actions}</th>
        </tr>
      </thead>

      <tbody>
        <tr className="border-t">
          {/* Item */}
          <td className="px-4 py-2 align-top">
            <Input
              placeholder="Service name"
              className="common-input w-full mb-2"
            />
            <Input
              placeholder="Description"
              className="common-input w-full"
            />
          </td>

          {/* Quantity */}
          <td className="px-4 py-2 text-center align-top">
            <Input
              type="number"
              defaultValue={1}
              className="common-input w-full text-center"
            />
          </td>

          {/* Price */}
          <td className="px-4 py-2 text-right align-top">
            <Input
              type="number"
              defaultValue={0}
              className="common-input w-full text-right"
            />
          </td>

          {/* Amount */}
          <td className="px-4 py-2 text-right font-medium text-gray-800 align-top">
            ฿0.00
          </td>

          {/* Action */}
          <td className="px-4 py-2 text-center align-top">
            <button className="text-red-500 hover:text-red-700">🗑</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

      </div>
    </SidebarLayout>
  );
}
