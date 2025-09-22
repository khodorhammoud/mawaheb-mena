import { useRef, useState } from 'react';
import { Form, useNavigate } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import AppFormField from '~/common/form-fields';
import { Badge } from '~/components/ui/badge';
import RequiredSkills from '~/routes/_templatedashboard.new-job/required-skills';
import { JobCategory, Skill } from '@mawaheb/db/types';
import RichTextEditor from '~/components/ui/richTextEditor';
import { getWordCount } from '~/lib/utils';
import { ExperienceLevel } from '@mawaheb/db/enums';

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
    expectedHourlyRate?: number;
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

type Errs = Partial<
  Record<
    | 'jobTitle'
    | 'workingHours'
    | 'location'
    | 'projectType'
    | 'budget'
    | 'expectedHourlyRate'
    | 'jobDescription'
    | 'jobCategory'
    | 'experienceLevel'
    | 'requiredSkills',
    string
  >
>;

export default function JobForm({ job, jobCategories, isEdit = false }: JobFormProps) {
  const navigate = useNavigate();
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
  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<Errs>({});

  const formRef = useRef<HTMLFormElement>(null);
  const targetRef = useRef<HTMLInputElement>(null);

  const handleDescriptionChange = (content: string) => setJobDescription(content);

  const collectErrors = (form: HTMLFormElement): Errs => {
    const e: Errs = {};

    const title = (form as any).jobTitle?.value?.trim() as string;
    const plainDesc = jobDescription.replace(/<[^>]*>/g, ' ').trim();
    const words = plainDesc.split(/\s+/).filter(Boolean).length;

    if (!title) e.jobTitle = 'Job title is required.';
    else if (title.length < 10) e.jobTitle = 'Job title must be at least 10 characters minimum.';
    else if (title.length > 100) e.jobTitle = 'Job title must be less than 100 characters.';

    if (words < 20) e.jobDescription = 'Description must be at least 20 words.';

    const workingHours = (form as any).workingHours?.value?.trim();
    const location = (form as any).location?.value?.trim();
    const projectType = (form as any).projectType?.value?.trim();
    const budget = (form as any).budget?.value?.trim();
    const expectedHourlyRate = (form as any).expectedHourlyRate?.value?.trim();

    if (!workingHours) e.workingHours = 'Working hours are required.';
    else if (Number(workingHours) <= 0) e.workingHours = 'Working hours must be greater than 0.';

    if (!location) e.location = 'Location preference is required.';
    if (!projectType) e.projectType = 'Select a project type.';

    if (!budget) e.budget = 'Budget is required.';
    else if (Number(budget) <= 0) e.budget = 'Budget must be greater than 0.';

    if (!expectedHourlyRate) e.expectedHourlyRate = 'Expected hourly rate is required.';
    else if (Number(expectedHourlyRate) <= 0)
      e.expectedHourlyRate = 'Expected rate must be greater than 0.';

    if (!selectedCategory) e.jobCategory = 'Please select a job category.';
    if (!selectedExperience) e.experienceLevel = 'Please select an experience level.';
    if (requiredSkills.length === 0) e.requiredSkills = 'Please select at least one skill.';

    return e;
  };

  const validate = (form: HTMLFormElement): boolean => {
    const e = collectErrors(form);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onClickSaveDraft: React.MouseEventHandler<HTMLButtonElement> = e => {
    const form = formRef.current;
    if (!form) return;
    setTouched(true);
    if (!validate(form)) {
      e.preventDefault();
      return;
    }
    if (targetRef.current) targetRef.current.value = 'save-draft';
  };

  const onClickPostJob: React.MouseEventHandler<HTMLButtonElement> = e => {
    const form = formRef.current;
    if (!form) return;
    setTouched(true);
    if (!validate(form)) {
      e.preventDefault();
      return;
    }
    // IMPORTANT: action expects "save-job" even when editing
    if (targetRef.current) targetRef.current.value = 'save-job';
  };

  const onClickCancel: React.MouseEventHandler<HTMLButtonElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      navigate('/manage-jobs');
    } else {
      const form = formRef.current;
      if (!form) return;
      setTouched(true);
      if (!validate(form)) {
        return;
      }
      if (targetRef.current) targetRef.current.value = 'save-draft';
    }
  };

  return (
    <div className="font-['Switzer-Regular'] w-full">
      <div className="p-6 bg-white">
        <div className="">
          <h1 className="md:text-2xl text-xl font-semibold mb-8 self-center">
            {isEdit ? 'Edit Job Posting' : 'Job Posting Form'}
          </h1>

          <Form
            method="post"
            ref={formRef}
            className="flex flex-col gap-6 md:grid grid-cols-1 md:grid-cols-2 xl:gap-x-12 w-full"
          >
            {/* Hidden Inputs */}
            {job?.id && <input type="hidden" name="jobId" value={job.id} />}
            <input type="hidden" name="experienceLevel" value={String(selectedExperience)} />
            <input
              type="hidden"
              name="jobCategory"
              value={selectedCategory != null ? String(selectedCategory) : ''}
            />
            <input type="hidden" name="jobSkills" value={JSON.stringify(requiredSkills)} />
            <input type="hidden" name="target" ref={targetRef} />

            {/* LEFT COL (kept): Job Title */}
            <div>
              <AppFormField
                type="text"
                id="jobTitle"
                name="jobTitle"
                label="Job Title"
                defaultValue={job?.title || ''}
                className="w-full"
                aria-invalid={!!errors.jobTitle && touched}
                aria-describedby={errors.jobTitle ? 'jobTitle-err' : undefined}
                required
              />
              {touched && errors.jobTitle && (
                <p id="jobTitle-err" className="text-red-500 text-sm mt-1">
                  {errors.jobTitle}
                </p>
              )}
            </div>

            {/* RIGHT COL (kept): Working Hours */}
            <div>
              <AppFormField
                type="number"
                id="workingHours"
                name="workingHours"
                label="Working Hours per week"
                defaultValue={String(job?.workingHoursPerWeek || '')}
                className="col-span-1 w-full"
                aria-invalid={!!errors.workingHours && touched}
                aria-describedby={errors.workingHours ? 'workingHours-err' : undefined}
                required
              />
              {touched && errors.workingHours && (
                <p id="workingHours-err" className="text-red-500 text-sm mt-1">
                  {errors.workingHours}
                </p>
              )}
            </div>

            {/* LEFT COL (kept): Job Description */}
            <div className={`flex flex-col gap-2`}>
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              <input type="hidden" name="jobDescription" value={jobDescription} />
              <RichTextEditor
                value={jobDescription}
                onChange={handleDescriptionChange}
                placeholder="Enter the job description"
                className="border-gray-300 rounded-md resize-none text-left break-words whitespace-normal overflow-hidden"
                style={{ wordBreak: 'break-word', hyphens: 'auto' }}
              />
              <div className="ml-6 text-xs text-gray-500">
                {getWordCount(jobDescription)} / 2000 characters
              </div>
              {touched && errors.jobDescription && (
                <p id="jobDescription-err" className="text-red-500 text-sm">
                  {errors.jobDescription}
                </p>
              )}
            </div>

            {/* RIGHT COL (kept): stacked fields */}
            <div className="flex flex-col gap-6">
              {/* Location */}
              <div>
                <AppFormField
                  type="text"
                  id="location"
                  name="location"
                  label="Location Preferences"
                  defaultValue={job?.locationPreference || ''}
                  className="col-span-1 w-full"
                  aria-invalid={!!errors.location && touched}
                  aria-describedby={errors.location ? 'location-err' : undefined}
                  required
                />
                {touched && errors.location && (
                  <p id="location-err" className="text-red-500 text-sm mt-1">
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div>
                <RequiredSkills selectedSkills={requiredSkills} onChange={setRequiredSkills} />
              </div>
              {touched && errors.requiredSkills && (
                <p className="text-red-500 text-sm -mt-5">{errors.requiredSkills}</p>
              )}

              {/* Project Type */}
              <div>
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
                  aria-invalid={!!errors.projectType && touched}
                  aria-describedby={errors.projectType ? 'projectType-err' : undefined}
                  required
                />
              </div>
              {touched && errors.projectType && (
                <p id="projectType-err" className="text-red-500 text-sm -mt-5">
                  {errors.projectType}
                </p>
              )}

              {/* Budget */}
              <div>
                <AppFormField
                  type="number"
                  id="budget"
                  name="budget"
                  label="Budget"
                  currency="$"
                  defaultValue={String(job?.budget || '')}
                  className="col-span-1 w-full"
                  aria-invalid={!!errors.budget && touched}
                  aria-describedby={errors.budget ? 'budget-err' : undefined}
                  required
                />
              </div>
              {touched && errors.budget && (
                <p id="budget-err" className="text-red-500 text-sm -mt-5">
                  {errors.budget}
                </p>
              )}

              {/* Expected Hourly Rate */}
              <div>
                <AppFormField
                  type="number"
                  id="expectedHourlyRate"
                  name="expectedHourlyRate"
                  label="Expected Hourly Rate"
                  placeholder="Enter expected hourly rate"
                  min={0}
                  defaultValue={job?.expectedHourlyRate ?? ''}
                  className="col-span-1 w-full"
                  aria-invalid={!!errors.expectedHourlyRate && touched}
                  aria-describedby={
                    errors.expectedHourlyRate ? 'expectedHourlyRate-err' : undefined
                  }
                  required
                />
              </div>
              {touched && errors.expectedHourlyRate && (
                <p id="expectedHourlyRate-err" className="text-red-500 text-sm -mt-5">
                  {errors.expectedHourlyRate}
                </p>
              )}
            </div>

            {/* Job Category (kept) */}
            <div className="col-span-2 mt-6">
              <label htmlFor="jobCategory" className="block md:text-2xl text-xl font-semibold mb-4">
                Job Category
              </label>
              <div
                className={`flex flex-wrap gap-3 p-2 rounded-xl`}
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
            {touched && errors.jobCategory && (
              <p className="text-red-500 text-sm -mt-6">{'Please select a job category.'}</p>
            )}

            {/* Experience Level (kept) */}
            <div className="col-span-2 mt-6">
              <h3 className="block md:text-2xl text-xl font-semibold mb-4">Experience Level</h3>
              <div className={`flex flex-wrap gap-2 p-2 rounded-xl`}>
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
            {touched && errors.experienceLevel && (
              <p className="text-red-500 text-sm -mt-6">{'Please select an experience level.'}</p>
            )}

            {/* Buttons (kept) */}
            <div className="flex justify-end space-x-4 mt-8 col-span-2">
              <Button
                data-testid="cancel-edit"
                type={isEdit ? 'button' : 'submit'}
                onClick={isEdit ? onClickCancel : onClickSaveDraft}
                className="text-primaryColor border-gray-300 rounded-xl hover:text-white hover:bg-primaryColor bg-white not-active-gradient"
              >
                {isEdit ? 'Cancel' : 'Save as Draft'}
              </Button>
              <Button
                type="submit"
                onClick={onClickPostJob}
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
