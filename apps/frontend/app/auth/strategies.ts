import { FormStrategy } from "remix-auth-form";
import {
  getUserAccountType,
  getUser,
  registerEmployer,
  registerFreelancer,
} from "../servers/user.server";
import { compare } from "bcrypt-ts";
import { Employer, Freelancer } from "../types/User";
import { EmployerAccountType } from "../types/enums";

export const loginStrategy = new FormStrategy(
  async ({ form }): Promise<number> => {
    let email = form.get("email") as string;
    const password = form.get("password") as string;
    const accountType = form.get("accountType") as string;
    email = email.toLowerCase().trim();
    const user = await getUser({ userEmail: email }, true);
    if (user && (await getUserAccountType(user.id!)) !== accountType) {
      throw new Error(`This ${accountType} account does not exist`);
    }

    if (!user || !(await compare(password, user.passHash!))) {
      throw new Error("Incorrect credentials");
    }

    if (!user.isVerified) throw new Error("Account not verified");

    return user.id;
  }
);

export const registerationStrategy = new FormStrategy(
  async ({ form }): Promise<number> => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const accountType = form.get("accountType") as string;
    const employerAccountType = form.get(
      "employerAccountType"
    ) as EmployerAccountType;

    let profile: Employer | Freelancer = null;
    if (!password || !firstName || !lastName || !email) {
      throw new Error("Missing required fields for registration");
    }

    try {
      switch (accountType) {
        case "employer":
          profile = await registerEmployer({
            account: {
              user: {
                firstName: firstName.toLowerCase().trim(),
                lastName: lastName.toLowerCase().trim(),
                email: email.toLowerCase().trim(),
                password,
              },
            },
            employerAccountType,
          } as Employer);

          break;
        case "freelancer":
          profile = await registerFreelancer({
            account: {
              user: {
                firstName: firstName.toLowerCase().trim(),
                lastName: lastName.toLowerCase().trim(),
                email: email.toLowerCase().trim(),
                password,
              },
            },
          } as Freelancer);
          break;
        default:
          throw new Error("Invalid registration type");
      }
    } catch (error) {
      console.error(error);
      throw new Error("Failed to register user");
    }
    return profile.account.user.id;
  }
);
