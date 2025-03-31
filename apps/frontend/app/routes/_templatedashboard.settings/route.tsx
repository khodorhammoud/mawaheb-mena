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
  exportUserData,
  checkForActiveJobs,
  requestAccountDeletion,
  saveExitFeedback,
} from '~/servers/user.server';
import { hash, compare } from 'bcrypt-ts';

export const action = async ({ request }) => {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const target = formData.get('formType');
  const action = formData.get('action');

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
        // First save the feedback if provided
        const feedback = formData.get('feedback');
        if (feedback) {
          await saveExitFeedback(currentUser.id, feedback as string);
        }

        // Then request account deletion
        const result = await requestAccountDeletion(currentUser.id);
        if (!result.success) {
          return Response.json({
            success: false,
            error: result.error || 'Failed to delete account',
          });
        }

        // If successful, redirect to logout
        return Response.redirect('/logout');
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
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
      console.error('Error exporting user data:', error);
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

  return Response.json({ settingsInfo: userSettings });
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
