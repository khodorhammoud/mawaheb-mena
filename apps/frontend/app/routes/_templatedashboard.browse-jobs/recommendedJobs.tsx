import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Employer } from "~/types/User";

export default function RecommendedJobs() {
    const employer = useLoaderData<{ employer: Employer }>();

    useEffect(() => {
        console.log(employer);
    }, []);

    return <div>RecommendedJobs</div>;
}
