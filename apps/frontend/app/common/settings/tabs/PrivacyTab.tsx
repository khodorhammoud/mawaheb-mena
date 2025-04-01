import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';

type SettingsFetcherData = {
  success?: boolean;
  error?: string;
  hasActiveJobs?: boolean;
  disabledMessage?: string;
};

type ExportDataResponse = {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
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
};

export default function PrivacyTab() {
  const settingsFetcher = useFetcher();
  const exportFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const feedbackFetcher = useFetcher();
  const navigate = useNavigate();

  // State for password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDisabled, setDeleteDisabled] = useState(false);
  const [deleteDisabledMessage, setDeleteDisabledMessage] = useState('');

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

  // Listen for delete fetcher response
  useEffect(() => {
    if (deleteFetcher.data) {
      const response = deleteFetcher.data as SettingsFetcherData;

      if (response.hasActiveJobs) {
        setDeleteDisabled(true);
        setDeleteDisabledMessage(
          'You cannot delete your account while there is jobs postings. Please close or complete all active jobs first.'
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

  // Listen for export fetcher response
  useEffect(() => {
    if (exportFetcher.data) {
      // Check if the response is an error
      if ('error' in exportFetcher.data) {
        setErrorMessage((exportFetcher.data as { error: string }).error);
        return;
      }

      const userData = exportFetcher.data as ExportDataResponse;

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

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    }
  }, [exportFetcher.data]);

  // Listen for feedback fetcher response
  useEffect(() => {
    if (feedbackFetcher.data) {
      const response = feedbackFetcher.data as SettingsFetcherData;
      if (response.success) {
        navigate('/auth/logout');
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    }
  }, [feedbackFetcher.data, navigate]);

  // Check for active jobs on mount
  useEffect(() => {
    const formData = new FormData();
    formData.append('formType', 'privacyTab');
    formData.append('action', 'checkDeleteEligibility');
    deleteFetcher.submit(formData, { method: 'post' });
  }, []);

  // Handle export data
  const handleExportData = () => {
    const formData = new FormData();
    formData.append('formType', 'exportData');
    formData.append('action', 'exportData');
    exportFetcher.submit(formData, { method: 'post' });
  };

  // Handle delete account click
  const handleDeleteClick = () => {
    const formData = new FormData();
    formData.append('formType', 'privacyTab');
    formData.append('action', 'checkDeleteEligibility');
    deleteFetcher.submit(formData, { method: 'post' });

    if (!deleteDisabled) {
      setIsDeleteDialogOpen(true);
    }
  };

  // Handle delete confirmation
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

  // Validation checks
  const isFormValid =
    currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

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
            <div>
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

          {/* Deactivate Account */}
          <div>
            <div className="text-base mt-1 mb-2">Deactivate my account</div>
            <div className="grid md:grid-cols-[50%_50%] xl:gap-8 lg:gap-10 md:gap-6 gap-4 items-center">
              <p className="text-sm text-gray-500">
                Mawaheb makes it easy to deactivate your account and all data associated with it.
                You can undo this at any time.
              </p>
              <button className="border border-gray-200 text-primaryColor sm:px-3 px-2 py-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs w-7/12 md:w-8/12 lg:w-3/5 xl:w-1/2">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {deleteDisabled ? (
              <p className="text-red-500">{deleteDisabledMessage}</p>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone.
                </p>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="feedback"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Please tell us why you're leaving (optional)
                    </label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      placeholder="Your feedback is for our improvement"
                      className="w-full"
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
    </div>
  );
}
