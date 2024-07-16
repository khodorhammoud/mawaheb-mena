import { createCookieSessionStorage, redirect } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__session",
		secure: process.env.NODE_ENV === "production",
		// TODO: update with environment variables
		secrets: ["s3cret1"],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 1 week
		httpOnly: true,
	},
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function createUserSession(userId: number, redirectTo: string) {
	const session = await getSession();
	session.set("userId", userId);
	console.log("setting session id", session, userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
}

export async function getUserSession(request: Request) {
	return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	return userId || null;
}
