import { Storage } from "@google-cloud/storage";
import { hash } from "bcrypt-ts";
function getStorage() {
  const storage = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: JSON.parse(process.env.GOOGLE_STORAGE_APPLICATION_CREDENTIALS),
  });
  return storage;
}

export async function getFileFromBucket(fileName: string) {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME;

  const [url] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl({
      version: "v4",
      action: "read" as const,
      expires: Date.now() + 15 * 60 * 1000,
    });
  return url;
}

export async function uploadFileToBucket(fileName: string, file: File) {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME;
  const bucket = storage.bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  // generate a hash for the file name to avoid conflicts, created with hash and signature date
  const fileNameWithHash = `${hash(fileName, 10)}-${Date.now()}`;
  const blob = bucket.file(fileNameWithHash);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type,
    },
  });
  blobStream.end(fileBuffer);
  return {
    url: blob.publicUrl(),
    fileName: fileNameWithHash,
  };
}
