import Heading from "~/common/profileView/heading/Heading";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { Employer } from "~/types/User";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { BsCurrencyDollar } from "react-icons/bs";
import { SlBadge } from "react-icons/sl";

export default function EmployerOnboardingScreen() {
  // Use loader data to retrieve the user information
  const { currentProfile } = useLoaderData<{ currentProfile: Employer }>();

  type ActionData = {
    error?: { message: string };
  };
  const actionData = useActionData<ActionData>();

  return (
    <div className="mt-20">
      <Heading />
      <div className="grid grid-cols-1 mb-4">
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3">
          {/* Years in Business */}
          <GeneralizableFormCard
            formType="increment"
            cardTitle="Years in Business"
            popupTitle="Years in Business"
            triggerLabel="Add Years in Business"
            formName="employer-years-in-business"
            fieldName="yearsInBusiness"
            triggerIcon={<SlBadge />}
            editable={true}
          />
          {/* Budget */}
          <GeneralizableFormCard
            formType="number"
            cardTitle="Average Project Budget"
            popupTitle="Add Average Budget"
            triggerLabel="Add Average Budget"
            formName="employer-budget"
            fieldName="employerBudget"
            triggerIcon={<BsCurrencyDollar />}
            editable={true}
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1">
          {/* About */}
          <GeneralizableFormCard
            formType="textArea"
            cardTitle="About"
            popupTitle="Add Average Budget"
            triggerLabel="Add Bio"
            formName="employer-about"
            fieldName="about"
            editable={true}
          />
        </div>
        {/* 
        </div>
        {/* <div className="grid grid-cols-3">
          <div className="p-4">
            <BudgetModuleForm />
          </div>
          <div className="p-4">
            <YearsInBusiness />
          </div>
        </div> */}
        {/* <HourlyRate /> */}
        {/* 
        "text"
    | "number"
    | "textArea"
    | "increment"
    | "video"
    | "file"
    | "custom";
        */}

        {/* range */}
        {/* <GeneralizableFormCard
          formType="range"
          minVal={12}
          maxVal={24}
          cardTitle="Range Card Title"
          popupTitle="Range Popup Title"
          triggerLabel="Edit Range"
          formName="employer-years-in-business"
          fieldName="years-in-business"
          triggerIcon={<SlBadge />}
          onSave={() => alert("save")}
        /> */}
        {/* <GeneralizableFormCard
          formType="number"
          title="Number"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="textArea"
          title="Text Area"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="increment"
          title="Increment"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="video"
          title="Video"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="file"
          title="File"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
        />
        <GeneralizableFormCard
          formType="custom"
          title="Custom"
          triggerLabel="Trigger Label"
          onSave={() => alert("save")}
          customComponents={[
            <div key="custom-component">Custom Component</div>,
          ]}
        /> */}
      </div>
      {/* <About /> */}

      {/* BUTTON */}
      <div className="sm:mt-6 mt-2 flex justify-end mr-24">
        {/* Form to update the user's onboard status */}
        <Form method="post">
          {/* this input sends the userId to be used in the action (queries, ....) */}
          <input
            type="hidden"
            name="userId"
            value={currentProfile.account.user.id}
          />
          <input type="hidden" name="target-updated" value="employer-onboard" />
          {/* in the switch case, use value employer-onboard */}
          <button
            type="submit"
            className="text-white sm:py-3 sm:px-6 py-2 px-4 rounded-xl bg-primaryColor font-medium not-active-gradient"
          >
            Proceed
          </button>
        </Form>
        {actionData?.error && (
          <p className="text-red-500 mt-2">{actionData.error.message}</p>
        )}
      </div>
    </div>
  );
}
