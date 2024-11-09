import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/common/header/card";
import { Input } from "~/components/ui/input";
import { Form, useActionData, useNavigation } from "@remix-run/react"; // Changed useTransition to useNavigation

// ActionData type for response handling
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
}

export default function JobPostingForm() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation(); // Use useNavigation instead of useTransition

  // Form fields state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  // Job categories and experience levels for selection
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

  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level"];

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleExperienceClick = (level: string) => {
    setSelectedExperience(level);
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen flex justify-center">
      <Card className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl font-bold">Job Posting Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                placeholder="Job Title"
                name="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <Input
                placeholder="Working Hours per week"
                name="workingHours"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
              />
              <Input
                placeholder="Location Preferences"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                placeholder="Required Skills"
                name="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <Input
                placeholder="Project Type"
                name="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              />
              <Input
                placeholder="Budget"
                name="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* Job Description */}
            <div className="mt-4">
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
              />
            </div>

            {/* Job Category */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Job Category</h3>
              <div className="flex flex-wrap gap-2">
                {jobCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryClick(category)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Experience Level</h3>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleExperienceClick(level)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedExperience === level
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button variant="outline" type="button">
                Save as Draft
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {navigation.state === "submitting" ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
