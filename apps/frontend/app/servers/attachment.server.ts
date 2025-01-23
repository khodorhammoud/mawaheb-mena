import { eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import { attachmentsTable } from "~/db/drizzle/schemas/schema";

/**
 * Save attachment metadata to the database
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
      .returning();

    return attachment;
  } catch (error: any) {
    if (error.code === "23505") {
      throw new Error("Attachment with this key already exists.");
    }
    console.error("Error saving attachment:", error);
    throw new Error("Failed to save attachment metadata.");
  }
}

export async function getAttachmentByKey(key: string) {
  try {
    const [attachment] = await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.key, key));

    if (!attachment) {
      throw new Error(`Attachment with key ${key} not found.`);
    }

    const fileExtension = attachment.key.split(".").pop()?.toLowerCase() || "";
    let icon = "default";

    if (["png", "jpg", "jpeg", "gif", "bmp"].includes(fileExtension)) {
      icon = "image";
    } else if (["mp4", "mov", "avi", "mkv"].includes(fileExtension)) {
      icon = "video";
    } else if (fileExtension === "pdf") {
      icon = "pdf";
    }

    return {
      id: attachment.id,
      url: attachment.url,
      icon, // Include icon
    };
  } catch (error) {
    console.error(`Error fetching attachment with key ${key}:`, error);
    throw new Error("Failed to retrieve attachment.");
  }
}
