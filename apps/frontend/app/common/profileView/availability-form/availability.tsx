import { useState, useEffect } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Checkbox } from "~/components/ui/checkbox";
import ToggleSwitch from "~/common/toggle-switch/ToggleSwitch";
import { Button } from "~/components/ui/button";
import AppFormField from "~/common/form-fields";
import Calendar from "~/common/calender/Calender";
import { format } from "date-fns";

type AvailabilityResponse = {
  success?: boolean; // If the operation was successful
  error?: {
    message: string; // The error message in case of failure
  };
};

type LoaderData = {
  profile?: {
    // form onboarding state ❤️
    availableForWork: boolean;
    jobsOpenTo: string[];
    dateAvailableFrom: string | null; // use Date type also
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
  };
  freelancerAvailability?: {
    // form dashboard state ❤️
    availableForWork: boolean;
    jobsOpenTo: string[];
    availableFrom: string | null; // use Date type also
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
  };
};

const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
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
  const loaderData = useLoaderData<LoaderData>();
  const onBoarding = loaderData.profile ? true : false; // determine if user is onboarding or dashboard

  const availabilityFetcher = useFetcher<AvailabilityResponse>();
  const toggleFetcher = useFetcher();

  const data = onBoarding
    ? loaderData.profile
    : loaderData.freelancerAvailability
      ? {
          ...loaderData.freelancerAvailability,
          // Map `availableFrom` to `dateAvailableFrom` for consistency
          jobsOpenTo: loaderData.freelancerAvailability.jobsOpenTo || [],
          dateAvailableFrom: loaderData.freelancerAvailability.availableFrom,
        }
      : undefined;

  const formatDate = (date: Date | null) =>
    date ? format(date, "yyyy-MM-dd") : "";

  const formatTime = (time: string) => time.slice(0, 5); // Extract HH:mm from HH:mm:ss

  const [workAvailability, setWorkAvailability] = useState(() => ({
    isLookingForWork: data?.availableForWork || false,
    jobTypes: data?.jobsOpenTo || [],
    availableFrom: data?.dateAvailableFrom || "", // Safely access `dateAvailableFrom`
    availableHoursStart: data?.hoursAvailableFrom
      ? formatTime(data.hoursAvailableFrom) // Format as HH:mm
      : "",
    availableHoursEnd: data?.hoursAvailableTo
      ? formatTime(data.hoursAvailableTo) // Format as HH:mm
      : "",
  }));

  const [isInitialized, setIsInitialized] = useState(false); // this is the one that solved my JobsOpenTo array ❤️❤️❤️

  useEffect(() => {
    if (!isInitialized) {
      setWorkAvailability({
        isLookingForWork: data?.availableForWork ?? false,
        jobTypes: data?.jobsOpenTo ?? [],
        availableFrom: data?.dateAvailableFrom ?? "",
        availableHoursStart: data?.hoursAvailableFrom ?? "",
        availableHoursEnd: data?.hoursAvailableTo ?? "",
      });
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [showAvailabilityMessage, setShowAvailabilityMessage] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>( // <-- Add this
    data?.dateAvailableFrom ? new Date(data.dateAvailableFrom) : null
  );

  const handleDateSelect = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd"); // Format as yyyy-MM-dd
    setSelectedDate(date);
    setWorkAvailability((prevState) => ({
      ...prevState,
      availableFrom: formattedDate, // Always a string // Update state
    }));
    setIsCalendarOpen(false); // close Calendar
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    const startTime = new Date(
      `1970-01-01T${workAvailability.availableHoursStart}:00Z`
    );
    const endTime = new Date(
      `1970-01-01T${workAvailability.availableHoursEnd}:00Z`
    );

    if (endTime <= startTime) {
      setTimeError("End time must be later than start time.");
      return;
    }

    setTimeError(null);

    availabilityFetcher.submit(
      {
        "target-updated": "freelancer-availability",
        available_for_work: workAvailability.isLookingForWork.toString(),
        available_from:
          workAvailability.availableFrom || formatDate(new Date()), // Default to today's date if empty
        hours_available_from: workAvailability.availableHoursStart,
        hours_available_to: workAvailability.availableHoursEnd,
        jobs_open_to: workAvailability.jobTypes,
      },
      { method: "post", action: onBoarding ? "/onboarding" : "/dashboard" }
    );
  };

  useEffect(() => {
    if (availabilityFetcher.data) {
      setShowAvailabilityMessage(true);
    }
  }, [availabilityFetcher.data]);

  return (
    <div
      className="bg-white w-full p-6 overflow-y-auto"
      style={{ maxHeight: "90vh" }}
    >
      <h2 className="text-2xl">Set your work availability</h2>

      <availabilityFetcher.Form
        method="post"
        action={onBoarding ? "/onboarding" : "/dashboard"} // Use action based on the state
      >
        <input
          type="hidden"
          name="target-updated"
          value="freelancer-availability"
        />

        {showAvailabilityMessage && availabilityFetcher.data?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mt-2">
            Availability saved successfully!
          </div>
        )}

        {showAvailabilityMessage && availabilityFetcher.data?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mt-2">
            {availabilityFetcher.data.error.message}
          </div>
        )}

        {/* Toggle */}
        <div className="flex text-sm items-center mt-5 mb-7 ml-1">
          <ToggleSwitch
            isChecked={workAvailability.isLookingForWork}
            onChange={(state) => {
              toggleFetcher.submit(
                {
                  "target-updated": "freelancer-is-available-for-work",
                  available_for_work: state.toString(),
                },
                {
                  method: "post",
                  action: onBoarding ? "/onboarding" : "/dashboard", // Use action based on the state
                }
              );

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

        {/* CheckBoxes */}
        <div className="mb-7">
          <p className="text-base mb-6">Job Types I am open to:</p>

          {/* Full Time Roles */}
          <div className="flex text-sm items-center ml-2 mb-4">
            <Checkbox
              id="full-time"
              name="jobs_open_to[]"
              value="full-time-roles"
              checked={workAvailability.jobTypes.includes("full-time-roles")}
              onCheckedChange={(checked) =>
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  jobTypes: checked
                    ? [...prevState.jobTypes, "full-time-roles"]
                    : prevState.jobTypes.filter(
                        (type) => type !== "full-time-roles"
                      ),
                }))
              }
            />
            <label htmlFor="full-time" className="ml-2 text-gray-700">
              Full Time Roles
            </label>
          </div>

          {/* Part Time Roles */}
          <div className="flex text-sm items-center ml-2 mb-4">
            <Checkbox
              id="part-time"
              name="jobs_open_to[]"
              value="part-time-roles"
              checked={workAvailability.jobTypes.includes("part-time-roles")}
              onCheckedChange={(checked) =>
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  jobTypes: checked
                    ? [...prevState.jobTypes, "part-time-roles"]
                    : prevState.jobTypes.filter(
                        (type) => type !== "part-time-roles"
                      ),
                }))
              }
            />
            <label htmlFor="part-time" className="ml-2 text-gray-700">
              Part Time Roles
            </label>
          </div>

          {/* Employee Roles */}
          <div className="flex text-sm items-center ml-2 mb-4">
            <Checkbox
              id="employee"
              name="jobs_open_to[]"
              value="employee-roles"
              checked={workAvailability.jobTypes.includes("employee-roles")}
              onCheckedChange={(checked) =>
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  jobTypes: checked
                    ? [...prevState.jobTypes, "employee-roles"]
                    : prevState.jobTypes.filter(
                        (type) => type !== "employee-roles"
                      ),
                }))
              }
            />
            <label htmlFor="employee" className="ml-2 text-gray-700">
              Employee Roles
            </label>
          </div>
        </div>

        {/* AvailableFrom Date */}
        <div className="relative my-6">
          <label
            htmlFor="availableFrom"
            className="block text-base font-medium mb-4"
          >
            I am available to work from:
          </label>

          {/* Input Field */}
          <div
            className="relative cursor-pointer"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsCalendarOpen(!isCalendarOpen);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <input
              type="text"
              id="availableFrom"
              name="available_from"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryColor"
              defaultValue={workAvailability.availableFrom} // Keep defaultValue
              readOnly // Prevent manual typing
            />
          </div>

          {/* Calendar Dropdown */}
          {isCalendarOpen && (
            <div className="absolute bg-white shadow-lg mt-1 z-50">
              <Calendar
                selectedDate={
                  workAvailability.availableFrom
                    ? new Date(workAvailability.availableFrom)
                    : null
                }
                onDateSelect={(date) => {
                  const formattedDate = format(date, "yyyy-MM-dd");
                  // Update the state with the new selected date
                  setWorkAvailability((prevState) => ({
                    ...prevState,
                    availableFrom: formattedDate,
                  }));

                  // Dynamically update the input value
                  const inputElement = document.getElementById(
                    "availableFrom"
                  ) as HTMLInputElement;
                  if (inputElement) {
                    inputElement.value = formattedDate;
                  }

                  // Close the calendar after selection
                  setIsCalendarOpen(false);
                }}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Hours Section */}
        <div className="mb-4">
          <label htmlFor="availableHours" className="block mb-4">
            Hours I am available to work:
          </label>
          <div className="flex gap-4 items-center">
            {/* Start Time */}
            <AppFormField
              type="select"
              id="availableHoursStart"
              name="hours_available_from"
              label="Start Time"
              defaultValue={workAvailability.availableHoursStart} // Reflect the default state
              options={timeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(value) =>
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  availableHoursStart: value,
                }))
              }
            />

            <span>to</span>

            {/* End Time */}
            <AppFormField
              type="select"
              id="availableHoursEnd"
              name="hours_available_to"
              label="End Time"
              defaultValue={workAvailability.availableHoursEnd} // Reflect the default state
              options={timeOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(value) =>
                setWorkAvailability((prevState) => ({
                  ...prevState,
                  availableHoursEnd: value,
                }))
              }
            />
          </div>
          {timeError && (
            <p className="text-red-500 text-sm mt-2">{timeError}</p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            disabled={availabilityFetcher.state === "submitting"}
            className="text-white py-4 px-6 rounded-xl bg-primaryColor font-medium not-active-gradient hover:not-active-gradient mt-2"
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
