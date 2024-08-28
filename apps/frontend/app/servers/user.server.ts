import { hash, compare } from "bcrypt-ts";
import { db } from "../db/drizzle/connector";
import {
  accountsTable,
  employersTable,
  freelancersTable,
  UsersTable,
  userVerificationTable,
} from "../db/drizzle/schemas/schema";
import { LoggedInUser, User, Employer, Freelancer, UserAccount } from "../types/User";
import { eq /* lt, gte, ne */ } from "drizzle-orm";
import { RegistrationError, ErrorCode } from "../common/errors/UserError";
import { AccountType } from "../types/enums";

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await db
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email));
  if (users.length > 0) {
    return users[0] as User;
  } else {
    console.log("No User with this Email found");
    return null;
  }
}

/**
 * Check if the provided user is an employee or a freelancer
 * @param userId : the id of the user to check
 * @returns string: the account type of the user, or null if the user does not exist or is not an employee or freelancer
 */

export async function getUserAccountType(userId: number): Promise<AccountType | null> {
  const accounts = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, userId));
  if (accounts.length > 0) {
    return accounts[0].accountType;
  }
  return null;
}


export async function isUserOnboarded(user: User): Promise<boolean> {
  const accounts = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.userId, user.id));
  if (accounts.length > 0) {
    return accounts[0].isOnboarded;
  }
  return false;
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
  employerAccountType,
}: Employer): Promise<Employer> {
  if (!employerAccountType)
    throw new RegistrationError(
      ErrorCode.MISSING_FIELDS,
      "Missing required fields for registration: employerAccountType"
    );

  console.log("registerEmployer step 1, employerAccountType: ", employerAccountType);
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
    employerAccountType,
  };

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
}: Freelancer): Promise<Freelancer> {
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
): Promise<UserAccount> {
  // if this is a fresh insert, we need to create a new user first
  if (freshInsert) {
    if (!userInfo)
      throw new RegistrationError(
        ErrorCode.MISSING_FIELDS,
        "Missing required fields for registration: userInfo"
      );
    const newUser = await registerUser(userInfo);
    userId = newUser.id;
  }
  type NewAccount = typeof accountsTable.$inferInsert;
  const newAccount: NewAccount = {
    userId,
    accountType,
  };

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
}: User): Promise<User> {
  if (!password)
    throw new RegistrationError(
      ErrorCode.MISSING_FIELDS,
      "Missing required fields for registration: password"
    );

  const passHash = await hash(
    password,
    process.env.bycryptSalt ? Number(process.env.bycryptSalt) : 10
  );
  email = email.toLowerCase();
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
  return result[0];
}

/**
 * get the user by their id
 * @param id : the id of the user to get
 * @returns LoggedInUser: the user with the given id
 */
export async function getUserById(id: number): Promise<LoggedInUser | null> {
  const user = await db.select().from(UsersTable).where(eq(UsersTable.id, id));
  if (user[0]) {
    const loggedinUser: LoggedInUser = user[0] as LoggedInUser;
    return loggedinUser;
  }
  return null;
}

/**
 * get the userId from the employerId
 * @param employerId : the id of the employer to get the userId for
 * @returns number: the userId of the employer
 */
export async function getUserIdFromEmployerId(employerId: number): Promise<number | null> {
  // join the employers table with the accounts table to get the userId
  const result = await db
    .select({ userId: accountsTable.userId })
    .from(employersTable)
    .leftJoin(accountsTable, eq(employersTable.id, employerId));
  if (result.length === 0) return null;
  return result[0].userId;
}

/**
 * get the userId from the freelancerId
 * @param freelancerId : the id of the freelancer to get the userId for
 * @returns number: the userId of the freelancer
 */

export async function getUserIdFromFreelancerId(freelancerId: number): Promise<number | null> {
  // join the freelancers table with the accounts table to get the userId
  const result = await db
    .select({ userId: accountsTable.userId })
    .from(freelancersTable)
    .leftJoin(accountsTable, eq(freelancersTable.id, freelancerId));
  if (result.length === 0) return null;
  return result[0].userId;

}


/**
 * verify the user's password
 * @param password: the password to verify
 * @param passHash: the hash to verify the password against
 * @returns boolean: true if the password is correct, false otherwise
 */
export async function verifyPassword(password: string, passHash: string): Promise<boolean> {
  return compare(password, passHash);
}

/**
 * generate and insert a verification token into the userVerificationTable for the given user
 *
 * @param userId: the id of the user to generate a verification token for
 * @returns string: the generated verification token
 */

export async function generateVerificationToken(userId: number): Promise<string> {
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

/**
 * update the user's verification status
 *
 * @param token: the token to verify
 * @returns boolean: true if the token is valid, false otherwise
 */
export async function verifyUserRegistrationToken(token: string) {
  if (!token)
    return {
      success: false,
      message: ErrorCode.INVALID_TOKEN,
    };
  const tokenRecord = await db
    .select()
    .from(userVerificationTable)
    .where(eq(userVerificationTable.token, token));
  console.log("tokenRecord", tokenRecord);
  if (tokenRecord.length === 0)
    return {
      success: false,
      message: ErrorCode.INVALID_TOKEN,
    };
  // check if the token is expired
  const expiry = new Date(tokenRecord[0].expiry);
  if (expiry < new Date())
    return {
      success: false,
      message: ErrorCode.EXPIRED_TOKEN,
    };
  // check if the token is already used
  if (tokenRecord[0].isUsed)
    return {
      success: false,
      message: ErrorCode.USED_TOKEN,
    };

  // update the token to be used
  await db
    .update(userVerificationTable)
    .set({ isUsed: true })
    .where(eq(userVerificationTable.token, token));

  // update the user to be verified
  const userId = tokenRecord[0].userId;
  const response = await db
    .update(UsersTable)
    .set({ isVerified: true })
    .where(eq(UsersTable.id, userId));
  console.log("in verification", userId);
  return {
    success: true,
    message: "User verified successfully",
    userId
  };
}
