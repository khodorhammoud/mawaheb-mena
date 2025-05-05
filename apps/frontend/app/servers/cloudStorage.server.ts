import { Storage } from '@google-cloud/storage';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@mawaheb/db/server';
import { attachmentsTable } from '@mawaheb/db';
import { eq } from 'drizzle-orm';

// Google Cloud Functions 👇👇

function getStorage() {
  return new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: JSON.parse(process.env.GOOGLE_STORAGE_APPLICATION_CREDENTIALS!),
  });
}

const formatDateWithMilliseconds = () => {
  return new Date().toISOString().replace(/[-:.TZ]/g, '');
};

export async function getFileFromBucket(fileName: string) {
  const storage = getStorage();
  const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME!;

  const [url] = await storage
    .bucket(bucketName)
    .file(fileName)
    .getSignedUrl({
      version: 'v4',
      action: 'read',
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
    blobStream.on('error', err => {
      console.error('Error writing to Google Cloud Storage:', err);
      reject(err);
    });

    blobStream.on('finish', () => {
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
    console.error('Error deleting file from Google Cloud Storage:', error);
    throw new Error('Failed to delete file from Google Cloud Storage.');
  }
}

// Google Cloud Functions 👆👆

// AWS S3 functions 👇👇

// Initialize the S3 client only when needed
let s3Client: S3Client;

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

/**
 * Upload a file to S3 bucket
 * @param prefix - Prefix for the file (e.g., folder or context identifier)
 * @param file - File object to upload
 * @returns { key, bucket }
 */
export async function uploadFileToS3(prefix: string, file: File) {
  const bucketName = process.env.S3_PRIVATE_BUCKET_NAME; // Use the private bucket
  if (!bucketName) {
    throw new Error('S3_PRIVATE_BUCKET_NAME is not defined in the environment variables.');
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
    await getS3Client().send(new PutObjectCommand(uploadParams));
    return {
      key: fileKey,
      bucket: bucketName,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3.');
  }
}

/**
 * Get a pre-signed URL for a file in S3
 * @param fileKey - Key of the file in S3
 * @param expiration - URL validity duration in seconds (default 3600 seconds)
 * @returns Pre-signed URL
 */
export async function getFileFromS3(fileKey: string, expiration = 3600): Promise<string> {
  const getParams = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileKey,
  };

  try {
    const signedUrl = await getSignedUrl(getS3Client(), new GetObjectCommand(getParams), {
      expiresIn: expiration,
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL from S3:', error);
    throw new Error('Failed to generate signed URL.');
  }
}

/**
 * Delete a file from S3
 * @param bucket - Name of the S3 bucket
 * @param key - Key of the file in S3
 */
export async function deleteFileFromS3(bucket: string, key: string): Promise<void> {
  if (!bucket) {
    throw new Error('Bucket name is missing.');
  }

  if (!key) {
    throw new Error('File key is missing.');
  }

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await getS3Client().send(command);
  } catch (error) {
    console.error(`Error deleting file from S3: ${key}`, error);
    throw new Error('Failed to delete file from S3.');
  }
}

/**
 * Generate a signed URL for secure access to a file in a private S3 bucket
 * @param fileKey - Key of the file in S3
 * @param expiration - URL validity duration in seconds (default 60 seconds)
 * @returns Pre-signed URL
 */
export const generatePresignedUrl = async (fileKey: string, expiration = 60): Promise<string> => {
  const params = {
    Bucket: process.env.S3_PRIVATE_BUCKET_NAME!,
    Key: fileKey,
    Expires: expiration, // URL validity duration in seconds
  };

  try {
    const signedUrl = await getSignedUrl(getS3Client(), new GetObjectCommand(params));
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL from S3:', error);
    throw error;
  }
};

export const getAttachmentSignedURL = async (fileKey: string): Promise<string> => {
  if (!fileKey) {
    throw new Error('File key is required to generate a signed URL.');
  }

  try {
    // Reuse the generatePresignedUrl utility function here
    return await generatePresignedUrl(fileKey, 3600); // Expiration set to 1 hour
  } catch (error) {
    console.error('Error generating signed URL from S3:', error);
    throw new Error('Failed to generate signed URL.');
  }
};

// AWS S3 functions 👆👆

// functions for both cloud and s3 👇👇

const isGoogleCloud = process.env.STORAGE_PROVIDER === 'google';

/**
 * Unified upload function
 * @param prefix - Prefix for the file
 * @param file - File object to upload
 * @returns { key, bucket, url }
 */
export async function uploadFile(prefix: string, file: File) {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error('Invalid file provided to uploadFile');
  }

  // Create a consistent key format that includes the original filename
  const fileKey = `${prefix}-${file.name}`;

  if (isGoogleCloud) {
    // For Google Cloud, we need to modify how we call uploadFileToBucket
    // to ensure it uses our consistent key format
    const storage = getStorage();
    const bucketName = process.env.GOOGLE_STORAGE_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const blob = bucket.file(fileKey);

    // Upload the file with our consistent key
    const uploadResult = await new Promise<{ fileName: string; url: string }>((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.type,
        },
      });

      blobStream.on('error', err => {
        console.error('Error writing to Google Cloud Storage:', err);
        reject(err);
      });

      blobStream.on('finish', () => {
        resolve({
          fileName: fileKey,
          url: blob.publicUrl(),
        });
      });

      blobStream.end(fileBuffer);
    });

    return {
      key: uploadResult.fileName,
      bucket: bucketName,
      url: uploadResult.url,
    };
  } else {
    // For S3, modify the uploadFileToS3 call to use our consistent key format
    const bucketName = process.env.S3_PRIVATE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('S3_PRIVATE_BUCKET_NAME is not defined in the environment variables.');
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
    };

    try {
      await getS3Client().send(new PutObjectCommand(uploadParams));
      const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      return { key: fileKey, bucket: bucketName, url };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3.');
    }
  }
}

