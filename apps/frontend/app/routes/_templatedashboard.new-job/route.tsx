import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import JobCategoryField from "./job-category";
import { createJobPosting, getAllJobCategories } from "~/servers/job.server";
import { Badge } from "~/components/ui/badge";
import RequiredSkills from "./required-skills";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { getCurrentProfileInfo } from "~/servers/user.server";
import { Job } from "~/types/Job";
import { Employer } from "~/types/User";

export async function loader() {
  const jobCategories = await getAllJobCategories();
  return {
    jobCategories: jobCategories || [],
  };
}
// ActionData type for response handling
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData(); // always do this :)
    const target = formData.get("target-updated"); // for the switch, to not use this sentence 2 thousand times :)
    const employer = (await getCurrentProfileInfo(request)) as Employer;
    if (target == "post-job") {
      // TODO: Add validation for the form fields
      const jobData: Job = {
        employerId: employer.id,
        title: formData.get("jobTitle") as string,
        description: formData.get("jobDescription") as string,
        jobCategoryId: parseInt(formData.get("jobCategory") as string) || null,
        workingHoursPerWeek:
          parseInt(formData.get("workingHours") as string, 10) || 0,
        locationPreference: formData.get("location") as string,
        requiredSkills: (formData.get("jobSkills") as string)
          .split(",")
          .map((skill) => skill.trim()),
        projectType: formData.get("projectType") as string,
        budget: parseInt(formData.get("budget") as string, 10) || 0,
        experienceLevel: formData.get("experienceLevel") as string,

        isDraft: false, // Set to false as it's being posted directly
        isActive: true,
        isDeleted: false,
        isClosed: false,
        isPaused: false,
      };

      const jobStatus = await createJobPosting(jobData);

      if (jobStatus.success) {
        return redirect("/dashboard");
      } else {
        return json(
          {
            success: false,
            error: { message: "Failed to create job posting" },
          },
          { status: 500 }
        );
      }
    }
    // DEFAULT
    throw new Error("Unknown target update");
  } catch (error) {
    console.error("error while creating a job", error);
    return json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

// ProjectType enum values
const projectTypes = [
  { value: "short-term", label: "Short Term" },
  { value: "long-term", label: "Long Term" },
  { value: "per-project-basis", label: "Per Project Basis" },
];

export default function JobPostingForm() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  // Form fields state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [workingHours, setWorkingHours] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState(projectTypes[0].value);
  const [budget, setBudget] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

  const handleExperienceClick = (level: string) => {
    setSelectedExperience(level);
  };

  return (
    <div className="flex">
      {/* Main Content */}
      {/* <div className="flex-1 p-6">
          {accountOnboarded ? <DashboardScreen /> : <OnboardingScreen />}
        </div> */}
      <div className="flex-1 p-6 bg-white">
        <div className="min-h-screen flex flex-col mt-20">
          <h1 className="text-2xl font-semibold">Job Posting Form</h1>

          <Form method="post" className="space-y-6">
            <input type="hidden" name="target-updated" value="post-job" />
            <input
              type="hidden"
              name="experienceLevel"
              value={selectedExperience}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                placeholder="Job Title"
                name="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
              <div className="mt-4 row-start-2">
                <label
                  htmlFor="jobDescription"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Enter the job description"
                  rows={4}
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <Input
                className="column-start-2"
                placeholder="Working Hours per week"
                name="workingHours"
                value={workingHours}
                type="number"
                onChange={(e) => setWorkingHours(parseInt(e.target.value))}
                required
              />
              <Input
                placeholder="Location Preferences"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="column-start-2"
                required
              />
              <RequiredSkills />

              <div className="column-start-2">
                <label
                  htmlFor="projectType"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Project Type
                </label>
                <select
                  name="projectType"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {projectTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Budget"
                name="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
            </div>

            <div className="mt-6">
              <JobCategoryField />
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Experience Level</h3>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((level) => (
                  <Badge
                    key={level}
                    onClick={() => handleExperienceClick(level)}
                    className={`cursor-pointer px-4 py-2 ${
                      selectedExperience === level
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            {actionData?.error && (
              <div className="text-red-600 mt-4">
                {actionData.error.message}
              </div>
            )}

            {actionData?.success && (
              <div className="text-green-600 mt-4">
                Job posted successfully!
              </div>
            )}

            <div className="flex justify-end space-x-4 mt-8">
              <Button variant="outline" type="button">
                Save as Draft
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {navigation.state === "submitting" ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
