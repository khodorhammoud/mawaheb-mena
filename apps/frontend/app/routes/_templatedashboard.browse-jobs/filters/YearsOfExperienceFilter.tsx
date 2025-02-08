import { useState, useEffect } from "react";
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

interface YearsOfExperienceFilterProps {
  filters: { yearsOfExperience: number | null };
  setFilters: (filters: any) => void;
}

export default function YearsOfExperienceFilter({
  filters,
  setFilters,
}: YearsOfExperienceFilterProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">(
    filters.yearsOfExperience || ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputKey, setInputKey] = useState(0); // ✅ Forces input reset

  // ✅ Remove error message when user enters a value
  useEffect(() => {
    if (yearsOfExperience !== "") {
      setErrorMessage(null);
    }
  }, [yearsOfExperience]);

  const saveExperience = () => {
    if (yearsOfExperience === "" || yearsOfExperience < 0) {
      showError("Please enter a valid number of years.");
      return;
    }

    setFilters((prev: any) => ({ ...prev, yearsOfExperience }));
    setOpenDialog(false);
  };

  const clearExperience = () => {
    setFilters((prev: any) => ({ ...prev, yearsOfExperience: null }));
    setYearsOfExperience("");
    setErrorMessage(null);
    setInputKey((prevKey) => prevKey + 1); // ✅ Force re-render
  };

  const showError = (message: string) => {
    setFadeOut(false);
    setErrorMessage(message);

    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setErrorMessage(null);
      }, 500);
    }, 2000);
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setYearsOfExperience(""); // ✅ Allow clearing the field
    } else if (!isNaN(Number(value)) && Number(value) >= 0) {
      setYearsOfExperience(Number(value)); // ✅ Store as a number
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <button className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-4 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition">
          Years of Experience
          {filters.yearsOfExperience !== null && (
            <X
              size={32}
              className="text-gray-500 p-1 rounded-full transition 
              group-hover:text-white hover:text-green-500"
              onClick={(e) => {
                e.stopPropagation();
                clearExperience();
              }}
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Specify Years of Experience</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div
            className={`px-4 py-3 rounded relative mt-2 text-center bg-red-100 border border-red-400 text-red-700 transition-opacity duration-500 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            {errorMessage}
          </div>
        )}

        {/* ✅ Use AppFormField for Number Input */}
        <div className="mt-4 mb-4" key={inputKey}>
          <AppFormField
            id="yearsOfExperience"
            name="yearsOfExperience"
            label="Years of Experience"
            type="number"
            placeholder="Enter years of experience"
            defaultValue={yearsOfExperience.toString()} // 🔥 FIX: Convert number to string
            onChange={(e) => handleExperienceChange(e)} // ✅ Ensure correct state update
          />
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            className="text-primaryColor hover:bg-gray-300 hover:text-white transition rounded-xl px-4 py-2 border border-gray-300"
            onClick={clearExperience}
          >
            Clear
          </Button>
          <Button
            onClick={saveExperience}
            className="bg-primaryColor text-white px-4 py-2 rounded-xl not-active-gradient hover:bg-primaryColor"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
