import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { JobApplicationStatus } from "~/types/enums";
import { ApplicationsTable } from "~/common/admin-pages/tables/ApplicationsTable";
import {
  getEmployerDetails,
  getEmployerApplications,
  type Application,
} from "~/routes/admin.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { employerId } = params;

  if (!employerId) {
    throw new Response("Employer ID is required", { status: 400 });
  }

  const employerData = await getEmployerDetails(employerId);
  if (!employerData) {
    throw new Response("Employer not found", { status: 404 });
  }

  const applications = await getEmployerApplications(employerId);

  return {
    employer: employerData.employer,
    applications,
  };
}

export default function AllJobApplications() {
  const { employer, applications } = useLoaderData<typeof loader>();

  // Group applications by job
  const groupedApplications = applications.reduce(
    (acc, application) => {
      const jobId = application.job.id;
      if (!acc[jobId]) {
        acc[jobId] = {
          jobTitle: application.job.title,
          applications: [],
        };
      }
      acc[jobId].applications.push(application);
      return acc;
    },
    {} as Record<number, { jobTitle: string; applications: Application[] }>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Applications for {employer.user.firstName} {employer.user.lastName}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            All Applications
          </h3>
        </div>

        {Object.keys(groupedApplications).length > 0 ? (
          Object.entries(groupedApplications).map(
            ([jobId, { jobTitle, applications: jobApplications }]) => (
              <div
                key={jobId}
                className="border-b border-gray-200 last:border-b-0"
              >
                <div className="px-6 py-4 bg-gray-50">
                  <h4 className="text-md font-medium text-gray-900">
                    {jobTitle}
                  </h4>
                </div>
                <div className="px-6 py-2">
                  <ApplicationsTable
                    applications={jobApplications}
                    showJob={false}
                  />
                </div>
              </div>
            )
          )
        ) : (
          <div className="px-6 py-5">
            <p className="text-sm text-gray-500">
              No applications received yet for any job.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
