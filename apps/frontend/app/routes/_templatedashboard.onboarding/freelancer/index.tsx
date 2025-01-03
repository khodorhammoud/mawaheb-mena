import Heading from "../common/heading/Heading";
// import YearsInBusiness from "./years-in-business-module/Form";
// import About from "./about-module/Form";
// import BudgetModuleForm from "./budget-module/Form";
import { Form, useActionData /* , useLoaderData */ } from "@remix-run/react";
// import type { Employer } from "~/types/User";
// import HourlyRate from "./hourlyRate";
import GeneralizableFormCard from "../common/onboarding-form-component";
// import { BsCurrencyDollar } from "react-icons/bs";
import { SlBadge } from "react-icons/sl";
import { FaDollarSign } from "react-icons/fa";

export default function EmployerOnboardingScreen() {
  // Use loader data to retrieve the user information
  // const { currentProfile } = useLoaderData<{ currentProfile: Employer }>();

  type ActionData = {
    error?: { message: string };
  };
  const actionData = useActionData<ActionData>();

  return (
    <div className="mt-20">
      <Heading />
      <div className="grid grid-cols-1 mb-4">
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-3">
          {/* Hourly Rate */}
          <GeneralizableFormCard
            formType="range"
            cardTitle="Hourly Rate"
            popupTitle="Hourly Rate"
            triggerLabel="Add Hourly Rate"
            formName="freelancer-hourly-rate"
            fieldName="hourlyRate"
            triggerIcon={<FaDollarSign />}
            minVal={10}
            maxVal={100}
          />

          {/* Years of Experience */}
          <GeneralizableFormCard
            formType="increment"
            cardTitle="Experience"
            popupTitle="Years of experience"
            triggerLabel="Add Years of Experience"
            formName="freelancer-years-of-experience"
            fieldName="yearsOfExperience"
            triggerIcon={<SlBadge />}
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2">
          {/* Years of Experience */}
          <GeneralizableFormCard
            formType="video"
            cardTitle="Don't miss out on this opportunity to make a great first impression."
            cardSubtitle="Upload a video to introduce yourself and your business."
            popupTitle="Introductory video"
            triggerLabel="Add Video"
            formName="freelancer-video"
            fieldName="introductoryVideo"
          />

          {/* About */}
          <GeneralizableFormCard
            formType="textArea"
            cardTitle="About"
            popupTitle="Introduce Yourself"
            triggerLabel="Add Bio"
            formName="freelancer-about"
            fieldName="about"
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1">
          {/* Portfolio */}
          <GeneralizableFormCard
            formType="repeatable"
            cardTitle="Projects"
            popupTitle="Add Average Budget"
            cardSubtitle="Upload your portfolio pieces and projects and let your work speak for itself."
            triggerLabel="Add Projects"
            formName="freelancer-portfolio"
            fieldName="portfolio"
            repeatableFieldName="portfolio"
          />

          {/* Work History */}
          <GeneralizableFormCard
            formType="repeatable"
            cardTitle="Work History"
            popupTitle="Work History"
            triggerLabel="Add Work History"
            formName="freelancer-work-history"
            fieldName="workHistory"
            repeatableFieldName="workHistory"
          />
          {/* Certificates */}
          <GeneralizableFormCard
            formType="repeatable"
            cardTitle="Certificates"
            cardSubtitle="Add your certifications."
            popupTitle="Add Certificates"
            triggerLabel="Add Certificates"
            formName="freelancer-certificates"
            fieldName="certificates"
            repeatableFieldName="certificates"
          />

          {/* Education */}
          <GeneralizableFormCard
            formType="repeatable"
            cardTitle="Education"
            cardSubtitle="Add your education and degrees."
            popupTitle="Add Education"
            triggerLabel="Add Education"
            formName="freelancer-educations"
            fieldName="educations"
            repeatableFieldName="educations"
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
      <div className="mt-6 flex justify-center">
        {/* Form to update the user's onboard status */}
        <Form method="post">
          <input
            type="hidden"
            name="target-updated"
            value="freelancer-onboard"
          />
          {/* in the switch case, use value employer-onboard */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
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
