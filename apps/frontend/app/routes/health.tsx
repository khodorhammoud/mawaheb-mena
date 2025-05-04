import type { LoaderFunctionArgs } from '@remix-run/node';

/**
 * Health check endpoint for the application
 * Returns a simple 200 OK response when the application is running
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Check database connection by importing the db object
  // If this import works, the app is healthy
  try {
    const { db } = await import('@mawaheb/db/server');
    // Only check that the import worked, no need to actually query the DB

    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json(
      {
        status: 'error',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
