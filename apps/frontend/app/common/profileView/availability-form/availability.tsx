import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Checkbox } from "~/components/ui/checkbox";
import ToggleSwitch from "~/common/toggle-switch/ToggleSwitch";
import { Button } from "~/components/ui/button";
import AppFormField from "~/common/form-fields";
import Calendar from "~/common/calender/Calender";
import { format } from "date-fns";
import { Freelancer } from "~/types/User";

// Define the type of the loader data
type LoaderData = {
  freelancerAvailability: {
    availableForWork: boolean;
    jobsOpenTo: string[];
    availableFrom: string;
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
  };
};

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

  const { freelancerAvailability } = useLoaderData<LoaderData>();

  // Fetcher for form submission
  const availabilityFetcher = useFetcher<AvailabilityResponse>();
  const toggleFetcher = useFetcher();

  const [workAvailability, setWorkAvailability] = useState({
    isLookingForWork: freelancerAvailability.availableForWork,
    jobTypes: freelancerAvailability.jobsOpenTo,
    availableFrom: freelancerAvailability.availableFrom,
    availableHoursStart: freelancerAvailability.hoursAvailableFrom,
    availableHoursEnd: freelancerAvailability.hoursAvailableTo,
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    freelancerAvailability?.availableFrom
      ? new Date(freelancerAvailability.availableFrom)
      : null
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Format the date to mm/dd/yyyy
  const formatDate = (date: Date | null) =>
    date ? format(date, "yyyy-MM-dd") : "";

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
    }
  }, [availabilityFetcher.data]);

  // For showing messages
  const [showAvailabilityMessage, setShowAvailabilityMessage] = useState(false);

  // these consoles are to see what are the data taken from the Loader, and i can use them in the file :)
  // console.log("freelancerAvailability:", freelancerAvailability);
  // console.log("workAvailability:", workAvailability);

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
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-2">
            <span className="block sm:inline">
              Availability saved successfully!
            </span>
          </div>
        )}

        {/* Error Message */}
        {showAvailabilityMessage && availabilityFetcher.data?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-2">
            <span className="block sm:inline">
              {availabilityFetcher.data.error.message}
            </span>
          </div>
        )}

        {/* ToggleSwitch */}
        <div className="flex text-sm items-center mt-5 mb-7 ml-1">
          <ToggleSwitch
            isChecked={workAvailability.isLookingForWork}
            onChange={(state) => {
              // Submit the toggle switch change using toggleFetcher
              toggleFetcher.submit(
                {
                  "target-updated": "freelancer-is-available-for-work",
                  available_for_work: state.toString(),
                },
                { method: "post" }
              );

              // Update the local state
              setWorkAvailability((prevState) => ({
                ...prevState,
                isLookingForWork: state,
              }));
            }}
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

          {/* Full Time Checkbox */}
          <div className="flex text-sm items-center ml-2 mb-4">
            <Checkbox
              id="full-time"
              name="jobs_open_to[]"
              value="full-time-roles" // Match this value with the database entry
              checked={workAvailability.jobTypes.includes("full-time-roles")}
              onCheckedChange={(checked) => {
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  jobTypes: checked
                    ? [...prevState.jobTypes, "full-time-roles"]
                    : prevState.jobTypes.filter(
                        (type) => type !== "full-time-roles"
                      ),
                }));
              }}
            />
            <label htmlFor="full-time" className="ml-2 text-gray-700">
              Full Time Roles
            </label>
          </div>

          {/* Part Time Checkbox */}
          <div className="flex text-sm items-center ml-2 mb-4">
            <Checkbox
              id="part-time"
              name="jobs_open_to[]"
              value="part-time-roles" // Match this value with the database entry
              checked={workAvailability.jobTypes.includes("part-time-roles")}
              onCheckedChange={(checked) => {
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  jobTypes: checked
                    ? [...prevState.jobTypes, "part-time-roles"]
                    : prevState.jobTypes.filter(
                        (type) => type !== "part-time-roles"
                      ),
                }));
              }}
            />
            <label htmlFor="part-time" className="ml-2 text-gray-700">
              Part Time Roles
            </label>
          </div>

          {/* Employee Checkbox */}
          <div className="flex text-sm items-center ml-2 mb-4">
            <Checkbox
              id="employee"
              name="jobs_open_to[]"
              value="employee-roles" // Match this value with the database entry
              checked={workAvailability.jobTypes.includes("employee-roles")}
              onCheckedChange={(checked) => {
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  jobTypes: checked
                    ? [...prevState.jobTypes, "employee-roles"]
                    : prevState.jobTypes.filter(
                        (type) => type !== "employee-roles"
                      ),
                }));
              }}
            />
            <label htmlFor="employee" className="ml-2 text-gray-700">
              Employee Roles
            </label>
          </div>
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
              defaultValue={workAvailability.availableFrom}
              onChange={(value) =>
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  availableFrom: value,
                }))
              }
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
              defaultValue={freelancerAvailability.hoursAvailableFrom}
              options={timeOptions}
            />
            <span>to</span>
            <AppFormField
              type="select"
              id="availableHoursEnd"
              name="hours_available_to"
              label="End Time"
              defaultValue={freelancerAvailability.hoursAvailableTo}
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
