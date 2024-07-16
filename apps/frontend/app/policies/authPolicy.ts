import { LoaderFunction, redirect, redirectDocument } from "@remix-run/node";
import { getSession, destroySession } from "~/auth/session.server";

// This policy ensures that the user is authenticated
export const ensureAuthenticated =
	(redirectTo: string = "/login"): LoaderFunction =>
		async ({ request }) => {
			const session = await getSession(request.headers.get("Cookie"));
			const userId = session.get("userId");
			if (!userId || typeof userId != "number") {
				console.log("redirecting to", redirectTo);
				throw redirect(redirectTo);
			}
			return userId;
		};

export const ensureNotAuthenticated =
	(redirectTo: string = "/"): LoaderFunction =>
		async ({ request }) => {
			const session = await getSession(request.headers.get("Cookie"));
			const userId = session.get("userId");
			if (userId) {
				throw redirect(redirectTo);
			}
		};
