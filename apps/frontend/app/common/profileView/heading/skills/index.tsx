import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { IoPencilSharp } from "react-icons/io5";
import { useLoaderData, useFetcher } from "@remix-run/react";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";
import { Language } from "~/types/enums";

export default function Skills() {
  const [languagesServedOpen, setLanguagesServedOpen] = useState(false); // Language dialog state
  const [showLanguageMessage, setShowLanguageMessage] = useState(false); // Track Language message visibility

  const languageFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for Language form

  const bioFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for bio form

  // const LanguageFormRef = useRef<HTMLFormElement>(null); // Ref for Language form

  // Load data
  const { employerLanguages, allLanguages } = useLoaderData() as {
    employerLanguages: Language[];
    allLanguages: Language[];
  };

  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);

  // Set initial Languages selected
  useEffect(() => {
    setSelectedLanguages(employerLanguages);
  }, [employerLanguages]);

  // Handle showing the Language submission message
  useEffect(() => {
    if (languageFetcher.data?.success || languageFetcher.data?.error) {
      setShowLanguageMessage(true);
    }
  }, [languageFetcher.data]);

  // Reset messages when the Language dialog is closed
  const handleLanguageDialogChange = (isOpen: boolean) => {
    setLanguagesServedOpen(isOpen);
    if (!isOpen) {
      setShowLanguageMessage(false); // Clear Language message when dialog is closed
      // setSearchTerm(""); // Clear search term when dialog is closed
    }
  };

  return (
    <>
      {/* LANGUAGES SERVED ✏️ */}
      <div className="ml-auto flex items-center xl:mr-20 md:mr-10 mr-0">
        {/* LANGUAGES */}
        <span className="lg:text-lg sm:text-base text-sm">Skills</span>
        {/* ✏️ + POPUP */}
        <Dialog
          open={languagesServedOpen}
          onOpenChange={handleLanguageDialogChange}
        >
          {/* ✏️ */}
          <DialogTrigger asChild>
            <Button variant="link">
              <IoPencilSharp className="lg:h-9 lg:w-8 h-7 w-6 hover:bg-slate-100 transition-all hover:rounded-xl p-1 mb-1 xl:-ml-1 lg:-ml-2 -ml-3" />{" "}
            </Button>
          </DialogTrigger>
          {/* POPUP */}
          <DialogContent className="bg-white w-80">
            <DialogHeader>
              <DialogTitle className="mt-3">Skills</DialogTitle>
            </DialogHeader>

            {/* ERROR MESSAGE */}
            {showLanguageMessage && languageFetcher.data?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  {languageFetcher.data.error.message}
                </span>
              </div>
            )}

            {/* THE FORM */}
            <SearcheableTagSelector<Language>
              data={allLanguages || []}
              selectedKeys={selectedLanguages || []}
              itemLabel={(item) => item}
              itemKey={(item) => item}
              formName="employer-languages"
              fieldName="employer-languages"
              searchPlaceholder="Search or type language"
            />

            {/* Display Success Message for Industries */}
            {/* {showIndustryMessage && industryFetcher.data?.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  <span className="block sm:inline">
                    Industries updated successfully
                  </span>
                </div>
              )} */}

            {/* <industryFetcher.Form
              ref={industryFormRef}
              method="post"
              id="employer-industires-form"
            >
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
            </industryFetcher.Form> */}

            {/* Search Bar */}
            {/* <div className="relative mb-4">
              <Input
                placeholder="Search or type industry"
                value={searchTerm}
                className="pl-10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            </div> */}

            {/* Industry Options */}
            {/* <div className="flex flex-wrap gap-2">
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
            </div> */}

            {/* <DialogFooter className="mt-6">
                <Button
                  className="px-6"
                  type="submit"
                  form="employer-industires-form"
                >
                  Save
                </Button>
              </DialogFooter> */}
            <DialogFooter>
              <Button
                disabled={bioFetcher.state === "submitting"}
                className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient"
                type="submit"
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
