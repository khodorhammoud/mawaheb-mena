import { useState, useEffect } from "react";
import { BsSearch } from "react-icons/bs";
import { X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import AppFormField from "~/common/form-fields";

interface FilteringSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: { workingHours: { from: string; to: string } | null };
  setFilters: (filters: any) => void;
}

export default function FilteringSearchSection({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: FilteringSearchSectionProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [tempWorkingHours, setTempWorkingHours] = useState({
    from: "",
    to: "",
  });

  // 🔥 Error message state (only for errors)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false); // ✅ Controls fade-out effect

  // 🔥 Force re-render by updating a unique key
  const [inputKey, setInputKey] = useState(0);

  const saveWorkingHours = () => {
    const from = tempWorkingHours.from;
    const to = tempWorkingHours.to;

    // ✅ Prevent saving if any field is empty
    if (!from || !to) {
      showError("Both 'From' and 'To' fields must be filled.");
      return;
    }

    // ✅ Ensure 'From' is less than 'To'
    if (parseInt(from) >= parseInt(to)) {
      showError("'From' value must be less than 'To' value.");
      return;
    }

    // ✅ Save if everything is valid
    setFilters((prev: any) => ({ ...prev, workingHours: tempWorkingHours }));
    setOpenDialog(false);
  };

  const clearWorkingHours = () => {
    setFilters((prev: any) => ({ ...prev, workingHours: null }));
    setTempWorkingHours({ from: "", to: "" });

    // ✅ Force re-render to instantly reset defaultValue
    setInputKey((prevKey) => prevKey + 1);
  };

  // ✅ Function to show error message with fade-out effect
  const showError = (message: string) => {
    setFadeOut(false); // Reset fade-out effect
    setErrorMessage(message);

    setTimeout(() => {
      setFadeOut(true); // Start fading out
      setTimeout(() => {
        setErrorMessage(null); // Remove message after fade-out
      }, 500); // Fade-out duration (0.5s)
    }, 2000); // Display message for 2 seconds
  };

  // ✅ Remove error message when modal is closed
  const handleDialogChange = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    if (!isOpen) {
      setErrorMessage(null); // Remove error when closing
      setFadeOut(false); // Reset fade effect
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-6 xl:gap-8 mt-4 mb-8">
      {/* Search Field */}
      <div className="relative md:w-1/3 w-full">
        <AppFormField
          id="search"
          name="search"
          type="text"
          placeholder="Hinted search text"
          defaultValue={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label={
            <div className="flex items-center">
              <BsSearch className="text-gray-500" />
              <span className="ml-2">Hinted search text</span>
            </div>
          }
        />
        {searchQuery && (
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
            onClick={() => setSearchQuery("")}
          >
            <X size={32} />
          </button>
        )}
      </div>

      {/* Working Hours Filter */}
      <Dialog open={openDialog} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <button className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-4 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition">
            Working Hours
            {filters.workingHours && (
              <X
                size={32}
                className="text-gray-500 p-1 group-hover:text-white transition hover:bg-gray-300 rounded-full hover:text-primaryColor"
                onClick={(e) => {
                  e.stopPropagation();
                  clearWorkingHours();
                }}
              />
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Specify Working Hours</DialogTitle>
          </DialogHeader>

          {/* ✅ Show error messages with fade-out and remove on close */}
          {errorMessage && (
            <div
              className={`px-4 py-3 rounded relative mb-4 text-center bg-red-100 border border-red-400 text-red-700 transition-opacity duration-500 ${
                fadeOut ? "opacity-0" : "opacity-100"
              }`}
            >
              {errorMessage}
            </div>
          )}

          {/* 🔥 Force re-render with dynamic key */}
          <div className="flex gap-4 mt-4 mb-4" key={inputKey}>
            <AppFormField
              key={inputKey + "-from"}
              id="from"
              name="from"
              type="number"
              placeholder="From (hours)"
              label="From (hours)"
              defaultValue={tempWorkingHours.from}
              onChange={(e) =>
                setTempWorkingHours((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }
            />
            <AppFormField
              key={inputKey + "-to"}
              id="to"
              name="to"
              type="number"
              placeholder="To (hours)"
              label="To (hours)"
              defaultValue={tempWorkingHours.to}
              onChange={(e) =>
                setTempWorkingHours((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }
            />
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              variant="ghost"
              className="text-primaryColor hover:bg-gray-300 hover:text-white transition rounded-xl px-4 py-2 border border-gray-300"
              onClick={clearWorkingHours}
            >
              Clear
            </Button>
            <Button
              onClick={saveWorkingHours}
              className="bg-primaryColor text-white px-4 py-2 rounded-xl not-active-gradient hover:bg-primaryColor"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
