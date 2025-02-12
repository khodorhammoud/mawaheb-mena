import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useState } from "react";
import { getCurrentUserAccountType } from "~/servers/user.server";
import { AccountType } from "~/types/enums";
import { requireUserIsFreelancerPublished } from "~/auth/auth.server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import DesignJobs from "./designJobs";
import AllJobs from "./allJobs";
import MyJobs from "./myJobs";
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
import { getReview, saveReview, updateReview } from "~/servers/job.server";
import { getFreelancerIdByAccountId } from "~/servers/freelancer.server";

// ✅ Define a type for the Loader's return data
export type LoaderData = {
  jobSkills: Skill[];
  review?: { rating: number; comment: string } | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const accountId = await requireUserIsFreelancerPublished(request);
  if (!accountId) {
    return redirect("/login-employer");
  }

  const accountType: AccountType = await getCurrentUserAccountType(request);
  if (accountType !== AccountType.Freelancer) {
    return redirect("/dashboard");
  }

  const url = new URL(request.url);
  const jobId = parseInt(url.searchParams.get("jobId") || "0", 10);
  const employerId = parseInt(url.searchParams.get("employerId") || "0", 10);
  const jobSkills = jobId > 0 ? await getJobSkills(jobId) : [];

  const freelancerId = await getFreelancerIdByAccountId(accountId);
  if (!freelancerId) {
    return Response.json({ jobSkills, review: null });
  }

  const existingReview =
    employerId > 0 ? await getReview(freelancerId, employerId) : null;

  return Response.json({ jobSkills, review: existingReview });
}

export async function action({ request }: ActionFunctionArgs) {
  const accountId = await requireUserIsFreelancerPublished(request);
  if (!accountId) return redirect("/login-employer");

  const formData = await request.formData();
  const actionType = formData.get("_action");
  const jobId = Number(formData.get("jobId"));
  const employerId = Number(formData.get("employerId"));
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment") as string;

  const freelancerId = await getFreelancerIdByAccountId(accountId);
  if (!freelancerId) {
    return Response.json({
      success: false,
      message: `❌ Freelancer with account ID ${accountId} does not exist.`,
    });
  }

  try {
    if (actionType === "interested") {
      console.log("🚀 Applying for job:", { jobId, freelancerId });
      return Response.json({ success: true });
    } else if (actionType === "review") {
      const existingReview = await getReview(freelancerId, employerId);
      if (existingReview) {
        console.log("✏️ Updating review...");
        await updateReview({ employerId, freelancerId, rating, comment });
      } else {
        console.log("🆕 Saving review...");
        await saveReview({ employerId, freelancerId, rating, comment });
      }
      return Response.json({ success: true });
    }
  } catch (error) {
    console.error("❌ Error handling action:", error);
    return Response.json({ success: false, message: (error as Error).message });
  }
}

export default function Layout() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetcher = useFetcher<LoaderData>();

  const handleJobSelect = async (jobData: Job) => {
    setIsLoading(true);
    setSelectedJob(jobData);
    setOpen(true);
    fetcher.load(
      `/browse-jobs?jobId=${jobData.id}&employerId=${jobData.employerId}`
    );
    setIsLoading(false);
  };

  return (
    <div>
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
                    review={fetcher.data?.review || null}
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
      <Tabs defaultValue="recommended-jobs" className="">
        <TabsList className="mt-4 mb-6">
          <TabsTrigger value="recommended-jobs">Design Jobs</TabsTrigger>
          <TabsTrigger value="all-jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="my-jobs">My Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="recommended-jobs" className="">
          <DesignJobs onJobSelect={handleJobSelect} />
        </TabsContent>
        <TabsContent value="all-jobs">
          <AllJobs onJobSelect={handleJobSelect} />
        </TabsContent>
        <TabsContent value="my-jobs">
          <MyJobs onJobSelect={handleJobSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
