import AppFormField from "~/common/form-fields";

export default function AccountTab() {
  return (
    <div className="p-6 space-y-20 mb-60">
      {/* Account Info */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8">
        <div className="text-lg font-semibold">Account Info</div>
        <div className="flex flex-col gap-4">
          <div className="text-base mt-1 mb-2">General</div>
          <div className="flex sm:flex-row flex-col gap-4">
            {/* AppFormField for first name */}
            <AppFormField
              className="w-1/2"
              id="firstName"
              name="firstName"
              label="First Name"
            />

            {/* AppFormField for last name */}
            <AppFormField
              className="w-1/2"
              id="lastName"
              name="lastName"
              label="Last Name"
            />
          </div>
          <AppFormField id="email" name="email" label="Email Address" />
        </div>
        {/* defaultValue="hello@darinetleiss.dev" */}
      </section>

      {/* Location */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8">
        <div className="text-lg font-semibold mt-1">Location</div>
        <AppFormField id="country" name="country" label="Country" />
      </section>

      {/* Region */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8">
        <div className="text-lg font-semibold">Region</div>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          <div className="text-base mt-1 mb-2 col-span-2">Address</div>
          <AppFormField id="country" name="country" label="Country" />
          <AppFormField id="state" name="state" label="State/Provence" />
          <AppFormField id="address1" name="address1" label="Address Line 1" />
          <AppFormField id="address2" name="address2" label="Address Line 2" />
          <AppFormField id="city" name="city" label="City" />
          <AppFormField id="zip" name="zip" label="Zip" />
        </div>
      </section>

      {/* Mobile Number */}
      <section className="grid lg:grid-cols-[15%_75%] gap-8">
        <div className="text-lg font-semibold">Mobile Number</div>
        <div className="grid xl:grid-cols-[25%_50%_25%] lg:grid-cols-[30%_50%_20%] items-center lg:gap-2 gap-4">
          <div className="w-2/3 md:w-1/2 lg:w-full">
            <AppFormField
              id="phoneState"
              name="phoneState"
              label="Phone State"
            />
          </div>
          <div className="">
            <AppFormField
              id="number"
              name="number"
              placeholder="Phone Number"
              label="Phone Number"
            />
          </div>
          <button className="bg-primaryColor text-white xl:py-3 lg:py-1 sm:py-3 sm:px-2 py-2 px-1  xl:whitespace-nowrap not-active-gradient gradient-box rounded-xl w-2/3 md:w-1/2 lg:w-full text-sm">
            Save Phone Number
          </button>
        </div>
      </section>
    </div>
    //   <img
    //   src="https://flagcdn.com/w40/lb.png"
    //   alt="Lebanon Flag"
    //   className="w-6 h-4 mr-2"
    // />
  );
}
