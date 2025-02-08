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
import { ProjectType } from "~/types/enums";

interface JobTypeFilterProps {
  filters: { jobType: ProjectType | null };
  setFilters: (filters: any) => void;
}

export default function JobTypeFilter({
  filters,
  setFilters,
}: JobTypeFilterProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<ProjectType | "">(
    filters.jobType || ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputKey, setInputKey] = useState(0); // ✅ Force re-render on clear

  // ✅ Remove error message when user selects a job type
  useEffect(() => {
    if (selectedJobType) {
      setErrorMessage(null);
    }
  }, [selectedJobType]);

  const saveJobType = () => {
    if (!selectedJobType) {
      showError("Please select a job type.");
      return;
    }

    setFilters((prev: any) => ({ ...prev, jobType: selectedJobType }));

    setOpenDialog(false);
  };

  const clearJobType = () => {
    setFilters((prev: any) => ({ ...prev, jobType: null }));
    setSelectedJobType(""); // ✅ Reset selected job type
    setErrorMessage(null);
    setInputKey((prevKey) => prevKey + 1); // ✅ Force re-render of dropdown
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

  const handleJobTypeChange = (value: string) => {
    setSelectedJobType(value as ProjectType);
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <button className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-4 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition">
          Job Type
          {filters.jobType && (
            <X
              size={32}
              className="text-gray-500 p-1 rounded-full transition 
              group-hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                clearJobType();
              }}
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Select Job Type</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div
            className={`px-4 py-3 rounded relative mb-4 text-center bg-red-100 border border-red-400 text-red-700 transition-opacity duration-500 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            {errorMessage}
          </div>
        )}

        {/* ✅ Use AppFormField with a Unique `key` to Force Re-render */}
        <div className="mt-4 mb-4" key={inputKey}>
          <AppFormField
            id="jobType"
            name="jobType"
            label="Select Job Type"
            type="select"
            options={[
              {
                value: ProjectType.PerProjectBasis,
                label: "Per Project Basis",
              },
              { value: ProjectType.ShortTerm, label: "Short Term" },
              { value: ProjectType.LongTerm, label: "Long Term" },
            ]}
            defaultValue={selectedJobType}
            onChange={(e) => handleJobTypeChange(e)} // ✅ Ensure correct state update
          />
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            className="text-primaryColor hover:bg-gray-300 hover:text-white transition rounded-xl px-4 py-2 border border-gray-300"
            onClick={clearJobType}
          >
            Clear
          </Button>
          <Button
            onClick={saveJobType}
            className="bg-primaryColor text-white px-4 py-2 rounded-xl not-active-gradient hover:bg-primaryColor"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
