// import { json } from "@remix-run/node";
// import { getUserByEmail, verifyPassword } from "~/utils/user.server";

import { sessionStorage, getSession } from "./session.server";
import { Authenticator } from "remix-auth";
import { registerationStrategy, loginStrategy } from "./strategies";
import { checkUserStatuses, getUser } from "~/servers/user.server";
import { AccountStatus, AccountType } from "~/types/enums";
import { redirect } from "@remix-run/node";

export const authenticator = new Authenticator<number>(sessionStorage);

authenticator.use(loginStrategy, "login");
authenticator.use(registerationStrategy, "register");

// the user must be authenticated and have a session
export async function requireUserSession(request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user");

  if (!userId) {
    console.warn("Unauthorized, user is not logged in");
    throw redirect("/login-employer");
  }

  return userId;
}

// the user must be verified through 2FA
export async function requireUserVerified(request: Request) {
  const userId = await requireUserSession(request);
  const status = await checkUserStatuses(userId, "isVerified", true);
  if (!status) {
    // redirect to login screen
    console.warn("Unauthorized, user is not verified");
    throw redirect("/login-employer");
  }
  return userId;
}

// the user must be onboarded
export async function requireUserOnboarded(request: Request) {
  // the user must be verified to check their statuses
  const userId = await requireUserVerified(request);
  const status = await checkUserStatuses(userId, "isOnboarded", true);
  if (!status) {
    console.warn("Unauthorized, user is not onboarded");
    // redirect to onboarding page
    throw redirect("/onboarding");
  }
  return userId;
}

// the user must have their account status published
export async function requireUserAccountStatusPublished(request: Request) {
  const userId = await requireUserOnboarded(request);
  const status = await checkUserStatuses(
    userId,
    "accountStatus",
    AccountStatus.Published
  );
  if (!status) {
    console.warn("Unauthorized, user is not published");
    throw redirect("/dashboard");
  }
  return userId;
}

// the user must be a freelancer
export async function requireUserIsFreelancer(request: Request) {
  const userId = await requireUserVerified(request);
  const status = await checkUserStatuses(
    userId,
    "accountType",
    AccountType.Freelancer
  );
  if (!status) {
    console.warn("Unauthorized, user is not a freelancer");
    throw redirect("/dashboard");
  }
  return userId;
}

// the user must be a freelancer and have their account status published
export async function requireUserIsFreelancerPublished(request: Request) {
  const userId = await requireUserAccountStatusPublished(request);
  const status = await checkUserStatuses(
    userId,
    "accountType",
    AccountType.Freelancer
  );
  if (!status) {
    console.warn("Unauthorized, user is not a published freelancer");
    throw redirect("/dashboard");
  }
  return userId;
}

// the user must be an employer
export async function requireUserIsEmployer(request: Request) {
  const userId = await requireUserVerified(request);
  const status = await checkUserStatuses(
    userId,
    "accountType",
    AccountType.Employer
  );
  if (!status) {
    console.warn("Unauthorized, user is not an employer");
    throw redirect("/dashboard");
  }
  return userId;
}

// the user must be an employer and have their account status published
export async function requireUserIsEmployerPublished(request: Request) {
  const userId = await requireUserAccountStatusPublished(request);
  const status = await checkUserStatuses(
    userId,
    "accountType",
    AccountType.Employer
  );
  if (!status) {
    console.warn("Unauthorized, user is not a published employer");
    throw redirect("/dashboard");
  }
  return userId;
}

export async function requireAdmin(request: Request) {
  const userId = await requireUserSession(request);
  const user = await getUser({ userId });

  if (!user || user.role !== "admin") {
    throw redirect("/login-admin");
  }

  return userId;
}

/* 
export async function login({ email, password }: User) {
	if (!email || !password)
		return json(
			{ error: "Please provide an email and password." },
			{ status: 400 }
		);
	const user = await getUserByEmail(email);
	if (
		!user ||
		!user.length ||
		!(await verifyPassword(password, user[0].passHash!))
	) {
		return json({ error: "Invalid credentials" }, { status: 400 });
	}

	return createUserSession(user[0].id!, "/dashboard"); // Redirect to dashboard after login
} */
