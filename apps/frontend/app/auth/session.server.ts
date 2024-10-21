import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { Employer, Freelancer } from "../types/User";

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
  user: Employer | Freelancer,
  redirectTo: string
) {
  const session = await getSession(request.headers.get("cookie"));
  session.set("user", user);
  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
  if (user.account.user.isOnboarded) return redirect(redirectTo, { headers });
  return redirect("/dashboard", { headers }); // this is the session that direct me to the dashboard
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getCurrentUser(
  request: Request
): Promise<Employer | Freelancer> {
  const session = await getUserSession(request);
  const user = session.get("user");
  return user || null;
}
