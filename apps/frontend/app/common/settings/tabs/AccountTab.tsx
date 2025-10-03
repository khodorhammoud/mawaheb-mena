import { useState, useEffect } from 'react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import AddressAutocomplete from '~/components/AddressAutocomplete';
import { useGoogleMapsScript } from '~/components/hooks/use-google-maps-script';

function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return children;
}

export default function AccountTab() {
  const { settingsInfo, userAccountStatus } = useLoaderData<{
    settingsInfo: any;
    userAccountStatus: any;
  }>();
  const settingsFetcher = useFetcher();

  // Check if account is deactivated
  const isDeactivated = userAccountStatus === 'deactivated' || userAccountStatus === 'Deactivated';

  // Debug logging for test
  if (typeof window !== 'undefined') {
    console.log('🔍 AccountTab Debug:', { userAccountStatus, isDeactivated });
  }

  // Parse phone number (split by "||" if it exists)
  const storedPhone = settingsInfo.phone || '+961||'; // Ensure it has a default format
  const [countryCode, storedPhoneNumber] = storedPhone.split('||');

  const [country, setCountry] = useState(settingsInfo.country || '');

  // State for controlled inputs
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCode);
  const [phone, setPhone] = useState(storedPhoneNumber || ''); // Prevent undefined

  // 🔥 Error & Success Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [address, setAddress] = useState(settingsInfo.address || '');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const googleLoaded = useGoogleMapsScript(apiKey);

  // 🔥 Listen for fetcher response and handle messages
  // Handle form submission response from action
  useEffect(() => {
    // Check if there's a response from the action in the URL or page state
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      setErrorMessage(null);
      setSuccessMessage('Account settings updated successfully!');
      // Auto-dismiss success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        // Clean up the URL parameter to prevent showing on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('success');
        window.history.replaceState({}, '', newUrl.toString());
      }, 5000);
      return () => clearTimeout(timer);
    } else if (error) {
      setSuccessMessage(null);
      setErrorMessage(error);
      // Clean up the URL parameter to prevent showing on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  return (
    <form method="post" action="/settings">
      {/* 🔥 Hidden field to indicate this is AccountTab */}
      <input type="hidden" name="formType" value="accountTab" />

      <div className="p-6 space-y-20 mb-60">
        {/* 🔥 Display error messages */}
        {errorMessage && (
          <div
            className="bg-red-100 text-red-700 p-2 rounded-md"
            data-testid="account-error-message"
          >
            {errorMessage}
          </div>
        )}

        {/* 🔥 Display success message */}
        {successMessage && (
          <div
            className="bg-green-100 text-green-700 p-2 rounded-md"
            data-testid="account-success-message"
          >
            {successMessage}
          </div>
        )}

        {/* 🔥 Deactivated Account Warning */}
        {isDeactivated && (
          <div
            className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-md mb-4"
            data-testid="account-deactivated-warning"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Account Deactivated</p>
                <p className="text-sm mt-1">
                  Your account is deactivated. You can view your settings but cannot make changes.
                  <a href="#privacy" className="underline font-medium hover:text-orange-800 ml-1">
                    Go to Privacy tab to reactivate your account
                  </a>
                </p>
              </div>
            </div>
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
                data-testid="account-first-name"
              />

              {/* Last Name */}
              <AppFormField
                className="w-1/2"
                id="lastName"
                name="lastName"
                label="Last Name"
                defaultValue={settingsInfo.lastName}
                data-testid="account-last-name"
              />
            </div>

            {/* Email */}
            <AppFormField
              id="email"
              name="email"
              label="Email Address"
              defaultValue={settingsInfo.email}
              data-testid="account-email"
            />
          </div>
        </section>

        {/* Location */}
        <section className="grid lg:grid-cols-[15%_75%] gap-8">
          <div className="text-lg font-semibold mt-1">Location</div>
          <div className="grid grid-cols-2 flex-col gap-4">
            {/* Country */}
            <div className="">
              <AppFormField
                id="countryDropdown"
                name="country"
                label="Country"
                type="country"
                defaultValue={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full"
                data-testid="account-country"
              />
            </div>

            {/* Address */}
            <ClientOnly>
              {googleLoaded ? (
                <>
                  <AddressAutocomplete value={address} onChange={setAddress} />
                  <input
                    type="hidden"
                    name="address"
                    value={address}
                    data-testid="account-address"
                  />
                </>
              ) : (
                <input disabled placeholder="Loading address autocomplete..." className="w-full" />
              )}
            </ClientOnly>
          </div>
        </section>

        {/* Region (Hidden) */}
        <section className="hidden">
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
            <AppFormField id="address2" name="address2" label="Address Line 2" defaultValue="" />
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
                onChange={e => setSelectedCountryCode(e.target.value)}
                data-testid="account-phone-state"
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
                onChange={e => setPhone(e.target.value)}
                data-testid="account-phone-number"
              />
            </div>

            {/* 🔥 Hidden field to store formatted phone number */}
            <input type="hidden" name="fullPhone" value={`${selectedCountryCode}||${phone}`} />

            <button
              type="submit"
              disabled={isDeactivated}
              className={`xl:py-3 lg:py-1 sm:py-3 sm:px-2 py-2 px-1 xl:whitespace-nowrap not-active-gradient gradient-box rounded-xl w-2/3 md:w-1/2 lg:w-full text-sm focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 ${
      isDeactivated
        ? 'bg-primaryColor/90 text-white cursor-not-allowed opacity-70'
        : 'bg-primaryColor text-white hover:bg-primaryColor-dark'
    }`}
              data-testid="account-save-changes"
              title={
                isDeactivated ? 'Reactivate your account to save changes' : 'Save your changes'
              }
            >
              {isDeactivated ? 'Save Changes (Disabled)' : 'Save Changes'}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}
