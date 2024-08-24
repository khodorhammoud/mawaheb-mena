import { FormStrategy } from "remix-auth-form";
import { getUserByEmail, registerEmployer } from "../servers/user.server";
import { compare } from "bcrypt-ts";
import { EmployerAccountType, User } from "../types/User";

export const loginStrategy = new FormStrategy(
  async ({ form }): Promise<User> => {
    let email = form.get("email") as string;
    const password = form.get("password") as string;
    email = email.toLowerCase().trim();
    const user = await getUserByEmail(email);

    console.log("user", user);

    if (!user || !(await compare(password, user.passHash!))) {
      console.error("about to throw incorrect credentials error");
      throw new Error("Incorrect credentials");
    }
    if (!user.isVerified) throw new Error("Account not verified");
    return user;
  }
);

export const registerationStrategy = new FormStrategy(
  async ({ form }): Promise<User> => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const registrationType = form.get("registrationType") as string;
    const accountType = form.get("accountType") as EmployerAccountType;

    let user = null;
    if (!password || !firstName || !lastName || !email)
      throw new Error("Missing required fields for registration");

    switch (registrationType) {
      case "employer":
        user = await registerEmployer({
          firstName: firstName.toLowerCase().trim(),
          lastName: lastName.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          password,
          accountType,
        });
        break;
      case "freelancer":
        // register freelancer
        break;
      default:
        throw new Error("Invalid registration type");
    }
    return user;
  }
);
