import { Link } from '@remix-run/react';
import { AccountStatus } from '@mawaheb/db';
import { DataTable } from './DataTable';

export interface Account {
  id: number;
  account: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    accountStatus: AccountStatus;
  };
}

interface AccountsTableProps {
  accounts: Account[];
  type: 'Freelancer' | 'Employer';
  emptyMessage?: string;
}

export function AccountsTable({
  accounts,
  type,
  emptyMessage = `No ${type.toLowerCase()} accounts found`,
}: AccountsTableProps) {
  const columns = [
    {
      header: 'Name',
      accessor: (acc: Account) => `${acc.account.user.firstName} ${acc.account.user.lastName}`,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Email',
      accessor: (acc: Account) => acc.account.user.email,
    },
    {
      header: 'Status',
      accessor: (acc: Account) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold ${
            acc.account.accountStatus === AccountStatus.Published
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {acc.account.accountStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (acc: Account) => (
        <Link
          to={`/admin-dashboard/${type.toLowerCase()}/${acc.id}`}
          className="text-primaryColor hover:text-primaryColor/80"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={accounts}
      keyExtractor={acc => acc.id}
      emptyMessage={emptyMessage}
    />
  );
}
