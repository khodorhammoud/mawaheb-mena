import { Storage } from "@google-cloud/storage";
function getStorage() {
  const storage = new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: JSON.parse(process.env.GOOGLE_STORAGE_APPLICATION_CREDENTIALS),
  });
  return storage;
}

// format the date in YYYY-MM-DDTHH:mm:ss format and then concatenated with milliseconds.
const formatDateWithMilliseconds = () => {
  const now = new Date();
  const dateString = now
    .toLocaleString("sv", { timeZoneName: "short" })
    .replace(/[-:T\s]/g, "")
    .slice(0, 14);
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  return `${dateString}${milliseconds}`;
};

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

export async function uploadFileToBucket(prefix: string, file: File) {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME;
  const bucket = storage.bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  // generate a unique file name to avoid conflicts, format: ${prefix}-${date formatted as YYYYMMDDHHmmss}
  const fileNameWithHash = `${prefix}-${formatDateWithMilliseconds()}`;
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
