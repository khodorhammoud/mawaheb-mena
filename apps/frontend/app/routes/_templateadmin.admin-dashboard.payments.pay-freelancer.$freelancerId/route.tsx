import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { requireAdmin } from '~/auth/auth.server';
import {
  getAdminBankAccounts,
  getUserBankAccount,
  createFreelancerPayment,
} from '~/servers/payments.server';
import { Button } from '~/components/ui/button';
import { AlertCircle } from 'lucide-react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const freelancerId = params.freelancerId;
  if (!freelancerId) {
    throw new Response('Freelancer ID is required', { status: 400 });
  }

  return json({ freelancerId });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdmin(request);

  const freelancerId = params.freelancerId;
  if (!freelancerId) {
    return json({ success: false, error: 'Freelancer ID is required' }, { status: 400 });
  }

  const formData = await request.formData();
  const amount = formData.get('amount');
  const description = formData.get('description');

  if (!amount) {
    return json({
      success: false,
      error: 'Amount is required',
    });
  }

  try {
    const paymentData = {
      amount: parseFloat(amount as string),
      description: (description as string) || 'Payment to freelancer',
      currency: 'USD',
      reference: `admin-payment-${Date.now()}`,
      toAccountId: `bank-${freelancerId}`,
    };

    await createFreelancerPayment(freelancerId, paymentData);

    return redirect(
      '/admin-dashboard/payments?success=true&message=Payment+to+freelancer+initiated+successfully'
    );
  } catch (error) {
    console.error('Error creating freelancer payment:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

export default function PayFreelancer() {
  const { freelancerId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pay Freelancer</h1>
        <p className="text-gray-500 mt-1">Freelancer ID: {freelancerId}</p>
      </div>

      {actionData?.error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md mb-6 flex gap-2">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p>{actionData.error}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-md shadow my-6">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

        <Form method="post">
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USD) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                min="1"
                step="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primaryColor focus:border-primaryColor"
                placeholder="Enter payment amount"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primaryColor focus:border-primaryColor"
                placeholder="What is this payment for? (optional)"
              />
            </div>

            <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p className="font-semibold">Payment Information</p>
              <p className="mt-1">
                This payment will be processed immediately from the admin account to the
                freelancer's account. The transaction will be recorded in the payment history.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primaryColor hover:bg-primaryColor/90 text-white py-3 mt-4"
            >
              {isSubmitting ? 'Processing...' : 'Process Payment'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
