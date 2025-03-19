import { useState, useEffect } from 'react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import { Button } from '~/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Simple Alert component since the UI alert is not available
const Alert = ({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
}) => {
  const baseClass = 'p-4 rounded-md border flex gap-3 items-start';
  const variantClasses = {
    default: 'bg-blue-50 text-blue-800 border-blue-200',
    destructive: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
  };

  return <div className={`${baseClass} ${variantClasses[variant]} ${className}`}>{children}</div>;
};

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="font-medium">{children}</div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

export default function PaymentTab() {
  const { bankAccount } = useLoaderData<{ bankAccount: any }>();
  const paymentFetcher = useFetcher();

  // 🔥 Error & Success Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔥 Listen for fetcher response and handle messages
  useEffect(() => {
    if (paymentFetcher.data) {
      const response = paymentFetcher.data as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.success) {
        setErrorMessage(response.error || 'An error occurred.');
        setSuccessMessage(null);
      } else {
        setErrorMessage(null);
        setSuccessMessage(response.message || 'Bank account details updated successfully!');
      }
    }
  }, [paymentFetcher.data]);

  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'EGP', label: 'EGP - Egyptian Pound' },
    { value: 'JOD', label: 'JOD - Jordanian Dinar' },
    { value: 'LBP', label: 'LBP - Lebanese Pound' },
    { value: 'QAR', label: 'QAR - Qatari Riyal' },
    { value: 'BHD', label: 'BHD - Bahraini Dinar' },
    { value: 'KWD', label: 'KWD - Kuwaiti Dinar' },
    { value: 'OMR', label: 'OMR - Omani Rial' },
  ];

  return (
    <paymentFetcher.Form method="post">
      {/* 🔥 Hidden field to indicate this is PaymentTab */}
      <input type="hidden" name="formType" value="paymentTab" />

      <div className="p-6 space-y-8 mb-20">
        <div className="text-lg font-semibold mb-6">Bank Account Information</div>

        {/* Error and Success Messages */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <div>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-gray-500 mb-6">
          Connect your bank account to receive payments through our secure payment gateway. Your
          banking information is encrypted and handled securely.
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Holder Name */}
          <AppFormField
            id="accountHolderName"
            name="accountHolderName"
            label="Account Holder Name *"
            defaultValue={bankAccount?.accountHolderName || ''}
            placeholder="Enter the account holder's full name"
          />

          {/* Account Number */}
          <AppFormField
            id="accountNumber"
            name="accountNumber"
            label="Account Number *"
            defaultValue={bankAccount?.accountNumber || ''}
            placeholder="Enter your account number"
          />

          {/* IBAN */}
          <AppFormField
            id="iban"
            name="iban"
            label="IBAN (International Bank Account Number)"
            defaultValue={bankAccount?.iban || ''}
            placeholder="Enter your IBAN"
          />

          {/* Bank Name */}
          <AppFormField
            id="bankName"
            name="bankName"
            label="Bank Name *"
            defaultValue={bankAccount?.bankName || ''}
            placeholder="Enter your bank's name"
          />

          {/* Branch Code */}
          <AppFormField
            id="branchCode"
            name="branchCode"
            label="Branch Code"
            defaultValue={bankAccount?.branchCode || ''}
            placeholder="Enter your bank's branch code"
          />

          {/* Swift Code */}
          <AppFormField
            id="swiftCode"
            name="swiftCode"
            label="Swift/BIC Code"
            defaultValue={bankAccount?.swiftCode || ''}
            placeholder="Enter the SWIFT/BIC code"
          />

          {/* Currency */}
          <AppFormField
            id="currency"
            name="currency"
            label="Currency"
            type="select"
            options={currencyOptions}
            defaultValue={bankAccount?.currency || 'USD'}
          />
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            disabled={paymentFetcher.state === 'submitting'}
            className="bg-primaryColor hover:bg-primaryColor/90 text-white py-2 px-4 rounded-md"
          >
            {paymentFetcher.state === 'submitting' ? 'Saving...' : 'Save Bank Account Details'}
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2 font-semibold">Important Information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your bank account details are encrypted and stored securely.</li>
            <li>
              We use industry-standard security protocols to protect your financial information.
            </li>
            <li>You will receive notifications when payments are processed to your account.</li>
            <li>For any issues with payments, please contact our support team.</li>
          </ul>
        </div>
      </div>
    </paymentFetcher.Form>
  );
}
