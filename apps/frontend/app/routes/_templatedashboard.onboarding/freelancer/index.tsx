import Heading from '~/common/profileView/heading/Heading';
import { Form, useActionData, useLoaderData, useFetcher } from '@remix-run/react';
import GeneralizableFormCard from '~/common/profileView/onboarding-form-component';
import { SlBadge } from 'react-icons/sl';
import { FaDollarSign, FaFileUpload } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';
import { FreelancerOnboardingData } from '../types';

export default function FreelancerOnboardingScreen() {
  type ActionData = {
    error?: { message: string };
  };
  const actionData = useActionData<ActionData>();
  const { accountOnboarded, currentProfile, freelancerSkills, freelancerLanguages } =
    useLoaderData<FreelancerOnboardingData>();
  const fetcher = useFetcher();

  // Add this helper
  const safeParseArray = (data: any): any[] => {
    try {
      return Array.isArray(data) ? data : JSON.parse(data ?? '[]');
    } catch {
      return [];
    }
  };

  const normalizedProfile = {
    ...currentProfile,
    portfolio: safeParseArray(currentProfile.portfolio),
    workHistory: safeParseArray(currentProfile.workHistory),
    certificates: safeParseArray(currentProfile.certificates),
    educations: safeParseArray(currentProfile.educations),
  };

  // Create a profile object that matches what the Heading component expects
  const profileWithSkillsAndLanguages = {
    ...normalizedProfile,
    skills:
      freelancerSkills?.map(skill => ({
        skillId: skill.skillId,
        label: skill.label,
        yearsOfExperience: skill.yearsOfExperience,
        isStarred: skill.isStarred,
      })) || [],
    languages: freelancerLanguages || [],
  };

  // console.log('🔥 Portfolio Data in GeneralizableFormCard:', normalizedProfile.portfolio);

  return (
    <div className="container mx-auto px-4">
      <div
        className="h-32 sm:h-36 md:h-40 w-auto sm:m-4 m-2 rounded-xl border-2 relative"
        style={{
          background: 'linear-gradient(to right, #27638a 0%, white 75%)',
        }}
      >
        <div className="absolute top-4 right-4">
          <button className="underline-none text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-5 sm:py-3 px-3 py-2 font-semibold tracking-wide not-active-gradient hover:text-white w-fit">
            Add Title
          </button>
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
      </div>

      <Heading profile={profileWithSkillsAndLanguages} />

      <div className="grid grid-cols-1 mb-4">
        {/* CV Upload */}
        <div className="grid mb-4 mt-6 grid-cols-1 gap-4 md:ml-20 md:mr-20 ml-10 mr-10">
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="file"
            cardTitle="Upload your CV"
            cardSubtitle="Upload your CV to automatically fill your profile information"
            popupTitle="Upload CV"
            triggerLabel="Upload CV"
            formName="freelancer-cv"
            fieldName="cvFile"
            triggerIcon={<FaFileUpload />}
            editable={true}
            acceptedFileTypes=".pdf,.doc,.docx"
            showLoadingOnSubmit={true}
          />
        </div>

        <div className="grid mb-4 grid-cols-1 gap-4 lg:grid-cols-2 xl:w-[70%] lg:w-[76%] md:ml-20 md:mr-20 ml-10 mr-10">
          {/* Hourly Rate */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="range"
            cardTitle="Hourly Rate"
            popupTitle="Hourly Rate"
            triggerLabel="Add Hourly Rate"
            formName="freelancer-hourly-rate"
            fieldName="hourlyRate"
            triggerIcon={<FaDollarSign />}
            minVal={10}
            maxVal={100}
            editable={true}
          />

          {/* Years of Experience */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="increment"
            cardTitle="Experience"
            popupTitle="Years of experience"
            triggerLabel="Add Years of Experience"
            formName="freelancer-years-of-experience"
            fieldName="yearsOfExperience"
            triggerIcon={<SlBadge />}
            editable={true}
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 md:ml-20 md:mr-20 ml-10 mr-10">
          {/* Years of Experience */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="video"
            cardTitle="Don't miss out on this opportunity to make a great first impression."
            cardSubtitle="Upload a video to introduce yourself and your business."
            popupTitle="Introductory video"
            triggerLabel="Add Video"
            formName="freelancer-video"
            fieldName="videoLink"
            editable={true}
          />

          {/* About */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="textArea"
            cardTitle="About"
            cardSubtitle="Add your headline and bio
            Share more about yourself and what you
            hope to accomplish."
            popupTitle="Introduce Yourself"
            triggerLabel="Add Bio"
            formName="freelancer-about"
            fieldName="about"
            useRichText={true}
            editable={true}
          />
        </div>
        <div className="grid mb-4 grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 md:ml-20 md:mr-20 ml-10 mr-10">
          {/* Portfolio */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="repeatable"
            cardTitle="Projects"
            popupTitle="Add a Project"
            cardSubtitle="Upload your portfolio pieces and projects and let your work speak for itself."
            triggerLabel="Add Projects"
            formName="freelancer-portfolio"
            fieldName="portfolio"
            repeatableFieldName="portfolio"
            editable={true}
          />

          {/* Work History */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="repeatable"
            cardTitle="Work History"
            popupTitle="Work History"
            triggerLabel="Add Work History"
            formName="freelancer-work-history"
            fieldName="workHistory"
            repeatableFieldName="workHistory"
            editable={true}
          />
          {/* Certificates */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="repeatable"
            cardTitle="Certificates"
            cardSubtitle="Add your certifications."
            popupTitle="Add Certificates"
            triggerLabel="Add Certificates"
            formName="freelancer-certificates"
            fieldName="certificates"
            repeatableFieldName="certificates"
            editable={true}
          />

          {/* Education */}
          <GeneralizableFormCard
            fetcher={fetcher}
            formType="repeatable"
            cardTitle="Education"
            cardSubtitle="Add your education and degrees."
            popupTitle="Add Education"
            triggerLabel="Add Education"
            formName="freelancer-educations"
            fieldName="educations"
            repeatableFieldName="educations"
            editable={true}
          />
        </div>

        {/* BUTTON */}
        <div className="sm:mt-6 mt-2 flex justify-end mr-24">
          {/* Form to update the user's onboard status */}
          <Form method="post">
            <input type="hidden" name="target-updated" value="freelancer-onboard" />
            {/* in the switch case, use value employer-onboard */}
            <button
              type="submit"
              className="text-white sm:py-3 sm:px-6 py-2 px-4 rounded-xl bg-primaryColor font-medium not-active-gradient"
            >
              Proceed
            </button>
          </Form>

          {/* ERROR MESSAGE */}
          {actionData?.error && <p className="text-red-500 mt-2">{actionData.error.message}</p>}
        </div>
      </div>
    </div>
  );
}
