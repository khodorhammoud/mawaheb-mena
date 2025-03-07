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
import { useFetcher } from "@remix-run/react";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";
import { Badge } from "~/components/ui/badge";

interface IndustriesProps {
  profile: { industries?: { id: number; name: string }[] };
  canEdit?: boolean;
}

export default function Industries({
  profile,
  canEdit = true,
}: IndustriesProps) {
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [showIndustryMessage, setShowIndustryMessage] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const industryFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  const [selectedIndustries, setSelectedIndustries] = useState<
    { id: number; name: string }[]
  >(profile.industries || []);

  useEffect(() => {
    setSelectedIndustries(profile.industries || []);
  }, [profile.industries]);

  useEffect(() => {
    if (industryFetcher.data?.success || industryFetcher.data?.error) {
      setShowIndustryMessage(true);
    }
  }, [industryFetcher.data]);

  const handleDialogChange = (isOpen: boolean) => {
    setIndustriesOpen(isOpen);
    if (!isOpen) {
      setShowIndustryMessage(false);
    }
  };

  const handleSubmit = () => {
    const industriesWithIds = selectedIndustries.map((industry) => ({
      id: industry.id,
    }));

    industryFetcher.submit(
      {
        industries: JSON.stringify(industriesWithIds),
        "target-updated": "freelancer-industries",
      },
      { method: "post" }
    );
  };

  const maxVisibleIndustries = 3;
  const extraIndustries = selectedIndustries.length - maxVisibleIndustries;
  const visibleIndustries = selectedIndustries.slice(0, maxVisibleIndustries);
  const hiddenIndustries = selectedIndustries.slice(maxVisibleIndustries);

  return (
    <div className="ml-auto flex flex-col xl:mr-20 md:mr-10 mr-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <span className="lg:text-lg sm:text-base text-sm font-medium">
          Industries
        </span>

        {canEdit && (
          <Dialog open={industriesOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button variant="link">
                <IoPencilSharp className="h-7 w-7 text-primaryColor hover:bg-gray-200 transition-all rounded-full p-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="mt-3">Industries</DialogTitle>
              </DialogHeader>

              {showIndustryMessage && industryFetcher.data?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">
                    {industryFetcher.data.error.message}
                  </span>
                </div>
              )}

              <SearcheableTagSelector<{ id: number; name: string }>
                dataType="industry"
                setSelectedItems={setSelectedIndustries}
                selectedItems={selectedIndustries}
                itemLabel={(item) => item.name}
                itemKey={(item) => item.id}
                formName="freelancer-industries"
                fieldName="freelancer-industries"
                searchPlaceholder="Search or type industry"
              />

              <DialogFooter className="mt-6">
                <Button
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium hover:bg-primaryColor"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={industryFetcher.state === "submitting"}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-2 w-full">
        {selectedIndustries.length > 0 ? (
          <>
            {visibleIndustries.map((industry) => (
              <Badge
                key={industry.id}
                className="px-4 py-1 text-sm bg-blue-100 text-gray-900 rounded-2xl shadow-sm"
              >
                {industry.name}
              </Badge>
            ))}

            {extraIndustries > 0 && (
              <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogTrigger asChild>
                  <Badge
                    variant="outline"
                    className="px-4 py-1 text-sm bg-gray-200 text-gray-700 rounded-2xl shadow-sm hover:bg-gray-300"
                  >
                    +{extraIndustries} more
                  </Badge>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg">
                      All Industries
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                    {hiddenIndustries.map((industry) => (
                      <Badge
                        key={industry.id}
                        className="px-3 py-1 text-sm bg-blue-100 text-gray-900 rounded-xl shadow-sm flex items-center justify-center"
                      >
                        {industry.name}
                      </Badge>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        ) : (
          <span className="text-gray-500 text-sm italic">
            No industries added
          </span>
        )}
      </div>
    </div>
  );
}
