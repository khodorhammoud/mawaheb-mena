import { useState, useEffect } from 'react';
import { useFetcher, useNavigate, useLoaderData } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/hooks/use-toast';
import { ToastAction } from '~/components/ui/toast';
import { AccountType, AccountStatus } from '@mawaheb/db/enums';
import { zxcvbn } from '@zxcvbn-ts/core';

// ----------------------------------------------
// Loader/Fake Data Types
// ----------------------------------------------
type LoaderData = {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    accountType: AccountType; // e.g., Employer, Freelancer
  };
  userAccountStatus: AccountStatus;
};

type SettingsFetcherData = {
  success?: boolean;
  error?: string;
  formType?: string;
  isDeactivated?: boolean;
  hasActiveJobs?: boolean;
  disabledMessage?: string;
  message?: string; // Success message
};

type ExportDataResponse = {
  user: { id: number; firstName: string; lastName: string; email: string };
  account: {
    id: number;
    accountType: string;
    accountStatus: string;
    country: string | null;
    phone: string | null;
    region: string | null;
    slug: string;
    isCreationComplete: boolean;
  };
  freelancerDetails?: {
    id: number;
    accountId: number;
    fieldsOfExpertise: any[];
    portfolio: string;
    workHistory: string;
  };
  jobApplications: any[];
  timesheetEntries: any[];
  languages: any[];
  skills: any[];
  userAccountStatus: AccountStatus;
};

