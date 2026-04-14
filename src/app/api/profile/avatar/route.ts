import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";
import { getCloudinaryUploadConfig } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Profile image file is required" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, and WEBP images are allowed" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image size must be 5MB or less" }, { status: 400 });
  }

  const cloudinary = getCloudinaryUploadConfig();
  if (!cloudinary) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", cloudinary.apiKey);
  uploadForm.append("timestamp", cloudinary.timestamp);
  uploadForm.append("folder", cloudinary.folder);
  uploadForm.append("signature", cloudinary.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadForm,
    }
  );

  const uploadData = (await uploadResponse.json()) as { secure_url?: string; error?: { message?: string } };
  if (!uploadResponse.ok || !uploadData.secure_url) {
    return NextResponse.json(
      { error: uploadData.error?.message || "Failed to upload profile image" },
      { status: 502 }
    );
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      avatar: uploadData.secure_url,
      updatedAt: new Date(),
    })
    .where(eq(users.id, sessionUser.id))
    .returning({
      avatar: users.avatar,
    });

  return NextResponse.json({
    success: true,
    avatar: updatedUser?.avatar ?? uploadData.secure_url,
  });
}
