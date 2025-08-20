// Environment configuration for S3 and other services

export const ENV_CONFIG = {
  S3: {
    BUCKET_NAME: process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET || '',
    REGION: process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || '',
    BASE_URL: `https://${process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET || ''}.s3.${process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || ''}.amazonaws.com`,
  },
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
  }
} as const;

// Helper function to construct S3 URLs
export const getS3Url = (path: string | undefined): string | null => {
  if (!path) return null;
  
  // If path is already a full URL, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, construct the full S3 URL
  return `${ENV_CONFIG.S3.BASE_URL}/${path}`;
};

// Helper function to construct avatar URLs specifically
export const getAvatarUrl = (avatar: string | undefined): string | null => {
  return getS3Url(avatar);
};
