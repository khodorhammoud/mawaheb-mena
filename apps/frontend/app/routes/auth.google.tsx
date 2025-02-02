import { ActionFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { AccountType } from "~/types/enums";

export const action: ActionFunction = async ({ request }) => {
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();

  const accountType = formData.get("accountType") as
    | AccountType.Freelancer
    | AccountType.Employer;

  const successRedirect =
    accountType == AccountType.Employer
      ? process.env.GOOGLE_CALLBACK_URL_EMPLOYER!
      : process.env.GOOGLE_CALLBACK_URL_FREELANCER!;

  const authStrategy =
    accountType == AccountType.Employer
      ? "google_employer"
      : "google_freelancer";

  const failureRedirect =
    formData.get("mode") === "login"
      ? `/login-${formData.get("accountType")}`
      : `/signup-${formData.get("accountType")}`;

  return authenticator.authenticate(authStrategy, request, {
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
  });
};
