import { hash, compare } from "bcrypt-ts";
import { db } from "../db/drizzle/connector";
import {
  accountsTable,
  employersTable,
  freelancersTable,
  UsersTable,
  userVerificationTable,
} from "../db/drizzle/schemas/schema";
import { LoggedInUser, User, Employer, Freelancer } from "../types/User";
import { eq /* lt, gte, ne */ } from "drizzle-orm";
import { RegistrationError, ErrorCode } from "../common/errors/UserError";

export async function getUserByEmail(email: string): Promise<User[] | []> {
  const users = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email));
  if (users.length > 0) {
    return users as User[];
  } else {
    console.error("No User with this Email found");
    return [];
  }
}

/**
 * creates a new employer account. This creates a new account record first, which in turn creates a new user record, before finally adding a new employer record.
 * @param param0 : object containing user info: firstName, lastName, email, password, and account type (personal or company)
 * @returns Employer: the newly created employer
 */
export async function registerEmployer({
  firstName,
  lastName,
  email,
  password,
  accountType,
}: Employer) {
  if (!accountType)
    throw new RegistrationError(
      ErrorCode.MISSING_FIELDS,
      "Missing required fields for registration: accountType"
    );

  // create the user account
  const newAccount = (await createAccount(
    {
      userId: null,
      accountType: "employer",
    },
    true,
    {
      firstName,
      lastName,
      email,
      password,
    }
  )) as any;

  const accountId = newAccount.id;

  type NewEmployer = typeof employersTable.$inferInsert;
  const newEmployer: NewEmployer = {
    accountId,
    accountType,
  };
  console.log("creating employer", newEmployer);
  const result = (await db
    .insert(employersTable) // insert into employers table
    .values(newEmployer)
    .returning()) as unknown as Employer;
  return result[0];
}

/**
 * creates a new freelancer account. This creates a new account record first, which in turn creates a new user record, before finally adding a new freelancer record.
 * @param param0 : object containing user info: firstName, lastName, email, password
 * @returns Freelancer: the newly created freelancer
 */
export async function registerFreelancer({
  firstName,
  lastName,
  email,
  password,
}: Freelancer) {
  // create the user account
  const newAccount = (await createAccount(
    {
      userId: null,
      accountType: "freelancer",
    },
    true,
    {
      firstName,
      lastName,
      email,
      password,
    }
  )) as any;

  const accountId = newAccount.id;

  type NewFreelancer = typeof freelancersTable.$inferInsert;
  const newFreelancer: NewFreelancer = {
    accountId,
  };
  console.log("creating freelancer", newFreelancer);
  const result = (await db
    .insert(freelancersTable) // insert into employers table
    .values(newFreelancer)
    .returning()) as unknown as Freelancer;
  return result[0];
}

/**
 * @param accountInfo : object containing userId and accountType
 * @returns NewAccount: the newly created account
 */
export async function createAccount(
  { userId, accountType }: any,
  freshInsert: boolean = false,
  userInfo: User = null
) {
  // if this is a fresh insert, we need to create a new user first
  if (freshInsert) {
    if (!userInfo)
      throw new RegistrationError(
        ErrorCode.MISSING_FIELDS,
        "Missing required fields for registration: userInfo"
      );
    console.log("creating user for account");
    const newUser = await registerUser(userInfo);
    console.log("newUser", newUser);
    userId = newUser.id;
  }
  type NewAccount = typeof accountsTable.$inferInsert;
  const newAccount: NewAccount = {
    userId,
    accountType,
  };
  console.log("creating account", newAccount);
  const result = (await db
    .insert(accountsTable)
    .values(newAccount)
    .returning()) as unknown as NewAccount;
  return result[0];
}

/**
 *
 * @param User: object containing firstName, lastName, email, password
 * @returns User: the newly created user
 */
export async function registerUser({
  firstName,
  lastName,
  email,
  password,
}: User) {
  if (!password)
    throw new RegistrationError(
      ErrorCode.MISSING_FIELDS,
      "Missing required fields for registration: password"
    );

  const passHash = await hash(
    password,
    process.env.bycryptSalt ? Number(process.env.bycryptSalt) : 10
  );

  console.log("creating user");
  // get the user type from the db schema
  type NewUser = typeof UsersTable.$inferInsert;
  const newUser: NewUser = {
    firstName: firstName,
    lastName: lastName,
    passHash,
    email,
  };

  // check if user exists
  const existingUsers = await getUserByEmail(newUser.email);
  if (existingUsers && existingUsers.length > 0)
    throw new RegistrationError(
      ErrorCode.EMAIL_ALREADY_EXISTS,
      "Email already exists"
    );

  // insert user
  const result = (await db
    .insert(UsersTable)
    .values(newUser)
    .returning()) as unknown as User;
  console.log("user created", result);
  return result[0];
}

export async function getUserById(id: number): Promise<LoggedInUser | null> {
  const user = await db.select().from(UsersTable).where(eq(UsersTable.id, id));
  if (user[0]) {
    const loggedinUser: LoggedInUser = user[0] as LoggedInUser;
    return loggedinUser;
  }
  return null;
}

export async function verifyPassword(password: string, passHash: string) {
  return compare(password, passHash);
}

/**
 * generate and insert a verification token into the userVerificationTable for the given user
 *
 * @param userId: the id of the user to generate a verification token for
 * @returns string: the generated verification token
 */
export async function generateVerificationToken(userId: number) {
  // generate the token hash
  const token = await hash(
    Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
    process.env.bycryptSalt ? Number(process.env.bycryptSalt) : 10
  );
  // set the expiry to be an hour from now
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  // convert expiry to db-compatible time firmat
  // const expiryTime = expiry.toISOString().replace("T", " ").replace("Z", "");
  // insert token into userVerificationTable
  await db
    .insert(userVerificationTable)
    .values({ userId, token, expiry: new Date(expiry.toISOString()) });
  return token;
}
