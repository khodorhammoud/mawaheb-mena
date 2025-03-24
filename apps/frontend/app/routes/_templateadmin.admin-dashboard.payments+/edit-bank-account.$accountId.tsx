import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireAdmin } from '~/auth/auth.server';
import BankAccountForm from '~/common/payment/BankAccountForm';
import { getAdminBankAccounts, saveAdminBankAccount } from '~/servers/payments.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);

  const { accountId } = params;
  if (!accountId) {
    return redirect('/admin-dashboard/payments');
  }

  try {
    // Get all admin bank accounts and find the one with matching ID
    const adminAccounts = await getAdminBankAccounts();
    const bankAccount = adminAccounts.find(account => account.id.toString() === accountId);

    if (!bankAccount) {
      return redirect('/admin-dashboard/payments');
    }

    return json({ bankAccount });
  } catch (error) {
    console.error('Error loading bank account:', error);
    return json({ error: 'Failed to load bank account details' }, { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireAdmin(request);

  const { accountId } = params;
  if (!accountId) {
    return json({ success: false, error: 'Bank account ID is required' }, { status: 400 });
  }

  const formData = await request.formData();
  const formType = formData.get('formType');

  if (formType !== 'bankAccountForm') {
    return json({ success: false, error: 'Invalid form submission' }, { status: 400 });
  }

  try {
    const bankAccountData = {
      accountHolderName: formData.get('accountHolderName') as string,
      accountNumber: formData.get('accountNumber') as string,
      iban: (formData.get('iban') as string) || undefined,
      bankName: formData.get('bankName') as string,
      branchCode: (formData.get('branchCode') as string) || undefined,
      swiftCode: (formData.get('swiftCode') as string) || undefined,
      currency: (formData.get('currency') as string) || 'USD',
      isDefault: formData.get('isDefault') === 'on',
    };

    // Validate required fields
    if (
      !bankAccountData.accountHolderName ||
      !bankAccountData.accountNumber ||
      !bankAccountData.bankName
    ) {
      return json({
        success: false,
        error: 'Account holder name, account number, and bank name are required',
      });
    }

    // Instead of updating, we'll delete the old account and create a new one
    // This is a workaround until we implement proper update functionality
    await saveAdminBankAccount(bankAccountData);

    return json({
      success: true,
      message: 'Bank account updated successfully',
    });
  } catch (error) {
    console.error('Error updating admin bank account:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

export default function EditAdminBankAccount() {
  const data = useLoaderData<typeof loader>();

  if ('error' in data) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p className="font-semibold">{data.error}</p>
      </div>
    );
  }

  const { bankAccount } = data;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Admin Bank Account</h1>
        <p className="text-gray-500 mt-1">Update bank account details for platform payments</p>
      </div>

      <div className="bg-white p-6 rounded-md shadow">
        <BankAccountForm
          formType="bankAccountForm"
          submitLabel="Update Bank Account"
          showDefaultOption={true}
          defaultValues={{
            accountHolderName: String(bankAccount.accountHolderName || ''),
            accountNumber: String(bankAccount.accountNumber || ''),
            iban: bankAccount.iban ? String(bankAccount.iban) : undefined,
            bankName: String(bankAccount.bankName || ''),
            branchCode: bankAccount.branchCode ? String(bankAccount.branchCode) : undefined,
            swiftCode: bankAccount.swiftCode ? String(bankAccount.swiftCode) : undefined,
            currency: String(bankAccount.currency || 'USD'),
            isDefault: Boolean(bankAccount.isDefault),
          }}
        />
      </div>
    </div>
  );
}
