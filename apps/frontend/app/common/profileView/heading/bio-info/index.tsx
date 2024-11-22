import { useState, useRef, MutableRefObject, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { RiGitlabFill } from "react-icons/ri";
import { IoPencilSharp } from "react-icons/io5";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaStackOverflow,
} from "react-icons/fa";
import { TbBrandGithubFilled, TbBrandDribbbleFilled } from "react-icons/tb";
import { AccountBio } from "~/types/User";
import { parseHTTP } from "~/lib/utils";
import AppFormField from "~/common/form-fields";

export default function Heading() {
  const [open, setOpen] = useState(false); // Bio dialog state
  const [showBioMessage, setShowBioMessage] = useState(false); // Track bio message visibility

  const bioFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for bio form

  // Load data
  const { bioInfo } = useLoaderData() as {
    bioInfo: AccountBio;
  };

  // Refs for location and website input fields
  const locationInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

  // Handle opening the bio dialog and focusing the relevant input
  const handleTriggerClick = (ref: MutableRefObject<HTMLInputElement>) => {
    setOpen(true);
    setTimeout(() => {
      ref.current?.focus();
    }, 100);
  };

  // Handle showing the bio submission message
  useEffect(() => {
    if (bioFetcher.data?.success || bioFetcher.data?.error) {
      setShowBioMessage(true);
    }
  }, [bioFetcher.data]);

  // Reset messages when the bio dialog is closed
  const handleBioDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowBioMessage(false); // Clear bio message when dialog is closed
    }
  };

  return (
    <>
      {/* CIRCLE */}
      <div className="bg-blue-100 rounded-full w-36 h-36 flex items-center justify-center mr-5 ml-20 mb-14">
        <span className="text-5xl font-semibold text-primaryColor">
          {bioInfo.firstName.charAt(0).toUpperCase()}
          {bioInfo.lastName.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* NAME + ✏️ + POPUP + BUTTONS */}
      <div className="mb-14">
        {/* NAME + ✏️ + POPUP */}
        <div className="flex mt-10">
          {/* NAME */}
          <h1 className="text-3xl">
            {bioInfo.firstName} {bioInfo.lastName}
          </h1>
          {/* ✏️ + POPUP */}
          <Dialog open={open} onOpenChange={handleBioDialogChange}>
            {/* ✏️ */}
            <DialogTrigger asChild>
              <Button variant="link">
                <IoPencilSharp className="h-9 w-8 hover:bg-slate-100 transition-all hover:rounded-xl p-1 mb-1" />
              </Button>
            </DialogTrigger>
            {/* POPUP CONTENT */}
            <DialogContent className="bg-white">
              {/* BIO */}
              <DialogHeader>
                <DialogTitle className="mt-3 text-lg">Bio</DialogTitle>
              </DialogHeader>

              {/* ERROR MESSAGE */}
              {showBioMessage && bioFetcher.data?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">
                    {bioFetcher.data.error.message}
                  </span>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {showBioMessage && bioFetcher.data?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">
                    Bio updated successfully
                  </span>
                </div>
              )}

              {/* FORM */}
              <bioFetcher.Form method="post" className="">
                <input
                  type="hidden"
                  name="target-updated"
                  value="freelancer-bio" // this value should match the target in the route.tsx
                />
                <div className="grid grid-cols-2 gap-4">
                  {/* FIRST NAME */}
                  <div>
                    <AppFormField
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      className="peer mt-1"
                      defaultValue={bioInfo.firstName}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <AppFormField
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      className="peer mt-1"
                      defaultValue={bioInfo.firstName}
                    />
                  </div>

                  {/* Location */}
                  <div className="">
                    <div className="relative">
                      {/* Location */}
                      <AppFormField
                        id="location"
                        name="location"
                        label="Location"
                        className="peer mt-1"
                        defaultValue={bioInfo.location}
                      />
                      <FaMapMarkerAlt className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      {/* ref={locationInputRef} */}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg mb-6 mt-6">My online profiles</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* PERSONAL WEBSITE */}
                  <div className="relative">
                    <AppFormField
                      id="website"
                      name="website"
                      label="Personal Website"
                      className="peer mt-1"
                      defaultValue={bioInfo.websiteURL}
                    />
                    <FaGlobe className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                  </div>

                  {/* LinkedIn */}
                  <div className="relative mt-1">
                    <AppFormField
                      id="linkedin"
                      name="linkedin"
                      label="LinkedIn"
                      defaultValue={bioInfo.socialMediaLinks?.linkedin}
                    />
                    <FaLinkedinIn className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                  </div>

                  {/* GitHub */}
                  <div className="relative">
                    <AppFormField
                      id="github"
                      name="github"
                      label="GitHub"
                      defaultValue={bioInfo.socialMediaLinks?.github}
                    />
                    <TbBrandGithubFilled className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                  </div>

                  {/* GitLab */}
                  <div className="relative">
                    <AppFormField
                      id="gitlab"
                      name="gitlab"
                      label="GitLab"
                      defaultValue={bioInfo.socialMediaLinks?.gitlab}
                    />
                    <RiGitlabFill className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                  </div>

                  {/* Dribbble */}
                  <div className="relative">
                    <AppFormField
                      id="dribbble"
                      name="dribbble"
                      defaultValue={bioInfo.socialMediaLinks?.dribbble}
                      label="Dribbble"
                    />
                    <TbBrandDribbbleFilled className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                  </div>

                  {/* StackOverflow */}
                  <div className="relative">
                    <AppFormField
                      id="stackoverflow"
                      name="stackoverflow"
                      label="StackOverflow"
                      defaultValue={bioInfo.socialMediaLinks?.stackoverflow}
                    />
                    <FaStackOverflow className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                  </div>
                </div>

                {/* Save */}
                <DialogFooter>
                  <Button
                    disabled={bioFetcher.state === "submitting"}
                    className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient mt-6"
                    type="submit"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </bioFetcher.Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ADD LOCATION + ADD WEBSITE */}
        <div className="flex space-x-2 mt-2">
          {/* ADD LOCATION */}
          {bioInfo.location ? (
            <span className="text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white">
              <FaMapMarkerAlt className="h-3 w-3 mr-2 mt-1" />
              {bioInfo.location}
            </span>
          ) : (
            <button
              onClick={() => handleTriggerClick(locationInputRef)}
              className="text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white"
            >
              <FaMapMarkerAlt className="h-3 w-3 mr-2 mt-1" />
              Add Location
            </button>
          )}

          {/* ADD WEBSITE */}
          {bioInfo.websiteURL ? (
            <span className="underline-none text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white">
              <FaGlobe className="h-3 w-3 mr-2 mt-1" />
              <a
                href={parseHTTP(bioInfo.websiteURL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {bioInfo.websiteURL}
              </a>
            </span>
          ) : (
            <button
              onClick={() => handleTriggerClick(websiteInputRef)}
              className="underline-none text-sm rounded-xl flex text-primaryColor border border-gray-300 px-5 py-3 font-semibold tracking-wide not-active-gradient hover:text-white"
            >
              <FaGlobe className="h-3 w-3 mr-2 mt-1" />
              Add Website
            </button>
          )}
        </div>
      </div>
    </>
  );
}
