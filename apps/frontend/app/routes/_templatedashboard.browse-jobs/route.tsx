import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  getCurrentProfileInfo,
  getCurrentUser,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import { AccountType } from "~/types/enums";
import { authenticator } from "~/auth/auth.server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import RecommendedJobs from "./recommendedJobs";
import AllJobs from "./allJobs";
import { useLoaderData } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {}

export async function loader({ request }: LoaderFunctionArgs) {
  // if the curretn user is not logged in, redirect them to the login screen
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    return redirect("/login-employer");
  }
  const accountType: AccountType = await getCurrentUserAccountType(request);
  // return if user is not freelancer
  if (accountType !== "freelancer") {
    return redirect("/dashboard");
  }

  const employer = await getCurrentProfileInfo(request);

  // Return the response data
  return Response.json({ employer });
}

// Layout component
export default function Layout() {
  const { employer } = useLoaderData<typeof loader>();

  return (
    <div>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Recommended Jobs</TabsTrigger>
          <TabsTrigger value="password">All Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <RecommendedJobs />
        </TabsContent>
        <TabsContent value="password">
          <AllJobs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
