import SettingsHeader from '~/common/settings/header/SettingHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import AccountTab from '~/common/settings/tabs/AccountTab';
import PrivacyTab from '~/common/settings/tabs/PrivacyTab';
import NotificationsTab from '~/common/settings/tabs/NotificationsTab';
import {
  getCurrentUser,
  getUserSettings,
  updateUserSettings,
  updateUserPassword,
  deactivateAccount,
  reactivateAccount,
  getCurrentUserAccountType,
  getCurrentUserAccountInfo,
  checkForActiveJobs,
  exportUserData,
  saveExitFeedback,
  requestAccountDeletion,
} from '~/servers/user.server';
import { AccountType, AccountStatus } from '@mawaheb/db';
import { hash, compare } from 'bcrypt-ts';
import { logout } from '~/auth/auth.server';

export const action = async ({ request }) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const target = formData.get('formType');
  const action = formData.get('action');

  // Handle account deactivation/reactivation
  if (target === 'deactivateAccount') {
    try {
      const userAccount = await getCurrentUserAccountInfo(request);
      const isDeactivated = userAccount?.accountStatus === AccountStatus.Deactivated;

      let success;
      if (isDeactivated) {
        success = await reactivateAccount(currentUser.id);
      } else {
        success = await deactivateAccount(currentUser.id);
      }

      if (success) {
        // If the account was deactivated, isDeactivated should be true
        // If the account was reactivated, isDeactivated should be false
        const newIsDeactivated = !isDeactivated;

        // Get the updated account status to confirm
        const updatedAccount = await getCurrentUserAccountInfo(request);

        return Response.json({
          success: true,
          formType: 'deactivateAccount',
          isDeactivated: updatedAccount?.accountStatus === AccountStatus.Deactivated,
        });
      } else {
        return Response.json(
          {
            success: false,
            error: isDeactivated ? 'Failed to reactivate account' : 'Failed to deactivate account',
            formType: 'deactivateAccount',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('💥 Error in account status change:', error);
      return Response.json(
        {
          success: false,
          error: 'An error occurred while updating account status',
          formType: 'deactivateAccount',
        },
        { status: 500 }
      );
    }
  }

  if (target === 'accountTab') {
    const phone = formData.get('fullPhone');

    const updatedSettings = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      country: formData.get('country'),
      address: formData.get('address'),
      region: formData.get('region'),
      phone,
      websiteURL: formData.get('websiteURL'),
      socialMediaLinks: JSON.parse(formData.get('socialMediaLinks') || '{}'),
    };

    try {
      await updateUserSettings(currentUser.id, updatedSettings);
      return Response.json({ success: true });
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
        { status: 500 }
      );
    }
  } else if (target === 'privacyTab') {
    if (action === 'checkDeleteEligibility') {
      try {
        const { hasActiveJobs, message } = await checkForActiveJobs(currentUser.id);
        return Response.json({
          success: !hasActiveJobs,
          hasActiveJobs,
          disabledMessage: message,
        });
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    } else if (action === 'deleteAccount') {
      try {
        const feedback = formData.get('feedback');
        if (feedback) {
          await saveExitFeedback(currentUser.id, feedback as string);
        }

        const result = await requestAccountDeletion(currentUser.id);

        if (!result.success) {
          return Response.json({
            success: false,
            error: result.error || 'Failed to delete account',
          });
        }

        return logout(request);
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    } else {
      const currentPassword = formData.get('currentPassword');
      const newPassword = formData.get('newPassword');
      const confirmPassword = formData.get('confirmPassword');

      if (!currentPassword || !newPassword || !confirmPassword) {
        return Response.json(
          { success: false, error: 'All fields are required.' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return Response.json(
          { success: false, error: 'New passwords do not match.' },
          { status: 400 }
        );
      }

      const storedUser = await getCurrentUser(request, true);
      if (!storedUser || !storedUser.passHash) {
        return Response.json({ success: false, error: 'User not found.' }, { status: 404 });
      }

      const isPasswordValid = await compare(currentPassword, storedUser.passHash);
      if (!isPasswordValid) {
        return Response.json(
          { success: false, error: 'Incorrect current password.' },
          { status: 401 }
        );
      }

      const hashedNewPassword = await hash(newPassword, 10);

      try {
        await updateUserPassword(currentUser.id, hashedNewPassword);
        return Response.json({
          success: true,
          message: 'Password updated successfully.',
        });
      } catch (error) {
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
          },
          { status: 500 }
        );
      }
    }
  } else if (target === 'exportData') {
    try {
      const userData = await exportUserData(currentUser.id);
      return new Response(JSON.stringify(userData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="user-data-${currentUser.id}.json"`,
        },
      });
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
        { status: 500 }
      );
    }
  }

  return Response.json({ success: false, error: 'Invalid request.' }, { status: 400 });
};

export const loader = async ({ request }) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const userSettings = await getUserSettings(currentUser.id);
  if (!userSettings) {
    throw new Response('User settings not found', { status: 404 });
  }

  // Get the user's account type and account info
  const accountType = await getCurrentUserAccountType(request);

  const userAccount = await getCurrentUserAccountInfo(request);

  const responseData = {
    settingsInfo: userSettings,
    user: {
      ...currentUser,
      accountType,
    },
    userAccountStatus: userAccount?.accountStatus || AccountStatus.Published,
  };

  return Response.json(responseData);
};

export default function Settings() {
  return (
    <div className="">
      <SettingsHeader />
      <Tabs defaultValue="account" className="">
        <TabsList className="flex sm:gap-4 gap-2 mb-4 md:w-[70%] lg:ml-0 md:ml-6 ml-0 bg-white">
          <TabsTrigger value="account" className="flex-grow text-center hover:scale-105">
            Account
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex-grow text-center hover:scale-105">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-grow text-center hover:scale-105">
            Notifications
          </TabsTrigger>
        </TabsList>

        <div className="">
          <TabsContent value="account" className="w-full">
            <AccountTab />
          </TabsContent>
          <TabsContent value="privacy" className="w-full">
            <PrivacyTab />
          </TabsContent>
          <TabsContent value="notifications" className="w-full">
            <NotificationsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
