import { Button } from "~/components/ui/button";

export default function SettingsHeader() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="xl:text-4xl md:text-3xl sm:text-2xl text-xl sm:ml-5 ml-4">
        Settings
      </div>
      <div className="flex md:gap-4 gap-2">
        <Button className="border border-gray-200 text-primaryColor lg:px-6 md:px-4 sm:px-3 px-2 not-active-gradient gradient-box rounded-xl hover:text-white sm:text-sm text-xs">
          Discard
        </Button>
        <Button className="bg-primaryColor text-white lg:px-6 md:px-4 sm:py-2 sm:px-3 px-2 not-active-gradient gradient-box rounded-xl sm:text-sm text-xs">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
