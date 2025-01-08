import { hash, compare } from "bcrypt-ts";
import { db } from "../db/drizzle/connector";
import {
  accountsTable,
  employersTable,
  freelancersTable,
  UsersTable,
  userVerificationsTable,
} from "../db/drizzle/schemas/schema";
import {
  // LoggedInUser,
  User,
  Employer,
  Freelancer,
  UserAccount,
  PortfolioFormFieldType,
} from "../types/User";
import { eq /* lt, gte, ne */ } from "drizzle-orm";
import { RegistrationError, ErrorCode } from "../common/errors/UserError";
import { AccountStatus, AccountType } from "../types/enums";
// import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "../auth/auth.server";

/****************************************************************
 *                                                              *
 *         get the user/Account/freelancer/employer info        *
 *                                                              *
 ****************************************************************/

/**
 * get the user by their id or email
 * @param id : the id of the user to get
 * @param email : the email of the user to get
 * @param withPassword : boolean to determine if the password hash should be included in the response
 * @returns User | null: the user with the given email or null if the user does not exist
 */

export async function getUser(
  { userId, userEmail }: { userId?: number; userEmail?: string },
  withPassword = false
): Promise<User | null> {
  let user: User = null;
  if (userId) {
    const userRes = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, userId));
    if (userRes[0]) {
      user = userRes[0] as User;
    }
  } else if (userEmail) {
    userEmail = userEmail.toLowerCase();

    const userRes = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, userEmail));
    if (userRes.length > 0) {
      user = userRes[0] as User;
    }
  }
  if (!user) return null;
  if (!withPassword) delete user.passHash;
  return user;
}

/**
 * get the current user from the session
 * @param request : the request object
 * @param withPassword : boolean to determine if the password hash should be included in the response
 * @returns User | null : the current user from the session or null if the user is not logged in
 */

export async function getCurrentUser(
  request: Request,
  withPassword = false
): Promise<User | null> {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) return null;
  const currentUser = await getUser({ userId }, withPassword);

  if (!withPassword) return { ...currentUser, passHash: undefined };
  return currentUser;
}

/**
 * get the user account info by the accountId
 * @param accountId : the id of the account to get the user info for
 * @returns UserAccount | null: the user account with the given id or null if the account does not exist
 */
export async function getUserAccountInfo(
  {
    accountId,
    userId,
    userEmail,
  }: { accountId?: number; userId?: number; userEmail?: string },
  withPassword = false
): Promise<UserAccount | null> {
  let user: User = null;
  let account = null;
  if (accountId) {
    account = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.id, accountId));
    if (account.length === 0) return null;
    user = await getUser({ userId: account[0].userId }, withPassword);
    if (!user) return null;
  }

  if (userId || userEmail) {
    user = await getUser({ userId, userEmail }, withPassword);
    if (!user) return null;
    account = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, user.id));

    if (account.length === 0) return null;
  }
  return { ...account[0], user } as UserAccount;
}

/**
 * get the account from the slug
 * @param slug : the slug of the account to get the type for
 * @returns UserAccount | null: the account with the given slug or null if the account does not exist
 */
export async function getAccountBySlug(
  slug: string
): Promise<UserAccount | null> {
  const account = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.slug, slug));
  if (account.length === 0) return null;
  return account[0] as unknown as UserAccount;
}

/**
 * get the current account info from the session
 * @param request : the request object
 * @param withPassword : boolean to determine if the password hash should be included in the response
 * @returns UserAccount | null: the current user account info from the session or null if the user is not logged in
 */

let currentAccount: UserAccount = null;
export async function getCurrentUserAccountInfo(
  request: Request,
  withPassword = false
): Promise<UserAccount | null> {
  if (!currentAccount) {
    const user = await getCurrentUser(request, withPassword);
    if (!user) return null;
    currentAccount = await getUserAccountInfo({ userId: user.id });
  }
  return currentAccount;
}

/**
 * get the full employer or freelancer info with account and user info.
 * @param identifier : object containing the id of the user, the email of the user, the id of the account, or the id of the employer/freelancer. The function only accepts one of the identifiers.
 * @returns Employer | Freelancer | null: the employer or freelancer with the given id or null if the employer/freelancer does not exist.
 */
