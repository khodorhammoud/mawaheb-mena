import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { db } from '@mawaheb/db/server';
import { attachmentsTable } from '@mawaheb/db';
import { eq } from 'drizzle-orm';
import { generatePresignedUrl } from '~/servers/cloudStorage.server';

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const { attachmentId } = params;

    if (!attachmentId || isNaN(Number(attachmentId))) {
      return json({ error: 'Invalid attachment ID' }, { status: 400 });
    }

    // Get the attachment from the database
    const attachment = await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, Number(attachmentId)))
      .limit(1);

    if (attachment.length === 0) {
      return json({ error: 'Attachment not found' }, { status: 404 });
    }

    const attachmentData = attachment[0];

    // Extract the file key from the metadata
    const metadata = attachmentData.metadata as any;
    let fileKey: string;

    if (metadata?.storage?.key) {
      fileKey = metadata.storage.key;
    } else if (attachmentData.key) {
      fileKey = attachmentData.key;
    } else {
      return json({ error: 'File key not found in attachment metadata' }, { status: 400 });
    }

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await generatePresignedUrl(fileKey, 3600);

    return json({ url: presignedUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}
