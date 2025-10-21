export async function getPresignedUrl(key: string): Promise<string | null> {
  try {
    const url = `/api/s3/presign?key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.url ?? null;
  } catch (e) {
    console.error("getPresignedUrl error", e);
    return null;
  }
}