type ProfileIdentifier = {
  userId?: number;
  userEmail?: string;
  accountId?: number;
  // employerId?: number;
  // freelancerId?: number;
};
export async function getProfileInfo(
  identifier: {
    [K in keyof ProfileIdentifier]: {
      [P in K]: ProfileIdentifier[P];
    };
  }[keyof ProfileIdentifier]
): Promise<Employer | Freelancer | null> {
  let account = null;
  let employer = null;
  let freelancer = null;

  /* // if the employerId or freelancerId are provided, get the full info from the employer/freelancer
  if ("employerId" in identifier || "freelancerId" in identifier) {
    let accountId = 0;
    if ("employerId" in identifier) {
      employer = await db
        .select()
        .from(employersTable)
        .where(eq(employersTable.id, identifier.employerId));
      if (employer.length === 0) return null;
      employer = employer[0];
      accountId = employer.accountId;
      const userAccount = await getUserAccountInfo({ accountId });
      if (!userAccount) return null;
      return {
        account: userAccount,
        ...employer,
      } as Employer;
    }
    if ("freelancerId" in identifier) {
      freelancer = await db
        .select()
        .from(freelancersTable)
        .where(eq(freelancersTable.id, identifier.freelancerId));
      if (freelancer.length === 0) return null;
      freelancer = freelancer[0];
      accountId = freelancer.accountId;
      const userAccount = await getUserAccountInfo({ accountId });
      if (!userAccount) return null;
      return {
        account: userAccount,
        ...freelancer,
      } as Freelancer;
    }
    return null;
  } */

  // if the  userId, userEmail, or accountId are provided, get the full info from the user/account
  if (
    "userId" in identifier ||
    "userEmail" in identifier ||
    "accountId" in identifier
  ) {
    account = await getUserAccountInfo(identifier);
    if (!account) return null;
    // get account type
    if (account.accountType === AccountType.Employer) {
      employer = await db
        .select()
        .from(employersTable)
        .where(eq(employersTable.accountId, account.id));
      if (employer.length === 0) return null;
      employer = employer[0];
    } else if (account.accountType === AccountType.Freelancer) {
      freelancer = await db
        .select()
        .from(freelancersTable)
        .where(eq(freelancersTable.accountId, account.id));
      if (freelancer.length === 0) return null;
      freelancer = freelancer[0];
      freelancer.portfolio = freelancer.portfolio as PortfolioFormFieldType[];
    }
    return {
      account,
      ...(employer || freelancer),
    } as Employer | Freelancer;
  }
  return null;
}

// get profile
export async function getCurrentProfileInfo(
  request: Request
): Promise<Employer | Freelancer | null> {
  const user = await getCurrentUser(request);
  if (!user) return null;
  const currentProfile: Employer | Freelancer = await getProfileInfo({
    userId: user.id,
  });

  return currentProfile;
}

export async function getProfileInfoByAccountId(accountId: number) {
  // Replace this with the actual implementation to fetch profile
  const profile = await getProfileInfo({ accountId });
  if (!profile) {
    throw new Error(`Profile not found for account ID: ${accountId}`);
  }
  return profile;
}

/**
 * Check if the provided user is an employee or a freelancer
 * @param userId : the id of the user to check
 * @returns string: the account type of the user, or null if the user does not exist or is not an employee or freelancer
 */

export async function getUserAccountType(
  userId: number
): Promise<AccountType | null> {
  const accounts = await db
    .select({ accountType: accountsTable.accountType })
    .from(accountsTable)
    .where(eq(accountsTable.userId, userId));
  if (accounts.length > 0) {
    return accounts[0].accountType as AccountType;
  }
  return null;
}

export async function isUserOnboarded_Depricated(user: User): Promise<boolean> {
  console.warn("using isUserOnboarded_Depricated", user);
  return null;
  // const users = await db
  //   .select()
  //   .from(UsersTable)
  //   .where(eq(UsersTable.id, user.id));
  // if (users.length > 0) {
  //   return users[0].isOnboarded;
  // }
  // return false;
}

/**
 * get the userId from the employerId
 * @param employerId : the id of the employer to get the userId for
 * @returns number: the userId of the employer
 */
export async function getUserIdFromEmployerId_Depricated(
  employerId: number
): Promise<number | null> {
  console.warn("using getUserIdFromEmployerId_Depricated", employerId);
  return null;
  // // join the employers table with the accounts table to get the userId
  // const result = await db
  //   .select({ userId: accountsTable.userId })
  //   .from(employersTable)
  //   .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
  //   .where(eq(employersTable.id, employerId));
  // if (result.length === 0) return null;
  // return result[0].userId;
}

/**
 * get the userId from the freelancerId
 * @param freelancerId : the id of the freelancer to get the userId for
 * @returns number: the userId of the freelancer
 */

export async function getUserIdFromFreelancerId(
  freelancerId: number
): Promise<number | null> {
  // join the freelancers table with the accounts table to get the userId
  const result = await db
    .select({ userId: accountsTable.userId })
    .from(freelancersTable)
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .where(eq(freelancersTable.id, freelancerId));
  if (result.length === 0) return null;
  return result[0].userId;
}

