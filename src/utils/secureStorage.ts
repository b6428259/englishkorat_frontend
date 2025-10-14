import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

// Secret key for encryption (in production, this should come from environment variables)
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'englishkorat-secret-key-2024';
// Use a distinct client-only cookie name to avoid collision with backend cookies
const TOKEN_COOKIE_NAME = 'ek_auth_secure';
const TOKEN_EXPIRY_HOURS = 2;

export interface TokenData {
  token: string;
  expiresAt: number;
  userId?: string;
}

/**
 * Encrypt data using AES encryption
 */
const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Decrypt data using AES encryption
 */
const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Store encrypted token in secure cookie
 */
export const setSecureToken = (token: string, userId?: string): void => {
  const expiresAt = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000); // 2 hours from now

  const tokenData: TokenData = {
    token,
    expiresAt,
    userId
  };

  const encryptedData = encrypt(JSON.stringify(tokenData));

  Cookies.set(TOKEN_COOKIE_NAME, encryptedData, {
    expires: TOKEN_EXPIRY_HOURS / 24, // Convert hours to days for js-cookie
    httpOnly: false, // Note: js-cookie can't set httpOnly cookies from client-side
    secure: process.env.NODE_ENV === 'production', // Only use secure in production
  sameSite: 'strict',
  path: '/', // Ensure cookie is available across the entire site
  });
};

/**
 * Get decrypted token from secure cookie
 */
export const getSecureToken = (): string | null => {
  try {
  // Prefer new cookie; fallback to legacy name during migration
  const encryptedData = Cookies.get(TOKEN_COOKIE_NAME);

    if (!encryptedData) {
      return null;
    }

    const decryptedData = decrypt(encryptedData);
    const tokenData: TokenData = JSON.parse(decryptedData);

    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
      removeSecureToken();
      return null;
    }

    return tokenData.token;
  } catch (error) {
    console.error('Error retrieving secure token:', error);
  removeSecureToken(); // Remove corrupted token
    return null;
  }
};

/**
 * Remove token from secure cookie
 */
export const removeSecureToken = (): void => {
  Cookies.remove(TOKEN_COOKIE_NAME, {
    secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/', // Ensure removal across all paths
  });

};

/**
 * Check if token exists and is valid
 */
export const hasValidToken = (): boolean => {
  return getSecureToken() !== null;
};

/**
 * Get token expiration time
 */
export const getTokenExpiryTime = (): Date | null => {
  try {
  const encryptedData = Cookies.get(TOKEN_COOKIE_NAME);

    if (!encryptedData) {
      return null;
    }

    const decryptedData = decrypt(encryptedData);
    const tokenData: TokenData = JSON.parse(decryptedData);

    return new Date(tokenData.expiresAt);
  } catch (error) {
    console.error('Error retrieving token expiry time:', error);
    return null;
  }
};

/**
 * Check if token will expire soon (within 15 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
  const expiryTime = getTokenExpiryTime();
  if (!expiryTime) return false;

  const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
  return expiryTime.getTime() - Date.now() < fifteenMinutes;
};
