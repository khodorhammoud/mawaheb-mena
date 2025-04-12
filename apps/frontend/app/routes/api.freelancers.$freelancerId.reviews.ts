import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { db } from '@mawaheb/db/server';
import { schema } from '@mawaheb/db';
import { and, eq } from 'drizzle-orm';

export async function loader({ params }: LoaderFunctionArgs) {
  const freelancerId = Number(params.freelancerId);
  if (!freelancerId) {
    return json({ error: 'Freelancer ID is required' }, { status: 400 });
  }

  const { reviewsTable } = schema;
  // Fetch all employer reviews for this freelancer
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.freelancerId, freelancerId),
        eq(reviewsTable.reviewType, 'employer_review')
      )
    );

  // Calculate overall rating from employer reviews only
  const overallRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return json({
    overallRating: overallRating.toFixed(1),
    totalReviews: reviews.length,
    reviews,
  });
}
