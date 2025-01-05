import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Checkbox } from "~/components/ui/checkbox";
import ToggleSwitch from "~/common/toggle-switch/ToggleSwitch";
import { Button } from "~/components/ui/button";
import AppFormField from "~/common/form-fields";
import Calendar from "~/common/calender/Calender";
import { format } from "date-fns";

// Generate time options for the entire day in 30-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const time = new Date(0, 0, 0, hour, minute);
      times.push({
        value: format(time, "HH:mm"),
        label: format(time, "h:mm a"),
      });
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export default function Availability() {
  type AvailabilityResponse = {
    success?: boolean;
    error?: {
      message: string;
    };
  };

  // Fetcher for form submission
  const availabilityFetcher = useFetcher<AvailabilityResponse>();

  // State for form fields
  const [workAvailability, setWorkAvailability] = useState({
    isLookingForWork: false,
    jobTypes: [],
    availableFrom: "",
    availableHoursStart: "09:00",
    availableHoursEnd: "17:00",
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // For showing messages
  const [showAvailabilityMessage, setShowAvailabilityMessage] = useState(false);

  // Format the date to mm/dd
  const formatDate = (date: Date | null) => (date ? format(date, "MM/dd") : "");

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setWorkAvailability((prevState) => ({
      ...prevState,
      availableFrom: formatDate(date),
    }));
    setIsCalendarOpen(false); // Close the calendar after selecting a date
  };

  // Effect to handle success/error messages after submission
  useEffect(() => {
    if (availabilityFetcher.data) {
      setShowAvailabilityMessage(true);

      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        setShowAvailabilityMessage(false);
      }, 3000);
    }
  }, [availabilityFetcher.data]);

  return (
    <div
      className="bg-white w-full p-6 overflow-y-auto"
      style={{ maxHeight: "90vh" }}
    >
      <h2 className="text-2xl">Set your work availability</h2>

      {/* Form using fetcher */}
      <availabilityFetcher.Form method="post">
        {/* Hidden input to identify the target */}
        <input
          type="hidden"
          name="target-updated"
          value="freelancer-availability"
        />

        {/* Success Message */}
        {showAvailabilityMessage && availabilityFetcher.data?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">
              Availability saved successfully!
            </span>
          </div>
        )}

        {/* Error Message */}
        {showAvailabilityMessage && availabilityFetcher.data?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">
              {availabilityFetcher.data.error.message}
            </span>
          </div>
        )}

        {/* ToggleSwitch */}
        <div className="flex text-sm items-center mt-5 mb-7 ml-1">
          <ToggleSwitch
            isChecked={workAvailability.isLookingForWork}
            onChange={(state) =>
              setWorkAvailability((prevState) => ({
                ...prevState,
                isLookingForWork: state,
              }))
            }
            className="mr-4"
          />
          <input
            type="hidden"
            name="available_for_work"
            value={workAvailability.isLookingForWork.toString()}
          />
          <div>I am looking for work</div>
        </div>

        {/* Checkboxes */}
        <div className="mb-7">
          <p className="text-base mb-6">Job Types I am open to:</p>
          {["Full Time", "Part Time", "Employee"].map((jobType) => (
            <div key={jobType} className="flex text-sm items-center ml-2 mb-4">
              <Checkbox
                id={jobType.toLowerCase()}
                checked={workAvailability.jobTypes.includes(jobType)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setWorkAvailability((prevState) => ({
                      ...prevState,
                      jobTypes: [...prevState.jobTypes, jobType],
                    }));
                  } else {
                    setWorkAvailability((prevState) => ({
                      ...prevState,
                      jobTypes: prevState.jobTypes.filter(
                        (type) => type !== jobType
                      ),
                    }));
                  }
                }}
              />
              <label
                htmlFor={jobType.toLowerCase()}
                className="ml-2 text-gray-700"
              >
                {jobType} Roles
              </label>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="relative my-6">
          <label
            htmlFor="availableFrom"
            className="block text-base font-medium mb-4"
          >
            I am available to work from:
          </label>

          <div
            className="relative cursor-pointer"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <AppFormField
              type="text"
              id="availableFrom"
              name="available_from"
              label="mm/dd"
              placeholder="mm/dd"
              defaultValue={formatDate(selectedDate)}
              className="block w-full"
            />
          </div>

          {isCalendarOpen && (
            <div className="relative bg-white mt-2">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Hours Available */}
        <div className="mb-4">
          <label className="block mb-4">Hours I am available to work:</label>
          <div className="flex gap-4 items-center">
            <AppFormField
              type="select"
              id="availableHoursStart"
              name="hours_available_from"
              label="Start Time"
              defaultValue={workAvailability.availableHoursStart}
              options={timeOptions}
            />
            <span>to</span>
            <AppFormField
              type="select"
              id="availableHoursEnd"
              name="hours_available_to"
              label="End Time"
              defaultValue={workAvailability.availableHoursEnd}
              options={timeOptions}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            disabled={availabilityFetcher.state === "submitting"}
            className="text-white py-4 px-6 rounded-xl bg-primaryColor font-medium not-active-gradient mt-2"
            type="submit"
          >
            {availabilityFetcher.state === "submitting"
              ? "Saving..."
              : "Save my availability"}
          </Button>
        </div>
      </availabilityFetcher.Form>
    </div>
  );
}
