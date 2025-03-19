import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate, Link } from '@remix-run/react';
import { requireAdmin } from '~/auth/auth.server';
import { useState } from 'react';
import {
  getAllPayments,
  getAdminBankAccounts,
  createFreelancerPayment,
} from '~/servers/payments.server';
import { format } from 'date-fns';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import BankAccountForm from '~/common/payment/BankAccountForm';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);

  try {
    const [payments, adminAccounts] = await Promise.all([getAllPayments(), getAdminBankAccounts()]);

    return json({
      payments,
      adminAccounts,
      error: null,
    });
  } catch (error) {
    console.error('Error loading payment data:', error);
    return json({
      payments: [],
      adminAccounts: [],
      error: 'Failed to load payment data',
    });
  }
}

export default function AdminPaymentsDashboard() {
  const { payments, adminAccounts, error } = useLoaderData<typeof loader>();
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const togglePaymentSelection = (paymentId: string) => {
    const newSelection = new Set(selectedPayments);
    if (newSelection.has(paymentId)) {
      newSelection.delete(paymentId);
    } else {
      newSelection.add(paymentId);
    }
    setSelectedPayments(newSelection);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMakePayment = (freelancerId: string) => {
    navigate(`/admin-dashboard/payments/pay-freelancer/${freelancerId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <div className="flex gap-2">
          <Link
            to="/admin-dashboard/payments/bank-accounts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primaryColor hover:bg-primaryColor/90"
          >
            Manage Bank Accounts
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md mb-6">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="bank-accounts">Admin Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="bg-white rounded-md shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Payments</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map(payment => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.type === 'employer_to_platform'
                            ? 'Employer Payment'
                            : 'Freelancer Payment'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(Number(payment.amount), payment.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/admin-dashboard/payments/${payment.id}`}
                            className="text-primaryColor hover:text-primaryColor/80 mr-3"
                          >
                            View Details
                          </Link>
                          {payment.type === 'employer_to_platform' &&
                            payment.status === 'completed' &&
                            payment.freelancerId && (
                              <button
                                onClick={() => handleMakePayment(payment.freelancerId)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Pay Freelancer
                              </button>
                            )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bank-accounts" className="space-y-4">
          <div className="bg-white rounded-md shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Admin Bank Accounts</h2>

            {adminAccounts.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded-md">
                <p className="text-gray-500">No bank accounts configured</p>
                <Link
                  to="/admin-dashboard/payments/add-bank-account"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primaryColor hover:bg-primaryColor/90"
                >
                  Add Bank Account
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {adminAccounts.map(account => (
                    <div
                      key={account.id}
                      className={`p-4 border rounded-md ${account.isDefault ? 'border-primaryColor' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{account.bankName}</h3>
                        {account.isDefault && (
                          <span className="px-2 py-1 text-xs bg-primaryColor/10 text-primaryColor rounded-md">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Account: {account.accountNumber}</p>
                      <p className="text-sm text-gray-500">Holder: {account.accountHolderName}</p>
                      {account.iban && (
                        <p className="text-sm text-gray-500">IBAN: {account.iban}</p>
                      )}
                      <p className="text-sm text-gray-500">Currency: {account.currency}</p>

                      <div className="mt-4 flex justify-end gap-2">
                        <Link
                          to={`/admin-dashboard/payments/edit-bank-account/${account.id}`}
                          className="text-sm text-primaryColor hover:text-primaryColor/80"
                        >
                          Edit
                        </Link>
                        {!account.isDefault && (
                          <Link
                            to={`/admin-dashboard/payments/set-default-account/${account.id}`}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Set as Default
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}

                  <Link
                    to="/admin-dashboard/payments/add-bank-account"
                    className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-md hover:border-primaryColor"
                  >
                    <div className="h-12 w-12 rounded-full bg-primaryColor/10 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primaryColor"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <span className="mt-2 text-sm font-medium text-primaryColor">
                      Add New Bank Account
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
