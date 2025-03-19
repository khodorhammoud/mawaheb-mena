import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUserSession } from '~/auth/auth.server';
import { getUserPayments } from '~/servers/payments.server';
import { formatCurrency } from '~/utils/formatters';
import { Badge } from '~/components/ui/badge';
import { Calendar, CreditCard, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '~/servers/user.server';

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure user is authenticated
  await requireUserSession(request);

  // Get the current user
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return json({
      success: false,
      error: 'User not authenticated',
      payments: [],
    });
  }

  try {
    // Ensure we have a string ID
    const userId = typeof currentUser.id === 'number' ? currentUser.id.toString() : currentUser.id;

    const payments = await getUserPayments(userId);

    return json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error loading user payments:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load payment history',
      payments: [],
    });
  }
}

export default function PaymentsPage() {
  const { payments, success, error } = useLoaderData<typeof loader>();

  // Function to determine the badge variant based on payment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <RefreshCw className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <RefreshCw className="w-3 h-3 mr-1" /> Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <RefreshCw className="w-3 h-3 mr-1" /> Refunded
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            <AlertCircle className="w-3 h-3 mr-1" /> {status}
          </Badge>
        );
    }
  };

  // Function to determine if the payment is inbound or outbound
  const isInbound = (paymentType: string) => {
    return paymentType === 'platform_to_freelancer';
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <a
          href="/make-payment"
          className="inline-flex items-center px-4 py-2 bg-primaryColor text-white rounded-md hover:bg-primaryColor/90"
        >
          <CreditCard className="w-4 h-4 mr-2" /> Make a Payment
        </a>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-800 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <h3 className="font-medium">Error loading payment history</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="flex justify-center mb-4">
            <CreditCard className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Payment History</h3>
          <p className="text-gray-500 mb-4">You haven't made or received any payments yet.</p>
          <a
            href="/make-payment"
            className="inline-flex items-center px-4 py-2 bg-primaryColor text-white rounded-md hover:bg-primaryColor/90"
          >
            Make Your First Payment
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isInbound(payment.type) ? (
                        <span className="inline-flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Sent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
