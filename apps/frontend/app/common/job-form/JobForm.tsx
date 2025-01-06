import { useState } from "react";
import { Form } from "@remix-run/react";
import AppFormField from "~/common/form-fields";
import { Badge } from "~/components/ui/badge";
import RequiredSkills from "~/routes/_templatedashboard.new-job/required-skills";
import { JobCategory } from "~/types/User";
import { Skill } from "~/types/Skill";
import SubmitButton from "../save-button/saveButton";

interface JobFormProps {
  job?: {
    id: string;
    title: string;
    description: string;
    locationPreference: string;
    workingHoursPerWeek: number;
    requiredSkills: Skill[];
    projectType: string;
    budget: number;
    experienceLevel: string;
    jobCategoryId: number | null;
  };
  jobCategories: JobCategory[];
  onSubmit?: (formData: any) => void;
  isEdit?: boolean;
}

export default function JobForm({
  job,
  jobCategories,
  isEdit = false,
}: JobFormProps) {
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>(
    Array.isArray(job?.requiredSkills)
      ? job.requiredSkills.map((skill: any) => ({
          name: skill.name || "",
          isStarred: skill.isStarred || false,
        }))
      : []
  );

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    job?.jobCategoryId || null
  );

  const [selectedExperience, setSelectedExperience] = useState(
    job?.experienceLevel || ""
  );

  // Handlers
  const handleSkillsChange = (skills: Skill[]) => setRequiredSkills(skills);
  const handleCategoryClick = (categoryId: number) =>
    setSelectedCategory(categoryId);
  const handleExperienceClick = (level: string) => setSelectedExperience(level);

  // timestamp to be used in a hidden input below 👍
  const [timestamp] = useState(Date.now());

  return (
    <div className="font-['Switzer-Regular'] mt-10 w-full">
      <div className="p-6 bg-white">
        <div className="mt-10">
          <h1 className="md:text-2xl text-xl font-semibold mb-8 self-center">
            {isEdit ? "Edit Job Posting" : "Job Posting Form"}
          </h1>

          <Form
            method="post"
            className="flex flex-col gap-6 md:grid grid-cols-1 md:grid-cols-2 xl:gap-x-12 w-full"
          >
            {/* Hidden Inputs */}
            {job?.id && <input type="hidden" name="jobId" value={job.id} />}
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

            {/* this is the hidden timestamp input */}
            <input type="hidden" name="timestamp" value={timestamp} />

            {/* Job Title */}
            <AppFormField
              type="text"
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              defaultValue={job?.title || ""}
              className="w-full"
            />

            {/* Working Hours */}
            <AppFormField
              type="number"
              id="workingHours"
              name="workingHours"
              label="Working Hours per week"
              defaultValue={String(job?.workingHoursPerWeek || "")}
              className="col-span-1 w-full"
            />

            {/* Job Description */}
            <AppFormField
              type="textarea"
              id="jobDescription"
              name="jobDescription"
              label="Job Description"
              defaultValue={job?.description || ""}
              className="w-full"
              col={10}
            />

            <div className="flex flex-col gap-6">
              {/* Location */}
              <AppFormField
                type="text"
                id="location"
                name="location"
                label="Location Preferences"
                defaultValue={job?.locationPreference || ""}
                className="col-span-1 w-full"
              />

              {/* Skills */}
              <RequiredSkills
                selectedSkills={requiredSkills}
                onChange={handleSkillsChange}
              />

              {/* Project Type */}
              <AppFormField
                type="select"
                id="projectType"
                name="projectType"
                label="Project Type"
                options={[
                  { value: "per-project-basis", label: "Per Project Basis" },
                  { value: "long-term", label: "Long Term" },
                  { value: "short-term", label: "Short Term" },
                ]}
                defaultValue={job?.projectType || ""}
                className="col-span-1 w-full"
              />

              {/* Budget */}
              <AppFormField
                type="number"
                id="budget"
                name="budget"
                label="Budget"
                defaultValue={String(job?.budget || "")}
                className="col-span-1 w-full"
              />
            </div>

            {/* Job Category */}
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

            {/* Experience Level */}
            <div className="col-span-2 mt-6">
              <h3 className="block md:text-2xl text-xl font-semibold mb-4">
                Experience Level
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Entry Level", "Mid Level", "Senior Level"].map((level) => (
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

            {/* Buttons   */}
            <div className="flex justify-end space-x-4 mt-8 col-span-2">
              <SubmitButton
                type="submit"
                name="target"
                value="save-draft"
                className="text-primaryColor border-gray-300 rounded-xl hover:text-white hover:bg-primaryColor sm:px-4 sm:py-2 px-3 py-1 not-active-gradient"
              >
                {isEdit ? "Cancel" : "Save as Draft"}
              </SubmitButton>

              <SubmitButton
                type="submit"
                name="target"
                value="post-job"
                className="bg-primaryColor text-white rounded-xl hover:text-white hover:bg-primaryColor sm:px-4 sm:py-2 px-3 py-1 not-active-gradient"
              >
                {isEdit ? "Update Job" : "Post Job"}
              </SubmitButton>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
