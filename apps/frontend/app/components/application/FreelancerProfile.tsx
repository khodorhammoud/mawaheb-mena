import { CompensationType } from '@mawaheb/db';

interface FreelancerProfileProps {
  freelancer: {
    yearsOfExperience: number;
    hourlyRate: number;
    compensationType: CompensationType;
    availableForWork: boolean;
    hoursAvailableFrom: string;
    hoursAvailableTo: string;
    about: string;
    fieldsOfExpertise: string[];
    jobsOpenTo: string[];
    preferredProjectTypes: string[];
    dateAvailableFrom: string | Date;
    skills: Array<{
      id: number;
      label: string;
      yearsOfExperience: number;
    }>;
  };
  jobSkills: Array<{
    id: number;
    label: string;
    isStarred: boolean;
  }>;
  matchScore?: number;
}

function safeParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

export function FreelancerProfile({ freelancer, jobSkills, matchScore }: FreelancerProfileProps) {
  // Parse JSON fields for freelancer
  const fieldsOfExpertise = Array.isArray(freelancer.fieldsOfExpertise)
    ? freelancer.fieldsOfExpertise
    : safeParseJSON<string[]>(freelancer.fieldsOfExpertise as unknown as string, []);

  const jobsOpenTo = Array.isArray(freelancer.jobsOpenTo)
    ? freelancer.jobsOpenTo
    : safeParseJSON<string[]>(freelancer.jobsOpenTo as unknown as string, []);

  const preferredProjectTypes = Array.isArray(freelancer.preferredProjectTypes)
    ? freelancer.preferredProjectTypes
    : safeParseJSON<string[]>(freelancer.preferredProjectTypes as unknown as string, []);

  // Format date properly
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Freelancer Profile</h3>
      </div>
      <div className="px-6 py-5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Years of Experience:</p>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.yearsOfExperience ? `${freelancer.yearsOfExperience} years` : '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Rate:</p>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.hourlyRate
                ? `$${freelancer.hourlyRate}/${freelancer.compensationType === CompensationType.HourlyRate ? 'hour' : 'fixed'}`
                : '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Availability:</p>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.availableForWork !== undefined ? (
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                    freelancer.availableForWork
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {freelancer.availableForWork ? 'Available' : 'Not Available'}
                </span>
              ) : (
                '-'
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Working Hours:</p>
            <p className="mt-1 text-sm text-gray-900">
              {freelancer.hoursAvailableFrom && freelancer.hoursAvailableTo
                ? `${freelancer.hoursAvailableFrom} - ${freelancer.hoursAvailableTo}`
                : '-'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">About</p>
          <div
            className="mt-1 text-sm text-gray-900 prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: freelancer.about || '-',
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fields of Expertise */}
          <div>
            <p className="text-sm text-gray-500">Fields of Expertise:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fieldsOfExpertise.length > 0 ? (
                fieldsOfExpertise.map((field: string) => (
                  <span
                    key={field}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {field}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>

          {/* Jobs Open To */}
          <div>
            <p className="text-sm text-gray-500">Jobs Open To:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {jobsOpenTo.length > 0 ? (
                jobsOpenTo.map((job: string) => (
                  <span
                    key={job}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {job}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Preferred Project Types */}
        <div>
          <p className="text-sm text-gray-500">Preferred Project Types:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {preferredProjectTypes.length > 0 ? (
              preferredProjectTypes.map((type: string) => (
                <span
                  key={type}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {type}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-900">-</span>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-500">Skills</h4>
          <div className="mt-2 mb-4">
            {(() => {
              const hasRequiredSkills = jobSkills && jobSkills.length > 0;
              if (!hasRequiredSkills) {
                return (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Skills Match:</div>
                    <div className="px-2 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                      100% fit
                    </div>
                    <span className="text-sm text-gray-500">(No skills required for this job)</span>
                  </div>
                );
              }

              const totalRequired = jobSkills.length;
              const matching = jobSkills.filter(jobSkill =>
                freelancer.skills.some(fs => fs.id === jobSkill.id)
              ).length;
              const matchRate = (matching / totalRequired) * 100;
              return (
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Skills Match:</div>
                  <div
                    className={`px-2 py-1 rounded-md text-sm font-medium ${
                      matchRate >= 80
                        ? 'bg-green-100 text-green-800'
                        : matchRate >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {matchRate.toFixed(1)}% fit
                  </div>
                  <span className="text-sm text-gray-500">
                    ({matching} of {totalRequired} required skills)
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="mt-2">
            <div className="text-sm text-gray-500 mb-2">Matching with Job Requirements:</div>
            <div className="flex flex-wrap gap-2">
              {jobSkills &&
              jobSkills.length > 0 &&
              jobSkills.some(jobSkill => freelancer.skills.some(fs => fs.id === jobSkill.id)) ? (
                jobSkills
                  .filter(jobSkill => freelancer.skills.some(fs => fs.id === jobSkill.id))
                  .map(jobSkill => {
                    const matchingFreelancerSkill = freelancer.skills.find(
                      fs => fs.id === jobSkill.id
                    );
                    return (
                      <div
                        key={jobSkill.id}
                        className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300"
                      >
                        <span>{jobSkill.label}</span>
                        {jobSkill.isStarred && <span className="ml-1 text-yellow-500">★</span>}
                        {matchingFreelancerSkill && (
                          <span className="ml-1 text-green-600">
                            ({matchingFreelancerSkill.yearsOfExperience}y)
                          </span>
                        )}
                      </div>
                    );
                  })
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-2">Missing Required Skills:</div>
            <div className="flex flex-wrap gap-2">
              {jobSkills &&
              jobSkills.length > 0 &&
              jobSkills.some(jobSkill => !freelancer.skills.some(fs => fs.id === jobSkill.id)) ? (
                jobSkills
                  .filter(jobSkill => !freelancer.skills.some(fs => fs.id === jobSkill.id))
                  .map(jobSkill => (
                    <div
                      key={jobSkill.id}
                      className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300"
                    >
                      <span>{jobSkill.label}</span>
                      {jobSkill.isStarred && <span className="ml-1 text-yellow-500">★</span>}
                    </div>
                  ))
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>

            <div className="text-sm text-gray-500 mt-4 mb-2">Additional Skills:</div>
            <div className="flex flex-wrap gap-2">
              {freelancer.skills &&
              freelancer.skills.length > 0 &&
              freelancer.skills.some(fs => !jobSkills.some(js => js.id === fs.id)) ? (
                freelancer.skills
                  .filter(fs => !jobSkills.some(js => js.id === fs.id))
                  .map(skill => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill.label} ({skill.yearsOfExperience}y)
                    </span>
                  ))
              ) : (
                <span className="text-sm text-gray-900">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Overall Match Score */}
        {matchScore !== undefined && (
          <div className="mb-4 mt-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Overall Match Score</h4>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  matchScore >= 80
                    ? 'bg-green-100 text-green-800'
                    : matchScore >= 50
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                <span className="text-lg font-bold">{matchScore}%</span> Match
              </div>
              <span className="text-sm text-gray-500">
                (Based on skills, experience, and job requirements)
              </span>
            </div>
          </div>
        )}

        {/* Available Hours Section */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-500">Available Hours</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Available From:</p>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(freelancer.dateAvailableFrom)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hours Available From:</p>
              <p className="mt-1 text-sm text-gray-900">{freelancer.hoursAvailableFrom || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hours Available To:</p>
              <p className="mt-1 text-sm text-gray-900">{freelancer.hoursAvailableTo || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
