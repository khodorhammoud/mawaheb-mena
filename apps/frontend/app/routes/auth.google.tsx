import { ActionFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  // Create a new request with the same method and headers
  const url = new URL(request.url);
  const formData = await request.formData();

  // Add form data to URL search params
  url.searchParams.set("mode", formData.get("mode") as string);
  url.searchParams.set("accountType", formData.get("accountType") as string);

  // Create a new request with the updated URL
  const newRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  });

  return authenticator.authenticate("google", newRequest, {
    successRedirect: process.env.GOOGLE_CALLBACK_URL!,
    failureRedirect:
      formData.get("mode") === "login"
        ? `/login-${formData.get("accountType")}`
        : `/signup-${formData.get("accountType")}`,
  });
};
