import { useState, useEffect } from 'react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/hooks/use-toast';
import { ToastAction } from '~/components/ui/toast';
import { AccountType, AccountStatus } from '~/types/enums';

type SettingsFetcherData = {
  success?: boolean;
  error?: string;
  formType?: string;
  isDeactivated?: boolean;
};

type LoaderData = {
  user: {
    accountType: AccountType;
  };
  userAccountStatus: AccountStatus;
};

export default function PrivacyTab() {
  const { user, userAccountStatus: initialAccountStatus } = useLoaderData<LoaderData>();
  const settingsFetcher = useFetcher<SettingsFetcherData>();
  const { toast } = useToast();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [currentAccountStatus, setCurrentAccountStatus] = useState<AccountStatus>(
    initialAccountStatus || AccountStatus.Published
  );

  // Update from initialAccountStatus when it's different
  useEffect(() => {
    if (
      initialAccountStatus &&
      initialAccountStatus !== currentAccountStatus &&
      !settingsFetcher.data
    ) {
      setCurrentAccountStatus(initialAccountStatus);
    }
  }, [initialAccountStatus, currentAccountStatus, settingsFetcher.data]);

  // Handle form submission response
  useEffect(() => {
    if (settingsFetcher.data && settingsFetcher.data.formType === 'deactivateAccount') {
      if (settingsFetcher.data.success) {
        const newStatus = settingsFetcher.data.isDeactivated
          ? AccountStatus.Deactivated
          : AccountStatus.Published;
        setCurrentAccountStatus(newStatus);

        toast({
          variant: 'default',
          title: settingsFetcher.data.isDeactivated ? 'Account Deactivated' : 'Account Reactivated',
          description: settingsFetcher.data.isDeactivated
            ? 'Your account has been deactivated successfully'
            : 'Your account has been reactivated successfully',
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
        // Only close dialog after successful response
        setShowDeactivateDialog(false);
      } else {
        setCurrentAccountStatus(initialAccountStatus);

        toast({
          variant: 'destructive',
          title: 'Error',
          description: settingsFetcher.data.error || 'Failed to update account status',
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        // Keep dialog open on error so user can try again
      }
    }
  }, [settingsFetcher.data, toast, initialAccountStatus]);

  // State for password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Listen for fetcher response and display error/success messages
  useEffect(() => {
    if (settingsFetcher.data) {
      const response = settingsFetcher.data as SettingsFetcherData;

      // Only handle password update messages here
      if (response.formType !== 'deactivateAccount') {
        if (!response.success) {
          setErrorMessage(response.error || 'An error occurred.');
          setSuccessMessage(null);
        } else {
          setErrorMessage(null);
          setSuccessMessage('Password updated successfully!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    }
  }, [settingsFetcher.data]);

  // Validation checks
  const isFormValid =
    currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  const handleDeactivateAccount = () => {
    settingsFetcher.submit(
      {
        formType: 'deactivateAccount',
      },
      { method: 'POST' }
    );
  };

  const getDeactivationWarning = () => {
    if (user.accountType === AccountType.Employer) {
      return (
        <>
          <p className="mb-4">As an employer:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Freelancers will no longer be able to see your posted jobs</li>
            <li>You will no longer be able to create new jobs</li>
            <li>Pending job applications will no longer be processed</li>
            <li>Ongoing job applications will continue to be in progress</li>
          </ul>
        </>
      );
    } else {
      return (
        <>
          <p className="mb-4">As a freelancer:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You will no longer be considered for any job applications in progress</li>
            <li>You will no longer be able to apply to new jobs</li>
            <li>Ongoing jobs will continue to be in progress</li>
          </ul>
        </>
      );
    }
  };

  return (
    <div className="">
      <settingsFetcher.Form method="post">
        {/* 🔥 Hidden field to indicate this is PrivacyTab */}
        <input type="hidden" name="formType" value="privacyTab" />

        <div className="p-6 space-y-12">
          {/* 🔥 Show error messages */}
          {errorMessage && (
            <div className="bg-red-100 text-red-700 p-2 rounded-md">{errorMessage}</div>
          )}

          {/* 🔥 Show success message */}
          {successMessage && (
            <div className="bg-green-100 text-green-700 p-2 rounded-md">{successMessage}</div>
          )}

          {/* Password Section */}
          <section className="grid lg:grid-cols-[15%_75%] gap-8">
            <div className="text-lg font-semibold">Password</div>
            <div className="flex flex-col md:gap-6 gap-4">
              <div className="text-base mt-1 mb-2">Change Password</div>
              <div className="flex flex-col md:gap-8 gap-6">
                <AppFormField
                  className="w-1/2"
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  defaultValue={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <div className="flex flex-col gap-4">
                  <div className="">
                    <AppFormField
                      className="w-1/2"
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      type="password"
                      defaultValue={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <p className="text-[12px] text-gray-500 mt-1 ml-2 leading-3">
                      Password must be 8 characters, upper case, lower case, symbols.
                    </p>
                  </div>
                  <AppFormField
                    className="w-1/2"
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    defaultValue={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`bg-primaryColor text-white sm:py-3 py-2 sm:px-2 px-1 xl:whitespace-nowrap not-active-gradient gradient-box rounded-xl xl:w-1/4 lg:w-1/3 md:w-2/5 w-1/2 sm:text-sm text-xs mb-6 ${
                  isFormValid ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </settingsFetcher.Form>

      {/* Account Section */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8 mb-20">
        <div className="text-lg font-semibold">Account</div>
        <div className="flex flex-col gap-6">
          {/* Delete Account */}
          <div>
            <div className="text-base mt-1 mb-2">Delete my account</div>
            <div className="grid md:grid-cols-[50%_50%] md:gap-6 gap-4 items-center">
              <p className="text-sm text-gray-700">
                Mawaheb makes it easy to delete your account and all data associated with it.{' '}
                <span className="text-red-500">You cannot undo this.</span>
              </p>
              <div className="flex md:gap-4 gap-2">
                <button className="border border-gray-200 text-primaryColor lg:px-6 md:px-4 sm:px-3 px-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs">
                  Delete Account
                </button>
                <button className="border border-gray-200 text-primaryColor lg:px-6 md:px-4 sm:px-3 px-2 py-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs">
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Deactivate Account */}
          <div>
            <div className="text-base mt-1">
              {currentAccountStatus === AccountStatus.Deactivated
                ? 'Reactivate my account'
                : 'Deactivate my account'}
            </div>

            {currentAccountStatus === AccountStatus.Deactivated ? (
              <div className="grid md:grid-cols-[70%_auto] md:gap-6 gap-4 items-center">
                <p className="text-sm text-gray-700">
                  Your account is currently deactivated. You can reactivate it when you want.
                </p>
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeactivateDialog(true)}
                    className="border border-gray-200 text-primaryColor not-active-gradient gradient-box rounded-xl hover:text-white sm:text-sm text-xs"
                  >
                    Reactivate Account
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-[70%_auto] md:gap-6 gap-4 items-center">
                <p className="text-sm text-gray-700 mt-2">
                  Mawaheb makes it easy to deactivate your account and all data associated with it.
                  You can undo this at any time.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivateDialog(true)}
                  className="border border-gray-200 text-primaryColor not-active-gradient gradient-box rounded-xl hover:text-white sm:text-sm text-xs"
                >
                  Deactivate Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAccountStatus === AccountStatus.Deactivated
                ? 'Reactivate Account'
                : 'Deactivate Account'}
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <div className="mt-4">
                {currentAccountStatus === AccountStatus.Deactivated ? (
                  <p>Are you sure you want to reactivate your account?</p>
                ) : (
                  <>
                    {getDeactivationWarning()}
                    <p>Are you sure you want to deactivate your account?</p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={
                currentAccountStatus === AccountStatus.Deactivated ? 'default' : 'destructive'
              }
              onClick={handleDeactivateAccount}
              disabled={settingsFetcher.state === 'submitting'}
            >
              {settingsFetcher.state === 'submitting'
                ? currentAccountStatus === AccountStatus.Deactivated
                  ? 'Reactivating...'
                  : 'Deactivating...'
                : currentAccountStatus === AccountStatus.Deactivated
                  ? 'Reactivate Account'
                  : 'Deactivate Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
