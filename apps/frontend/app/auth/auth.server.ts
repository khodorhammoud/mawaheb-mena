import { json } from "@remix-run/node";
import { getUserByEmail, verifyPassword } from "~/utils/user.server";
import { createUserSession } from "./session.server";
import { User } from "~/types/User";

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
}
