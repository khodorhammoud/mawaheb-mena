import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { RiPencilFill } from "react-icons/ri";
import { useLoaderData, useFetcher } from "@remix-run/react";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";
import { Language } from "~/types/enums";

export default function Languages() {
  const [languagesServedOpen, setLanguagesServedOpen] = useState(false); // Language dialog state
  const [showLanguageMessage, setShowLanguageMessage] = useState(false); // Track Language message visibility

  const languageFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for Language form

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
      {/* Languages Served ✏️ */}
      <div className="ml-auto text-sm flex items-center">
        <span>Languages</span>
        <Dialog
          open={languagesServedOpen}
          onOpenChange={handleLanguageDialogChange}
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

            {/* Display Error Message */}
            {showLanguageMessage && languageFetcher.data?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  {languageFetcher.data.error.message}
                </span>
              </div>
            )}

            <SearcheableTagSelector<Language>
              data={allLanguages}
              selectedKeys={selectedLanguages}
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
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
