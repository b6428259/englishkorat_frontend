"use client";

import { branchService } from "@/services/branch.service";
import { BranchBanner, BranchLogo } from "@/types/branch.types";
import Image from "next/image";
import React, { useRef, useState } from "react";

interface BranchBrandingUploadProps {
  branchId: number;
  currentLogo: BranchLogo | null;
  currentBanner: BranchBanner | null;
  onLogoUpdate: (logo: BranchLogo | null) => void;
  onBannerUpdate: (banner: BranchBanner | null) => void;
}

export default function BranchBrandingUpload({
  branchId,
  currentLogo,
  currentBanner,
  onLogoUpdate,
  onBannerUpdate,
}: BranchBrandingUploadProps) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo Upload
  const handleLogoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLogoError(null);
    setIsUploadingLogo(true);

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) {
      setLogoError(
        "Only image files are allowed (jpg, jpeg, png, gif, webp, bmp)"
      );
      setIsUploadingLogo(false);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setLogoError("File size must be less than 10MB");
      setIsUploadingLogo(false);
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Upload
      const response = await branchService.uploadLogo(branchId, file);
      onLogoUpdate(response.logo);

      // Clean up
      URL.revokeObjectURL(previewUrl);
      setLogoPreview(null);

      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      setLogoError(
        error instanceof Error ? error.message : "Failed to upload logo"
      );

      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle Banner Upload
  const handleBannerSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBannerError(null);
    setIsUploadingBanner(true);

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!validTypes.includes(file.type)) {
      setBannerError(
        "Only image files are allowed (jpg, jpeg, png, gif, webp, bmp)"
      );
      setIsUploadingBanner(false);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setBannerError("File size must be less than 10MB");
      setIsUploadingBanner(false);
      return;
    }

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);

      // Upload
      const response = await branchService.uploadBanner(branchId, file);
      onBannerUpdate(response.banner);

      // Clean up
      URL.revokeObjectURL(previewUrl);
      setBannerPreview(null);

      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      setBannerError(
        error instanceof Error ? error.message : "Failed to upload banner"
      );

      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
        setBannerPreview(null);
      }
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handle Logo Delete
  const handleDeleteLogo = async () => {
    if (!currentLogo || !confirm("Are you sure you want to delete the logo?"))
      return;

    setLogoError(null);
    setIsUploadingLogo(true);

    try {
      await branchService.deleteLogo(branchId);
      onLogoUpdate(null);
    } catch (error) {
      console.error("Error deleting logo:", error);
      setLogoError(
        error instanceof Error ? error.message : "Failed to delete logo"
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle Banner Delete
  const handleDeleteBanner = async () => {
    if (
      !currentBanner ||
      !confirm("Are you sure you want to delete the banner?")
    )
      return;

    setBannerError(null);
    setIsUploadingBanner(true);

    try {
      await branchService.deleteBanner(branchId);
      onBannerUpdate(null);
    } catch (error) {
      console.error("Error deleting banner:", error);
      setBannerError(
        error instanceof Error ? error.message : "Failed to delete banner"
      );
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🏢</span>
            Branch Logo
          </h3>
          <p className="text-sm text-gray-600">
            Upload your branch logo. Recommended size: 200x200px or square ratio
            (Max: 10MB)
          </p>
        </div>

        {/* Current Logo Display */}
        {currentLogo && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src={currentLogo.logo_url}
                    alt="Branch Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Current Logo</p>
                  <p className="text-sm text-blue-600">
                    {(currentLogo.file_size / 1024).toFixed(2)} KB •{" "}
                    {currentLogo.mime_type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteLogo}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                disabled={isUploadingLogo}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        )}

        {/* Logo Upload Area */}
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
            isUploadingLogo
              ? "opacity-50 pointer-events-none"
              : "hover:border-blue-400"
          }`}
        >
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
            onChange={handleLogoSelect}
            className="hidden"
            disabled={isUploadingLogo}
          />

          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {isUploadingLogo ? (
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <span className="text-2xl">🖼️</span>
              )}
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {isUploadingLogo
                ? "Uploading..."
                : currentLogo
                ? "Update Logo"
                : "Upload Logo"}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Click to select an image file
            </p>
          </div>

          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            disabled={isUploadingLogo}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isUploadingLogo ? "Uploading..." : "Choose File"}
          </button>

          <div className="mt-4 text-xs text-gray-500">
            <p>Supported formats: JPG, PNG, GIF, WebP, BMP</p>
            <p>Recommended: Square ratio (200x200px)</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>

        {/* Logo Error Display */}
        {logoError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start space-x-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div>
                <p className="font-medium text-red-800">Upload Error</p>
                <p className="text-sm text-red-600">{logoError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Banner Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2">🎨</span>
            Branch Banner
          </h3>
          <p className="text-sm text-gray-600">
            Upload your branch banner. Recommended size: 1920x400px or 16:9
            ratio (Max: 10MB)
          </p>
        </div>

        {/* Current Banner Display */}
        {currentBanner && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex flex-col space-y-4">
              <div className="w-full rounded-lg border-2 border-gray-200 overflow-hidden">
                <Image
                  src={currentBanner.banner_url}
                  alt="Branch Banner"
                  width={800}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-900">Current Banner</p>
                  <p className="text-sm text-purple-600">
                    {(currentBanner.file_size / 1024).toFixed(2)} KB •{" "}
                    {currentBanner.mime_type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteBanner}
                  className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  disabled={isUploadingBanner}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner Upload Area */}
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
            isUploadingBanner
              ? "opacity-50 pointer-events-none"
              : "hover:border-purple-400"
          }`}
        >
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
            onChange={handleBannerSelect}
            className="hidden"
            disabled={isUploadingBanner}
          />

          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {isUploadingBanner ? (
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              ) : (
                <span className="text-2xl">🖼️</span>
              )}
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {isUploadingBanner
                ? "Uploading..."
                : currentBanner
                ? "Update Banner"
                : "Upload Banner"}
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Click to select an image file
            </p>
          </div>

          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={isUploadingBanner}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {isUploadingBanner ? "Uploading..." : "Choose File"}
          </button>

          <div className="mt-4 text-xs text-gray-500">
            <p>Supported formats: JPG, PNG, GIF, WebP, BMP</p>
            <p>Recommended: Wide ratio (1920x400px)</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>

        {/* Banner Error Display */}
        {bannerError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start space-x-2">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div>
                <p className="font-medium text-red-800">Upload Error</p>
                <p className="text-sm text-red-600">{bannerError}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
