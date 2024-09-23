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
import { useState, useRef, MutableRefObject, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import {
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedinIn,
  FaStackOverflow,
  FaSearch,
} from "react-icons/fa";
import { TbBrandGithubFilled, TbBrandDribbbleFilled } from "react-icons/tb";
import { EmployerBio, Industry } from "~/types/User";
import { parseHTTP } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

export default function Heading() {
  const [open, setOpen] = useState(false); // Dialog state
  const [industriesServedOpen, setIndustriesServedOpen] = useState(false);
  const { bioInfo, employerIndustries, allIndustries } = useLoaderData() as {
    bioInfo: EmployerBio;
    employerIndustries: Industry[];
    allIndustries: Industry[];
  };
  const actionData = useActionData();
  const navigation = useNavigation();
  const locationInputRef = useRef<HTMLInputElement>(null); // Ref for location input
  const websiteInputRef = useRef<HTMLInputElement>(null); // Ref for location input

  const handleTriggerClick = (ref: MutableRefObject<HTMLInputElement>) => {
    setOpen(true); // Open the dialog
    setTimeout(() => {
      ref.current?.focus(); // Focus the location input
    }, 100); // Slight delay to ensure dialog is fully opened
  };

  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([]);

  // set the initial value of selected industries
  useEffect(() => {
    setSelectedIndustries(employerIndustries.map((i) => i.id));
  }, [employerIndustries]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredIndustries = allIndustries.filter(
    (industry) =>
      industry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industry.metadata.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const toggleIndustry = (industryId: number) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industryId));
    } else {
      setSelectedIndustries([...selectedIndustries, industryId]);
    }
  };

  return (
    <>
      <div className="flex items-center mb-6">
        <div className="bg-gray-300 rounded-full w-24 h-24 flex items-center justify-center mr-4">
          <span className="text-3xl font-bold">AM</span>
        </div>
        <div>
          <div className="flex">
            <h1 className="text-2xl font-semibold">
              {bioInfo.firstName} {bioInfo.lastName}
            </h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="link">
                  <RiPencilFill className="text-lg" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Bio</DialogTitle>
                </DialogHeader>
                {/* error message in case of error */}
                {actionData?.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">
                      {actionData?.error?.message}
                    </span>
                  </div>
                )}
                {/* handle success */}
                {actionData?.success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">
                      Bio updated successfully
                    </span>
                  </div>
                )}
                <Form method="post" className="space-y-6">
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
                        defaultValue={bioInfo.socialMediaLinks.linkedin}
                      />
                      <FaLinkedinIn className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    {/* GitHub */}
                    <div className="relative">
                      <Input
                        name="github"
                        defaultValue={bioInfo.socialMediaLinks.github}
                        placeholder="GitHub"
                      />
                      <TbBrandGithubFilled className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    {/* GitLab */}
                    <div className="relative">
                      <Input
                        name="gitlab"
                        defaultValue={bioInfo.socialMediaLinks.gitlab}
                        placeholder="GitLab"
                      />
                      <RiGitlabFill className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    {/* Dribbble */}
                    <div className="relative">
                      <Input
                        name="dribbble"
                        defaultValue={bioInfo.socialMediaLinks.dribbble}
                        placeholder="Dribbble"
                      />
                      <TbBrandDribbbleFilled className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>

                    {/* StackOverflow */}
                    <div className="relative">
                      <Input
                        name="stackoverflow"
                        placeholder="StackOverflow"
                        defaultValue={bioInfo.socialMediaLinks.stackoverflow}
                      />
                      <FaStackOverflow className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      disabled={navigation.state === "submitting"}
                      //   onClick={() => setOpen(false)}
                      className="mr-2 bg-gray-200 text-sm disabled:opacity-50 hover:bg-gray-300"
                      type="submit"
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

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

        <div className="ml-auto text-sm flex items-center">
          <span>Industries Served</span>
          <Dialog
            open={industriesServedOpen}
            onOpenChange={setIndustriesServedOpen}
          >
            <DialogTrigger asChild>
              <Button variant="link">
                <RiPencilFill className="text-large" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Industries</DialogTitle>
              </DialogHeader>

              <Form method="post" id="employer-industires-form">
                <input
                  type="hidden"
                  name="target-updated"
                  value="employer-industries"
                />
                <input
                  type="hidden"
                  name="employer-industries"
                  value={selectedIndustries.join(",")}
                />
              </Form>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Input
                  placeholder="Search or type industry"
                  value={searchTerm}
                  className="pl-10"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Industry Options */}
              <div className="flex flex-wrap gap-2">
                {filteredIndustries.length > 0 ? (
                  filteredIndustries.map((industry) => (
                    <Badge
                      key={industry.id}
                      onClick={() => toggleIndustry(industry.id)}
                      className={`cursor-pointer px-4 py-2 ${
                        selectedIndustries.includes(industry.id)
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {industry.label}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No industries found</p>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  className="px-6"
                  type="submit"
                  form="employer-industires-form"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
