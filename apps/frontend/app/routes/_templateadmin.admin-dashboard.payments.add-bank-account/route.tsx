import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { requireAdmin } from '~/auth/auth.server';
import BankAccountForm from '~/common/payment/BankAccountForm';
import { saveAdminBankAccount } from '~/servers/payments.server';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  return Response.json({ success: true });
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();
  const formType = formData.get('formType');

  if (formType !== 'bankAccountForm') {
    return Response.json({
      success: false,
      error: 'Invalid form submission',
    });
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
      return Response.json({
        success: false,
        error: 'Account holder name, account number, and bank name are required',
      });
    }

    await saveAdminBankAccount(bankAccountData);

    return Response.json({
      success: true,
      message: 'Bank account added successfully',
    });
  } catch (error) {
    console.error('Error adding admin bank account:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
}

export default function AddAdminBankAccount() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Admin Bank Account</h1>
        <p className="text-gray-500 mt-1">Add a new bank account for handling platform payments</p>
      </div>

      <div className="bg-white p-6 rounded-md shadow">
        <BankAccountForm
          formType="bankAccountForm"
          submitLabel="Add Bank Account"
          showDefaultOption={true}
        />
      </div> */}
    </div>
  );
}
