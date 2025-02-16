import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { IoPencilSharp } from "react-icons/io5";
import { useFetcher } from "@remix-run/react";
import SearcheableTagSelector from "~/common/SearcheableTagSelector";
import { Badge } from "~/components/ui/badge";

interface LanguagesProps {
  profile: { languages?: { id: number; name: string }[] };
  canEdit?: boolean;
}

export default function Languages({ profile, canEdit = true }: LanguagesProps) {
  const [languagesServedOpen, setLanguagesServedOpen] = useState(false);
  const [showLanguageMessage, setShowLanguageMessage] = useState(false);
  const [showAll, setShowAll] = useState(false); // Modal for extra languages

  // console.log("🔥 LANGUAGES COMPONENT: Received Profile:", profile);

  const languageFetcher = useFetcher<{
    success?: boolean;
    error?: { message: string };
  }>();

  const [selectedLanguages, setSelectedLanguages] = useState<
    { id: number; name: string }[]
  >(profile.languages || []);

  useEffect(() => {
    setSelectedLanguages(profile.languages || []);
  }, [profile.languages]);

  useEffect(() => {
    if (languageFetcher.data?.success || languageFetcher.data?.error) {
      setShowLanguageMessage(true);
    }
  }, [languageFetcher.data]);

  const handleLanguageDialogChange = (isOpen: boolean) => {
    setLanguagesServedOpen(isOpen);
    if (!isOpen) {
      setShowLanguageMessage(false);
    }
  };

  const handleSubmit = () => {
    const languagesWithExperience = selectedLanguages.map((language) => ({
      id: language.id,
    }));

    languageFetcher.submit(
      {
        languages: JSON.stringify(languagesWithExperience),
        "target-updated": "freelancer-languages",
      },
      { method: "post" }
    );
  };

  const maxVisibleLanguages = 3;
  const extraLanguages = selectedLanguages.length - maxVisibleLanguages;
  const visibleLanguages = selectedLanguages.slice(0, maxVisibleLanguages);
  const hiddenLanguages = selectedLanguages.slice(maxVisibleLanguages);

  // console.log("Received profile.languages:", profile.languages);

  return (
    <div className="ml-auto flex flex-col xl:mr-20 md:mr-10 mr-0 gap-2">
      {/* HEADER - Languages Title & Edit Button */}
      <div className="flex items-center justify-between w-full">
        <span className="lg:text-lg sm:text-base text-sm font-medium">
          Languages
        </span>

        {canEdit && (
          <Dialog
            open={languagesServedOpen}
            onOpenChange={handleLanguageDialogChange}
          >
            <DialogTrigger asChild>
              <Button variant="link">
                <IoPencilSharp className="h-7 w-7 text-primaryColor hover:bg-gray-200 transition-all rounded-full p-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="mt-3">Languages</DialogTitle>
                <DialogDescription>
                  Add the languages you speak
                </DialogDescription>
              </DialogHeader>

              {showLanguageMessage && languageFetcher.data?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">
                    {languageFetcher.data.error.message}
                  </span>
                </div>
              )}

              <SearcheableTagSelector<{ id: number; name: string }>
                dataType="language"
                setSelectedItems={setSelectedLanguages}
                selectedItems={selectedLanguages}
                itemLabel={(item) => item.name}
                itemKey={(item) => item.id}
                formName="freelancer-languages"
                fieldName="freelancer-languages"
                searchPlaceholder="Search or type language"
              />

              <DialogFooter className="mt-6">
                <Button
                  className="text-white py-4 px-10 rounded-xl bg-primaryColor font-medium hover:bg-primaryColor"
                  type="submit"
                  form="freelancer-languages-form"
                  onClick={handleSubmit}
                  disabled={languageFetcher.state === "submitting"}
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* LANGUAGES LIST - Independent Layout */}
      <div className="flex flex-wrap items-start gap-2 w-full">
        {selectedLanguages.length > 0 ? (
          <>
            {visibleLanguages.map((language) => (
              <Badge
                key={language.id}
                className="px-4 py-1 text-sm bg-blue-100 text-gray-900 rounded-2xl shadow-sm"
              >
                {language.name}
              </Badge>
            ))}

            {extraLanguages > 0 && (
              <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogTrigger asChild>
                  <Badge
                    variant="outline"
                    className="px-4 py-1 text-sm bg-gray-200 text-gray-700 rounded-2xl shadow-sm hover:bg-gray-300"
                  >
                    +{extraLanguages} more
                  </Badge>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg">All Languages</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                    {hiddenLanguages.map((language) => (
                      <Badge
                        key={language.id}
                        className="px-3 py-1 text-sm bg-blue-100 text-gray-900 rounded-xl shadow-sm flex items-center justify-center"
                      >
                        {language.name}
                      </Badge>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        ) : (
          <span className="text-gray-500 text-sm italic">
            No languages added
          </span>
        )}
      </div>
    </div>
  );
}
