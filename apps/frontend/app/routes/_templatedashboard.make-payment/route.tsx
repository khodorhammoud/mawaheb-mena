import { json, ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { getCurrentUser } from '~/servers/user.server';
import { getUserBankAccount, createEmployerPayment } from '~/servers/payments.server';
import { Button } from '~/components/ui/button';
import { AlertCircle, ChevronRight } from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Verify the user is an employer
  const userId = String(currentUser.id);
  const userRole = currentUser.role;

  if (userRole !== 'employer') {
    throw new Response('Only employers can make payments', { status: 403 });
  }

  // Get the user's bank account details
  const bankAccount = await getUserBankAccount(userId);

  // Get employer ID
  const employer = await import('~/servers/employer.server').then(module =>
    module.getEmployerByUserId(userId)
  );

  if (!employer) {
    throw new Response('Employer profile not found', { status: 404 });
  }

  return json({
    userId,
    employerId: employer.id,
    bankAccount,
    hasBankAccount: !!bankAccount,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const amount = formData.get('amount');
  const description = formData.get('description');
  const employerId = formData.get('employerId');

  if (!amount || !employerId) {
    return json({
      success: false,
      error: 'Amount and employer ID are required',
    });
  }

  try {
    const paymentData = {
      amount: parseFloat(amount as string),
      description: (description as string) || 'Payment to platform',
    };

    const result = await createEmployerPayment(employerId as string, paymentData);

    if (result.redirectUrl) {
      // Redirect to the payment gateway
      return redirect(result.redirectUrl);
    }

    return json({
      success: true,
      message: 'Payment initiated successfully',
      paymentId: result.paymentId,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

export default function MakePayment() {
  const { bankAccount, hasBankAccount, employerId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (!hasBankAccount) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Make a Payment</h1>
        </div>

        <div className="bg-white p-6 rounded-md shadow mb-8">
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md mb-6 flex gap-2">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Bank Account Required</h3>
              <p>You need to set up a bank account before you can make payments.</p>
            </div>
          </div>

          <Button className="bg-primaryColor hover:bg-primaryColor/90" asChild>
            <a href="/settings?tab=payment">
              Set Up Bank Account
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Make a Payment</h1>
        <p className="text-gray-500 mt-1">
          Send a payment to the platform using your connected bank account
        </p>
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

      <div className="bg-white p-6 rounded-md shadow mb-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Connected Bank Account</h2>
          <div className="p-4 border rounded-md">
            <p className="text-sm text-gray-500">Account: {bankAccount.accountNumber}</p>
            <p className="text-sm text-gray-500">Bank: {bankAccount.bankName}</p>
            <p className="text-sm text-gray-500">Holder: {bankAccount.accountHolderName}</p>
          </div>
        </div>

        <Form method="post">
          <input type="hidden" name="employerId" value={employerId} />

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

      <div className="bg-gray-50 p-6 rounded-md border">
        <h3 className="text-md font-semibold mb-2">About Secure Payments</h3>
        <p className="text-sm text-gray-600 mb-4">
          All payments are processed securely through our payment gateway provider. Your banking
          information is encrypted and handled securely.
        </p>
        <p className="text-sm text-gray-600">
          After submitting, you will be redirected to our payment processing page to complete your
          transaction.
        </p>
      </div>
    </div>
  );
}
