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
import { AccountBio } from '@mawaheb/db/types';
import AppFormField from '~/common/form-fields';
import { AccountType, Country } from '@mawaheb/db/enums';
import { toast } from '~/components/hooks/use-toast';

interface BioInfoProps {
  profile: any;
  canEdit?: boolean;
}

// function that is used to see if the linked in account is valid - gitlab account is valid - etc..
function validateSocialLinks(data: Record<string, string>) {
  const errors: string[] = [];

  if (data.website && !/^https?:\/\/.+/.test(data.website)) {
    errors.push('Personal Website must start with http:// or https://');
  }
  if (data.linkedin && !/^https:\/\/(www\.)?linkedin\.com\/.+/.test(data.linkedin)) {
    errors.push('LinkedIn must be a valid LinkedIn URL');
  }
  if (data.github && !/^https:\/\/(www\.)?github\.com\/.+/.test(data.github)) {
    errors.push('GitHub must be a valid GitHub URL');
  }
  if (data.gitlab && !/^https:\/\/(www\.)?gitlab\.com\/.+/.test(data.gitlab)) {
    errors.push('GitLab must be a valid GitLab URL');
  }
  if (data.dribbble && !/^https:\/\/(www\.)?dribbble\.com\/.+/.test(data.dribbble)) {
    errors.push('Dribbble must be a valid Dribbble URL');
  }
  if (data.stackoverflow && !/^https:\/\/(www\.)?stackoverflow\.com\/.+/.test(data.stackoverflow)) {
    errors.push('StackOverflow must be a valid StackOverflow URL');
  }

  return errors;
}

