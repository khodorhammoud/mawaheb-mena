// import { eq, and, not, desc } from "drizzle-orm";
// import { db } from "~/db/drizzle/connector";
// import { attachmentsTable } from "~/db/drizzle/schemas/schema";
// import { AttachmentBelongsTo } from "~/types/enums";

// export async function saveAttachment(
//   key: string,
//   bucket: string,
//   url: string,
//   belongsTo: AttachmentBelongsTo,
//   componentId: number,
//   fieldId: number, // Include fieldId to distinguish fields
//   metadata?: { fileSize?: number; contentType?: string }
// ) {
//   if (!key || !bucket || !url || !belongsTo || !componentId || !fieldId) {
//     throw new Error(
//       "Invalid attachment metadata. 'key', 'bucket', 'url', 'belongsTo', 'componentId', and 'fieldId' are required."
//     );
//   }

//   try {
//     const [attachment] = await db
//       .insert(attachmentsTable)
//       .values({
//         key,
//         bucket,
//         url,
//         belongsTo,
//         componentId,
//         fieldId, // Save fieldId
//         ...(metadata && { metadata: JSON.stringify(metadata) }),
//       })
//       .returning();

//     return attachment;
//   } catch (error: any) {
//     console.error("Error saving attachment:", error);
//     if (error.code === "23505") {
//       throw new Error("Attachment with this key already exists.");
//     }
//     throw new Error("Failed to save attachment metadata.");
//   }
// }

// export async function getAttachmentByKey(key: string) {
//   try {
//     const [attachment] = await db
//       .select()
//       .from(attachmentsTable)
//       .where(eq(attachmentsTable.key, key));

//     if (!attachment) {
//       throw new Error(`Attachment with key ${key} not found.`);
//     }

//     const fileExtension = attachment.key.split(".").pop()?.toLowerCase() || "";
//     let icon = "default";

//     if (["png", "jpg", "jpeg", "gif", "bmp"].includes(fileExtension)) {
//       icon = "image";
//     } else if (["mp4", "mov", "avi", "mkv"].includes(fileExtension)) {
//       icon = "video";
//     } else if (fileExtension === "pdf") {
//       icon = "pdf";
//     }

//     return {
//       id: attachment.id,
//       url: attachment.url,
//       icon, // Include icon
//     };
//   } catch (error) {
//     console.error(`Error fetching attachment with key ${key}:`, error);
//     throw new Error("Failed to retrieve attachment.");
//   }
// }

// export async function deletePreviousAttachment(
//   belongsTo: AttachmentBelongsTo,
//   componentId: number,
//   fieldId: number, // Include fieldId to target specific field
//   excludeKey: string
// ): Promise<void> {
//   try {
//     await db.delete(attachmentsTable).where(
//       and(
//         eq(attachmentsTable.belongsTo, belongsTo),
//         eq(attachmentsTable.componentId, componentId),
//         eq(attachmentsTable.fieldId, fieldId), // Delete only for the specific field
//         not(eq(attachmentsTable.key, excludeKey))
//       )
//     );
//   } catch (error) {
//     console.error("Error deleting previous attachment:", error);
//     throw new Error("Failed to delete previous attachment.");
//   }
// }

// export async function getPreviousAttachment(
//   belongsTo: AttachmentBelongsTo,
//   componentId: number
// ) {
//   try {
//     const [attachment] = await db
//       .select()
//       .from(attachmentsTable)
//       .where(
//         and(
//           eq(attachmentsTable.belongsTo, belongsTo),
//           eq(attachmentsTable.componentId, componentId)
//         )
//       )
//       .orderBy(desc(attachmentsTable.createdAt)) // Use `desc()` for descending order
//       .limit(1); // Fetch only the latest one

//     if (attachment) {
//       return attachment;
//     }

//     return null;
//   } catch (error) {
//     console.error("Error fetching previous attachment:", error);
//     throw new Error("Failed to fetch previous attachment.");
//   }
// }

// export async function deletePreviousAttachmentByFieldId(
//   belongsTo: AttachmentBelongsTo,
//   componentId: number,
//   fieldId: number,
//   excludeKey: string // Add excludeKey to prevent deleting the current attachment
// ): Promise<void> {
//   try {
//     await db.delete(attachmentsTable).where(
//       and(
//         eq(attachmentsTable.belongsTo, belongsTo),
//         eq(attachmentsTable.componentId, componentId),
//         eq(attachmentsTable.fieldId, fieldId), // Ensure the fieldId matches
//         not(eq(attachmentsTable.key, excludeKey)) // Negate the equality condition
//       )
//     );
//   } catch (error) {
//     console.error("Error deleting previous attachment:", error);
//     throw new Error("Failed to delete previous attachment.");
//   }
// }

// export async function getPreviousAttachmentByFieldId(
//   belongsTo: AttachmentBelongsTo,
//   componentId: number,
//   fieldId: number
// ) {
//   try {
//     const [attachment] = await db
//       .select()
//       .from(attachmentsTable)
//       .where(
//         and(
//           eq(attachmentsTable.belongsTo, belongsTo),
//           eq(attachmentsTable.componentId, componentId),
//           eq(attachmentsTable.fieldId, fieldId) // Match the fieldId
//         )
//       )
//       .orderBy(desc(attachmentsTable.createdAt)) // Fetch the latest attachment for this fieldId
//       .limit(1);

//     if (attachment) {
//       return attachment;
//     }

//     return null;
//   } catch (error) {
//     console.error("Error fetching previous attachment by fieldId:", error);
//     throw new Error("Failed to fetch previous attachment by fieldId.");
//   }
// }

import { db } from "~/db/drizzle/connector";
import { attachmentsTable } from "~/db/drizzle/schemas/schema";
import { AttachmentsType } from "~/types/User";
import { eq } from "drizzle-orm";

export async function saveAttachment(
  key: string,
  metadata?: { fileSize?: number; contentType?: string }
) {
  if (!key) {
    throw new Error("Invalid attachment metadata. 'key' is required.");
  }

  try {
    const [attachment] = await db
      .insert(attachmentsTable)
      .values({
        key,
        metadata: metadata ? JSON.stringify(metadata) : {},
      } as AttachmentsType)
      .returning({ id: attachmentsTable.id });

    return attachment;
  } catch (error) {
    console.error("Error saving attachment:", error);
    throw new Error("Failed to save attachment metadata.");
  }
}

export async function deleteAttachmentById(
  attachmentId: number
): Promise<void> {
  try {
    await db
      .delete(attachmentsTable)
      .where(eq(attachmentsTable.id, attachmentId));

    console.log(`Attachment with ID ${attachmentId} successfully deleted.`);
  } catch (error) {
    console.error(
      `Failed to delete attachment with ID ${attachmentId}:`,
      error
    );
    throw new Error("Failed to delete attachment.");
  }
}
