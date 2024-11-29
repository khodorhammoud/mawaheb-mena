import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { IoPencilSharp } from "react-icons/io5";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Industry } from "~/types/User";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";

export default function Languages() {
  const [industriesServedOpen, setIndustriesServedOpen] = useState(false); // Industry dialog state
  const [showIndustryMessage, setShowIndustryMessage] = useState(false); // Track industry message visibility

  const industryFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for industry form

  // const industryFormRef = useRef<HTMLFormElement>(null); // Ref for industry form

  // Load data
  const { employerIndustries, allIndustries } = useLoaderData() as {
    employerIndustries: Industry[];
    allIndustries: Industry[];
  };

  const [selectedIndustries, setSelectedIndustries] = useState<number[]>([]);

  // Set initial industries selected
  useEffect(() => {
    setSelectedIndustries(employerIndustries.map((i) => i.id)); // comment that for the wierd error (cannot find ...)
  }, [employerIndustries]);

  // const [searchTerm, setSearchTerm] = useState<string>("");

  /* const filteredIndustries = allIndustries.filter(
    (industry) =>
      industry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      industry.metadata.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  ); */

  /* const toggleIndustry = (industryId: number) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industryId));
    } else {
      setSelectedIndustries([...selectedIndustries, industryId]);
    }
    // wait for the state to update before submitting the industries form programmatically
    setTimeout(() => {
      if (industryFormRef.current) {
        industryFetcher.submit(industryFormRef.current);
      }
    }, 100);
  }; */

  // Handle showing the industry submission message
  useEffect(() => {
    if (industryFetcher.data?.success || industryFetcher.data?.error) {
      setShowIndustryMessage(true);
    }
  }, [industryFetcher.data]);

  // Reset messages when the industry dialog is closed
  const handleIndustryDialogChange = (isOpen: boolean) => {
    setIndustriesServedOpen(isOpen);
    if (!isOpen) {
      setShowIndustryMessage(false); // Clear industry message when dialog is closed
      // setSearchTerm(""); // Clear search term when dialog is closed
    }
  };

  return (
    <>
      {/* Industries Served ✏️ */}
      <div className="ml-auto text-sm flex items-center">
        <span>Industries Served</span>
        <Dialog
          open={industriesServedOpen}
          onOpenChange={handleIndustryDialogChange}
        >
          <DialogTrigger asChild>
            <Button variant="link">
              <IoPencilSharp className="text-large" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Industries</DialogTitle>
            </DialogHeader>

            {/* Display Error Message */}
            {showIndustryMessage && industryFetcher.data?.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">
                  {industryFetcher.data.error.message}
                </span>
              </div>
            )}

            <SearcheableTagSelector<Industry>
              data={allIndustries}
              selectedKeys={selectedIndustries}
              itemLabel={(item: Industry) => item.label}
              itemKey={(item) => item.id}
              formName="employer-industries"
              fieldName="employer-industries"
              searchPlaceholder="Search or type industry"
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
