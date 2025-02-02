import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import AppFormField from "~/common/form-fields";

export default function AccountTab() {
  const { settingsInfo } = useLoaderData<{ settingsInfo: any }>();
  const settingsFetcher = useFetcher();

  // Parse phone number (split by "||" if it exists)
  const storedPhone = settingsInfo.phone || "+961||"; // Ensure it has a default format
  const [countryCode, storedPhoneNumber] = storedPhone.split("||");

  // State for controlled inputs
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode);
  const [phone, setPhone] = useState(storedPhoneNumber || ""); // Prevent undefined

  // 🔥 Error & Success Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 🔥 Listen for fetcher response and handle messages
  useEffect(() => {
    if (settingsFetcher.data) {
      const response = settingsFetcher.data as {
        success?: boolean;
        error?: string;
      };

      if (!response.success) {
        setErrorMessage(response.error || "An error occurred.");
        setSuccessMessage(null);
      } else {
        setErrorMessage(null);
        setSuccessMessage("Account settings updated successfully!");
      }
    }
  }, [settingsFetcher.data]);

  return (
    <settingsFetcher.Form method="post">
      {/* 🔥 Hidden field to indicate this is AccountTab */}
      <input type="hidden" name="formType" value="accountTab" />

      <div className="p-6 space-y-20 mb-60">
        {/* 🔥 Display error messages */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md">
            {errorMessage}
          </div>
        )}

        {/* 🔥 Display success message */}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-2 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Account Info */}
        <section className="grid lg:grid-cols-[15%_75%] gap-8">
          <div className="text-lg font-semibold">Account Info</div>
          <div className="flex flex-col gap-4">
            <div className="text-base mt-1 mb-2">General</div>
            <div className="flex sm:flex-row flex-col gap-4">
              {/* First Name */}
              <AppFormField
                className="w-1/2"
                id="firstName"
                name="firstName"
                label="First Name"
                defaultValue={settingsInfo.firstName}
              />

              {/* Last Name */}
              <AppFormField
                className="w-1/2"
                id="lastName"
                name="lastName"
                label="Last Name"
                defaultValue={settingsInfo.lastName}
              />
            </div>

            {/* Email */}
            <AppFormField
              id="email"
              name="email"
              label="Email Address"
              defaultValue={settingsInfo.email}
            />
          </div>
        </section>

        {/* Location */}
        <section className="grid lg:grid-cols-[15%_75%] gap-8">
          <div className="text-lg font-semibold mt-1">Location</div>
          <div className="grid grid-cols-2 flex-col gap-4">
            {/* Country */}
            <AppFormField
              id="country"
              name="country"
              label="Country"
              defaultValue={settingsInfo.country}
            />

            {/* Address */}
            <AppFormField
              id="address"
              name="address"
              label="Address"
              defaultValue={settingsInfo.address}
            />
          </div>
        </section>

        {/* Region (Hidden) */}
        <section className="grid lg:grid-cols-[15%_75%] gap-8 hidden">
          <div className="text-lg font-semibold">Region</div>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div className="text-base mt-1 mb-2 col-span-2">Address</div>
            <AppFormField
              id="state"
              name="state"
              label="State/Province"
              defaultValue={settingsInfo.region}
            />
            <AppFormField
              id="address1"
              name="address1"
              label="Address Line 1"
              defaultValue={settingsInfo.address}
            />
            <AppFormField
              id="address2"
              name="address2"
              label="Address Line 2"
              defaultValue=""
            />
            <AppFormField id="city" name="city" label="City" defaultValue="" />
            <AppFormField id="zip" name="zip" label="Zip" defaultValue="" />
          </div>
        </section>

        {/* Mobile Number */}
        <section className="grid lg:grid-cols-[15%_75%] gap-8">
          <div className="text-lg font-semibold">Mobile Number</div>
          <div className="grid xl:grid-cols-[25%_50%_25%] lg:grid-cols-[30%_50%_20%] items-center lg:gap-2 gap-4">
            {/* +961 */}
            <div className="w-2/3 md:w-1/2 lg:w-full">
              <AppFormField
                id="phoneState"
                name="phoneState"
                label="Phone State"
                type="select"
                defaultValue={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="">
              <AppFormField
                id="phone"
                name="phone"
                placeholder="Phone Number"
                label="Phone Number"
                defaultValue={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* 🔥 Hidden field to store formatted phone number */}
            <input
              type="hidden"
              name="fullPhone"
              value={`${selectedCountryCode}||${phone}`}
            />

            <button
              type="submit"
              className="bg-primaryColor text-white xl:py-3 lg:py-1 sm:py-3 sm:px-2 py-2 px-1 xl:whitespace-nowrap not-active-gradient gradient-box rounded-xl w-2/3 md:w-1/2 lg:w-full text-sm"
            >
              Save Phone Number
            </button>
          </div>
        </section>
      </div>
    </settingsFetcher.Form>
  );
}
