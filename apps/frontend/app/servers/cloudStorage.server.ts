import { Storage } from "@google-cloud/storage";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Google Cloud Functions 👇👇

function getStorage() {
  return new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: JSON.parse(
      process.env.GOOGLE_STORAGE_APPLICATION_CREDENTIALS!
    ),
  });
}

const formatDateWithMilliseconds = () => {
  return new Date().toISOString().replace(/[-:.TZ]/g, "");
};

export async function getFileFromBucket(fileName: string) {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME!;

  const [url] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });
  return url;
}

// this is used in freelancer.server.ts in these 2 functions (updateFreelancerPortfolio and updateFreelancerCertificates)
export async function uploadFileToBucket(
  prefix: string,
  file: File
): Promise<{ fileName: string; url: string }> {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME!;
  const bucket = storage.bucket(bucketName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileNameWithHash = `${prefix}-${formatDateWithMilliseconds()}`;
  const blob = bucket.file(fileNameWithHash);

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.type,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      console.error("Error writing to Google Cloud Storage:", err);
      reject(err);
    });

    blobStream.on("finish", () => {
      resolve({
        fileName: fileNameWithHash,
        url: blob.publicUrl(),
      });
    });

    blobStream.end(fileBuffer);
  });
}

export async function deleteFileFromBucket(fileName: string) {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME!;
  try {
    await storage.bucket(bucketName).file(fileName).delete();
  } catch (error) {
    console.error("Error deleting file from Google Cloud Storage:", error);
    throw new Error("Failed to delete file from Google Cloud Storage.");
  }
}

// Google Cloud Functions 👆👆

// AWS S3 functions 👇👇

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload a file to S3 bucket
 * @param prefix - Prefix for the file (e.g., folder or context identifier)
 * @param file - File object to upload
 * @returns { key, bucket }
 */
export async function uploadFileToS3(prefix: string, file: File) {
  const bucketName = process.env.S3_PRIVATE_BUCKET_NAME; // Use the private bucket
  if (!bucketName) {
    throw new Error(
      "S3_PRIVATE_BUCKET_NAME is not defined in the environment variables."
    );
  }

  const fileKey = `${prefix}-${Date.now()}-${file.name}`; // Generate a unique key
  const fileBuffer = Buffer.from(await file.arrayBuffer()); // Use Buffer instead of stream

  const uploadParams = {
    Bucket: bucketName, // Use the private bucket name
    Key: fileKey,
    Body: fileBuffer, // Pass the buffer directly
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return {
      key: fileKey,
      bucket: bucketName,
    };
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw new Error("Failed to upload file to S3.");
  }
}

/**
 * Get a pre-signed URL for a file in S3
 * @param fileKey - Key of the file in S3
 * @param expiration - URL validity duration in seconds (default 3600 seconds)
 * @returns Pre-signed URL
 */
export async function getFileFromS3(
  fileKey: string,
  expiration = 3600
): Promise<string> {
  const getParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
  };

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(getParams),
      { expiresIn: expiration }
    );
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL from S3:", error);
    throw new Error("Failed to generate signed URL.");
  }
}

/**
 * Delete a file from S3
 * @param bucket - Name of the S3 bucket
 * @param key - Key of the file in S3
 */
export async function deleteFileFromS3(
  bucket: string,
  key: string
): Promise<void> {
  if (!bucket) {
    throw new Error("Bucket name is missing.");
  }

  if (!key) {
    throw new Error("File key is missing.");
  }

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    console.log("Deleting file from S3 with params:", params);
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log(`File deleted successfully from S3: ${key}`);
  } catch (error) {
    console.error(`Error deleting file from S3: ${key}`, error);
    throw new Error("Failed to delete file from S3.");
  }
}

/**
 * Generate a signed URL for secure access to a file in a private S3 bucket
 * @param fileKey - Key of the file in S3
 * @param expiration - URL validity duration in seconds (default 60 seconds)
 * @returns Pre-signed URL
 */
export const generatePresignedUrl = async (
  fileKey: string,
  expiration = 60
): Promise<string> => {
  const params = {
    Bucket: process.env.S3_PRIVATE_BUCKET_NAME!,
    Key: fileKey,
    Expires: expiration, // URL validity duration in seconds
  };

  try {
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand(params)
    );
    console.log("signedUrl", signedUrl);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL from S3:", error);
    throw error;
  }
};

// AWS S3 functions 👆👆

// functions for both cloud and s3 👇👇

const isGoogleCloud = process.env.STORAGE_PROVIDER === "google";

/**
 * Unified upload function
 * @param prefix - Prefix for the file
 * @param file - File object to upload
 * @returns { key, bucket, url }
 */
export async function uploadFile(prefix: string, file: File) {
  if (isGoogleCloud) {
    const uploadResult = await uploadFileToBucket(prefix, file);
    const key = uploadResult.fileName;
    const bucket = process.env.GOOGLE_STORAGE_BUCKET_NAME!;
    const url = uploadResult.url;

    return { key, bucket, url };
  } else {
    const uploadResult = await uploadFileToS3(prefix, file);
    const url = `https://${uploadResult.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadResult.key}`;
    return { key: uploadResult.key, bucket: uploadResult.bucket, url };
  }
}

export async function deleteFile(bucket: string, key: string): Promise<void> {
  try {
    console.log(`Deleting file from S3 - Bucket: ${bucket}, Key: ${key}`);
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await s3Client.send(command);
    console.log(`File deleted successfully from S3: ${key}`);
  } catch (error) {
    console.error(`Error deleting file from S3: ${key}`, error);
    throw new Error("Failed to delete file from S3.");
  }
}

export async function getFile(fileKey: string): Promise<string> {
  try {
    if (isGoogleCloud) {
      return await getFileFromBucket(fileKey);
    } else {
      return await getFileFromS3(fileKey);
    }
  } catch (error) {
    console.error(`Error fetching file: ${fileKey}`, error);
    throw new Error(`Failed to fetch file: ${fileKey}`);
  }
}

// functions for both cloud and s3 👆👆
