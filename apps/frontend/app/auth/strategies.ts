import { FormStrategy } from "remix-auth-form";
import { getUserAccountType, getUserByEmail, registerEmployer, registerFreelancer } from "../servers/user.server";
import { compare } from "bcrypt-ts";
import { EmployerAccountType, User } from "../types/User";

export const loginStrategy = new FormStrategy(
  async ({ form }): Promise<User> => {
    let email = form.get("email") as string;
    const password = form.get("password") as string;
    const accountType = form.get("accountType") as string;
    email = email.toLowerCase().trim();
    const user = await getUserByEmail(email);

    if (user && await getUserAccountType(user.id!) !== accountType) {
      throw new Error(`This ${accountType} account does not exist`);
    }

    if (!user || !(await compare(password, user.passHash!))) {
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
    const accountType = form.get("accountType") as string;
    const employerAccountType = form.get("employerAccountType") as EmployerAccountType;

    let user = null;
    if (!password || !firstName || !lastName || !email) {
      throw new Error("Missing required fields for registration");
    }

    try {

      switch (accountType) {
        case "employer":
          user = await registerEmployer({
            firstName: firstName.toLowerCase().trim(),
            lastName: lastName.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password,
            employerAccountType,
          });
          break;
        case "freelancer":
          user = await registerFreelancer({
            firstName: firstName.toLowerCase().trim(),
            lastName: lastName.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password,
          });
          break;
        default:
          throw new Error("Invalid registration type");
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to register user");
    }
    return user;
  }
);
