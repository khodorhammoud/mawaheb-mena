import { useState } from 'react';
import { Form } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import AppFormField from '~/common/form-fields';
import { Badge } from '~/components/ui/badge';
import RequiredSkills from '~/routes/_templatedashboard.new-job/required-skills';
import { JobCategory } from '@mawaheb/db/types';
import { Skill } from '@mawaheb/db/types';
import RichTextEditor from '~/components/ui/richTextEditor';
import { getWordCount } from '~/lib/utils';
import { ExperienceLevel } from '@mawaheb/db/enums';
import { toast } from '~/components/hooks/use-toast';

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
    expectedHourlyRate?: number; // ADDED
    experienceLevel: ExperienceLevel;
    jobCategoryId: number | null;
  };
  jobCategories: JobCategory[];
  onSubmit?: (formData: any) => void;
  isEdit?: boolean;
}

const experienceLevelLabels: Record<string, string> = {
  entry_level: 'Entry Level',
  mid_level: 'Mid Level',
  senior_level: 'Expert Level',
};

export default function JobForm({ job, jobCategories, isEdit = false }: JobFormProps) {
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>(
    Array.isArray(job?.requiredSkills)
      ? job.requiredSkills.map((skill: any) => ({
          id: skill.id || 0,
          name: skill.name || '',
          isStarred: skill.isStarred || false,
        }))
      : []
  );

  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    job?.jobCategoryId || null
  );
  const [selectedExperience, setSelectedExperience] = useState(job?.experienceLevel || '');
  const [jobDescription, setJobDescription] = useState(job?.description || '');

  const handleDescriptionChange = (content: string) => setJobDescription(content);

  const [touched, setTouched] = useState(false);

  // Submission validations
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    const title = form.jobTitle.value?.trim();
    const description = jobDescription?.trim();
    const wordCount = description.split(/\s+/).filter(word => word).length;

    if (!title || title.length < 10) {
      toast({
        title: 'Validation Error',
        description: 'Job title must be minimum 10 characters',
        variant: 'destructive',
      });
      return;
    }

    if (title.length > 100) {
      toast({
        title: 'Title too long',
        description: 'Job title must be less than 100 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (wordCount < 20) {
      toast({
        title: 'Validation Error',
        description: 'Job description shall be minimum of 20 words',
        variant: 'destructive',
      });
      return;
    }

    // Ensure other fields are filled in
    const requiredFields = [
      'jobTitle',
      'workingHours',
      'location',
      'projectType',
      'budget',
      'expectedHourlyRate',
    ];

    for (const fieldName of requiredFields) {
      const value = form[fieldName]?.value?.trim();
      if (!value) {
        toast({
          title: 'Missing Field',
          description: `Please fill in all required fields.`,
          variant: 'destructive',
        });
        return;
      }
    }

    if (!selectedCategory) {
      toast({
        title: 'Missing Category',
        description: 'Please select a job category.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedExperience) {
      toast({
        title: 'Missing Experience Level',
        description: 'Please select an experience level.',
        variant: 'destructive',
      });
      return;
    }

    if (requiredSkills.length === 0) {
      toast({
        title: 'Missing Skills',
        description: 'Please select at least one required skill.',
        variant: 'destructive',
      });
      return;
    }

    const hours = Number(form.workingHours.value);
    const budget = Number(form.budget.value);
    const rate = Number(form.expectedHourlyRate.value);

    if (hours <= 0 || budget <= 0 || rate <= 0) {
      toast({
        title: 'Invalid Values',
        description: 'Working hours, budget, and expected rate must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setTouched(true); // ✅ triggers visual validation

    // If all good, submit the form
    form.submit();
  }

  return (
    <div className="font-['Switzer-Regular'] w-full">
      <div className="p-6 bg-white">
        <div className="">
          <h1 className="md:text-2xl text-xl font-semibold mb-8 self-center">
            {isEdit ? 'Edit Job Posting' : 'Job Posting Form'}
          </h1>

          <Form
            method="post"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 md:grid grid-cols-1 md:grid-cols-2 xl:gap-x-12 w-full"
          >
            {/* Hidden Inputs */}
            {job?.id && <input type="hidden" name="jobId" value={job.id} />}
            <input type="hidden" name="experienceLevel" value={selectedExperience} />
            <input type="hidden" name="jobCategory" value={selectedCategory} />
            <input type="hidden" name="jobSkills" value={JSON.stringify(requiredSkills)} />

            {/* Job Title */}
            <AppFormField
              type="text"
              id="jobTitle"
              name="jobTitle"
              label="Job Title"
              defaultValue={job?.title || ''}
              className="w-full"
              required
            />

            {/* Working Hours */}
            <AppFormField
              type="number"
              id="workingHours"
              name="workingHours"
              label="Working Hours per week"
              defaultValue={String(job?.workingHoursPerWeek || '')}
              className="col-span-1 w-full"
              required
            />

            {/* Job Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <input type="hidden" name="jobDescription" value={jobDescription} />
              {/* the hidden input is needed for the description as a richTextEditor to be saved :) */}
              <RichTextEditor
                value={jobDescription}
                onChange={handleDescriptionChange}
                placeholder="Enter the job description"
                className="border-gray-300 rounded-md resize-none mt-6 mb-1 text-left break-words whitespace-normal overflow-hidden"
                style={{ wordBreak: 'break-word', hyphens: 'auto' }}
              />
              <div className="ml-6 text-xs text-gray-500">
                {getWordCount(jobDescription)} / 2000 characters
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Location */}
              <AppFormField
                type="text"
                id="location"
                name="location"
                label="Location Preferences"
                defaultValue={job?.locationPreference || ''}
                className="col-span-1 w-full"
                required
              />

              {/* Skills */}
              <div
                className={`p-2 rounded-xl ${touched && requiredSkills.length === 0 ? 'border border-red-500' : ''}`}
              >
                <RequiredSkills selectedSkills={requiredSkills} onChange={setRequiredSkills} />
              </div>
              {touched && requiredSkills.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Please select at least one required skill.
                </p>
              )}

              {/* Project Type */}
              <AppFormField
                type="select"
                id="projectType"
                name="projectType"
                label="Project Type"
                options={[
                  { value: 'per-project-basis', label: 'Per Project Basis' },
                  { value: 'long-term', label: 'Long Term' },
                  { value: 'short-term', label: 'Short Term' },
                ]}
                defaultValue={job?.projectType || ''}
                className="col-span-1 w-full"
                required
              />

              {/* Budget */}
              <AppFormField
                type="number"
                id="budget"
                name="budget"
                label="Budget"
                defaultValue={String(job?.budget || '')}
                className="col-span-1 w-full"
                required
              />

              {/* === NEW FIELD: Expected Hourly Rate === */}
              <AppFormField
                type="number"
                id="expectedHourlyRate"
                name="expectedHourlyRate"
                label="Expected Hourly Rate"
                placeholder="Enter expected hourly rate"
                min={0}
                defaultValue={job?.expectedHourlyRate ?? ''}
                className="col-span-1 w-full"
                required
              />
              {/* ====================================== */}
            </div>

            {/* Job Category */}
            <div className="col-span-2 mt-6">
              <label htmlFor="jobCategory" className="block md:text-2xl text-xl font-semibold mb-4">
                Job Category
              </label>
              <div
                className={`flex flex-wrap gap-3 p-2 rounded-xl ${
                  touched && !selectedCategory ? 'border border-red-500' : ''
                }`}
                id="jobCategory"
                role="radiogroup"
                aria-label="Job Category"
              >
                {jobCategories.map(category => (
                  <Badge
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`cursor-pointer px-4 py-2 rounded-full border bg-white hover:bg-blue-100 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-600 border-blue-600'
                        : 'text-gray-600 border-gray-300'
                    }`}
                  >
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>
            {touched && !selectedCategory && (
              <p className="text-red-500 text-sm mt-1">Please select a job category.</p>
            )}

            {/* Experience Level */}
            <div className="col-span-2 mt-6">
              <h3 className="block md:text-2xl text-xl font-semibold mb-4">Experience Level</h3>
              <div
                className={`flex flex-wrap gap-2 p-2 rounded-xl ${
                  touched && !selectedExperience ? 'border border-red-500' : ''
                }`}
              >
                {Object.values(ExperienceLevel).map(level => (
                  <Badge
                    key={level}
                    onClick={() => setSelectedExperience(level)}
                    className={`cursor-pointer px-4 py-2 rounded-full border hover:bg-blue-100 ${
                      selectedExperience === level
                        ? 'bg-blue-100 text-blue-600 border-blue-600'
                        : 'text-gray-600 border-gray-300'
                    }`}
                  >
                    {experienceLevelLabels[level] || level}
                  </Badge>
                ))}
              </div>
            </div>
            {touched && !selectedExperience && (
              <p className="text-red-500 text-sm mt-1">Please select an experience level.</p>
            )}

            <div className="flex justify-end space-x-4 mt-8 col-span-2">
              <Button
                type="submit"
                name="target"
                value="save-draft"
                className="text-primaryColor border-gray-300 rounded-xl hover:text-white hover:bg-primaryColor bg-white not-active-gradient"
              >
                {isEdit ? 'Cancel' : 'Save as Draft'}
              </Button>
              <Button
                type="submit"
                className="bg-primaryColor text-white rounded-xl hover:text-white hover:bg-primaryColor not-active-gradient"
              >
                {isEdit ? 'Update Job' : 'Post Job'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
