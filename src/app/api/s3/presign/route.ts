import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

// Simple presign endpoint for S3 objects. Call with: /api/s3/presign?key=borrowable-items/1/cover-image/...
// Security: this implementation performs a minimal whitelist check to only allow keys under
// `borrowable-items/` to reduce abuse. Adjust as needed for your app.

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Missing `key` query parameter" },
        { status: 400 }
      );
    }

    // Basic validation: restrict to borrowable-items path to avoid arbitrary file access
    if (!key.startsWith("borrowable-items/")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || process.env.S3_BUCKET;
    const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION;

    if (!bucket || !region) {
      return NextResponse.json(
        { error: "S3 bucket/region not configured" },
        { status: 500 }
      );
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    const client = new S3Client(
      accessKeyId && secretAccessKey
        ? { region, credentials: { accessKeyId, secretAccessKey } }
        : { region }
    );

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    // Signed URL validity (seconds) — tune as needed
    const presignedUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 60,
    });

    return NextResponse.json({ url: presignedUrl });
  } catch (err: unknown) {
    console.error("Presign error", err);
    let message: string;
    try {
      if (typeof err === "string") message = err;
      else message = JSON.stringify(err);
    } catch {
      message = String(err);
    }
    return NextResponse.json({ error: message || "unknown" }, { status: 500 });
  }
}
