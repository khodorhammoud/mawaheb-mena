// Layout component
import { type FC } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getAccountBySlug } from "~/servers/user.server";
import { useLoaderData } from "@remix-run/react";
import { UserAccount } from "~/types/User";
// import Heading from "~/common/profileView/heading/Heading";
import FreelancerPage from "./freelancer";
import EmployerPage from "./employer";
export async function action({ request }: ActionFunctionArgs) {
  return Response.json({
    success: false,
    error: { message: "An unexpected error occurred." },
    status: 500,
  });
}

export async function loader({ params }: LoaderFunctionArgs) {
  // check params for slug
  const slug = params.slug;
  if (!slug) {
    throw new Response("Account type not found", { status: 404 });
  }

  // get slug account type
  const userAccount = await getAccountBySlug(slug);
  if (!userAccount) {
    throw new Response("Account not found", { status: 404 });
  }
  return Response.json({ userAccount });
}

const Layout: FC = () => {
  const { userAccount } = useLoaderData<{
    userAccount: UserAccount;
  }>();

  return (
    <div>
      {userAccount.accountType === "employer" ? (
        <EmployerPage />
      ) : (
        <FreelancerPage />
      )}
    </div>
  );
};

export default Layout;
