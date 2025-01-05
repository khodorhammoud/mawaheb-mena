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
import { RiGitlabFill, RiPencilFill } from "react-icons/ri";
import { IoPencilSharp } from "react-icons/io5";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaLinkedin,
  FaStackOverflow,
  FaGitlab,
  FaDribbble,
} from "react-icons/fa";
import { TbBrandGithubFilled, TbBrandDribbbleFilled } from "react-icons/tb";
import { AccountBio } from "~/types/User";
import AppFormField from "~/common/form-fields";
import { AccountType } from "~/types/enums";

export default function Heading() {
  const { accountType } = useLoaderData<{ accountType: AccountType }>();

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
    if (bioFetcher.data) {
      console.log("Full bioFetcher response:", bioFetcher.data);
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
    <div className="">
      <div className="md:flex">
        {/* CIRCLE */}
        <div className="bg-blue-100 rounded-full lg:w-36 lg:h-36 sm:h-32 sm:w-32 h-28 w-28 flex items-center justify-center lg:mr-5 mr-2 lg:ml-20 ml-8 md:mb-14 border-4 border-white">
          <span className="lg:text-5xl sm:text-4xl text-3xl font-semibold text-primaryColor">
            {bioInfo.firstName.charAt(0).toUpperCase()}
            {bioInfo.lastName.charAt(0).toUpperCase()}
            {/* // comment that for the wierd error (cannot find ...) */}
          </span>
        </div>

        {/* NAME + ✏️ + POPUP + BUTTONS */}
        <div className="md:mb-14 mb-4">
          {/* NAME + ✏️ + POPUP */}
          <div className="flex md:mt-14 mt-4">
            {/* NAME */}
            <h1 className="xl:text-3xl lg:text-2xl sm:text-xl text-lg xl:mt-0 md:mt-1 mt-1 md:ml-0 ml-10">
              {bioInfo.firstName} {bioInfo.lastName}
              {/* // comment that for the wierd error (cannot find ...) */}
            </h1>
            {/* ✏️ + POPUP */}
            <Dialog open={open} onOpenChange={handleBioDialogChange}>
              {/* ✏️ */}
              <DialogTrigger asChild>
                <Button variant="link">
                  <IoPencilSharp className="lg:h-9 lg:w-8 h-7 w-6 hover:bg-slate-100 transition-all hover:rounded-xl p-1 mb-1 xl:-ml-1 lg:-ml-2 -ml-3" />{" "}
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
                    value={
                      accountType === AccountType.Employer
                        ? "employer-bio"
                        : "freelancer-bio"
                    } // this value should match the target in the route.tsx
                  />
                  <div className="grid grid-cols-2 gap-4">
                    {/* FIRST NAME */}
                    <div>
                      <AppFormField
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        className="peer mt-1"
                        defaultValue={bioInfo.firstName} // comment that for the wierd error (cannot find ...)
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <AppFormField
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        className="peer mt-1"
                        defaultValue={bioInfo.lastName} // comment that for the wierd error (cannot find ...)
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
                          defaultValue={bioInfo.location} // comment that for the wierd error (cannot find ...)
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
                        defaultValue={bioInfo.websiteURL || ""} // comment that for the wierd error (cannot find ...)
                      />
                      <FaGlobe className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                    </div>

                    {/* LinkedIn */}
                    <div className="relative mt-1">
                      <AppFormField
                        id="linkedin"
                        name="linkedin"
                        label="LinkedIn"
                        defaultValue={bioInfo.socialMediaLinks?.linkedin} // comment that for the wierd error (cannot find ...)
                      />
                      <FaLinkedinIn className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                    </div>

                    {/* GitHub */}
                    <div className="relative">
                      <AppFormField
                        id="github"
                        name="github"
                        label="GitHub"
                        defaultValue={bioInfo.socialMediaLinks?.github} // comment that for the wierd error (cannot find ...)
                      />
                      <TbBrandGithubFilled className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                    </div>

                    {/* GitLab */}
                    <div className="relative">
                      <AppFormField
                        id="gitlab"
                        name="gitlab"
                        label="GitLab"
                        defaultValue={bioInfo.socialMediaLinks?.gitlab} // comment that for the wierd error (cannot find ...)
                      />
                      <RiGitlabFill className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                    </div>

                    {/* Dribbble */}
                    <div className="relative">
                      <AppFormField
                        id="dribbble"
                        name="dribbble"
                        defaultValue={bioInfo.socialMediaLinks?.dribbble} // comment that for the wierd error (cannot find ...)
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
                        defaultValue={bioInfo.socialMediaLinks?.stackoverflow} // comment that for the wierd error (cannot find ...)
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
          <div className="flex items-center sm:h-10 md:ml-0 sm:ml-10 ml-10 xl:-mt-1 lg:-mt-2 sm:-mt-3">
            <div className="flex sm:mt-6">
              {/* ADD LOCATION */}
              {bioInfo.location ? (
                // comment that for the wierd error (cannot find ...)
                <span className="text-sm text-black font-semibold tracking-wide">
                  {bioInfo.location}
                  {/* // comment that for the wierd error (cannot find ...) */}
                </span>
              ) : (
                // comment that for the wierd error (cannot find ...)
                <button
                  onClick={() => handleTriggerClick(locationInputRef)}
                  className="text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-4 sm:py-2 px-2 py-1 font-semibold tracking-wide not-active-gradient hover:text-white sm:mr-2 sm:mb-0 mb-2 w-fit"
                >
                  <FaMapMarkerAlt className="md:h-4 h-3 md:w-4 w-3 mr-2" />
                  Add Location
                </button>
              )}

              {/* ADD WEBSITE */}
              {bioInfo.websiteURL ? (
                <div className="hidden"></div>
              ) : (
                <button
                  onClick={() => handleTriggerClick(websiteInputRef)}
                  className="text-sm rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 sm:px-4 sm:py-2 px-2 py-1 font-semibold tracking-wide not-active-gradient hover:text-white sm:mr-2 sm:mb-0 mb-2 w-fit"
                >
                  <FaGlobe className="md:h-4 h-3 md:w-4 w-3 mr-2" />
                  Add Websites
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 ml-2 sm:mt-6">
              {/* Linkedin icons interface */}
              {bioInfo.socialMediaLinks.linkedin ? (
                <span className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all">
                  <FaLinkedin className="w-4 h-4" />
                </span>
              ) : (
                <div className="hidden"></div>
              )}

              {/* Gitlab icons interface */}
              {bioInfo.socialMediaLinks.gitlab ? (
                <span className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all">
                  <FaGitlab className="w-4 h-4" />
                </span>
              ) : (
                <div className="hidden"></div>
              )}

              {/* Dribbble icons interface */}
              {bioInfo.socialMediaLinks.dribbble ? (
                <span className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all">
                  <FaDribbble className="w-4 h-4" />
                </span>
              ) : (
                <div className="hidden"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    // {parseHTTP(bioInfo.websiteURL)}
  );
}