export async function deleteFile(bucket: string, key: string): Promise<void> {
  try {
    if (isGoogleCloud) {
      // Use Google Cloud-specific delete logic
      await deleteFileFromBucket(key);
    } else {
      // Use S3 delete logic
      const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await getS3Client().send(command);
    }
  } catch (error) {
    console.error(
      `Error deleting file from ${isGoogleCloud ? 'Google Cloud' : 'S3'}: ${key}`,
      error
    );
    throw new Error(`Failed to delete file from ${isGoogleCloud ? 'Google Cloud' : 'S3'}.`);
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

/**
 * Saves a file's metadata to the attachments table
 * @param file The file to save
 * @param prefix The prefix to use for the file (e.g., 'identification', 'trade_license')
 * @returns The ID of the saved attachment
 */
export async function saveAttachment(file: File, prefix: string) {
  try {
    if (!file || !(file instanceof File) || file.size === 0) {
      console.error('Invalid file provided to saveAttachment');
      return { success: false, error: 'Invalid file' };
    }

    // Create a consistent key format that includes the original filename
    const fileKey = `${prefix}-${file.name}`;

    // Check if an attachment with the same key already exists
    const existingAttachment = await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.key, fileKey))
      .limit(1);

    // First upload the file to cloud storage using the existing function
    // Use a consistent key format that includes the original filename
    const uploadResult = await uploadFile(prefix, file);

    // Create the metadata object with file info and storage details
    const metadata = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      storage: {
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        url: uploadResult.url,
      },
    };

    let result;

    // If an attachment with the same key exists, update it
    if (existingAttachment.length > 0) {
      result = await db
        .update(attachmentsTable)
        .set({
          metadata: metadata,
          updatedAt: new Date(),
        } as any)
        .where(eq(attachmentsTable.id, existingAttachment[0].id))
        .returning();
    } else {
      // Otherwise, create a new attachment
      result = await db
        .insert(attachmentsTable)
        .values({
          key: fileKey, // Use consistent key format
          metadata: metadata,
        } as any)
        .returning();
    }

    if (!result.length) {
      throw new Error('Failed to save attachment');
    }

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('Error saving attachment:', error);
    return { success: false, error };
  }
}

/**
 * Saves multiple files to the attachments table
 * @param files Array of files to save
 * @param prefix The prefix to use for the files
 * @returns Array of attachment IDs
 */
export async function saveAttachments(files: File[], prefix: string) {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return { success: true, data: [] };
    }

    // Filter out invalid files
    const validFiles = files.filter(file => file instanceof File && file.size > 0);

    if (validFiles.length === 0) {
      return { success: true, data: [] };
    }

    // Process files one by one to ensure proper handling of duplicates
    const results = [];
    for (const file of validFiles) {
      const result = await saveAttachment(file, prefix);

      if (result.success && result.data) {
        results.push(result.data.id);
      }
    }

    return { success: true, data: results };
  } catch (error) {
    console.error('Error saving attachments:', error);
    return { success: false, error };
  }
}

/**
 * Gets attachment metadata by ID
 * @param id The attachment ID
 * @returns The attachment metadata
 */
export async function getAttachmentMetadataById(id: number) {
  try {
    const attachment = await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, id))
      .limit(1);

    if (attachment.length > 0) {
      return { success: true, data: attachment[0].metadata };
    }

    return { success: false, error: 'Attachment not found' };
  } catch (error) {
    console.error('Error getting attachment metadata:', error);
    return { success: false, error };
  }
}
