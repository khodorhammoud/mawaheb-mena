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
  getCurrentUserAccountType,
} from '~/servers/user.server';
import { hash, compare } from 'bcrypt-ts';
import { AccountType } from '~/types/enums';

export const action = async ({ request }) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const target = formData.get('formType');

  // Handle account deactivation
  if (target === 'deactivateAccount') {
    try {
      const success = await deactivateAccount(currentUser.id);

      if (success) {
        return Response.json({
          success: true,
          formType: 'deactivateAccount',
        });
      } else {
        return Response.json(
          {
            success: false,
            error: 'Failed to deactivate account',
            formType: 'deactivateAccount',
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('💥 Error in deactivation:', error);
      return Response.json(
        {
          success: false,
          error: 'An error occurred while deactivating account',
          formType: 'deactivateAccount',
        },
        { status: 500 }
      );
    }
  }

  if (target === 'accountTab') {
    // ✅ AccountTab: Only updates user info, not password
    const phone = formData.get('fullPhone'); // ✅ Stored as "{countryCode}||{phone}"

    const updatedSettings = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      country: formData.get('country'),
      address: formData.get('address'),
      region: formData.get('region'),
      phone, // ✅ Saves in "{countryCode}||{phone}" format
      websiteURL: formData.get('websiteURL'),
      socialMediaLinks: JSON.parse(formData.get('socialMediaLinks') || '{}'),
    };

    try {
      await updateUserSettings(currentUser.id, updatedSettings);
      return Response.json({ success: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        },
        { status: 500 }
      );
    }
  } else if (target === 'privacyTab') {
    // ✅ PrivacyTab: Only updates password
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    // Ensure all fields are filled
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    // Ensure new passwords match
    if (newPassword !== confirmPassword) {
      return Response.json(
        { success: false, error: 'New passwords do not match.' },
        { status: 400 }
      );
    }

    // Fetch stored hashed password from DB
    const storedUser = await getCurrentUser(request, true);
    if (!storedUser || !storedUser.passHash) {
      return Response.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, storedUser.passHash);
    if (!isPasswordValid) {
      return Response.json(
        { success: false, error: 'Incorrect current password.' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 10);

    // Update password in database
    try {
      await updateUserPassword(currentUser.id, hashedNewPassword);
      return Response.json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (error) {
      console.error('Error updating password:', error);
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

  // Get the user's account type
  const accountType = await getCurrentUserAccountType(request);

  return Response.json({
    settingsInfo: userSettings,
    user: {
      ...currentUser,
      accountType,
    },
  });
};

export default function Settings() {
  return (
    <div className="">
      <SettingsHeader />
      <Tabs defaultValue="account" className="">
        {/* Tabs List */}
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

        {/* Tabs Content */}
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
