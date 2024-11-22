import Heading from "~/common/profileView/heading/Heading";
import { Form, useActionData } from "@remix-run/react";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { SlBadge } from "react-icons/sl";
import { FaDollarSign } from "react-icons/fa";

export default function EmployerOnboardingScreen() {
  type ActionData = {
    error?: { message: string };
  };
  const actionData = useActionData<ActionData>();

  return (
    <div className="mt-24">
      <div className="bg-primaryColor md:h-40 sm:h-36 h-32 w-auto sm:m-4 m-2 rounded-xl border-2"></div>
      <Heading />
      <div className="grid grid-cols-1 mb-4">
        <div className="grid mb-4 grid-cols-1 gap-4 lg:grid-cols-2 xl:w-[70%] lg:w-[76%] md:ml-20 md:mr-20 ml-10 mr-10">
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
        <div className="grid mb-4 grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 md:ml-20 md:mr-20 ml-10 mr-10">
          {/* Years of Experience */}
          <GeneralizableFormCard
            formType="video"
            cardTitle="Don't miss out on this opportunity to make a great first impression."
            cardSubtitle="Upload a video to introduce yourself and your business."
            popupTitle="Introductory video"
            triggerLabel="Add Video"
            formName="freelancer-video"
            fieldName="videoLink"
          />

          {/* About */}
          <GeneralizableFormCard
            formType="textArea"
            cardTitle="About"
            cardSubtitle="Add your headline and bio
            Share more about yourself and what you
            hope to accomplish."
            popupTitle="Introduce Yourself"
            triggerLabel="Add Bio"
            formName="freelancer-about"
            fieldName="about"
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 md:ml-20 md:mr-20 ml-10 mr-10">
          {/* Portfolio */}
          <GeneralizableFormCard
            formType="repeatable"
            cardTitle="Projects"
            popupTitle="Add a Project"
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

        {/* BUTTON */}
        <div className="sm:mt-6 mt-2 flex justify-end mr-24">
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
              className="text-white sm:py-3 sm:px-6 py-2 px-4 rounded-xl bg-primaryColor font-medium not-active-gradient"
            >
              Proceed
            </button>
          </Form>

          {/* ERROR MESSAGE */}
          {actionData?.error && (
            <p className="text-red-500 mt-2">{actionData.error.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
