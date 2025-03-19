import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import { Button } from '~/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Simple Alert component
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

// Currency options
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

interface BankAccountFormProps {
  defaultValues?: {
    accountHolderName?: string;
    accountNumber?: string;
    iban?: string;
    bankName?: string;
    branchCode?: string;
    swiftCode?: string;
    currency?: string;
    isDefault?: boolean;
  };
  formType?: string;
  submitLabel?: string;
  showDefaultOption?: boolean;
  actionUrl?: string; // Optional action URL override
}

export default function BankAccountForm({
  defaultValues = {},
  formType = 'bankAccountForm',
  submitLabel = 'Save Bank Account Details',
  showDefaultOption = false,
  actionUrl,
}: BankAccountFormProps) {
  const bankAccountFetcher = useFetcher();

  // 🔥 Error & Success Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔥 Listen for fetcher response and handle messages
  useEffect(() => {
    if (bankAccountFetcher.data) {
      const response = bankAccountFetcher.data as {
        success?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.success) {
        setErrorMessage(response.error || 'An error occurred.');
        setSuccessMessage(null);
      } else {
        setErrorMessage(null);
        setSuccessMessage(response.message || 'Bank account details saved successfully!');
      }
    }
  }, [bankAccountFetcher.data]);

  return (
    <bankAccountFetcher.Form method="post" action={actionUrl}>
      {/* Hidden field to indicate form type */}
      <input type="hidden" name="formType" value={formType} />

      <div className="space-y-6">
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Holder Name */}
          <AppFormField
            id="accountHolderName"
            name="accountHolderName"
            label="Account Holder Name *"
            defaultValue={defaultValues.accountHolderName || ''}
            placeholder="Enter the account holder's full name"
          />

          {/* Account Number */}
          <AppFormField
            id="accountNumber"
            name="accountNumber"
            label="Account Number *"
            defaultValue={defaultValues.accountNumber || ''}
            placeholder="Enter your account number"
          />

          {/* IBAN */}
          <AppFormField
            id="iban"
            name="iban"
            label="IBAN (International Bank Account Number)"
            defaultValue={defaultValues.iban || ''}
            placeholder="Enter your IBAN"
          />

          {/* Bank Name */}
          <AppFormField
            id="bankName"
            name="bankName"
            label="Bank Name *"
            defaultValue={defaultValues.bankName || ''}
            placeholder="Enter your bank's name"
          />

          {/* Branch Code */}
          <AppFormField
            id="branchCode"
            name="branchCode"
            label="Branch Code"
            defaultValue={defaultValues.branchCode || ''}
            placeholder="Enter your bank's branch code"
          />

          {/* Swift Code */}
          <AppFormField
            id="swiftCode"
            name="swiftCode"
            label="Swift/BIC Code"
            defaultValue={defaultValues.swiftCode || ''}
            placeholder="Enter the SWIFT/BIC code"
          />

          {/* Currency */}
          <AppFormField
            id="currency"
            name="currency"
            label="Currency"
            type="select"
            options={currencyOptions}
            defaultValue={defaultValues.currency || 'USD'}
          />

          {/* Is Default (Admin only) */}
          {showDefaultOption && (
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                defaultChecked={defaultValues.isDefault || false}
                className="h-4 w-4 text-primaryColor focus:ring-primaryColor border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                Set as default account
              </label>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            disabled={bankAccountFetcher.state === 'submitting'}
            className="bg-primaryColor hover:bg-primaryColor/90 text-white py-2 px-4 rounded-md"
          >
            {bankAccountFetcher.state === 'submitting' ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </div>
    </bankAccountFetcher.Form>
  );
}
