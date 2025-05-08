import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useActionData, Link, useNavigate } from '@remix-run/react';
import { JobApplicationStatus } from '@mawaheb/db/enums';
import { ApplicationOverview } from '~/components/application/ApplicationOverview';
import { JobDetails } from '~/components/application/JobDetails';
import { FreelancerProfile } from '~/components/application/FreelancerProfile';
import { getApplicationMatchScore } from '~/servers/job.server';

// Helper function to safely parse JSON
function safeParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    return defaultValue;
  }
}

/** Subcomponent: Back button */
function BackButton() {
  const navigate = useNavigate();

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.back();
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleGoBack}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>
    </div>
  );
}

export async function loader({ params }: LoaderFunctionArgs) {
  const applicationId = params.applicationId;

  if (!applicationId) {
    throw new Response('Application ID is required', { status: 400 });
  }

  // Import server functions dynamically inside the loader
  const { getApplicationDetails } = await import('~/servers/application.server');

  // Get application details
  const applicationDetails = await getApplicationDetails(applicationId);

  // Get the job ID and freelancer ID from the application details
  const jobId = applicationDetails.application?.job?.id;
  const freelancerId = applicationDetails.application?.freelancer?.id;

  // Calculate match score for this application if we have both IDs
  let matchScore = 0;
  if (jobId && freelancerId) {
    try {
      matchScore = await getApplicationMatchScore(jobId, freelancerId);
    } catch (error) {
      // Silently fail and use default score
    }
  }

  // Return structured data for the components
  return {
    application: applicationDetails.application,
    matchScore,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const status = formData.get('status') as JobApplicationStatus;
  const applicationId = params.applicationId;

  if (!applicationId || !status) {
    return Response.json({ success: false, error: 'Missing required fields' });
  }

  // Import server functions dynamically inside the action
  const { updateApplicationStatus } = await import('~/servers/application.server');
  return Response.json(await updateApplicationStatus(applicationId, status));
}

export default function ApplicationDetails() {
  const { application, matchScore } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <BackButton />

      <ApplicationOverview
        application={{
          application: application.application,
          freelancerUser: application.freelancerUser,
          employerUser: application.employerUser,
          employer: application.employer,
          job: application.job,
        }}
        actionData={actionData}
      />

      <JobDetails job={application.job} />

      <FreelancerProfile
        freelancer={application.freelancer}
        jobSkills={application.job?.skills || []}
        matchScore={matchScore}
      />
    </div>
  );
}
