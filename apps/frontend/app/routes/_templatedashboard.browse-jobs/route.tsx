import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useState } from "react";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
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
  SheetTitle,
} from "~/components/ui/sheet";
import { Job } from "~/types/Job";
import SingleJobView from "./singleJobView";
import { getJobSkills } from "~/servers/skill.server";
import { Skill } from "~/types/Skill";

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

  const handleJobSelect = async (jobData: Job) => {
    setIsLoading(true);
    setSelectedJob(jobData);
    setOpen(true); // Open the sheet when a job is selected

    // Here you can add additional data fetching if needed
    setIsLoading(false);
  };

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="bg-white w-[600px]">
          <SheetHeader>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <SheetTitle>{selectedJob?.title || "Job Details"}</SheetTitle>
                <SheetDescription>
                  {/* Replace with actual job details */}
                  {selectedJob ? (
                    <SingleJobView job={selectedJob} />
                  ) : (
                    "No job selected"
                  )}
                </SheetDescription>
              </>
            )}
          </SheetHeader>
        </SheetContent>
      </Sheet>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="password">All Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <RecommendedJobs onJobSelect={handleJobSelect} />
        </TabsContent>
        <TabsContent value="password">
          <AllJobs onJobSelect={handleJobSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
