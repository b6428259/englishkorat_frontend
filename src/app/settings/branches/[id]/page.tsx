"use client";

import ColorPicker from "@/components/common/ColorPicker";
import SidebarLayout from "@/components/common/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { branchManagementService } from "@/services/branch-management.service";
import {
  Branch,
  BranchBanner,
  BranchLogo,
} from "@/types/branch-management.types";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function BranchDetailPage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const branchId = Number(params.id);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [logo, setLogo] = useState<BranchLogo | null>(null);
  const [banner, setBanner] = useState<BranchBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name_en: "",
    name_th: "",
    code: "",
    address: "",
    phone: "",
    type: "branch",
    active: true,
    color: "#3B82F6",
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

  // Load branch data
  useEffect(() => {
    if (branchId) {
      loadBranchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const loadBranchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await branchManagementService.getBranchById(branchId);
      setBranch(response.branch);
      setLogo(response.logo);
      setBanner(response.banner);

      // Extract time from ISO 8601 timestamp (e.g., "2025-10-02T08:00:00+07:00" -> "08:00")
      const extractTime = (timestamp: string) => {
        const timeRegex = /T(\d{2}:\d{2})/;
        const timeMatch = timeRegex.exec(timestamp);
        return timeMatch ? timeMatch[1] : "08:00";
      };

      // Populate form
      setFormData({
        name_en: response.branch.name_en,
        name_th: response.branch.name_th,
        code: response.branch.code,
        address: response.branch.address,
        phone: response.branch.phone,
        type: response.branch.type,
        active: response.branch.active,
        color: response.branch.color || "#3B82F6",
        open_time: extractTime(response.branch.open_time),
        close_time: extractTime(response.branch.close_time),
      });
    } catch (err) {
      console.error("Error loading branch:", err);
      setError(
        language === "th"
          ? "ไม่สามารถโหลดข้อมูลสาขาได้"
          : "Failed to load branch data"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
    setSuccessMessage(null);

    try {
      const updateData = {
        ...formData,
        open_time: formData.open_time + ":00",
        close_time: formData.close_time + ":00",
        logo: logoFile,
        banner: bannerFile,
      };

      await branchManagementService.updateBranchWithMedia(branchId, updateData);

      setSuccessMessage(
        language === "th" ? "บันทึกข้อมูลสำเร็จ" : "Branch updated successfully"
      );

      // Reload data
      await loadBranchData();

      // Clear file states
      setLogoFile(null);
      setLogoPreview(null);
      setBannerFile(null);
      setBannerPreview(null);
    } catch (err) {
      console.error("Error updating branch:", err);
      setError(
        language === "th"
          ? "ไม่สามารถบันทึกข้อมูลได้"
          : "Failed to update branch"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBranch = async () => {
    const confirmMessage =
      language === "th"
        ? `คุณแน่ใจหรือไม่ที่จะลบสาขา "${formData.name_th}"?`
        : `Are you sure you want to delete branch "${formData.name_en}"?`;

    if (!confirm(confirmMessage)) return;

    setIsSaving(true);
    setError(null);

    try {
      await branchManagementService.deleteBranch(branchId);
      router.push("/settings/branches");
    } catch (err) {
      console.error("Error deleting branch:", err);
      setError(
        language === "th" ? "ไม่สามารถลบสาขาได้" : "Failed to delete branch"
      );
      setIsSaving(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    return null;
  }

  if (isLoading) {
    return (
      <SidebarLayout
        breadcrumbItems={[{ label: t.settings, href: "/settings" }]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (error && !branch) {
    return (
      <SidebarLayout
        breadcrumbItems={[
          { label: t.settings, href: "/settings" },
          {
            label: language === "th" ? "จัดการสาขา" : "Branch Management",
            href: "/settings/branches",
          },
        ]}
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => router.push("/settings/branches")}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            {language === "th" ? "กลับ" : "Go Back"}
          </button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbItems={[
        { label: t.settings, href: "/settings" },
        {
          label: language === "th" ? "จัดการสาขา" : "Branch Management",
          href: "/settings/branches",
        },
        { label: language === "th" ? formData.name_th : formData.name_en },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {language === "th" ? "แก้ไขข้อมูลสาขา" : "Edit Branch"}
              </h1>
              <p className="text-gray-600">{formData.code}</p>
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
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? language === "th"
                    ? "กำลังบันทึก..."
                    : "Saving..."
                  : language === "th"
                  ? "บันทึก"
                  : "Save"}
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

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
            </h3>

            {/* Current Logo */}
            {(logo || logoPreview) && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 mx-auto bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src={logoPreview || logo!.logo_url}
                    alt="Logo"
                    width={128}
                    height={128}
                    className="object-contain"
                  />
                </div>
                {logoPreview && (
                  <p className="text-center text-sm text-blue-600 mt-2 font-medium">
                    {language === "th"
                      ? "ภาพใหม่ (ยังไม่บันทึก)"
                      : "New Image (Not Saved)"}
                  </p>
                )}
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
          </div>

          {/* Banner Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🎨</span>
              {language === "th" ? "แบนเนอร์สาขา" : "Branch Banner"}
            </h3>

            {/* Current Banner */}
            {(banner || bannerPreview) && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-full h-32 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <Image
                    src={bannerPreview || banner!.banner_url}
                    alt="Banner"
                    width={400}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                {bannerPreview && (
                  <p className="text-center text-sm text-blue-600 mt-2 font-medium">
                    {language === "th"
                      ? "ภาพใหม่ (ยังไม่บันทึก)"
                      : "New Image (Not Saved)"}
                  </p>
                )}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                onChange={(color: string) =>
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
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            {language === "th" ? "โซนอันตราย" : "Danger Zone"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {language === "th"
              ? "การลบสาขานี้จะไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ"
              : "Deleting this branch is irreversible. Please be certain before proceeding."}
          </p>
          <button
            type="button"
            onClick={handleDeleteBranch}
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === "th" ? "ลบสาขา" : "Delete Branch"}
          </button>
        </div>
      </form>
    </SidebarLayout>
  );
}
