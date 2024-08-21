import { hash, compare } from "bcrypt-ts";
import { db } from "~/db/drizzle/connector";
import { UsersTable } from "~/db/drizzle/schemas/schema";
import { LoggedInUser, User } from "~/types/User";
import { eq /* lt, gte, ne */ } from "drizzle-orm";

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

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
}: User) {
  if (!password) throw new Error("Missing required fields for registration");
  const passHash = await hash(password, process.env.bycryptSalt || 10);
  type NewUser = typeof UsersTable.$inferInsert;
  const newUser: NewUser = {
    firstName,
    lastName,
    passHash,
    email,
  };

  // check if user exists
  const existingUsers = await getUserByEmail(newUser.email);
  if (existingUsers && existingUsers.length > 0) throw new Error("User exists");

  const result = (await db
    .insert(UsersTable)
    .values(newUser)
    .returning()) as unknown as User;
  console.log("user created", result);
  return result;
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

/* export async function getUserById(email: number): Promise<any> {
  return new Promise((resolve, reject) => {
    return resolve({
      id: 1,
      firstName: "John",

      lastName: "Doe",
      email: "john@doe.com",
      passHash: "123456",
    });
  });
}
 */
