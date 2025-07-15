import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { IoPencilSharp } from 'react-icons/io5';
import { useFetcher } from '@remix-run/react';
import SearcheableTagSelector from '~/common/SearcheableTagSelector';
import { Badge } from '~/components/ui/badge';

interface IndustriesProps {
  profile: { industries?: { id: number; name: string }[] };
  canEdit?: boolean;
}

export default function Industries({ profile, canEdit = true }: IndustriesProps) {
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [showIndustryMessage, setShowIndustryMessage] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const industryFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  const [selectedIndustries, setSelectedIndustries] = useState<{ id: number; name: string }[]>(
    profile.industries || []
  );

  useEffect(() => {
    setSelectedIndustries(profile.industries || []);
  }, [profile.industries]);

  useEffect(() => {
    if (industryFetcher.data?.success) {
      setIndustriesOpen(false);
      setShowIndustryMessage(false);
    } else if (industryFetcher.data?.error) {
      setShowIndustryMessage(true);
    }
  }, [industryFetcher.data]);

  const handleDialogChange = (isOpen: boolean) => {
    setIndustriesOpen(isOpen);
    if (!isOpen) {
      setShowIndustryMessage(false);
    }
  };

  // console.log('🤖 INDUSTRIES SERVED PROFILE:', profile);
  // console.log('🤖 INDUSTRIES:', profile.industries);

  const handleSubmit = () => {
    const industriesPayload = selectedIndustries.map(industry => ({ id: industry.id }));
    industryFetcher.submit(
      {
        'employer-industries': JSON.stringify(industriesPayload),
        'target-updated': 'employer-industries',
      },
      { method: 'post' }
    );
  };

  const maxVisible = 2;
  const visible = selectedIndustries.slice(0, maxVisible);
  const extraCount = selectedIndustries.length - maxVisible;

  return (
    <div className="ml-auto flex flex-col xl:mr-20 md:mr-10 mr-0 gap-2">
      <div className="flex items-center justify-between w-full">
        <span className="relative 2xl:text-lg lg:text-base text-sm font-medium">Industries</span>

        {canEdit && (
          <Dialog open={industriesOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button
                className="focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                variant="link"
              >
                <IoPencilSharp className="lg:relative absolute lg:left-0 left-20 xl:h-7 h-6 xl:w-7 w-6 text-primaryColor hover:bg-gray-200 transition-all rounded-full p-1" />
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-white lg:w-[500px] w-[300px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="mt-3">Industries</DialogTitle>
              </DialogHeader>

              {showIndustryMessage && industryFetcher.data?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{industryFetcher.data.error.message}</span>
                </div>
              )}

              <div className="mt-6 ml-1">
                <SearcheableTagSelector<{ id: number; name: string }>
                  dataType="industry"
                  setSelectedItems={setSelectedIndustries}
                  selectedItems={selectedIndustries}
                  itemLabel={item => item.name}
                  itemKey={item => item.id}
                  formName="employer-industries"
                  fieldName="employer-industries"
                  searchPlaceholder="Search or type industry"
                />
              </div>

              <DialogFooter className="mt-6">
                <Button
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium hover:bg-primaryColor focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                  onClick={handleSubmit}
                  disabled={industryFetcher.state === 'submitting'}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Shown industries */}
      <div className="flex flex-wrap items-start gap-2 w-full">
        {selectedIndustries.length > 0 ? (
          <>
            {visible.map(ind => (
              <Badge
                key={ind.id}
                className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm"
              >
                {ind.name}
              </Badge>
            ))}
            {extraCount > 0 && (
              <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogTrigger asChild>
                  <Badge
                    variant="outline"
                    className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-gray-200 text-gray-700 rounded-2xl shadow-sm hover:bg-gray-300"
                  >
                    +{extraCount} more
                  </Badge>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="xl:text-lg text-base">All Industries</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-wrap items-start gap-2 mt-4">
                    {selectedIndustries.map(ind => (
                      <Badge
                        key={ind.id}
                        className="px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm flex items-center justify-center"
                      >
                        {ind.name}
                      </Badge>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        ) : (
          <span className="text-gray-500 text-sm italic">No industries added</span>
        )}
      </div>
    </div>
  );
}
