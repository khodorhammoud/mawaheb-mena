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

interface HourlyRateFilterProps {
  filters: { hourlyRate: number | null };
  setFilters: (filters: any) => void;
}

export default function HourlyRateFilter({
  filters,
  setFilters,
}: HourlyRateFilterProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number | "">(
    filters.hourlyRate || ""
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [inputKey, setInputKey] = useState(0); // ✅ Forces input reset

  // ✅ Remove error message when user enters a value
  useEffect(() => {
    if (hourlyRate !== "") {
      setErrorMessage(null);
    }
  }, [hourlyRate]);

  const saveHourlyRate = () => {
    if (hourlyRate === "" || hourlyRate < 0) {
      showError("Please enter a valid hourly rate.");
      return;
    }

    setFilters((prev: any) => ({ ...prev, hourlyRate }));
    setOpenDialog(false);
  };

  const clearHourlyRate = () => {
    setFilters((prev: any) => ({ ...prev, hourlyRate: null }));
    setHourlyRate("");
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

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setHourlyRate(""); // ✅ Allow clearing the field
    } else if (!isNaN(Number(value)) && Number(value) >= 0) {
      setHourlyRate(Number(value)); // ✅ Store as a number
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <button className="group border border-gray-300 text-primaryColor bg-white rounded-[10px] px-4 py-2 flex items-center gap-2 hover:bg-primaryColor hover:text-white transition">
          Hourly Rate
          {filters.hourlyRate !== null && (
            <X
              size={32}
              className="text-gray-500 p-1 rounded-full transition 
              group-hover:text-white hover:bg-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                clearHourlyRate();
              }}
            />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Specify Hourly Rate</DialogTitle>
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
            id="hourlyRate"
            name="hourlyRate"
            label="Hourly Rate ($/hr)"
            type="number"
            placeholder="Enter hourly rate"
            defaultValue={hourlyRate.toString()} // ✅ Ensure it's a string
            onChange={handleHourlyRateChange}
          />
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            className="text-primaryColor hover:bg-gray-300 hover:text-white transition rounded-xl px-4 py-2 border border-gray-300"
            onClick={clearHourlyRate}
          >
            Clear
          </Button>
          <Button
            onClick={saveHourlyRate}
            className="bg-primaryColor text-white px-4 py-2 rounded-xl not-active-gradient hover:bg-primaryColor"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
