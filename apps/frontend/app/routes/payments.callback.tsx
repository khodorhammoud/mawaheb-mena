import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { updatePaymentStatus } from '~/servers/payments.server';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

// Define types for the loader response
type SuccessResponse = {
  success: true;
  paymentId: string;
  status: string;
};

type ErrorResponse = {
  success: false;
  error: string;
  paymentId?: string;
  status?: string;
};

type LoaderResponse = SuccessResponse | ErrorResponse;

/**
 * This route handles callbacks from the Tarabut payment gateway
 * It receives payment status updates and processes them
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('payment_id') || url.searchParams.get('disbursement_id');
  const status = url.searchParams.get('status');

  if (!paymentId || !status) {
    return json<ErrorResponse>({
      success: false,
      error: 'Missing required parameters',
    });
  }

  try {
    await updatePaymentStatus(paymentId, status);

    return json<SuccessResponse>({
      success: true,
      paymentId,
      status,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return json<ErrorResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment status',
      paymentId,
      status,
    });
  }
}

export default function PaymentCallback() {
  const data = useLoaderData<typeof loader>();

  // Type guard to determine if we have a success or error response
  const isSuccessResponse = (data: LoaderResponse): data is SuccessResponse => {
    return data.success === true;
  };

  // Safely access properties based on the response type
  const paymentId = 'paymentId' in data ? data.paymentId : undefined;
  const status = 'status' in data ? data.status : undefined;
  const error = !isSuccessResponse(data) ? data.error : undefined;

  const isSuccessful =
    data.success && status && ['completed', 'success', 'processing'].includes(status.toLowerCase());

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          {isSuccessful ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}

          <h1 className="text-2xl font-bold">
            {isSuccessful ? 'Payment Successful' : 'Payment Failed'}
          </h1>

          <p className="text-gray-600 mt-2">
            {isSuccessful
              ? 'Your payment has been processed successfully.'
              : 'There was an issue processing your payment.'}
          </p>

          {paymentId && <p className="text-sm text-gray-500 mt-1">Payment ID: {paymentId}</p>}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">{error}</div>
          )}
        </div>

        <div className="space-y-4">
          <Link
            to="/payments"
            className="flex items-center justify-center w-full py-3 px-4 bg-primaryColor hover:bg-primaryColor/90 text-white rounded-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Payment History
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center justify-center w-full py-3 px-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
