import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Form, useActionData, useNavigation } from "@remix-run/react";

// ActionData type for response handling
interface ActionData {
  success?: boolean;
  error?: {
    message: string;
  };
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
  const [workingHours, setWorkingHours] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [projectType, setProjectType] = useState(projectTypes[0].value);
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
          <Form method="post" action="/dashboard" className="space-y-6">
            <input type="hidden" name="target-updated" value="post-job" />
            <input type="hidden" name="category" value={selectedCategory} />
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
              <Input
                placeholder="Working Hours per week"
                name="workingHours"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                required
              />
              <Input
                placeholder="Location Preferences"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <Input
                placeholder="Required Skills (comma-separated)"
                name="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
              <div>
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
                required
              />
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
