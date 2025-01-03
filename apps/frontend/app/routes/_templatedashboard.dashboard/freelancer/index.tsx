import Heading from "~/common/profileView/heading/Heading";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import GeneralizableFormCard from "~/common/profileView/onboarding-form-component";
import { SlBadge } from "react-icons/sl";
import { FaDollarSign } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";

export default function Dashboard() {
  const { accountOnboarded, accountType, isOwner } = useLoaderData<{
    accountOnboarded: boolean;
    accountType: string;
    isOwner: boolean;
  }>();
  // Include accountType and isOwner from loader

  type ActionData = {
    error?: { message: string };
  };
  const actionData = useActionData<ActionData>();

  // Determine if the page should allow editing
  const canEdit = accountType === "freelancer" && isOwner;

  return (
    <div className="mt-10 relative">
      <div
        className="h-32 sm:h-36 md:h-40 w-auto sm:m-4 m-2 rounded-xl border-2 xl:mr-10 lg:mr-5 relative"
        style={{
          background: "linear-gradient(to right, #27638a 0%, white 75%)",
        }}
      >
        {/* Show Edit Title button only if the user can edit */}
        {canEdit && (
          <div className="absolute top-4 right-4">
            <button className="underline-none text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-5 sm:py-3 px-3 py-2 font-semibold tracking-wide not-active-gradient hover:text-white w-fit">
              Add Title
            </button>
          </div>
        )}
        <div className="xl:right-40 lg:right-32 md:right-24 sm:right-16 right-10">
          {/* Conditionally Render Star Rating */}
          {!accountOnboarded && (
            <div className="flex items-center justify-end mt-6 mr-1">
              <AiFillStar className="text-yellow-500 h-5 w-5 mr-1" />
              <span>0/5</span>
            </div>
          )}
        </div>
      </div>

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
            editable={canEdit} // Allow editing only if the user can edit
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
            editable={canEdit} // Allow editing only if the user can edit
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 md:ml-20 md:mr-20 ml-10 mr-10">
          {/* Introductory Video */}
          <GeneralizableFormCard
            formType="video"
            cardTitle="Don't miss out on this opportunity to make a great first impression."
            cardSubtitle="Upload a video to introduce yourself and your business."
            popupTitle="Introductory video"
            triggerLabel="Add Video"
            formName="freelancer-video"
            fieldName="videoLink"
            editable={canEdit} // Allow editing only if the user can edit
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
            editable={canEdit} // Allow editing only if the user can edit
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
            editable={canEdit} // Allow editing only if the user can edit
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
            editable={canEdit} // Allow editing only if the user can edit
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
            editable={canEdit} // Allow editing only if the user can edit
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
            editable={canEdit} // Allow editing only if the user can edit
          />
        </div>
      </div>
    </div>
  );
}
