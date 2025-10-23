"use client";

import ColorPicker from "@/components/common/ColorPicker";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { branchManagementService } from "@/services/branch-management.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function CreateBranchPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name_en: "",
    name_th: "",
    code: "",
    address: "",
    phone: "",
    type: "branch" as "main" | "branch",
    active: true,
    color: "#3B82F6", // Default blue color
    open_time: "08:00",
    close_time: "20:00",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Check permission
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        language === "th"
          ? "กรุณาเลือกไฟล์รูปภาพ"
          : "Please select an image file"
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(language === "th" ? "ไฟล์ใหญ่เกิน 10MB" : "File size exceeds 10MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        language === "th"
          ? "กรุณาเลือกไฟล์รูปภาพ"
          : "Please select an image file"
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(language === "th" ? "ไฟล์ใหญ่เกิน 10MB" : "File size exceeds 10MB");
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const createData = {
        name_en: formData.name_en,
        name_th: formData.name_th,
        code: formData.code,
        address: formData.address,
        phone: formData.phone,
        type: formData.type,
        active: formData.active,
        color: formData.color,
        open_time: formData.open_time + ":00",
        close_time: formData.close_time + ":00",
        logo: logoFile,
        banner: bannerFile,
      };

      await branchManagementService.createBranch(createData);

      // Redirect to branches list
      router.push("/settings/branches");
    } catch (err) {
      console.error("Error creating branch:", err);
      setError(
        language === "th" ? "ไม่สามารถสร้างสาขาได้" : "Failed to create branch"
      );
      setIsSaving(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return null;
  }

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.settings, href: "/settings" },
        {
          label: language === "th" ? "จัดการสาขา" : "Branch Management",
          href: "/settings/branches",
        },
        { label: language === "th" ? "สร้างสาขาใหม่" : "Create New Branch" },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "th" ? "สร้างสาขาใหม่" : "Create New Branch"}
              </h1>
              <p className="text-gray-600">
                {language === "th"
                  ? "กรอกข้อมูลสาขาใหม่พร้อมอัปโหลดโลโก้และแบนเนอร์"
                  : "Fill in branch details and upload logo and banner"}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push("/settings/branches")}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSaving}
              >
                {language === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? language === "th"
                    ? "กำลังสร้าง..."
                    : "Creating..."
                  : language === "th"
                  ? "สร้างสาขา"
                  : "Create Branch"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Logo & Banner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🏢</span>
              {language === "th" ? "โลโก้สาขา" : "Branch Logo"}
              <span className="ml-1 text-sm text-gray-500">
                ({language === "th" ? "ไม่บังคับ" : "Optional"})
              </span>
            </h3>

            {/* Logo Preview */}
            {logoPreview && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 mx-auto bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src={logoPreview}
                    alt="Logo Preview"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
                <p className="text-center text-sm text-blue-600 mt-2 font-medium">
                  {language === "th" ? "ตัวอย่างโลโก้" : "Logo Preview"}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === "th"
                    ? "คลิกเพื่อเลือกโลโก้"
                    : "Click to select logo"}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP (Max 10MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </label>

            {logoFile && (
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null);
                  setLogoPreview(null);
                }}
                className="mt-3 w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                {language === "th" ? "ลบโลโก้" : "Remove Logo"}
              </button>
            )}
          </div>

          {/* Banner Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🎨</span>
              {language === "th" ? "แบนเนอร์สาขา" : "Branch Banner"}
              <span className="ml-1 text-sm text-gray-500">
                ({language === "th" ? "ไม่บังคับ" : "Optional"})
              </span>
            </h3>

            {/* Banner Preview */}
            {bannerPreview && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-full h-32 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <Image
                    src={bannerPreview}
                    alt="Banner Preview"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm text-blue-600 mt-2 font-medium">
                  {language === "th" ? "ตัวอย่างแบนเนอร์" : "Banner Preview"}
                </p>
              </div>
            )}

            {/* Upload Button */}
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === "th"
                    ? "คลิกเพื่อเลือกแบนเนอร์"
                    : "Click to select banner"}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP (Max 10MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerSelect}
                className="hidden"
              />
            </label>

            {bannerFile && (
              <button
                type="button"
                onClick={() => {
                  setBannerFile(null);
                  setBannerPreview(null);
                }}
                className="mt-3 w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                {language === "th" ? "ลบแบนเนอร์" : "Remove Banner"}
              </button>
            )}
          </div>
        </div>

        {/* Branch Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {language === "th" ? "ข้อมูลสาขา" : "Branch Information"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name English */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "ชื่อ (อังกฤษ)" : "Name (English)"}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                required
                placeholder="Branch Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Name Thai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "ชื่อ (ไทย)" : "Name (Thai)"}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name_th"
                value={formData.name_th}
                onChange={handleInputChange}
                required
                placeholder="ชื่อสาขา"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "รหัสสาขา" : "Branch Code"}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="BR001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "เบอร์โทร" : "Phone Number"}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="02-123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "ประเภท" : "Type"}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="main">
                  {language === "th" ? "สำนักงานใหญ่" : "Main Office"}
                </option>
                <option value="branch">
                  {language === "th" ? "สาขา" : "Branch"}
                </option>
              </select>
            </div>

            {/* Branch Color */}
            <div>
              <ColorPicker
                color={formData.color}
                onChange={(color) =>
                  setFormData((prev) => ({ ...prev, color }))
                }
                label={language === "th" ? "สีประจำสาขา" : "Branch Color"}
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "สถานะ" : "Status"}
              </label>
              <div className="flex items-center space-x-4 mt-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-700">
                    {language === "th" ? "ใช้งาน" : "Active"}
                  </span>
                </label>
              </div>
            </div>

            {/* Open Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "เวลาเปิด" : "Opening Time"}
              </label>
              <input
                type="time"
                name="open_time"
                value={formData.open_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Close Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "เวลาปิด" : "Closing Time"}
              </label>
              <input
                type="time"
                name="close_time"
                value={formData.close_time}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Address (Full Width) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "th" ? "ที่อยู่" : "Address"}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                placeholder={
                  language === "th" ? "ที่อยู่สาขา..." : "Branch address..."
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </form>
    </SidebarLayout>
  );
}
