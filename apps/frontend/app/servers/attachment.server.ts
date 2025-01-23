import { db } from "~/db/drizzle/connector";
import { attachmentsTable } from "~/db/drizzle/schemas/schema";

// Database Logic for Saving Attachments 👇👇
// Database Logic for Saving Attachments 👇👇

/**
 * Save attachment metadata to the database
 * @param key - The unique key for the file in S3 or Google Cloud
 * @param bucket - The name of the storage bucket
 * @param url - The public or signed URL for the file
 * @param metadata - Optional metadata for the file (e.g., fileSize, contentType)
 * @returns The inserted attachment record
 */
export async function saveAttachment(
  key: string,
  bucket: string,
  url: string,
  metadata?: { fileSize?: number; contentType?: string }
) {
  if (!key || !bucket || !url) {
    throw new Error(
      "Invalid attachment metadata. 'key', 'bucket', and 'url' are required."
    );
  }

  try {
    const [attachment] = await db
      .insert(attachmentsTable)
      .values({
        key,
        bucket,
        url,
        ...(metadata && { metadata: JSON.stringify(metadata) }),
      })
      .returning(); // Return the inserted row

    return attachment;
  } catch (error: any) {
    if (error.code === "23505") {
      // Handle unique constraint violation (PostgreSQL specific)
      throw new Error("Attachment with this key already exists.");
    }
    console.error("Error saving attachment:", error);
    throw new Error("Failed to save attachment metadata.");
  }
}
// Database Logic for Saving Attachments 👆👆
// Database Logic for Saving Attachments 👆👆
