// Environment configuration for S3 and other services

export const ENV_CONFIG = {
  S3: {
    BUCKET_NAME:
      process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET || "",
    REGION: process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "",
    BASE_URL: `https://${
      process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET || ""
    }.s3.${
      process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || ""
    }.amazonaws.com`,
  },
  API: {
    BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://api.englishkorat.site/api/v1",
  },
  IMAGE: {
    // Image quality settings for Next.js Image Optimization
    QUALITY: {
      AVATAR: 95, // Avatar images - high quality
      COVER: 90, // Cover images - high quality
      THUMBNAIL: 85, // Thumbnails - good quality
      BACKGROUND: 80, // Background images - standard quality
      DEFAULT: 90, // Default quality for all images
    },
    // Image sizes for optimization
    SIZES: {
      AVATAR_SM: 40,
      AVATAR_MD: 64,
      AVATAR_LG: 128,
      COVER_SM: 200,
      COVER_MD: 400,
      COVER_LG: 800,
      THUMBNAIL: 150,
    },
  },
} as const;

// Helper function to construct S3 URLs
export const getS3Url = (path: string | undefined): string | null => {
  if (!path) return null;
  // If path is already a full URL, return as is
  if (path.startsWith("http")) {
    return path;
  }
  // If BASE_URL is invalid, return a valid relative path
  if (
    !ENV_CONFIG.S3.BASE_URL ||
    ENV_CONFIG.S3.BASE_URL === "https://.s3..amazonaws.com"
  ) {
    return path.startsWith("/") ? path : `/${path}`;
  }
  // Otherwise, construct the full S3 URL
  return `${ENV_CONFIG.S3.BASE_URL}/${path}`;
};

/**
 * Image URL helpers with Next.js Image Optimization support
 * These functions ensure all images use Next.js Image component for optimal performance
 */

// Helper function to construct avatar URLs
export const getAvatarUrl = (avatar: string | undefined): string | null => {
  const url = getS3Url(avatar);
  // Validate constructed URL
  try {
    if (url) {
      new URL(url);
      return url;
    }
  } catch {
    return null;
  }
  return null;
};

// Helper function to construct cover image URLs
export const getCoverImageUrl = (
  coverImage: string | undefined
): string | null => {
  const url = getS3Url(coverImage);
  // Validate constructed URL
  try {
    if (url) {
      new URL(url);
      return url;
    }
  } catch {
    return null;
  }
  return null;
};

// Helper function to construct general image URLs
export const getImageUrl = (imagePath: string | undefined): string | null => {
  const url = getS3Url(imagePath);
  // Validate constructed URL
  try {
    if (url) {
      new URL(url);
      return url;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Get optimized image props for Next.js Image component
 * @param src - Image source URL
 * @param type - Image type (avatar, cover, thumbnail, background)
 * @param size - Optional specific size
 * @returns Object with src, width, height, and quality for Next.js Image
 */
export const getOptimizedImageProps = (
  src: string | undefined | null,
  type: "avatar" | "cover" | "thumbnail" | "background" | "default" = "default",
  size?: number
) => {
  let quality: number;
  let width: number;
  let height: number;

  // Determine quality based on type
  switch (type) {
    case "avatar":
      quality = ENV_CONFIG.IMAGE.QUALITY.AVATAR;
      width = size || ENV_CONFIG.IMAGE.SIZES.AVATAR_MD;
      height = size || ENV_CONFIG.IMAGE.SIZES.AVATAR_MD;
      break;
    case "cover":
      quality = ENV_CONFIG.IMAGE.QUALITY.COVER;
      width = size || ENV_CONFIG.IMAGE.SIZES.COVER_MD;
      height = size || ENV_CONFIG.IMAGE.SIZES.COVER_MD;
      break;
    case "thumbnail":
      quality = ENV_CONFIG.IMAGE.QUALITY.THUMBNAIL;
      width = size || ENV_CONFIG.IMAGE.SIZES.THUMBNAIL;
      height = size || ENV_CONFIG.IMAGE.SIZES.THUMBNAIL;
      break;
    case "background":
      quality = ENV_CONFIG.IMAGE.QUALITY.BACKGROUND;
      width = size || 1920;
      height = size || 1080;
      break;
    default:
      quality = ENV_CONFIG.IMAGE.QUALITY.DEFAULT;
      width = size || 400;
      height = size || 400;
  }

  return {
    src: src || "",
    width,
    height,
    quality,
  };
};
