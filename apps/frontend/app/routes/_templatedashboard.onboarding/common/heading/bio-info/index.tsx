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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
      <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mr-4">
        <span className="text-3xl font-bold">AM</span>
      </div>
      <div>
        <div className="flex">
          <h1 className="text-2xl font-semibold">
            {bioInfo.firstName} {bioInfo.lastName}
          </h1>
          {/* ✏️ */}
          <Dialog open={open} onOpenChange={handleBioDialogChange}>
            <DialogTrigger asChild>
              <Button variant="link">
                <RiPencilFill className="text-lg" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Bio</DialogTitle>
              </DialogHeader>
              {/* Display Error Message */}
              {showBioMessage && bioFetcher.data?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">
                    {bioFetcher.data.error.message}
                  </span>
                </div>
              )}
              {/* Display Success Message for Bio */}
              {showBioMessage && bioFetcher.data?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">
                    Bio updated successfully
                  </span>
                </div>
              )}
              <bioFetcher.Form method="post" className="space-y-6">
                <input
                  type="hidden"
                  name="target-updated"
                  value="employer-bio"
                />
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={bioInfo.firstName}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={bioInfo.lastName}
                    />
                  </div>

                  {/* Location */}
                  <div className="col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <Input
                        id="location"
                        name="location"
                        defaultValue={bioInfo.location}
                        ref={locationInputRef}
                      />
                      <FaMapMarkerAlt className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <h3 className="text-md font-semibold mt-6 mb-4">
                  My online profiles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Personal Website */}
                  <div className="relative">
                    <Input
                      name="website"
                      defaultValue={bioInfo.websiteURL}
                      placeholder="Personal Website"
                      ref={websiteInputRef}
                    />
                    <FaGlobe className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  {/* LinkedIn */}
                  <div className="relative">
                    <Input
                      name="linkedin"
                      placeholder="LinkedIn"
                      defaultValue={bioInfo.socialMediaLinks?.linkedin}
                    />
                    <FaLinkedinIn className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  {/* GitHub */}
                  <div className="relative">
                    <Input
                      name="github"
                      defaultValue={bioInfo.socialMediaLinks?.github}
                      placeholder="GitHub"
                    />
                    <TbBrandGithubFilled className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  {/* GitLab */}
                  <div className="relative">
                    <Input
                      name="gitlab"
                      defaultValue={bioInfo.socialMediaLinks?.gitlab}
                      placeholder="GitLab"
                    />
                    <RiGitlabFill className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  {/* Dribbble */}
                  <div className="relative">
                    <Input
                      name="dribbble"
                      defaultValue={bioInfo.socialMediaLinks?.dribbble}
                      placeholder="Dribbble"
                    />
                    <TbBrandDribbbleFilled className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  {/* StackOverflow */}
                  <div className="relative">
                    <Input
                      name="stackoverflow"
                      placeholder="StackOverflow"
                      defaultValue={bioInfo.socialMediaLinks?.stackoverflow}
                    />
                    <FaStackOverflow className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {/* Save */}
                <DialogFooter>
                  <Button
                    disabled={bioFetcher.state === "submitting"}
                    className="mr-2 bg-gray-200 text-sm disabled:opacity-50 hover:bg-gray-300"
                    type="submit"
                  >
                    Save
                  </Button>
                </DialogFooter>
              </bioFetcher.Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Add Location / Add Website */}
        <div className="flex space-x-2 mt-2">
          {bioInfo.location ? (
            <span className="flex items-center text-sm">
              <FaMapMarkerAlt className="h-4 w-4 mr-1" />
              {bioInfo.location}
            </span>
          ) : (
            <button
              onClick={() => handleTriggerClick(locationInputRef)}
              className="text-sm bg-gray-200 px-3 py-1 rounded-md"
            >
              Add Location
            </button>
          )}

          {bioInfo.websiteURL ? (
            <span className="flex items-center text-sm">
              <FaGlobe className="h-4 w-4 mr-1" />
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
              className="text-sm bg-gray-200 px-3 py-1 rounded-md"
            >
              Add Website
            </button>
          )}
        </div>
      </div>
    </>
  );
}
