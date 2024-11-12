import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import JobCategoryField from "../job-category";
import { Badge } from "~/components/ui/badge";
import RequiredSkills from "../required-skills";
import AppFormField from "../../../common/form-fields";

interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function NewJob() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([]); // Track selected skills

  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];
  const jobCategories = [
    "Design",
    "Programming",
    "Writing",
    "Marketing",
    "Law",
    "Communications",
    "Health Care",
    "Other",
  ];

  const handleExperienceClick = (level) => {
    setSelectedExperience(level);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleSkillsChange = (skills) => {
    setRequiredSkills(skills); // Update selected skills
  };

  return (
    <div className="font-['Switzer-Regular'] mt-10 w-full">
      <div className="p-6 bg-white">
        <div className="mt-10">
          <h1 className="md:text-2xl text-xl font-semibold mb-8 self-center">
            Job Posting Form
          </h1>

          <Form
            method="post"
            className="flex flex-col gap-6 md:grid grid-cols-1 md:grid-cols-2 xl:gap-x-12 w-full"
          >
            <input type="hidden" name="target-updated" value="post-job" />
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

            <AppFormField
              type="text"
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              className="w-full"
            />
            <AppFormField
              type="number"
              id="workingHours"
              name="workingHours"
              label="Working Hours per week"
              className="col-span-1 w-full"
            />
            <AppFormField
              type="textarea"
              id="jobDescription"
              name="jobDescription"
              label="Job Description"
              className="w-full"
              col={10}
            />
            <div className="flex flex-col gap-6">
              <AppFormField
                type="text"
                id="location"
                name="location"
                label="Location Preferences"
                className="col-span-1 w-full"
              />
              <RequiredSkills
                selectedSkills={requiredSkills}
                onChange={handleSkillsChange}
              />
              <AppFormField
                type="select"
                id="projectType"
                name="projectType"
                label="Project Type"
                options={[
                  { value: "project1", label: "Project 1" },
                  { value: "project2", label: "Project 2" },
                ]}
                className="col-span-1 w-full"
              />
              <AppFormField
                type="number"
                id="budget"
                name="budget"
                label="Budget"
                className="col-span-1 w-full"
              />
            </div>

            {/* Job Category Section */}
            <div className="col-span-2 mt-6">
              <label className="block md:text-2xl text-xl font-semibold mb-4">
                Job Category
              </label>
              <div className="flex flex-wrap gap-3">
                {jobCategories.map((category) => (
                  <Badge
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`cursor-pointer px-4 py-2 rounded-full border hover:bg-blue-100 ${
                      selectedCategory === category
                        ? "bg-blue-100 text-blue-600 border-blue-600"
                        : "text-gray-600 border-gray-300"
                    }`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Experience Level Section */}
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
                Job posted successfully!
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-8 col-span-2">
              <Button
                variant="outline"
                type="button"
                className="text-primaryColor border-gray-300 not-active-gradient rounded-xl hover:text-white hover:bg-primaryColor"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                className="bg-primaryColor text-white not-active-gradient rounded-xl hover:text-white hover:bg-primaryColor"
              >
                {navigation.state === "submitting" ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
