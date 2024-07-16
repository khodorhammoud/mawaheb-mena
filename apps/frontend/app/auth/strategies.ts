import { FormStrategy } from "remix-auth-form";
import { Authenticator } from "remix-auth";
import { registerUser, getUserByEmail } from "~/utils/user.server";
import {
	sessionStorage,
	commitSession,
	destroySession,
} from "./session.server";
import { compare, hash } from "bcrypt-ts";
import { User } from "~/types/User";
import { AuthenticationError } from "~/types/AuthenticationError";

export let authenticator = new Authenticator(sessionStorage);

const loginStrategy = new FormStrategy(async ({ form }: any): Promise<User> => {
	const email = form.get("email");
	const password = form.get("password");

	console.log({ email, password });

	const user = await getUserByEmail(email);

	if (!user || !user.length || !(await compare(password, user[0].passHash!))) {
		console.error("about to throw incorrect credentials error")
		throw new AuthenticationError("Incorrect email/password combination");
	}
	return user[0];
});
const registerationStrategy = new FormStrategy(
	async ({ form }: any): Promise<User> => {
		const email = form.get("email");
		const password = form.get("password");
		const firstName = form.get("firstName");
		const lastName = form.get("lastName");

		if (!password || !firstName || !lastName || !email)
			throw new Error("Missing required fields for registration");

		const user = await registerUser({ firstName, lastName, email, password });

		return user;
	}
);

authenticator.use(loginStrategy, "login");
authenticator.use(registerationStrategy, "register");
