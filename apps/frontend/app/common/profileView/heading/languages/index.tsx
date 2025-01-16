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

export default function Languages() {
  const [languagesServedOpen, setLanguagesServedOpen] = useState(false); // Language dialog state
  const [showLanguageMessage, setShowLanguageMessage] = useState(false); // Track Language message visibility

  const languageFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>(); // Fetcher for Language form

  // Load data
  const { freelancerLanguages, allLanguages } = useLoaderData() as {
    freelancerLanguages: { id: number; name: string }[];
    allLanguages: { id: number; name: string }[];
  };

  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);

  // Set initial Languages selected
  useEffect(() => {
    setSelectedLanguages(freelancerLanguages.map((lang) => lang.id));
  }, [freelancerLanguages]);

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
    }
  };

  return (
    <>
      {/* LANGUAGES SERVED ✏️ */}
      <div className="ml-auto flex items-center xl:mr-20 md:mr-10 mr-0">
        {/* LANGUAGES */}
        <span className="lg:text-lg sm:text-base text-sm">Languages</span>
        {/* ✏️ + POPUP */}
        <Dialog
          open={languagesServedOpen}
          onOpenChange={handleLanguageDialogChange}
        >
          {/* ✏️ */}
          <DialogTrigger asChild>
            <Button variant="link">
              <IoPencilSharp className="h-7 w-7 text-small text-primaryColor hover:bg-[#E4E3E6] transition-all rounded-full p-1 xl:-ml-1 lg:-ml-2 -ml-3" />
            </Button>
          </DialogTrigger>
          {/* POPUP */}
          <DialogContent className="bg-white w-80">
            <DialogHeader>
              <DialogTitle className="mt-3">Languages</DialogTitle>
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
            <SearcheableTagSelector<{ id: number; name: string }>
              data={allLanguages}
              selectedKeys={selectedLanguages}
              itemLabel={(item) => item.name}
              itemKey={(item) => item.id}
              formName="freelancer-languages"
              fieldName="freelancer-languages"
              searchPlaceholder="Search or type language"
            />

            <DialogFooter className="mt-6">
              <Button
                className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium not-active-gradient hover:bg-primaryColor"
                type="submit"
                form="freelancer-languages-form"
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
