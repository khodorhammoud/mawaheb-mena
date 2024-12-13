import AppFormField from "~/common/form-fields";

export default function PrivacyTab() {
  return (
    <div className="p-6 space-y-12">
      {/* Password Section */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8">
        <div className="text-lg font-semibold">Password</div>
        <div className="flex flex-col md:gap-6 gap-4">
          <div className="text-base mt-1 mb-2">Change Password</div>
          <div className="flex flex-col md:gap-8 gap-6">
            <AppFormField
              className="w-1/2"
              id="password"
              name="password"
              label="Current Password"
            />
            <div className="flex flex-col gap-4">
              <div className="">
                <AppFormField
                  className="w-1/2"
                  id="password"
                  name="password"
                  label="New Password"
                />
                <p className="text-[12px] text-gray-500 mt-1 ml-2 leading-3">
                  Password must be 8 characters, upper case, lower case,
                  symbols.
                </p>
              </div>
              <AppFormField
                className="w-1/2"
                id="password"
                name="password"
                label="Confirm Password"
              />
            </div>
          </div>
          <button className="bg-primaryColor text-white sm:py-3 py-2 sm:px-2 px-1 xl:whitespace-nowrap not-active-gradient gradient-box rounded-xl xl:w-1/4 lg:w-1/3 md:w-2/5 w-1/2 sm:text-sm text-xs">
            Save Changes
          </button>
        </div>
      </section>

      {/* Account Section */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8">
        <div className="text-lg font-semibold">Account</div>
        <div className="flex flex-col gap-6">
          {/* Delete Account */}
          <div>
            <div className="text-base mt-1 mb-2">Delete my account</div>
            <div className="grid md:grid-cols-[50%_50%] md:gap-6 gap-4 items-center">
              <p className="text-sm text-gray-700">
                Mawaheb makes it easy to delete your account and all data
                associated with it.{" "}
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
          <div>
            <div className="text-base mt-1 mb-2">Deactivate my account</div>
            <div className="grid md:grid-cols-[50%_50%] xl:gap-8 lg:gap-10 md:gap-6 gap-4 items-center">
              <p className="text-sm text-gray-500">
                Mawaheb makes it easy to deactivate your account and all data
                associated with it. You can undo this at any time.
              </p>
              <button className="border border-gray-200 text-primaryColor sm:px-3 px-2 py-2 not-active-gradient whitespace-nowrap gradient-box rounded-xl hover:text-white sm:text-sm text-xs w-7/12 md:w-8/12 lg:w-3/5 xl:w-1/2">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
