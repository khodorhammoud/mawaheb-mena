// import { Employer } from "~/types/User";
import { getCurrentUser } from "./user.server";

import { db } from "../db/drizzle/connector";
import { accountsTable, employersTable } from "../db/drizzle/schemas/schema";
import { eq } from "drizzle-orm";
import { Employer } from "../types/User";

export async function getCurrentEmployerAccountInfo(
  request: Request
): Promise<Employer | null> {
  const user = await getCurrentUser(request);
  const employer = await db
    .select()
    .from(employersTable)
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .where(eq(accountsTable.userId, user.id));

  if (!employer) return null;
  return { ...employer[0].employers, ...employer[0].accounts } as Employer;
}
