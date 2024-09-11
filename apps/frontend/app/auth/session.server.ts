import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { authenticator } from "./auth.server";
import { User } from "../types/User";
import { isUserOnboarded } from "../servers/user.server";

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
  user: User,
  redirectTo: string
) {
  const session = await getSession(request.headers.get("cookie"));
  session.set("user", user);
  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
  if (isUserOnboarded(user)) return redirect(redirectTo, { headers });
  return redirect("/onboarding", { headers });
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getCurrentUser(request: Request) {
  const session = await getUserSession(request);
  const user = session.get("user");
  return user || null;
}
