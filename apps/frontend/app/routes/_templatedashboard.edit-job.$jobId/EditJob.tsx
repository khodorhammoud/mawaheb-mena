import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
} from "@remix-run/react";
import AppFormField from "~/common/form-fields";
import { Badge } from "~/components/ui/badge";
import RequiredSkills from "../_templatedashboard.new-job/required-skills";
import { JobCategory } from "~/types/User";
import { ActionData } from "~/types/SuccessError";

// this is to call the content of the job from the database :D, and because of that, there is no LoaderData inside New Job file, where there is no content from the Loader of the route i am taking (database)
interface LoaderData {
  job: {
    id;
    title: string;
    description: string;
    locationPreference: string;
    workingHoursPerWeek: number;
    requiredSkills: { name: string }[]; // Add requiredSkills
    projectType: string;
    budget: number;
    experienceLevel: string;
    jobCategoryId: number | null;
  };
  jobCategories: JobCategory[];
}

export default function EditJob() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const [requiredSkills, setRequiredSkills] = useState([]); // Track selected skills

  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

  const { job, jobCategories } = useLoaderData<LoaderData>();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    job.jobCategoryId || null
  );

  const [selectedExperience, setSelectedExperience] = useState(
    job.experienceLevel || ""
  ); // this is for the value of the Experience level taken from the db

  const handleExperienceClick = (level) => {
    setSelectedExperience(level);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSkillsChange = (skills) => {
    setRequiredSkills(skills);
  };

  return (
    <div className="font-['Switzer-Regular'] mt-10 w-full">
      <div className="p-6 bg-white">
        <div className="mt-10">
          <h1 className="md:text-2xl text-xl font-semibold mb-8 self-center">
            Edit Job Posting
          </h1>

          <Form
            method="post"
            className="flex flex-col gap-6 md:grid grid-cols-1 md:grid-cols-2 xl:gap-x-12 w-full"
          >
            {/* Hidden Inputs */}
            <input type="hidden" name="jobId" value={job.id} />
            <input
              type="hidden"
              name="experienceLevel"
              value={selectedExperience}
            />
            <input type="hidden" name="jobCategory" value={selectedCategory} />
            <input
              type="hidden"
              name="requiredSkills"
              value={requiredSkills.map((skill) => skill.name).join(",")}
            />

            {/* JOB TITLE */}
            <AppFormField
              type="text"
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              defaultValue={job.title}
              className="w-full"
            />

            {/* WORKING HRS */}
            <AppFormField
              type="number"
              id="workingHours"
              name="workingHours"
              label="Working Hours per week"
              defaultValue={String(job.workingHoursPerWeek)} // Convert number to string
              className="col-span-1 w-full"
            />

            {/* JOB DESCRIPTION */}
            <AppFormField
              type="textarea"
              id="jobDescription"
              name="jobDescription"
              label="Job Description"
              defaultValue={job.description}
              className="w-full"
              col={10}
            />

            <div className="flex flex-col gap-6">
              {/* LOCATION */}
              <AppFormField
                type="text"
                id="location"
                name="location"
                label="Location Preferences"
                defaultValue={job.locationPreference}
                className="col-span-1 w-full"
              />

              {/* SKILLS */}
              <RequiredSkills
                selectedSkills={requiredSkills}
                onChange={handleSkillsChange}
              />

              {/* PROJECT TYPE */}
              <AppFormField
                type="select"
                id="projectType"
                name="projectType"
                label="Project Type"
                options={[
                  { value: "per-project-basis", label: "per-project-basis" },
                  { value: "long-term", label: "long-term" },
                  { value: "short-term", label: "short-term" },
                ]}
                defaultValue={job.projectType}
                className="col-span-1 w-full"
              />

              {/* BUDGET */}
              <AppFormField
                type="number"
                id="budget"
                name="budget"
                label="Budget"
                defaultValue={String(job.budget)}
                className="col-span-1 w-full"
              />
            </div>

            {/* JOB CATEGORY */}
            <div className="col-span-2 mt-6">
              <label
                htmlFor="jobCategory"
                className="block md:text-2xl text-xl font-semibold mb-4"
              >
                Job Category
              </label>
              <div
                className="flex flex-wrap gap-3"
                id="jobCategory"
                role="radiogroup"
                aria-label="Job Category"
              >
                {jobCategories.map((category) => (
                  <Badge
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`cursor-pointer px-4 py-2 rounded-full border hover:bg-blue-100 ${
                      selectedCategory === category.id
                        ? "bg-blue-100 text-blue-600 border-blue-600"
                        : "text-gray-600 border-gray-300"
                    }`}
                  >
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* EXPERIENCE LEVEL */}
            <div className="col-span-2 mt-6">
              <h3 className="block md:text-2xl text-xl font-semibold mb-4">
                Experience Level
              </h3>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((level) => (
                  <Badge
                    key={level}
                    onClick={() => handleExperienceClick(level)}
                    className={`cursor-pointer px-4 py-2 rounded-full border hover:bg-blue-100 ${
                      selectedExperience === level
                        ? "bg-blue-100 text-blue-600 border-blue-600"
                        : "text-gray-600 border-gray-300"
                    }`}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Success or Error Message */}
            {actionData?.error && (
              <div className="text-red-600 mt-4 col-span-2">
                {actionData.error.message}
              </div>
            )}
            {actionData?.success && (
              <div className="text-green-600 mt-4 col-span-2">
                Job updated successfully!
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex justify-end space-x-4 mt-8 col-span-2">
              {/* Save as Draft Button */}
              <Button
                type="submit"
                name="target"
                value="save-draft" // This value indicates the Save as Draft action
                className="text-primaryColor border-gray-300 not-active-gradient rounded-xl hover:text-white hover:bg-primaryColor"
              >
                Save as Draft
              </Button>

              {/* Update Job Button */}
              <Button
                type="submit"
                name="target"
                value="update-job" // This value indicates the Update Job action
                className="bg-primaryColor text-white not-active-gradient rounded-xl hover:text-white hover:bg-primaryColor"
              >
                {navigation.state === "submitting"
                  ? "Updating..."
                  : "Update Job"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
