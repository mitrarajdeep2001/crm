import { createHash } from "node:crypto";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

export function getCloudinaryUploadConfig() {
  const config = getCloudinaryConfig();
  if (!config) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "crm/profile";
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${config.apiSecret}`;
  const signature = createHash("sha1").update(signatureBase).digest("hex");

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    folder,
    signature,
  };
}
