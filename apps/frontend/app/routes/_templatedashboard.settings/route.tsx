import SettingsHeader from "~/common/settings/header/SettingHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AccountTab from "~/common/settings/tabs/AccountTab";
import PrivacyTab from "~/common/settings/tabs/PrivacyTab";
import NotificationsTab from "~/common/settings/tabs/NotificationsTab";

export default function Settings() {
  return (
    <div className="">
      <SettingsHeader />
      <Tabs defaultValue="account" className="">
        {/* Tabs List */}
        <TabsList className="flex sm:gap-4 gap-2 mb-4 md:w-[70%] lg:ml-0 md:ml-6 ml-0">
          <TabsTrigger value="account" className="flex-grow text-center">
            Account
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex-grow text-center">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-grow text-center">
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
