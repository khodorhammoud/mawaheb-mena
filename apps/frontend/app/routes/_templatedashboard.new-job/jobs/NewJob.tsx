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

  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

  const handleExperienceClick = (level) => {
    setSelectedExperience(level);
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
            className="flex flex-col gap-6 md:grid grid-cols-1 md:grid-cols-2 md:gap-x-12 md:gap-y-6 w-full"
          >
            {" "}
            {/* Add w-full here */}
            <input type="hidden" name="target-updated" value="post-job" />
            <input
              type="hidden"
              name="experienceLevel"
              value={selectedExperience}
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
              <AppFormField
                type="text"
                id="requiredSkills"
                name="requiredSkills"
                label="Required Skills"
                className="col-span-1 w-full"
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
            <div className="col-span-2 mt-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Job Category
              </label>
              <JobCategoryField />
            </div>
            <div className="col-span-2 mt-6">
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
              <div className="text-red-600 mt-4 col-span-2">
                {actionData.error.message}
              </div>
            )}
            {actionData?.success && (
              <div className="text-green-600 mt-4 col-span-2">
                Job posted successfully!
              </div>
            )}
            <div className="flex justify-end space-x-4 mt-8 col-span-2">
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