export default function BioInfo({ profile, canEdit = true }: BioInfoProps) {
  // const { accountType } = useLoaderData<{ accountType: AccountType }>();

  const { accountType, bioInfo } = useLoaderData<{
    accountType: AccountType;
    bioInfo: AccountBio;
  }>();

  const [open, setOpen] = useState(false); // Bio dialog state

  // a state to save a value even after redering, this value will be used to know where we shall focus
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const bioFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for bio form

  // ✅ Use `profile` (freelancer) if available, otherwise fallback to `bioInfo` (current user)
  const profileData = profile || bioInfo;

  // Refs for location and website input fields
  const countryInputRef = useRef<HTMLButtonElement>(null); // CountrySelectField uses a <button> trigger, not an input, so we target that
  const addressInputRef = useRef<HTMLInputElement>(null);
  const websiteInputRef = useRef<HTMLInputElement>(null);

  // when i click Add Country lets say, the app will run handleTriggerClick("country"), and this will make the focusedField constant be filled with 'country', so react will remember that like:
  // "Aha! The user clicked the country field. I'll focus that later." :))
  const handleTriggerClick = (fieldName: string) => {
    if (!canEdit) return;
    setFocusedField(fieldName); // tells the useEffect which field to focus
    setOpen(true);
  };

  //   ✅ What does it do when it runs?
  // When both open === true and focusedField !== null, it:
  // Starts a small timeout (50ms) — to wait for the dialog to finish opening.
  // Checks what the current focusedField is
  // Focuses the matching input field using .focus()
  useEffect(() => {
    if (!open || !focusedField) return;

    const timeout = setTimeout(() => {
      switch (focusedField) {
        case 'country':
          countryInputRef.current?.focus(); // Focuses the matching input field using .focus()
          countryInputRef.current?.click(); // ✅ This opens the dropdown :))))))
          break;
        case 'address':
          addressInputRef.current?.focus();
          break;
        case 'website':
          websiteInputRef.current?.focus();
          break;
        default:
          break;
      }
    }, 50); // slight delay for dialog mount
    // Why did we use this slight timeout:
    // Dialogs in most UI libraries (like shadcn, Radix, etc.) take time to mount.
    // If you try to focus an input before the DOM is ready, it fails.

    return () => clearTimeout(timeout);
  }, [open, focusedField]); // 🔁 runs when open or focusedField changes

  // Reset messages when the bio dialog is closed
  const handleBioDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFocusedField(null); // clear the focus
    }
  };

  // for seeing iof the URL's are valid using validateSocialLinks function
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      website: formData.get('website')?.toString().trim() || '',
      linkedin: formData.get('linkedin')?.toString().trim() || '',
      github: formData.get('github')?.toString().trim() || '',
      gitlab: formData.get('gitlab')?.toString().trim() || '',
      dribbble: formData.get('dribbble')?.toString().trim() || '',
      stackoverflow: formData.get('stackoverflow')?.toString().trim() || '',
    };

    const errors = validateSocialLinks(data);

    if (errors.length > 0) {
      e.preventDefault(); // 🛑 Stop form submit
      errors.forEach(err => toast({ variant: 'destructive', title: 'Error', description: err }));
    }
  }

  useEffect(() => {
    if (bioFetcher.data?.success) {
      setOpen(false); // 🔒 Close dialog
      toast({
        title: 'Success',
        description: 'Bio updated successfully!',
      });
    } else if (bioFetcher.data?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: bioFetcher.data.error.message,
      });
    }
  }, [bioFetcher.data]);

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
                  <Button
                    className="
                    ml-1
                    focus-visible:outline-none
                    focus:border-none
                    focus-visible:border-none
                    focus-visible:ring-offset-0
                    focus-visible:!ring-0
                    focus:!ring-0
                    focus:!outline-none
                  "
                    variant="link"
                  >
                    <IoPencilSharp className="2xl:h-8 xl:h-7 h-6 2xl:w-8 xl:w-7 w-6 text-sm text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1 xl:-ml-1 lg:-ml-2 -ml-3" />{' '}
                  </Button>
                </DialogTrigger>
                {/* POPUP CONTENT */}
                <DialogContent className="bg-white">
                  {/* BIO */}
                  <DialogHeader>
                    <DialogTitle className="mt-3 lg:text-lg text-base">Bio</DialogTitle>
                  </DialogHeader>

                  {/* FORM */}
                  <bioFetcher.Form method="post" className="" onSubmit={handleFormSubmit}>
                    <input
                      type="hidden"
                      name="target-updated"
                      value={
                        accountType === AccountType.Employer ? 'employer-bio' : 'freelancer-bio'
                      } // this value should match the target in the route.tsx
                    />
                    <div className="grid grid-cols-2 gap-4 ml-1">
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
                          id="countryDropdown"
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
                          ref={countryInputRef} // ✅ This is the key line
                        />
                      </div>
                      {/* Address Input */}
                      <div className="relative">
                        <AppFormField
                          id="address"
                          name="address"
                          label="Address"
                          defaultValue={profileData?.address || profileData?.account?.address || ''}
                          ref={addressInputRef} // ✅ also this
                        />
                        <FaMapMarkerAlt className="absolute top-1/2 right-2 transform -translate-y-1/2 h-9 w-9 text-primaryColor hover:bg-slate-100 transition-all hover:rounded-xl p-2" />
                      </div>
                    </div>

                    <h3 className="text-lg mb-6 mt-6">My online profiles</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {/* PERSONAL WEBSITE */}
                      <div className="relative ml-1">
                        <AppFormField
                          id="website"
                          name="website"
                          label="Personal Website"
                          className="peer mt-1"
                          defaultValue={
                            profileData?.websiteURL || profileData?.account?.websiteURL || ''
                          } // comment that for the wierd error (cannot find ...)
                          ref={websiteInputRef} // ✅ and this one too
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
                      <div className="relative ml-1">
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
                      <div className="relative ml-1">
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
                        className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient mt-6 focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
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
                    onClick={() => handleTriggerClick('country')}
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
                    onClick={() => handleTriggerClick('address')}
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
                    onClick={() => handleTriggerClick('website')}
                    className="2xl:text-sm text-xs rounded-xl flex items-center justify-center text-primaryColor border border-gray-300 px-2 py-1 font-semibold tracking-wide hover:text-white ml-1 sm:mb-0 mb-2 w-fit bg-white not-active-gradient focus:outline-none
    focus-visible:ring-0
   
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
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
