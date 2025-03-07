interface JobDetailsProps {
  job: {
    title: string;
    description: string;
    budget: number;
    workingHoursPerWeek: number;
    locationPreference: string;
    projectType: string;
    experienceLevel: string;
    createdAt: string;
    category?: {
      label: string;
    };
    skills: Array<{
      id: number;
      label: string;
      isStarred: boolean;
    }>;
  };
}

export function JobDetails({ job }: JobDetailsProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Job Details
        </h3>
      </div>
      <div className="px-6 py-5 space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Description</h4>
          <div
            className="mt-1 text-sm text-gray-900 prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: job.description || "-",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Category</h4>
            <p className="mt-1 text-sm text-gray-900">
              {job.category?.label || "-"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Skills</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      skill.isStarred
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {skill.label}
                    {skill.isStarred && (
                      <span className="ml-1 text-yellow-500">★</span>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Budget</h4>
            <p className="mt-1 text-sm text-gray-900">
              {job.budget ? `$${job.budget}` : "-"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Working Hours</h4>
            <p className="mt-1 text-sm text-gray-900">
              {job.workingHoursPerWeek
                ? `${job.workingHoursPerWeek} hours per week`
                : "-"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Experience Level
            </h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {job.experienceLevel ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.experienceLevel}
                </span>
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Project Type</h4>
            <p className="mt-1 text-sm text-gray-900">
              {job.projectType || "-"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Location Preference
            </h4>
            <p className="mt-1 text-sm text-gray-900">
              {job.locationPreference || "-"}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Posted Date</h4>
            <p className="mt-1 text-sm text-gray-900">
              {job.createdAt
                ? new Date(job.createdAt).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
