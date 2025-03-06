import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { JobApplicationStatus } from "~/types/enums";
import { ApplicationsTable } from "~/common/admin-pages/tables/ApplicationsTable";
import { getApplications } from "~/servers/admin.server";

interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: Date;
  };
  job: {
    id: number;
    title: string;
    employerId: number;
  };
  freelancer: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  employer: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

type LoaderData = {
  applications: Application[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const params = {
    status: url.searchParams.get("status") || undefined,
    employerId: url.searchParams.get("employer") || undefined,
    freelancerId: url.searchParams.get("freelancer") || undefined,
  };

  const applications = await getApplications(params);

  // Transform the data to match the Application interface
  const transformedApplications = applications.map((app) => ({
    application: {
      id: app.application.id,
      status: app.application.status as JobApplicationStatus,
      createdAt: app.application.createdAt,
    },
    job: {
      id: app.job.id,
      title: app.job.title,
      employerId: app.job.employerId,
    },
    freelancer: {
      id: app.application.freelancerId,
      user: app.freelancer.user
        ? {
            firstName: app.freelancer.user.firstName,
            lastName: app.freelancer.user.lastName,
            email: app.freelancer.user.email,
          }
        : undefined,
    },
    employer: {
      id: app.job.employerId,
      user: app.employer.user
        ? {
            firstName: app.employer.user.firstName,
            lastName: app.employer.user.lastName,
            email: app.employer.user.email,
          }
        : undefined,
    },
  }));

  return { applications: transformedApplications } as LoaderData;
}

export default function AdminApplications() {
  const { applications } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <div className="flex gap-4">
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set("status", e.target.value);
              } else {
                newParams.delete("status");
              }
              setSearchParams(newParams);
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-primaryColor focus:ring-primaryColor"
          >
            <option value="">All Statuses</option>
            {Object.values(JobApplicationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ApplicationsTable
          applications={applications}
          emptyMessage="No applications found. Try adjusting your filters."
        />
      </div>
    </div>
  );
}
