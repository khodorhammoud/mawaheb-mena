import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useState } from "react";
import { getCurrentUserAccountType } from "~/servers/user.server";
import { AccountType } from "~/types/enums";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import RecommendedJobs from "./recommendedJobs";
import AllJobs from "./allJobs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
} from "~/components/ui/sheet";
import { Job } from "~/types/Job";
import SingleJobView from "./singleJobView";
import { getJobSkills } from "~/servers/skill.server";
import { Skill } from "~/types/Skill";
import { useFetcher } from "@remix-run/react";
import AppFormField from "~/common/form-fields";
import { BsSearch } from "react-icons/bs";

// ✅ Define a type for the Loader's return data
export type LoaderData = {
  jobSkills: Skill[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return redirect("/login-employer");
  }

  const accountType: AccountType = await getCurrentUserAccountType(request);
  if (accountType !== AccountType.Freelancer) {
    return redirect("/dashboard");
  }

  // ✅ FIXED: Get jobId from query params
  const url = new URL(request.url);
  const jobId = parseInt(url.searchParams.get("jobId") || "0", 10);
  // console.log("🔎 Extracted Job ID:", jobId);

  const jobSkills = jobId > 0 ? await getJobSkills(jobId) : [];
  // console.log("📌 Returning Job Skills:", jobSkills);

  return Response.json({ jobSkills });
}

// Layout component
export default function Layout() {
  // const { employer } = useLoaderData<typeof loader>();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // Add this for controlling Sheet state

  const fetcher = useFetcher<LoaderData>();

  const handleJobSelect = async (jobData: Job) => {
    setIsLoading(true);
    setSelectedJob(jobData);
    setOpen(true);

    // ✅ Fetch job skills dynamically when selecting a job
    fetcher.load(`/browse-jobs?jobId=${jobData.id}`);

    setIsLoading(false);
  };

  return (
    <div>
      {/* THE SHEET */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="bg-white xl:w-[800px] lg:w-[800px] md:w-3/4 w-full px-2 max-h-screen overflow-y-auto"
        >
          <SheetHeader>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <SheetDescription>
                {selectedJob ? (
                  <SingleJobView
                    job={selectedJob}
                    jobSkills={fetcher.data?.jobSkills || []}
                  />
                ) : (
                  "No job selected"
                )}
              </SheetDescription>
            )}
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* TABS */}
      <Tabs defaultValue="account" className="">
        <TabsList className="mt-4 mb-6">
          <TabsTrigger value="account">Design Jobs</TabsTrigger>
          <TabsTrigger value="password">All Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="">
          <RecommendedJobs onJobSelect={handleJobSelect} />
        </TabsContent>
        <TabsContent value="password">
          <AllJobs onJobSelect={handleJobSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
