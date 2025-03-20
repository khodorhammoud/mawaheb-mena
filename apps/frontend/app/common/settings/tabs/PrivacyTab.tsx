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
import { AccountType } from '~/types/enums';

type SettingsFetcherData = {
  success?: boolean;
  error?: string;
  formType?: string;
};

type LoaderData = {
  user: {
    accountType: AccountType;
  };
};

export default function PrivacyTab() {
  const { user } = useLoaderData<LoaderData>();
  const settingsFetcher = useFetcher<SettingsFetcherData>();
  const { toast } = useToast();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

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
  }, [settingsFetcher.data]);

  // Validation checks
  const isFormValid =
    currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  const handleDeactivateAccount = () => {
    settingsFetcher.submit({ formType: 'deactivateAccount' }, { method: 'POST' });
    setShowDeactivateDialog(false);
  };

  useEffect(() => {
    if (settingsFetcher.data && settingsFetcher.data.formType === 'deactivateAccount') {
      if (settingsFetcher.data.success) {
        toast({
          title: 'Account Deactivated',
          description:
            'Your account has been deactivated successfully. Please log out to complete the process.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: settingsFetcher.data.error || 'Failed to deactivate account',
          variant: 'destructive',
        });
      }
    }
  }, [settingsFetcher.data]);

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
          <div className="">
            <div className="text-base mt-1 mb-2">Deactivate my account</div>
            <div className="grid md:grid-cols-[50%_50%] xl:gap-8 lg:gap-10 md:gap-6 gap-4 items-center">
              <p className="text-sm text-gray-500">
                Mawaheb makes it easy to deactivate your account and all data associated with it.
                You can undo this at any time.
              </p>
              <button
                type="button"
                onClick={() => setShowDeactivateDialog(true)}
                className="border border-gray-200 text-primaryColor sm:px-3 px-2 py-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs w-7/12 md:w-8/12 lg:w-3/5 xl:w-1/2"
              >
                Deactivate Account
              </button>
            </div>
          </div>

          <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate Account</DialogTitle>
                <DialogDescription className="space-y-4">
                  <div className="mt-4">
                    {getDeactivationWarning()}
                    <p>Are you sure you want to deactivate your account?</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeactivateAccount}
                  disabled={settingsFetcher.state === 'submitting'}
                >
                  {settingsFetcher.state === 'submitting'
                    ? 'Deactivating...'
                    : 'Deactivate Account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </div>
  );
}
