import { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  return authenticator.authenticate("google_employer", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/signup-employer",
  });
};
