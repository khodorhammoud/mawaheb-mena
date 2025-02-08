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

interface WorkingHoursFilterProps {
  filters: { workingHours: { from: string; to: string } | null };
  setFilters: (filters: any) => void;
}

export default function WorkingHoursFilter({
  filters,
  setFilters,
}: WorkingHoursFilterProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [tempWorkingHours, setTempWorkingHours] = useState({
    from: "",
    to: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const saveWorkingHours = () => {
    const from = tempWorkingHours.from;
    const to = tempWorkingHours.to;

    if (!from || !to) {
      showError("Both 'From' and 'To' fields must be filled.");
      return;
    }
    if (parseInt(from) >= parseInt(to)) {
      showError("'From' value must be less than 'To' value.");
      return;
    }

    setFilters((prev: any) => ({ ...prev, workingHours: tempWorkingHours }));
    setOpenDialog(false);
  };

  const clearWorkingHours = () => {
    setFilters((prev: any) => ({ ...prev, workingHours: null }));
    setTempWorkingHours({ from: "", to: "" });
    setInputKey((prevKey) => prevKey + 1);
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

  const handleDialogChange = (isOpen: boolean) => {
    setOpenDialog(isOpen);
    if (!isOpen) {
      setErrorMessage(null);
      setFadeOut(false);
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <button className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-4 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition not-active-gradient">
          Working Hours
          {filters.workingHours && (
            <X
              size={32}
              className="text-gray-500 p-1 rounded-full transition 
              group-hover:text-white hover:bg-gray-400"
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

        {errorMessage && (
          <div
            className={`px-4 py-3 rounded relative mt-2 text-center bg-red-100 border border-red-400 text-red-700 transition-opacity duration-500 ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            {errorMessage}
          </div>
        )}

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
  );
}
