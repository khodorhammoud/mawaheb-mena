import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { db } from '@mawaheb/db/server';
import { attachmentsTable } from '@mawaheb/db';
import { eq } from 'drizzle-orm';
import { generatePresignedUrl } from '~/servers/cloudStorage.server';

type AttachmentMetadata = {
  storage?: { key?: string };
  name?: string;
};

interface Metadata {
  storage?: {
    key?: string;
  };
}

export async function loader({ params }: LoaderFunctionArgs) {
  const attachmentId = Number(params.attachmentId);
  if (isNaN(attachmentId)) {
    throw new Response('Invalid attachment ID', { status: 400 });
  }

  const result = await db
    .select()
    .from(attachmentsTable)
    .where(eq(attachmentsTable.id, attachmentId))
    .limit(1);

  if (!result.length) {
    throw new Response('Attachment not found', { status: 404 });
  }

  const metadata = result[0].metadata as Metadata;
  const fileKey = metadata?.storage?.key || result[0].key;

  if (!fileKey) {
    throw new Response('File key missing', { status: 400 });
  }

  const presignedUrl = await generatePresignedUrl(fileKey, 3600);
  return redirect(presignedUrl);
}