/**
 * get the freelancerId from the userId
 * @param userId : the id of the user to get the freelancerId for
 * @returns number: the freelancerId of the user
 */
export async function getFreelancerIdFromUserId(
  userId: number
): Promise<number | null> {
  // left join freelancers table with accounts table left join with users table on userId
  const result = await db
    .select({ freelancerId: freelancersTable.id })
    .from(freelancersTable)
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(UsersTable.id, userId));
  if (result.length === 0) return null;
  return result[0].freelancerId;
}
/**
 * get the employerId from the userId
 * @param userId : the id of the user to get the employerId for
 * @returns number: the employerId of the user
 */
export async function getEmployerIdFromUserId(
  userId: number
): Promise<number | null> {
  const result = await db
    .select({ employerId: employersTable.id })
    .from(employersTable)
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .where(eq(accountsTable.userId, userId));
  if (result.length === 0) return null;
  return result[0].employerId;
}

export async function getCurrentEmployerAccountInfo_Depricated(
  request: Request
): Promise<Employer | null> {
  console.warn("using getCurrentEmployerAccountInfo_Depricated", request);
  return null;
  // const user = await getCurrentUser(request);
  // const employer = await db
  //   .select()
  //   .from(employersTable)
  //   .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
  //   .where(eq(accountsTable.userId, user.id));

  // if (!employer) return null;
  // return { ...employer[0].employers, ...employer[0].accounts } as Employer;
}

/**
 * check if the current user is an employer or a freelancer
 * @returns string: the account type of the user, or null if the user does not exist or is not an employee or freelancer
 */
export async function getCurrentUserAccountType(
  request: Request
): Promise<AccountType | null> {
  // get the current user id from the session
  const currentUser = await getCurrentUser(request);
  if (!currentUser) return null;
  const userId = currentUser.id;
  return await getUserAccountType(userId);
}
/****************************************************************
 *                                                              *
 *                    user/account creation                     *
 *                                                              *
 ****************************************************************/

/**
 * creates a new employer account. This creates a new account record first, which in turn creates a new user record, before finally adding a new employer record.
 * @param param0 : object containing user info: firstName, lastName, email, password, and account type (personal or company)
 * @returns Employer: the newly created employer
 */
export async function registerEmployer({
  account,
  employerAccountType,
}: Employer): Promise<Employer> {
  if (!employerAccountType || !account.user)
    throw new RegistrationError(
      ErrorCode.MISSING_FIELDS,
      "Missing required fields for registration"
    );

  const { firstName, lastName, email, password } = account.user;
  // create the user account
  const newAccount = (await createUserAccount(
    {
      userId: null,
      accountType: AccountType.Employer,
    },
    true,
    {
      firstName,
      lastName,
      email,
      password,
    }
  )) as UserAccount;

  const accountId = newAccount.id;

  type NewEmployer = typeof employersTable.$inferInsert;
  const newEmployer: NewEmployer = {
    accountId,
    employerAccountType,
  };

  await db
    .insert(employersTable) // insert into employers table
    .values(newEmployer)
    .returning();
  return (await getProfileInfo({
    accountId,
    // employerId: result[0].id,
  })) as Employer;
}

/**
 * create a new account slug
 * @param firstName : the first name of the account
 * @param lastName : the last name of the account
 * @returns string: the newly created slug
 */
export async function createAccountSlug(
  firstName: string,
  lastName: string
): Promise<string> {
  let slug = `${firstName}-${lastName}`;
  slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  // remove any trailing hyphens
  slug = slug.replace(/-+$/, "");
  // if the slug is longer than 60 characters, truncate it
  if (slug.length > 60) {
    slug = slug.substring(0, 60);
  }
  // if the slug already exists, add a random number to the end of the slug
  // failsafe: this should never happen, but if it does, we don't want to get stuck in an infinite loop
  let counter = 0;
  while (
    (await db.select().from(accountsTable).where(eq(accountsTable.slug, slug)))
      .length > 0
  ) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    counter++;
    if (counter > 1000) {
      throw new Error("Failed to create a unique slug for the account");
    }
  }
  return slug;
}

/**
 * creates a new freelancer account. This creates a new account record first, which in turn creates a new user record, before finally adding a new freelancer record.
 * @param param0 : object containing user info: firstName, lastName, email, password
 * @returns Freelancer: the newly created freelancer
 */
