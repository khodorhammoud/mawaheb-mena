import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AccountStatus } from "~/types/enums";
import {
  AccountsTable,
  Account,
} from "~/common/admin-pages/tables/AccountsTable";
import {
  getFreelancerAccounts,
  getEmployerAccounts,
} from "~/servers/admin.server";

type LoaderData = {
  freelancers: Account[];
  employers: Account[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const [freelancers, employers] = await Promise.all([
    getFreelancerAccounts(),
    getEmployerAccounts(),
  ]);

  return { freelancers, employers };
}

interface AccountTableProps {
  accounts: Account[];
  type: "Freelancer" | "Employer";
}

/* function AccountTable({ accounts, type }: AccountTableProps) {
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
} */

export default function AdminDashboard() {
  const { freelancers, employers } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Freelancer Accounts</h2>
        <AccountsTable accounts={freelancers} type="Freelancer" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Employer Accounts</h2>
        <AccountsTable accounts={employers} type="Employer" />
      </section>
    </div>
  );
}
