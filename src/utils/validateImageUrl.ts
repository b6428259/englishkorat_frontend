// Utility to validate image URLs for Avatar
export function validateImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}