// ----------------------------------------------
// PrivacyTab Component
// ----------------------------------------------
export default function PrivacyTab() {
  // Loader data for user/account status
  const { user, userAccountStatus: initialAccountStatus } = useLoaderData<LoaderData>();

  // Fetchers for all async actions
  const settingsFetcher = useFetcher<SettingsFetcherData>();
  const exportFetcher = useFetcher<ExportDataResponse>();
  const deleteFetcher = useFetcher<SettingsFetcherData>();
  const feedbackFetcher = useFetcher<SettingsFetcherData>();

  // Navigation & Toast
  const navigate = useNavigate();
  const { toast } = useToast();

  // Account Status
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [currentAccountStatus, setCurrentAccountStatus] =
    useState<AccountStatus>(initialAccountStatus);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Success/Error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Account delete state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDisabled, setDeleteDisabled] = useState(false);
  const [deleteDisabledMessage, setDeleteDisabledMessage] = useState('');
  const [feedback, setFeedback] = useState('');

  // -------------------------------
  // ZXCVBN Password Strength Checker
  // -------------------------------
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');

  // Check password strength when newPassword changes
  useEffect(() => {
    if (newPassword) {
      const result = zxcvbn(newPassword);
      setPasswordScore(result.score); // 0 to 4
      setPasswordFeedback(result.feedback.suggestions.join(' '));
    } else {
      setPasswordScore(0);
      setPasswordFeedback('');
    }
  }, [newPassword]);

  // Keep currentAccountStatus in sync with loader data
  useEffect(() => {
    if (
      initialAccountStatus &&
      initialAccountStatus !== currentAccountStatus &&
      !settingsFetcher.data
    ) {
      setCurrentAccountStatus(initialAccountStatus);
    }
  }, [initialAccountStatus, currentAccountStatus, settingsFetcher.data]);

  // console.log('FETCHER DATA', settingsFetcher.data); // for ensuring if the password is changed!

  // Handle password update / account deactivate/reactivate success & errors
  useEffect(() => {
    if (!settingsFetcher.data) return;
    if (
      settingsFetcher.data.formType === 'privacyTab' &&
      settingsFetcher.state === 'idle' &&
      !settingsFetcher.data.isDeactivated
    ) {
      if (!settingsFetcher.data.success) {
        setErrorMessage(settingsFetcher.data.error || 'An error occurred.');
        setSuccessMessage(null);
      } else {
        setErrorMessage(null);
        setSuccessMessage(settingsFetcher.data.message || 'Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordScore(0);
        setPasswordFeedback('');
      }
    }
    // (Account deactivate/reactivate message logic below unchanged)
    if (settingsFetcher.data.formType === 'deactivateAccount') {
      if (settingsFetcher.data.success) {
        const newStatus = settingsFetcher.data.isDeactivated
          ? AccountStatus.Deactivated
          : AccountStatus.Published;
        setCurrentAccountStatus(newStatus);
        toast({
          variant: 'default',
          title:
            newStatus === AccountStatus.Deactivated ? 'Account Deactivated' : 'Account Reactivated',
          description:
            newStatus === AccountStatus.Deactivated
              ? 'Your account has been deactivated successfully.'
              : 'Your account has been reactivated successfully.',
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
        setShowDeactivateDialog(false);
      } else {
        setCurrentAccountStatus(initialAccountStatus);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: settingsFetcher.data.error || 'Failed to update account status',
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    }
  }, [settingsFetcher.data, settingsFetcher.state, initialAccountStatus, toast]);

  // Listen for delete eligibility/errors
  useEffect(() => {
    if (deleteFetcher.data) {
      const response = deleteFetcher.data;
      if (response.hasActiveJobs) {
        setDeleteDisabled(true);
        setDeleteDisabledMessage(
          'You cannot delete your account while there are active job postings. Please close or complete all active jobs first.'
        );
      } else {
        setDeleteDisabled(false);
        setDeleteDisabledMessage('');
      }

      if (!response.success && response.error) {
        setErrorMessage(response.error);
      }
    }
  }, [deleteFetcher.data]);

  // Listen for export data response (download json)
  useEffect(() => {
    if (exportFetcher.data) {
      // If there's an error field
      if ('error' in exportFetcher.data && exportFetcher.data.error) {
        setErrorMessage(exportFetcher.data.error as string);
        return;
      }

      const userData = exportFetcher.data;
      // Create a blob from the data
      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-${userData.user.id}.json`;

      // Append to body, click, remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }, [exportFetcher.data]);

  // Listen for feedback fetcher response (final delete)
  useEffect(() => {
    if (feedbackFetcher.data) {
      if (feedbackFetcher.data.success) {
        navigate('/auth/logout');
      } else if (feedbackFetcher.data.error) {
        setErrorMessage(feedbackFetcher.data.error);
      }
    }
  }, [feedbackFetcher.data, navigate]);

  // On mount, check if user can delete
  useEffect(() => {
    const formData = new FormData();
    formData.append('formType', 'privacyTab');
    formData.append('action', 'checkDeleteEligibility');
    deleteFetcher.submit(formData, { method: 'post' });
  }, []);

  // ---------------------------------------
  // Validate password form (add zxcvbn check)
  // ---------------------------------------
  const isFormValid =
    currentPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    passwordScore >= 3; // password must be 'good' or better (score 3 or 4)

  // --------------------------------------
  // Handlers for export/delete/deactivate
  // --------------------------------------
  const handleExportData = () => {
    const formData = new FormData();
    formData.append('formType', 'exportData');
    formData.append('action', 'exportData');
    exportFetcher.submit(formData, { method: 'post' });
  };

  const handleDeleteClick = () => {
    // Re-check if user can delete
    const formData = new FormData();
    formData.append('formType', 'privacyTab');
    formData.append('action', 'checkDeleteEligibility');
    deleteFetcher.submit(formData, { method: 'post' });

    if (!deleteDisabled) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    const formData = new FormData();
    formData.append('formType', 'privacyTab');
    formData.append('action', 'deleteAccount');
    if (feedback.trim()) {
      formData.append('feedback', feedback);
    }
    feedbackFetcher.submit(formData, { method: 'post' });
    setIsDeleteDialogOpen(false);
  };

  const handleDeactivateAccount = () => {
    settingsFetcher.submit({ formType: 'deactivateAccount' }, { method: 'post' });
  };

  // Account deactivation warning block
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

  // =====================================================
  //                 RENDER
  // =====================================================
  return (
    <div className="">
      {/* Password Update Form */}
      <settingsFetcher.Form method="post">
        <input type="hidden" name="formType" value="privacyTab" />

        <div className="p-6 space-y-12">
          {/* Error/Success messages (show after submit) */}
          {/* Top of form, can move below button if you prefer */}
          {settingsFetcher.data?.success && settingsFetcher.data?.message && (
            <div className="bg-green-100 text-green-700 p-2 rounded-md mt-2">
              {settingsFetcher.data.message}
            </div>
          )}
          {settingsFetcher.data?.error && (
            <div className="bg-red-100 text-red-700 p-2 rounded-md mt-2">
              {settingsFetcher.data.error}
            </div>
          )}

          {/* Password Section */}
          <section className="grid lg:grid-cols-[15%_75%] gap-8">
            <div className="text-lg font-semibold">Password</div>
            <div>
              <div className="text-base mt-1 mb-4">Change Password</div>
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
                  <div>
                    <AppFormField
                      className="w-1/2"
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      type="password"
                      defaultValue={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    {/* Password strength bar + feedback */}
                    {passwordScore < 3 && newPassword && (
                      <div className="text-red-500 text-xs mt-1">Password is too weak!</div>
                    )}
                  </div>
                  <div>
                    <AppFormField
                      className="w-1/2"
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      defaultValue={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    {/* {passwordScore < 3 && newPassword && (
                      <div className="text-red-500 text-xs mt-1">Password is too weak!</div>
                    )} */}
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`bg-primaryColor text-white sm:py-3 py-2 sm:px-2 px-1 xl:whitespace-nowrap not-active-gradient gradient-box rounded-xl xl:w-1/4 lg:w-1/3 md:w-2/5 w-1/2 sm:text-sm text-xs mb-2 mt-4 ${
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
          {/* DELETE ACCOUNT */}
          <div>
            <div className="text-base mt-1 mb-2">Delete my account</div>
            <div className="grid md:grid-cols-[50%_50%] md:gap-6 gap-4 items-center">
              <p className="text-sm text-gray-700">
                Mawaheb makes it easy to delete your account and all data associated with it.{' '}
                <span className="text-red-500">You cannot undo this.</span>
              </p>
              <div className="flex md:gap-4 gap-2">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={deleteDisabled}
                    className={`border border-gray-200 text-primaryColor lg:px-6 md:px-4 sm:px-3 px-2 py-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs ${
                      deleteDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-disabled={deleteDisabled}
                  >
                    Delete Account
                  </button>
                  {deleteDisabled && deleteDisabledMessage && (
                    <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal w-64">
                      {deleteDisabledMessage}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="border border-gray-200 text-primaryColor lg:px-6 md:px-4 sm:px-3 px-2 py-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* DEACTIVATE / REACTIVATE ACCOUNT */}
          <div>
            <div className="text-base mt-1">
              {currentAccountStatus === AccountStatus.Published
                ? 'Deactivate my account'
                : 'Reactivate my account'}
            </div>

            {currentAccountStatus === AccountStatus.Published ? (
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
            ) : (
              <div className="grid md:grid-cols-[70%_auto] md:gap-6 gap-4 items-center">
                <p className="text-sm text-gray-700">
                  Your account is currently deactivated. You can reactivate it at any time.
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
            )}
          </div>
        </div>
      </section>

      {/* ========================================
          DIALOG: DELETE ACCOUNT
      ========================================= */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="py-4 px-1">
            {deleteDisabled ? (
              <p className="text-red-500">{deleteDisabledMessage}</p>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="space-y-4">
                  <div>
                    <AppFormField
                      id="feedback"
                      name="feedback"
                      type="textarea"
                      label="Please tell us why you're leaving (optional)"
                      defaultValue={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      placeholder="Your feedback helps us improve"
                      className="w-full !h-[120px]"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="px-4 py-2 text-sm font-medium border bg-primaryColor/80 hover:bg-primaryColor/90 hover:text-white rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================
          DIALOG: DEACTIVATE/REACTIVATE ACCOUNT
      ========================================= */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAccountStatus === AccountStatus.Published
                ? 'Deactivate Account'
                : 'Reactivate Account'}
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <div className="mt-4">
                {currentAccountStatus === AccountStatus.Published ? (
                  <>
                    {getDeactivationWarning()}
                    <p>Are you sure you want to deactivate your account?</p>
                  </>
                ) : (
                  <p>Are you sure you want to reactivate your account?</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={currentAccountStatus === AccountStatus.Published ? 'destructive' : 'default'}
              onClick={handleDeactivateAccount}
              disabled={settingsFetcher.state === 'submitting'}
            >
              {settingsFetcher.state === 'submitting'
                ? currentAccountStatus === AccountStatus.Published
                  ? 'Deactivating...'
                  : 'Reactivating...'
                : currentAccountStatus === AccountStatus.Published
                  ? 'Deactivate Account'
                  : 'Reactivate Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
