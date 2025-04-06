import { useState, useRef, MutableRefObject, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { RiGitlabFill, RiPencilFill } from 'react-icons/ri';
import { IoPencilSharp } from 'react-icons/io5';
import { useLoaderData, useFetcher } from '@remix-run/react';
import {
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaLinkedin,
  FaStackOverflow,
  FaGitlab,
  FaDribbble,
} from 'react-icons/fa';
import { TbBrandGithubFilled, TbBrandDribbbleFilled } from 'react-icons/tb';
import { AccountBio } from '@mawaheb/db/src/types/User';
import AppFormField from '~/common/form-fields';
import { AccountType, Country } from '@mawaheb/db/src/types/enums';

interface BioInfoProps {
  profile: any;
  canEdit?: boolean;
}

export default function BioInfo({ profile, canEdit = true }: BioInfoProps) {
  // const { accountType } = useLoaderData<{ accountType: AccountType }>();

  const { accountType, bioInfo } = useLoaderData<{
    accountType: AccountType;
    bioInfo: AccountBio;
  }>();

  const [open, setOpen] = useState(false); // Bio dialog state
  const [showBioMessage, setShowBioMessage] = useState(false); // Track bio message visibility

  const bioFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for bio form

  // ✅ Use `profile` (freelancer) if available, otherwise fallback to `bioInfo` (current user)
  const profileData = profile || bioInfo;

  // Refs for location and website input fields
  const countryInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

  // Handle opening the bio dialog and focusing the relevant input
  // ✅ Prevent opening dialog if `canEdit === false`
  const handleTriggerClick = (ref: MutableRefObject<HTMLInputElement>) => {
    if (!canEdit) return;
    setOpen(true);
    setTimeout(() => ref.current?.focus(), 100);
  };

  // Handle showing the bio submission message
  useEffect(() => {
    if (bioFetcher.data) {
      setShowBioMessage(true);
    }
  }, [bioFetcher.data]);

  // Reset messages when the bio dialog is closed
  const handleBioDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setShowBioMessage(false);
  };

  // console.log("🔥 HEADING COMPONENT: bioInfo Received:", bioInfo);
  // console.log("🔥 HEADING COMPONENT: Final Profile Data:", profileData);
  // console.log("🔥 BIOINFO COMPONENT: Received Profile Data:", profile);

  return (
    <div className="">
      <div className="flex">
        {/* CIRCLE */}
        <div className="bg-blue-100 rounded-full xl:w-36 xl:h-36 lg:h-32 lg:w-32 h-28 w-28 flex items-center justify-center lg:mr-5 mr-2 2xl:ml-16 ml-4 md:mb-14 border-4 border-white">
          <span className="xl:text-5xl lg:text-4xl md:text-3xl text-2xl font-semibold text-primaryColor">
            {(profileData?.firstName?.charAt(0) || '?').toUpperCase()}
            {(profileData?.lastName?.charAt(0) || '?').toUpperCase()}
          </span>
        </div>

        {/* NAME + ✏️ + POPUP + BUTTONS */}
        <div className="md:mb-14 mb-4">
          {/* NAME + ✏️ + POPUP */}
          <div className="flex mt-14">
            {/* NAME */}
            <h1 className="2xl:text-2xl lg:text-xl md:text-lg text-base xl:mt-0 mt-1 md:ml-0 sm:ml-4 ml-0">
              {profileData.firstName || '?'} {profileData.lastName || '?'}
              {/* // comment that for the wierd error (cannot find ...) */}
            </h1>
            {/* ✏️ + POPUP */}
            {/* ✅ Show Edit Button only if `canEdit === true` */}
            {canEdit && (
              <Dialog open={open} onOpenChange={handleBioDialogChange}>
                {/* ✏️ */}
                <DialogTrigger asChild>
                  <Button variant="link">
                    <IoPencilSharp className="2xl:h-8 xl:h-7 h-6 2xl:w-8 xl:w-7 w-6 text-sm text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1 xl:-ml-1 lg:-ml-2 -ml-3" />{' '}
                  </Button>
                </DialogTrigger>
                {/* POPUP CONTENT */}
                <DialogContent className="bg-white">
                  {/* BIO */}
                  <DialogHeader>
                    <DialogTitle className="mt-3 lg:text-lg text-base">Bio</DialogTitle>
                  </DialogHeader>

                  {/* ERROR MESSAGE */}
                  {showBioMessage && bioFetcher.data?.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                      <span className="block sm:inline">{bioFetcher.data.error.message}</span>
                    </div>
                  )}

                  {/* SUCCESS MESSAGE */}
                  {showBioMessage && bioFetcher.data?.success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 lg:px-4 px-2 lg:py-3 py-2 rounded relative mb-4">
                      <span className="block sm:inline">Bio updated successfully</span>
                    </div>
                  )}

                  {/* FORM */}
                  <bioFetcher.Form method="post" className="">
                    <input
                      type="hidden"
                      name="target-updated"
                      value={
                        accountType === AccountType.Employer ? 'employer-bio' : 'freelancer-bio'
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
                          defaultValue={profileData.firstName || ''} // comment that for the wierd error (cannot find ...)
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <AppFormField
                          id="lastName"
                          name="lastName"
                          label="Last Name"
                          className="peer mt-1"
                          defaultValue={profileData.lastName || ''} // comment that for the wierd error (cannot find ...)
                        />
                      </div>

                      {/* Country Dropdown */}
                      <div>
                        <AppFormField
                          id="country"
                          name="country"
                          label="Country"
                          type="select"
                          options={[
                            { value: '', label: '--' },
                            ...Object.values(Country).map(country => ({
                              value: country,
                              label: country,
                            })),
                          ]}
                          defaultValue={profileData?.country || profileData?.account?.country || ''}
                        />
                      </div>
                      {/* Address Input */}
                      <div className="relative">
                        <AppFormField
                          id="address"
                          name="address"
                          label="Address"
                          className=""
                          defaultValue={profileData?.address || profileData?.account?.address || ''}
                        />
                        <FaMapMarkerAlt className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
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
                          defaultValue={
                            profileData?.websiteURL || profileData?.account?.websiteURL || ''
                          } // comment that for the wierd error (cannot find ...)
                        />
                        <FaGlobe className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      </div>

                      {/* LinkedIn */}
                      <div className="relative mt-1">
                        <AppFormField
                          id="linkedin"
                          name="linkedin"
                          label="LinkedIn"
                          defaultValue={
                            profileData?.socialMediaLinks?.linkedin ||
                            profileData?.account?.socialMediaLinks?.linkedin ||
                            ''
                          } // comment that for the wierd error (cannot find ...)
                        />
                        <FaLinkedinIn className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      </div>

                      {/* GitHub */}
                      <div className="relative">
                        <AppFormField
                          id="github"
                          name="github"
                          label="GitHub"
                          defaultValue={
                            profileData?.socialMediaLinks?.github ||
                            profileData?.account?.socialMediaLinks?.github ||
                            ''
                          } // comment that for the wierd error (cannot find ...)
                        />
                        <TbBrandGithubFilled className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      </div>

                      {/* GitLab */}
                      <div className="relative">
                        <AppFormField
                          id="gitlab"
                          name="gitlab"
                          label="GitLab"
                          defaultValue={
                            profileData?.socialMediaLinks?.gitlab ||
                            profileData?.account?.socialMediaLinks?.gitlab ||
                            ''
                          } // comment that for the wierd error (cannot find ...)
                        />
                        <RiGitlabFill className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor  hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      </div>

                      {/* Dribbble */}
                      <div className="relative">
                        <AppFormField
                          id="dribbble"
                          name="dribbble"
                          defaultValue={
                            profileData?.socialMediaLinks?.dribbble ||
                            profileData?.account?.socialMediaLinks?.dribbble ||
                            ''
                          } // comment that for the wierd error (cannot find ...)
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
                          defaultValue={
                            profileData?.socialMediaLinks?.stackoverflow ||
                            profileData?.account?.socialMediaLinks?.stackoverflow ||
                            ''
                          } // comment that for the wierd error (cannot find ...)
                        />
                        <FaStackOverflow className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      </div>
                    </div>

                    {/* Save */}
                    <DialogFooter>
                      <Button
                        disabled={bioFetcher.state === 'submitting'}
                        className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient mt-6"
                        type="submit"
                      >
                        Save
                      </Button>
                    </DialogFooter>
                  </bioFetcher.Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* ADD LOCATION + ADD WEBSITE */}
          <div className="relative flex flex-wrap items-center justify-start sm:h-10 md:ml-0 sm:ml-4 xl:-mt-1 lg:-mt-2 sm:-mt-3 gap-x-3">
            <div className="flex sm:mt-2 items-center justify-start gap-x-2">
              {/* COUNTRY */}
              {profileData?.country || profileData?.account?.country ? (
                <span className="lg:text-sm text-xs text-black font-semibold tracking-wide">
                  {profileData?.country || profileData?.account?.country}
                </span>
              ) : (
                canEdit && (
                  <Button
                    onClick={() => handleTriggerClick?.(countryInputRef)}
                    className="2xl:text-sm text-xs rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 px-2 py-1 font-semibold tracking-wide hover:text-white xl:mr-2 mr-1 sm:mb-0 mb-2 w-fit bg-white not-active-gradient"
                  >
                    <FaGlobe className="xl:h-4 h-3 xl:w-4 w-3 mr-2" />
                    Add Country
                  </Button>
                )
              )}

              {/* ADDRESS */}
              {profileData?.address || profileData?.account?.address ? (
                <span className="lg:text-sm text-xs text-black font-semibold tracking-wide">
                  {profileData?.country || profileData?.account?.country ? ', ' : ''}
                  {profileData?.address || profileData?.account?.address}
                </span>
              ) : (
                canEdit && (
                  <Button
                    onClick={() => handleTriggerClick?.(addressInputRef)}
                    className="2xl:text-sm text-xs rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 px-2 py-1 font-semibold tracking-wide hover:text-white xl:mr-2 mr-1 sm:mb-0 mb-2 w-fit bg-white not-active-gradient"
                  >
                    <FaMapMarkerAlt className="xl:h-4 h-3 xl:w-4 w-3 mr-2" />
                    Add Address
                  </Button>
                )
              )}

              {/* WEBSITE */}
              {profileData?.websiteURL || profileData?.account?.websiteURL ? (
                <span className="lg:text-sm text-xs text-black font-semibold tracking-wide"></span>
              ) : (
                canEdit && (
                  <Button
                    onClick={() => handleTriggerClick?.(websiteInputRef)}
                    className="2xl:text-sm text-xs rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 px-2 py-1 font-semibold tracking-wide hover:text-white ml-1 sm:mb-0 mb-2 w-fit bg-white not-active-gradient"
                  >
                    <FaGlobe className="xl:h-4 h-3 xl:w-4 w-3 mr-2" />
                    Add Website
                  </Button>
                )
              )}
            </div>

            {/* SOCIAL MEDIA ICONS (Only Show If At Least One Exists) */}
            {(profileData?.socialMediaLinks?.linkedin ||
              profileData?.account?.socialMediaLinks?.linkedin ||
              profileData?.socialMediaLinks?.gitlab ||
              profileData?.account?.socialMediaLinks?.gitlab ||
              profileData?.socialMediaLinks?.dribbble ||
              profileData?.account?.socialMediaLinks?.dribbble) && (
              <div className="inline-flex items-center gap-x-2 sm:mt-2 mt-1">
                {profileData?.websiteURL || profileData?.account?.websiteURL ? (
                  <a
                    href={profileData?.websiteURL || profileData?.account?.websiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all"
                  >
                    <FaGlobe className="lg:w-4 w-3 lg:h-4 h-3" />
                  </a>
                ) : null}

                {profileData?.socialMediaLinks?.linkedin ||
                profileData?.account?.socialMediaLinks?.linkedin ? (
                  <a
                    href={
                      profileData?.socialMediaLinks?.linkedin ||
                      profileData?.account?.socialMediaLinks?.linkedin
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all"
                  >
                    <FaLinkedin className="lg:w-4 w-3 lg:h-4 h-3" />
                  </a>
                ) : null}

                {profileData?.socialMediaLinks?.gitlab ||
                profileData?.account?.socialMediaLinks?.gitlab ? (
                  <a
                    href={
                      profileData?.socialMediaLinks?.gitlab ||
                      profileData?.account?.socialMediaLinks?.gitlab
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all"
                  >
                    <FaGitlab className="lg:w-4 w-3 lg:h-4 h-3" />
                  </a>
                ) : null}

                {profileData?.socialMediaLinks?.dribbble ||
                profileData?.account?.socialMediaLinks?.dribbble ? (
                  <a
                    href={
                      profileData?.socialMediaLinks?.dribbble ||
                      profileData?.account?.socialMediaLinks?.dribbble
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 border border-gray-300 rounded-full flex items-center justify-center text-gray-700 hover:text-white hover:bg-primaryColor transition-all"
                  >
                    <FaDribbble className="lg:w-4 w-3 lg:h-4 h-3" />
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    // {parseHTTP(bioInfo.websiteURL)}
  );
}
