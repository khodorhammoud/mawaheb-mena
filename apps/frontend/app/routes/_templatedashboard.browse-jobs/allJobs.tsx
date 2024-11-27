import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getEmployerJobs } from "~/servers/job.server";
import { Job } from "~/types/Job";
import { Employer } from "~/types/User";
import JobCard from "./job";
import { useFetcher } from "@remix-run/react";

export default function AllJobs() {
    const { employer } = useLoaderData<{ employer: Employer }>();
    const [allJobs, setAllJobs] = useState<Job[]>([]);


    return (
        <div>
            {allJobs.map((job) => (
                <JobCard job={job} />
            ))}
        </div>
    );
}

