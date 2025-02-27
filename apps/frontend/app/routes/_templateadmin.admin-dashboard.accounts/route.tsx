import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { db } from "~/db/drizzle/connector";
import {
  accountsTable,
  UsersTable,
  freelancersTable,
  employersTable,
} from "~/db/drizzle/schemas/schema";
import { AccountType, AccountStatus } from "~/types/enums";
import { Freelancer, Employer } from "~/types/User";

type LoaderData = {
  freelancers: Freelancer[];
  employers: Employer[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Fetch freelancers with complete information
  const freelancersQuery = await db
    .select({
      freelancer: freelancersTable,
      account: accountsTable,
      user: UsersTable,
    })
    .from(freelancersTable)
    .leftJoin(accountsTable, eq(freelancersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(accountsTable.accountType, AccountType.Freelancer));

  // Fetch employers with complete information
  const employersQuery = await db
    .select({
      employer: employersTable,
      account: accountsTable,
      user: UsersTable,
    })
    .from(employersTable)
    .leftJoin(accountsTable, eq(employersTable.accountId, accountsTable.id))
    .leftJoin(UsersTable, eq(accountsTable.userId, UsersTable.id))
    .where(eq(accountsTable.accountType, AccountType.Employer));

  // Transform the data to match Freelancer and Employer types
  const freelancers = freelancersQuery.map(({ freelancer, account, user }) => ({
    ...freelancer,
    account: {
      ...account,
      user: user,
    },
  })) as unknown as Freelancer[];

  const employers = employersQuery.map(({ employer, account, user }) => ({
    ...employer,
    account: {
      ...account,
      user: user,
    },
  })) as unknown as Employer[];

  return { freelancers, employers } as LoaderData;
}

interface AccountTableProps {
  accounts: (Freelancer | Employer)[];
  type: "Freelancer" | "Employer";
}

function AccountTable({ accounts, type }: AccountTableProps) {
  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((acc) => (
                <tr key={acc.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    {acc.account.user.firstName} {acc.account.user.lastName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {acc.account.user.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        acc.account.accountStatus === AccountStatus.Published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {acc.account.accountStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <Link
                      to={`/admin-dashboard/${type.toLowerCase()}/${acc.id}`}
                      className="text-primaryColor hover:text-primaryColor/80"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { freelancers, employers } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Freelancer Accounts</h2>
        <AccountTable accounts={freelancers} type="Freelancer" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Employer Accounts</h2>
        <AccountTable accounts={employers} type="Employer" />
      </section>
    </div>
  );
}
