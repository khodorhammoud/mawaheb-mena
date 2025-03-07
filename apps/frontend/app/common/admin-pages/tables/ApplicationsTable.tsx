import { Link } from "@remix-run/react";
import { JobApplicationStatus } from "~/types/enums";
import { DataTable } from "./DataTable";

interface Application {
  application: {
    id: number;
    status: JobApplicationStatus;
    createdAt: string | Date;
    matchScore?: number;
  };
  freelancer?: {
    id: number;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  job?: {
    id: number;
    title: string;
  };
}

interface ApplicationsTableProps {
  applications: Application[];
  showJob?: boolean;
  showFreelancer?: boolean;
  showMatchScore?: boolean;
  emptyMessage?: string;
}

function getStatusColor(status: JobApplicationStatus) {
  switch (status) {
    case JobApplicationStatus.Pending:
      return "bg-yellow-100 text-yellow-800";
    case JobApplicationStatus.Shortlisted:
      return "bg-blue-100 text-blue-800";
    case JobApplicationStatus.Approved:
      return "bg-green-100 text-green-800";
    case JobApplicationStatus.Rejected:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getMatchScoreColor(score: number) {
  if (score >= 90) return "bg-green-100 text-green-800";
  if (score >= 80) return "bg-green-50 text-green-700";
  if (score >= 70) return "bg-blue-100 text-blue-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-800";
}

export function ApplicationsTable({
  applications,
  showJob = true,
  showFreelancer = true,
  showMatchScore = true,
  emptyMessage = "No applications found",
}: ApplicationsTableProps) {
  const columns = [
    ...(showJob
      ? [
          {
            header: "Job Title",
            accessor: (app: Application) => (
              <Link
                to={`/admin-dashboard/job/${app.job?.id}`}
                className="text-primaryColor hover:text-primaryColor/80"
              >
                {app.job?.title}
              </Link>
            ),
            className: "font-medium text-gray-900",
          },
        ]
      : []),
    ...(showFreelancer
      ? [
          {
            header: "Freelancer",
            accessor: (app: Application) => (
              <Link
                to={`/admin-dashboard/freelancer/${app.freelancer?.id}`}
                className="text-primaryColor hover:text-primaryColor/80"
              >
                {app.freelancer?.user?.firstName}{" "}
                {app.freelancer?.user?.lastName}
              </Link>
            ),
            className: "font-medium text-gray-900",
          },
        ]
      : []),
    {
      header: "Status",
      accessor: (app: Application) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
            app.application.status
          )}`}
        >
          {app.application.status}
        </span>
      ),
    },
    ...(showMatchScore
      ? [
          {
            header: "Match Score",
            accessor: (app: Application) =>
              app.application.matchScore ? (
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getMatchScoreColor(
                    app.application.matchScore
                  )}`}
                >
                  {app.application.matchScore}%
                </span>
              ) : (
                <span className="text-gray-400 text-xs">Not calculated</span>
              ),
          },
        ]
      : []),
    {
      header: "Applied Date",
      accessor: (app: Application) =>
        new Date(app.application.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      accessor: (app: Application) => (
        <Link
          to={`/admin-dashboard/application/${app.application.id}`}
          className="text-primaryColor hover:text-primaryColor/80"
        >
          Manage
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      keyExtractor={(app) => app.application.id}
      emptyMessage={emptyMessage}
    />
  );
}
