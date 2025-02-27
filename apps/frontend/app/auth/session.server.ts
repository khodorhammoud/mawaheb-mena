import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getUser, getUserAccountInfo } from "~/servers/user.server";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "user",
    secure: false, //process.env.NODE_ENV === "production",
    // TODO: update with environment variables
    secrets: ["s3cret1"],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function createUserSession(
  request,
  userId: number,
  redirectTo: string
) {
  const session = await getSession(request.headers.get("cookie"));
  session.set("user", userId);

  const user = await getUser({ userId });
  if (user?.role === "admin") {
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return redirect("/admin-dashboard", { headers });
  }
  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
  const userAccount = await getUserAccountInfo({ userId });
  if (userAccount.user.isOnboarded) return redirect(redirectTo, { headers });
  return redirect("/dashboard", { headers }); // this is the session that direct me to the dashboard
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getCurrentUserId(request: Request): Promise<number> {
  const session = await getUserSession(request);
  const userId = session.get("user");
  return userId || null;
}
