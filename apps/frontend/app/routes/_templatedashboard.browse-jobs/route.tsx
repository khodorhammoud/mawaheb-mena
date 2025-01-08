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

// export async function action({ request }: ActionFunctionArgs) {}

// the loader is sending the employer data to file
export async function loader({ request }: LoaderFunctionArgs) {
  // current user must be a published

  const userId = await requireUserIsFreelancerPublished(request);
  if (!userId) {
    return redirect("/login-employer");
  }

  const accountType: AccountType = await getCurrentUserAccountType(request);
  // return if user is not freelancer
  if (accountType !== AccountType.Freelancer) {
    return redirect("/dashboard");
  }

  const employer = await getCurrentProfileInfo(request);

  // Return the response data
  return Response.json({ employer });
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
