import { redirect, useLoaderData } from "@remix-run/react";
import { AccountType, AccountStatus, EmployerAccountType } from "~/types/enums";
import {
  getCurrentProfileInfo,
  getCurrentUserAccountType,
} from "~/servers/user.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Employer, Freelancer } from "~/types/User";
import { requireUserVerified } from "~/auth/auth.server";
import FreelancerIdentifyingScreen from "./freelancer";
import EmployerIdentifyingScreen from "./employer";
import {
  createEmployerIdentification,
  getEmployerIdentification,
  updateEmployerIdentification,
  updateEmployerAccountStatusToPending,
} from "~/servers/employer.server";
import {
  createFreelancerIdentification,
  getFreelancerIdentification,
  updateFreelancerIdentification,
  updateFreelancerAccountStatusToPending,
} from "~/servers/freelancer.server";

export async function action({ request }: ActionFunctionArgs) {
  // user must be verified
  await requireUserVerified(request);

  try {
    const formData = await request.formData();
    const userProfile = await getCurrentProfileInfo(request);
    const currentProfile = await getCurrentProfileInfo(request);
    const accountType = currentProfile.account.accountType;
    const targetUpdated = formData.get("target-updated") as string;

    // Process based on account type
    if (
      accountType === AccountType.Employer &&
      targetUpdated === "employer-identification"
    ) {
      const userId = currentProfile.account.user.id;
      const accountId = currentProfile.account.id;
      const employerAccountType = formData.get("employerAccountType") as string;

      // Get file uploads
      const identificationFiles = formData.getAll("identification") as File[];
      const tradeLicenseFiles = formData.getAll("trade_license") as File[];

      // Prepare attachments data
      const attachmentsData: Record<string, string[]> = {
        identification: identificationFiles.map((file) => file.name),
        trade_license: tradeLicenseFiles.map((file) => file.name),
      };

      // Add board resolution files for company accounts
      if (employerAccountType === EmployerAccountType.Company) {
        const boardResolutionFiles = formData.getAll(
          "board_resolution"
        ) as File[];
        attachmentsData.board_resolution = boardResolutionFiles.map(
          (file) => file.name
        );
      }

      // Check if identification record exists
      const existingIdentification = await getEmployerIdentification(userId);

      // Create or update identification record
      if (!existingIdentification.data) {
        await createEmployerIdentification(userId, attachmentsData);
      } else {
        await updateEmployerIdentification(userId, attachmentsData);
      }

      // Update account status to pending
      await updateEmployerAccountStatusToPending(accountId);

      return Response.json({ success: true });
    } else if (
      accountType === AccountType.Freelancer &&
      targetUpdated === "freelancer-identification"
    ) {
      const userId = currentProfile.account.user.id;
      const accountId = currentProfile.account.id;

      // Get file uploads
      const identificationFiles = formData.getAll("identification") as File[];

      // Prepare attachments data
      const attachmentsData: Record<string, string[]> = {
        identification: identificationFiles.map((file) => file.name),
      };

      // Check if identification record exists
      const existingIdentification = await getFreelancerIdentification(userId);

      // Create or update identification record
      if (!existingIdentification.data) {
        await createFreelancerIdentification(userId, attachmentsData);
      } else {
        await updateFreelancerIdentification(userId, attachmentsData);
      }

      // Update account status to pending
      await updateFreelancerAccountStatusToPending(accountId);

      return Response.json({ success: true });
    }

    // DEFAULT
    throw new Error("Unknown account type or target update");
  } catch (error) {
    console.error("Error processing identification:", error);
    return Response.json(
      { success: false, error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is verified
  await requireUserVerified(request);

  // Get the account type and profile info
  const accountType = await getCurrentUserAccountType(request);
  let profile = await getCurrentProfileInfo(request);

  if (!profile) {
    return Response.json({
      success: false,
      error: { message: "Profile information not found." },
      status: 404,
    });
  }

  // If user is not onboarded, redirect to onboarding
  if (!profile.account?.user?.isOnboarded) {
    return redirect("/onboarding");
  }

  // If account status is published, redirect to dashboard
  if (profile.account?.accountStatus === AccountStatus.Published) {
    return redirect("/dashboard");
  }

  // If account status is pending, show pending message
  const isPending = profile.account?.accountStatus === AccountStatus.Pending;

  if (accountType === AccountType.Employer) {
    profile = profile as Employer;
    return Response.json({
      accountType,
      currentProfile: profile,
      isPending,
    });
  } else if (accountType === AccountType.Freelancer) {
    profile = profile as Freelancer;
    return Response.json({
      accountType,
      currentProfile: profile,
      isPending,
    });
  }

  return Response.json({
    success: false,
    error: { message: "Account type not found." },
    status: 404,
  });
}

// Layout component
export default function Layout() {
  const { accountType, isPending } = useLoaderData<{
    accountType: AccountType;
    isPending: boolean;
  }>();

  // If account status is pending, show pending message
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Account Verification</h1>
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-800">
              Your account is being validated
            </p>
            <p className="text-gray-600 mt-2">
              We're reviewing your submitted documents. This process typically
              takes 1-2 business days.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            You'll receive an email notification once your account is approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {accountType === AccountType.Employer ? (
        <EmployerIdentifyingScreen />
      ) : (
        <FreelancerIdentifyingScreen />
      )}
    </div>
  );
}
