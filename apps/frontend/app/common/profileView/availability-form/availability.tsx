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
    availableForWork: boolean;
    jobsOpenTo: string[];
    availableFrom: string;
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
  };
  freelancerAvailability?: {
    availableForWork: boolean;
    jobsOpenTo: string[];
    availableFrom: string;
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
  };
};

// const [workAvailability, setWorkAvailability] = useState({
//   isLookingForWork: profile.availableForWork || false,
//   jobTypes: profile.jobsOpenTo || [],
//   availableFrom: profile.dateAvailableFrom || "",
//   availableHoursStart: profile.hoursAvailableFrom || "09:00",
//   availableHoursEnd: profile.hoursAvailableTo || "17:00",
// });

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
  const onBoarding = loaderData.profile ? true : false; // Determine if the state is onboarding or dashboard

  const availabilityFetcher = useFetcher<AvailabilityResponse>();
  const toggleFetcher = useFetcher();

  const data = onBoarding
    ? loaderData.profile
    : loaderData.freelancerAvailability;

  const [workAvailability, setWorkAvailability] = useState({
    isLookingForWork: data?.availableForWork || false,
    jobTypes: data?.jobsOpenTo || [],
    availableFrom: data?.availableFrom || "", // Use only availableFrom
    availableHoursStart: data?.hoursAvailableFrom || "09:00",
    availableHoursEnd: data?.hoursAvailableTo || "17:00",
  });

  const [timeError, setTimeError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    data?.availableFrom ? new Date(data.availableFrom) : null
  );

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAvailabilityMessage, setShowAvailabilityMessage] = useState(false);

  const formatDate = (date: Date | null) =>
    date ? format(date, "yyyy-MM-dd") : "";

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setWorkAvailability((prevState) => ({
      ...prevState,
      availableFrom: formatDate(date),
    }));
    setIsCalendarOpen(false);
  };

  /* const handleSave = (event: React.FormEvent) => {
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
        available_from: workAvailability.availableFrom,
        hours_available_from: workAvailability.availableHoursStart,
        hours_available_to: workAvailability.availableHoursEnd,
        jobs_open_to: workAvailability.jobTypes,
      },
      { method: "post", action: onBoarding ? "/onboarding" : "/dashboard" }
    );
  }; */

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

        {/* y */}
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
            <div className="absolute bg-white shadow-lg mt-1 z-50">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Hours Section */}
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
              onChange={(value) =>
                setWorkAvailability((prev) => ({
                  ...prev,
                  availableHoursStart: value,
                }))
              }
            />
            <span>to</span>
            <AppFormField
              type="select"
              id="availableHoursEnd"
              name="hours_available_to"
              label="End Time"
              defaultValue={workAvailability.availableHoursEnd}
              options={timeOptions}
              onChange={(value) =>
                setWorkAvailability((prev) => ({
                  ...prev,
                  availableHoursEnd: value,
                }))
              }
            />
          </div>
          {timeError && (
            <p className="text-red-500 text-sm mt-2">{timeError}</p>
          )}
        </div>

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
