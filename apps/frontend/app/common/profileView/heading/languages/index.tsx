import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { IoPencilSharp } from 'react-icons/io5';
import { useFetcher } from '@remix-run/react';
import SearcheableTagSelector from '~/common/SearcheableTagSelector';
import { Badge } from '~/components/ui/badge';

interface LanguagesProps {
  profile: { languages?: { id: number; language: string }[] };
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

  const [selectedLanguages, setSelectedLanguages] = useState<{ id: number; language: string }[]>(
    profile.languages || []
  );

  useEffect(() => {
    setSelectedLanguages(profile.languages || []);
  }, [profile.languages]);

  useEffect(() => {
    if (languageFetcher.data?.success) {
      setLanguagesServedOpen(false); // CLOSE dialog on success
      setShowLanguageMessage(false); // Optionally reset error/message
    } else if (languageFetcher.data?.error) {
      setShowLanguageMessage(true); // Show error message only if error
    }
  }, [languageFetcher.data]);

  const handleLanguageDialogChange = (isOpen: boolean) => {
    setLanguagesServedOpen(isOpen);
    if (!isOpen) {
      setShowLanguageMessage(false);
    }
  };

  const handleSubmit = () => {
    const languagesWithExperience = selectedLanguages.map(language => ({
      id: language.id,
    }));

    languageFetcher.submit(
      {
        languages: JSON.stringify(languagesWithExperience),
        'target-updated': 'freelancer-languages',
      },
      { method: 'post' }
    );
  };

  const maxVisibleLanguages = 2;
  const extraLanguages = selectedLanguages.length - maxVisibleLanguages;
  const visibleLanguages = selectedLanguages.slice(0, maxVisibleLanguages);
  // const hiddenLanguages = selectedLanguages.slice(maxVisibleLanguages);

  // console.log("Received profile.languages:", profile.languages);

  return (
    <div className="lg:ml-auto flex flex-col xl:mr-20 md:mr-10 mr-0 gap-2">
      {/* HEADER - Languages Title & Edit Button */}
      <div className="flex items-center justify-between w-full">
        <span className="relative 2xl:text-lg lg:text-base text-sm font-medium">Languages</span>

        {canEdit && (
          <Dialog open={languagesServedOpen} onOpenChange={handleLanguageDialogChange}>
            {/* ✏️ */}
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
                <DialogTitle className="mt-3">Languages</DialogTitle>
                <DialogDescription className="w-2/3 text-base">
                  Add the languages you speak
                </DialogDescription>
              </DialogHeader>

              {showLanguageMessage && languageFetcher.data?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 lg:px-4 px-2 lg:py-3 py-1 rounded relative mb-4">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{languageFetcher.data.error.message}</span>
                </div>
              )}

              <div className="mt-6 ml-1">
                <SearcheableTagSelector<{ id: number; language: string }>
                  dataType="language"
                  setSelectedItems={setSelectedLanguages}
                  selectedItems={selectedLanguages}
                  itemLabel={item => item.language}
                  itemKey={item => item.id}
                  formName="freelancer-languages"
                  fieldName="freelancer-languages"
                  searchPlaceholder="Search or type language"
                />
              </div>

              <div className="border-t border-gray-300 my-6 ml-2 mr-6"></div>
              <p className="-mt-1 ml-1 mb-3 font-semibold text-sm">Choosed Languages:</p>

              <div className="flex flex-wrap items-start gap-2 w-full">
                {selectedLanguages.length > 0 ? (
                  selectedLanguages.map(language => (
                    <Badge
                      key={language.id}
                      className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm flex items-center gap-2"
                    >
                      {language.language}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm italic">No languages added</span>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  className="text-white lg:py-4 py-3 lg:px-10 px-6 rounded-xl bg-primaryColor font-medium hover:bg-primaryColor focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0"
                  type="submit"
                  form="freelancer-languages-form"
                  onClick={handleSubmit}
                  disabled={languageFetcher.state === 'submitting'}
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
            {visibleLanguages.map(language => (
              <Badge
                key={language.id}
                className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm"
              >
                {language.language}
              </Badge>
            ))}

            {extraLanguages > 0 && (
              <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogTrigger asChild>
                  <Badge
                    variant="outline"
                    className="xl:px-4 px-3 py-1 xl:text-sm text-xs bg-gray-200 text-gray-700 rounded-2xl shadow-sm hover:bg-gray-300"
                  >
                    +{extraLanguages} more
                  </Badge>
                </DialogTrigger>
                <DialogContent className="bg-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="xl:text-lg text-base">All Languages</DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-wrap items-start gap-2 mt-4">
                    {selectedLanguages.map(language => (
                      <Badge
                        key={language.id}
                        className="px-3 py-1 xl:text-sm text-xs bg-blue-100 text-gray-900 rounded-2xl shadow-sm flex items-center justify-center w-fit"
                      >
                        {language.language}
                      </Badge>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        ) : (
          <span className="text-gray-500 text-sm italic">No languages added</span>
        )}
      </div>
    </div>
  );
}
