import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  jobApplicationsTable,
  jobsTable,
  freelancersTable,
} from "~/db/drizzle/schemas/schema";

export async function loader({ request }: LoaderFunctionArgs) {
  const applications = await db
    .select()
    .from(jobApplicationsTable)
    .leftJoin(jobsTable, eq(jobApplicationsTable.jobId, jobsTable.id))
    .leftJoin(
      freelancersTable,
      eq(jobApplicationsTable.freelancerId, freelancersTable.id)
    );

  return { applications };
}

export default function AdminApplications() {
  const { applications } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Applications</h1>
      {/* Render applications table with filters */}
      <pre>{JSON.stringify(applications, null, 2)}</pre>
    </div>
  );
}
