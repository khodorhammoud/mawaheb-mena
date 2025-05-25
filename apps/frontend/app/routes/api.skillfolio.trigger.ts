import { ActionFunctionArgs } from '@remix-run/node';
import { requireAdmin } from '~/auth/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  // Ensure only admins can trigger skillfolio generation
  await requireAdmin(request);

  try {
    // Get the request body
    const requestData = await request.json();
    const { userId, accountId, newStatus } = requestData;

    // Validate required fields
    if (!userId || !accountId || !newStatus) {
      return Response.json(
        {
          success: false,
          error: {
            message: 'Missing required fields: userId, accountId, or newStatus',
          },
        },
        { status: 400 }
      );
    }

    // Make the API call to the backend
    const backendUrl =
      typeof window !== 'undefined' ? `${window.ENV.BACKEND_URL}` : 'http://localhost:3002';
    const response = await fetch(`${backendUrl}/skillfolio/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        accountId,
        newStatus,
      }),
    });

    // Parse the response
    const result = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: {
            message: 'Failed to trigger skillfolio generation',
            details: result,
          },
        },
        { status: response.status }
      );
    }

    return Response.json({
      success: true,
      jobId: result.jobId,
    });
  } catch (error) {
    console.error('Error triggering skillfolio generation:', error);
    return Response.json(
      {
        success: false,
        error: {
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
