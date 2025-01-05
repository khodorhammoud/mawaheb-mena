import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getCurrentUserAccountType } from "~/servers/user.server";
import { AccountType } from "~/types/enums";
import { requireUserAccountStatusPublished } from "~/auth/auth.server";
import { useLoaderData } from "@remix-run/react";
import FreelancerTimesheet from "./freelancer";
import EmployerTimesheet from "./employer";

// export async function action({ request }: ActionFunctionArgs) {}

export async function loader({ request }: LoaderFunctionArgs) {
  // current user must be published
  const userId = await requireUserAccountStatusPublished(request);
  if (!userId) {
    return redirect("/login-employer");
  }
  const accountType: AccountType = await getCurrentUserAccountType(request);

  // Return the response data
  return Response.json({ accountType });
}

// Layout component
export default function Layout() {
  const { accountType } = useLoaderData<{
    accountType: AccountType;
  }>();
  return (
    <div>
      {accountType === AccountType.Freelancer ? (
        <FreelancerTimesheet />
      ) : (
        <EmployerTimesheet />
      )}
    </div>
  );
}
