import { redirect } from "@remix-run/node";
import { getSession } from "~/auth/session.server";

// This policy ensures that the user is authenticated
export const ensureAuthenticated = async (
  request: Request,
  redirectTo: string = "/login"
) => {
  try {
    const session = await getSession(request.headers.get("cookie"));
    if (!session.get("user")) {
      console.log("user not authenticated");
      return redirect(redirectTo);
    }
    const { id: userId } = session.get("user");
    if (!userId || typeof userId != "number") {
      throw redirect(redirectTo);
    }
    return userId;
  } catch (error) {
    console.error("error ensuring user is authenticated", error);
  }
};

export const ensureNotAuthenticated = async (
  request: Request,
  redirectTo: string = "/"
) => {
  try {
    const session = await getSession(request.headers.get("cookie"));
    if (session.get("user")) {
      return redirect(redirectTo);
    }
  } catch (error) {
    console.error("error ensuring user is not authenticated", error);
  }
};