export async function registerFreelancer({
  account,
}: Freelancer): Promise<Freelancer> {
  if (!account.user)
    throw new RegistrationError(
      ErrorCode.MISSING_FIELDS,
      "Missing required fields for registration"
    );

  const { firstName, lastName, email, password } = account.user;
  // create the user account
  const newAccount = (await createUserAccount(
    {
      userId: null,
      accountType: AccountType.Freelancer,
    },
    true,
    {
      firstName,
      lastName,
      email,
      password,
    }
  )) as UserAccount;

  const accountId = newAccount.id;

  type NewFreelancer = typeof freelancersTable.$inferInsert;
  const newFreelancer: NewFreelancer = {
    accountId,
  };

  await db
    .insert(freelancersTable) // insert into employers table
    .values(newFreelancer)
    .returning();

  return (await getProfileInfo({
    // freelancerId: result[0].id,
    accountId,
  })) as Freelancer;
}

/**
 * @param accountInfo : object containing userId and accountType
 * @returns NewAccount: the newly created account
 */
export async function createUserAccount(
  { userId, accountType },
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

  // get firstName and Lastname from userId
  const user = await getUser({ userId: result[0].userId });
  if (!user)
    throw new RegistrationError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to get user after creating account"
    );
  const slug = await createAccountSlug(user.firstName, user.lastName);
  // insert the slug into the freelancers table
  await db
    .update(accountsTable)
    .set({ slug })
    .where(eq(accountsTable.id, result[0].id));
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
    // @ts-expect-error this is correct syntax 🙂
    firstName: firstName,
    lastName: lastName,
    passHash,
    email,
  };

  // check if user exists
  const existingUsers = await getUser({ userEmail: newUser.email });
  if (existingUsers)
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
 * verify the user's password
 * @param password: the password to verify
 * @param passHash: the hash to verify the password against
 * @returns boolean: true if the password is correct, false otherwise
 */
export async function verifyPassword(
  password: string,
  passHash: string
): Promise<boolean> {
  return compare(password, passHash);
}

/**
 * generate and insert a verification token into the userVerificationsTable for the given user
 *
 * @param userId: the id of the user to generate a verification token for
 * @returns string: the generated verification token
 */

export async function generateVerificationToken(
  userId: number
): Promise<string> {
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
  // insert token into userVerificationsTable
  await db
    .insert(userVerificationsTable)
    .values({ userId, token, expiry: new Date(expiry.toISOString()) });
  return token;
}

/**
 * update the user's verification status
 *
 * @param token: the token to verify
 * @returns boolean: true if the token is valid, false otherwise
 */
export async function verifyUserVerificationToken(token: string) {
  if (!token)
    return {
      success: false,
      message: ErrorCode.INVALID_TOKEN,
    };
  const tokenRecord = await db
    .select()
    .from(userVerificationsTable)
    .where(eq(userVerificationsTable.token, token));

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
    .update(userVerificationsTable)
    .set({ isUsed: true })
    .where(eq(userVerificationsTable.token, token));

  // update the user to be verified
  const userId = tokenRecord[0].userId;
  try {
    const response = await db
      .update(UsersTable)
      // @ts-expect-error this is correct syntax 🙂
      .set({ isVerified: true })
      .where(eq(UsersTable.id, userId))
      .returning({ updatedId: UsersTable.id });
    if (response.length === 0)
      return {
        success: false,
        message: ErrorCode.INTERNAL_ERROR,
      };
  } catch (e) {
    console.error("Error verifying user:", e);
    return {
      success: false,
      message: ErrorCode.INTERNAL_ERROR,
    };
  }
  return {
    success: true,
    message: "User verified successfully",
    userId,
  };
}

/**
 * check user statuses: isVerified, isOnboarded,
 * also check account status if is of a certain type
 *
 * @param userId: the id of the user to check the statuses for
 * @param checkingWhat: the type of status to check for
 * @param checkingFor: the status to check for
 * @returns boolean: true if the status is met, false otherwise
 */
export async function checkUserStatuses(
  userId: number,
  checkingWhat: "isVerified" | "isOnboarded" | "accountStatus" | "accountType",
  checkingFor?: AccountType | AccountStatus | boolean
) {
  const user = await getUser({ userId });
  if (!user) return false;
  if (checkingWhat === "isVerified") return user.isVerified === checkingFor;
  if (checkingWhat === "isOnboarded") return user.isOnboarded === checkingFor;
  if (checkingWhat === "accountType" || checkingWhat === "accountStatus") {
    const account = await getUserAccountInfo({ userId: user.id });
    if (checkingWhat === "accountType")
      return account.accountType === checkingFor;
    if (checkingWhat === "accountStatus")
      return account.accountStatus === checkingFor;
  }
  return false;
}
